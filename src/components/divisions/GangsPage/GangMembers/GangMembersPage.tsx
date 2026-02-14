'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useGangMembers } from './hooks/useGangMembers';
import type { GangMemberReport } from './hooks/useGangMembers';
import MembersList from './MembersList';
import MemberDetail from './MemberDetail';
import MemberForm from './MemberForm';
import ReportForm from './ReportForm';
import InvestigationReportPrint from './InvestigationReportPrint';
import AutopsyReportPrint from './AutopsyReportPrint';

type View = 'list' | 'detail' | 'create' | 'edit' | 'report';

export default function GangMembersPage({ embedded, createTrigger }: { embedded?: boolean; createTrigger?: number } = {}) {
  const { user, isCS, mtaNick } = useAuth();
  const hook = useGangMembers(user?.id);
  const [view, setView] = useState<View>('list');

  // External trigger from RightPanel (DODAJ OSOBĘ)
  useEffect(() => {
    if (createTrigger && createTrigger > 0) {
      hook.setSelectedMember(null);
      setView('create');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createTrigger]);
  const [viewingReport, setViewingReport] = useState<GangMemberReport | null>(null);
  const [editingReport, setEditingReport] = useState<GangMemberReport | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null); // member id

  const handleSelectMember = async (id: string) => {
    await hook.selectMember(id);
    setView('detail');
  };

  const handleBack = () => {
    if (view === 'report' || view === 'edit') {
      setView('detail');
    } else {
      hook.setSelectedMember(null);
      setView('list');
    }
  };

  const handleCreateSubmit = async (data: Parameters<typeof hook.handleCreateMember>[0]) => {
    const { error } = await hook.handleCreateMember(data);
    if (!error) setView('detail');
  };

  const handleEditSubmit = async (data: Parameters<typeof hook.handleUpdateMember>[1]) => {
    if (!hook.selectedMember) return;
    const { error } = await hook.handleUpdateMember(hook.selectedMember.id, data);
    if (!error) setView('detail');
  };

  const handleDeleteMember = async () => {
    if (!confirmDelete) return;
    await hook.handleDeleteMember(confirmDelete);
    setConfirmDelete(null);
    setView('list');
  };

  const handleReportSubmit = async (data: Parameters<typeof hook.handleCreateReport>[0]) => {
    if (editingReport) {
      // Update existing report
      const { error } = await hook.handleUpdateReport(editingReport.id, data);
      if (!error) {
        setEditingReport(null);
        setView('detail');
      }
    } else {
      const { error } = await hook.handleCreateReport(data);
      if (!error) setView('detail');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    await hook.handleDeleteReport(reportId);
  };

  return (
    <div className="flex flex-col" style={{ height: embedded ? '100%' : 'calc(100vh - 48px)' }}>
      {/* Top bar */}
      {!embedded && (
        <div className="flex items-center gap-3 px-4 py-2" style={{ backgroundColor: 'var(--mdt-header)', borderBottom: '2px solid #555' }}>
          {view !== 'list' && (
            <button
              onClick={handleBack}
              className="btn-win95 py-0 px-1.5"
              title="Wróć"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest" style={{ color: '#4ade80' }}>
            GANG UNIT — BAZA CZŁONKÓW
          </span>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {view === 'list' && (
          <MembersList
            members={hook.members}
            gangs={hook.gangs}
            gangFilter={hook.gangFilter}
            searchQuery={hook.searchQuery}
            loading={hook.loading}
            onGangFilterChange={hook.setGangFilter}
            onSearchChange={(q) => { hook.setSearchQuery(q); if (!q.trim()) hook.refreshMembers(); }}
            onSearch={hook.handleSearch}
            onSelectMember={handleSelectMember}
            onCreateNew={() => { hook.setSelectedMember(null); setView('create'); }}
          />
        )}

        {view === 'detail' && hook.selectedMember && (
          <MemberDetail
            member={hook.selectedMember}
            isCS={isCS}
            onEdit={() => setView('edit')}
            onDelete={() => setConfirmDelete(hook.selectedMember!.id)}
            onNewReport={() => { setEditingReport(null); setView('report'); }}
            onViewReport={(r) => setViewingReport(r)}
            onEditReport={(r) => { setEditingReport(r); setView('report'); }}
            onDeleteReport={handleDeleteReport}
          />
        )}

        {view === 'create' && (
          <MemberForm
            gangs={hook.gangs}
            saving={hook.saving}
            onSubmit={handleCreateSubmit}
            onCancel={handleBack}
          />
        )}

        {view === 'edit' && hook.selectedMember && (
          <MemberForm
            gangs={hook.gangs}
            editingMember={hook.selectedMember}
            saving={hook.saving}
            onSubmit={(data) => handleEditSubmit(data)}
            onCancel={handleBack}
          />
        )}

        {view === 'report' && hook.selectedMember && (
          <ReportForm
            member={hook.selectedMember}
            officerNick={mtaNick || user?.username || 'Unknown'}
            saving={hook.saving}
            editingReport={editingReport}
            onSubmit={handleReportSubmit}
            onCancel={() => { setEditingReport(null); handleBack(); }}
          />
        )}
      </div>

      {/* Report preview modals */}
      {viewingReport && hook.selectedMember && viewingReport.report_type === 'investigation' && (
        <InvestigationReportPrint
          member={hook.selectedMember}
          report={viewingReport}
          onClose={() => setViewingReport(null)}
        />
      )}

      {viewingReport && hook.selectedMember && viewingReport.report_type === 'autopsy' && (
        <AutopsyReportPrint
          member={hook.selectedMember}
          report={viewingReport}
          onClose={() => setViewingReport(null)}
        />
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="panel-raised w-80 mx-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
            <div className="px-3 py-1.5" style={{ backgroundColor: '#8b1a1a' }}>
              <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider text-white uppercase">
                Potwierdzenie usunięcia
              </span>
            </div>
            <div className="p-4">
              <p className="font-mono text-xs mb-4" style={{ color: 'var(--mdt-content-text)' }}>
                Czy na pewno chcesz usunąć tę osobę i wszystkie powiązane raporty? Tej operacji nie można cofnąć.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleDeleteMember}
                  className="btn-win95 text-xs"
                  style={{ backgroundColor: '#8b1a1a', color: '#fff', borderColor: '#a33 #511 #511 #a33' }}
                >
                  USUŃ
                </button>
                <button onClick={() => setConfirmDelete(null)} className="btn-win95 text-xs">ANULUJ</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
