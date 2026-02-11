'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { Plus, Filter, FileText, Archive } from 'lucide-react';
import { useDivisionReports } from './hooks/useDivisionReports';
import { getReportConfig, getReportTypeDefinition, type ReportTypeDefinition } from './reportConfig';
import ReportTypeSelector from './ReportTypeSelector';
import ReportForm from './ReportForm';
import ReportCard from './ReportCard';
import ReportDetailModal from './ReportDetailModal';
import { notifyDivisionReport } from '@/src/lib/webhooks/divisionReport';
import { getAllUsersWithDetails } from '@/src/lib/db/users';
import LoadingState from '@/src/components/shared/LoadingState';

const divisionColors: Record<string, string> = {
  DTU: '#60a5fa',
  GU: '#10b981',
  SWAT: '#c41e1e',
  SS: '#ff8c00',
};

interface ReportsPageProps {
  divisionId: string;
  onBack: () => void;
}

export default function ReportsPage({ divisionId, onBack }: ReportsPageProps) {
  const router = useRouter();
  const { user, isCS, isDev, division, permissions, isSwatCommander, isSwatOperator } = useAuth();
  const userId = user?.id;

  const {
    reports,
    loading,
    filterType,
    setFilterType,
    handleCreateReport,
    handleUpdateReport,
    handleDeleteReport,
    handleArchiveReport,
    reloadReports,
  } = useDivisionReports(divisionId, userId);

  const [view, setView] = useState<'list' | 'selectType' | 'form'>('list');
  const [selectedReportType, setSelectedReportType] = useState<ReportTypeDefinition | null>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [editingReport, setEditingReport] = useState<any>(null);

  const config = getReportConfig(divisionId);
  const color = divisionColors[divisionId] || '#3a6a3a';

  // Access control: who can WRITE reports
  const canWrite = isCS || isDev ||
    division === divisionId ||
    (divisionId === 'SWAT' && (
      permissions?.includes('SWAT') || isSwatCommander || isSwatOperator
    ));

  const handleSelectReportType = (rt: ReportTypeDefinition) => {
    setSelectedReportType(rt);
    setView('form');
  };

  const handleFormSubmit = async (data: {
    report_type: string;
    participants: string[];
    form_data: Record<string, any>;
  }) => {
    let success: boolean;

    if (editingReport) {
      success = await handleUpdateReport(editingReport.id, {
        participants: data.participants,
        form_data: data.form_data,
      });
    } else {
      success = await handleCreateReport(data);
    }

    if (success) {
      // Send Discord webhook (only for new reports)
      if (!editingReport) {
        try {
          const { data: allUsers } = await getAllUsersWithDetails();
          const participantNames = data.participants
            .map((pid) => {
              const u = allUsers?.find((u: any) => u.id === pid);
              return u ? (u.mta_nick || u.username) : 'Nieznany';
            });

          const typeDef = getReportTypeDefinition(divisionId, data.report_type);
          await notifyDivisionReport({
            division: divisionId,
            reportTypeLabel: typeDef?.label || data.report_type,
            author: {
              username: user?.user_metadata?.full_name || user?.user_metadata?.name || 'Unknown',
              mta_nick: null,
            },
            date: data.form_data.date,
            time: data.form_data.time,
            location: data.form_data.location,
            participants: participantNames,
          });
        } catch (e) {
          console.error('Webhook error:', e);
        }
      }

      setView('list');
      setSelectedReportType(null);
      setEditingReport(null);
    }

    return success;
  };

  const handleFormCancel = () => {
    setView('list');
    setSelectedReportType(null);
    setEditingReport(null);
  };

  const handleReportClick = (report: any) => {
    setSelectedReport(report);
  };

  const handleEditReport = () => {
    if (!selectedReport) return;
    const typeDef = getReportTypeDefinition(divisionId, selectedReport.report_type);
    if (typeDef) {
      setEditingReport(selectedReport);
      setSelectedReportType(typeDef);
      setSelectedReport(null);
      setView('form');
    }
  };

  const handleDeleteReportFromModal = async () => {
    if (!selectedReport) return;
    const success = await handleDeleteReport(selectedReport.id);
    if (success) {
      setSelectedReport(null);
    }
  };

  const handleArchiveReportFromModal = async () => {
    if (!selectedReport) return;
    const success = await handleArchiveReport(selectedReport.id);
    if (success) {
      setSelectedReport(null);
    }
  };

  if (loading) {
    return <LoadingState message="Ładowanie raportów..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="panel-raised mb-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        <div className="px-3 py-1 flex items-center justify-between" style={{ backgroundColor: color }}>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-white" />
            <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
              Raporty — {divisionId}
            </span>
          </div>
          <span className="font-mono text-xs text-white opacity-80">
            {reports.length} raportów
          </span>
        </div>

        <div className="p-3 flex items-center gap-2 flex-wrap">
          {/* New Report button */}
          {canWrite && view === 'list' && (
            <button
              onClick={() => setView('selectType')}
              className="btn-win95 flex items-center gap-1 text-xs py-0.5 px-2"
              style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
            >
              <Plus className="w-3 h-3" />
              Nowy raport
            </button>
          )}

          {/* Filter by type */}
          {view === 'list' && config && (
            <div className="flex items-center gap-1">
              <Filter className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="panel-inset px-2 py-0.5 font-mono text-xs"
                style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)' }}
              >
                <option value="">Wszystkie typy</option>
                {config.reportTypes.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.icon} {rt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Archive link (CS+ only) */}
          {(isCS || isDev) && view === 'list' && (
            <button
              onClick={() => router.push(`/divisions/${divisionId}/raport/archived`)}
              className="btn-win95 flex items-center gap-1 text-xs py-0.5 px-2"
            >
              <Archive className="w-3 h-3" />
              Archiwum
            </button>
          )}

          {/* Back to list from form */}
          {view !== 'list' && (
            <button
              onClick={handleFormCancel}
              className="btn-win95 text-xs py-0.5 px-2"
            >
              Wróć do listy
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {view === 'selectType' && (
        <ReportTypeSelector divisionId={divisionId} onSelect={handleSelectReportType} />
      )}

      {view === 'form' && selectedReportType && (
        <ReportForm
          reportType={selectedReportType}
          divisionId={divisionId}
          authorId={userId || ''}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          initialData={editingReport?.form_data}
          initialParticipants={editingReport?.participants}
        />
      )}

      {view === 'list' && (
        <>
          {reports.length === 0 ? (
            <div className="panel-raised p-8 flex flex-col items-center gap-3" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
              <FileText className="w-10 h-10" style={{ color: 'var(--mdt-muted-text)' }} />
              <p className="font-[family-name:var(--font-vt323)] text-lg tracking-widest" style={{ color: 'var(--mdt-content-text)' }}>
                BRAK RAPORTÓW
              </p>
              <p className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
                {canWrite ? 'Kliknij "Nowy raport" aby złożyć pierwszy raport.' : 'Brak raportów do wyświetlenia.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  divisionColor={color}
                  onClick={() => handleReportClick(report)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          divisionColor={color}
          canEdit={selectedReport.author_id === userId || isCS || isDev}
          canDelete={isCS || isDev}
          canArchive={isCS || isDev}
          onClose={() => setSelectedReport(null)}
          onEdit={handleEditReport}
          onDelete={handleDeleteReportFromModal}
          onArchive={handleArchiveReportFromModal}
        />
      )}
    </div>
  );
}
