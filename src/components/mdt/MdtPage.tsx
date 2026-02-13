"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/src/components/dashboard/Navbar"
import { useAuth } from "@/src/contexts/AuthContext"
import AccessDenied from "@/src/components/shared/AccessDenied"
import { MdtHeader } from "./MdtHeader"
import { MdtSidebar } from "./MdtSidebar"
import { SearchPanel } from "./SearchPanel"
import { RightPanel } from "./RightPanel"
import { PlayerRecord } from "./PlayerRecord"
import { EditPlayerRecord } from "./EditPlayerRecord"
import { RecordsList } from "./RecordsList"
import { BoloVehiclesPanel } from "./BoloVehiclesPanel"
import { MainDashboard } from "./MainDashboard"
import { MonitoringPanel } from "./MonitoringPanel"
import { UnitsPanel } from "./UnitsPanel"
import { EmergencyPanel } from "./EmergencyPanel"
import GangMembersPage from "@/src/components/divisions/GangsPage/GangMembers/GangMembersPage"
import MdtModals from "./modals/MdtModals"
import type { ModalType, ModalEditData } from "./modals/MdtModals"
import { useMdtRecords } from "./hooks/useMdtRecords"
import { useMdtBolo } from "./hooks/useMdtBolo"
import { getGangProfiles } from "@/src/lib/db/gangs"
import type { MdtRecord } from "./types"

export default function MdtPage() {
  const router = useRouter()
  const { user, mtaNick, isCS, division, loading: authLoading } = useAuth() as {
    user: { id: string } | null
    mtaNick: string | null
    isCS: boolean
    division: string | null
    loading: boolean
  }

  // Layout states
  const [activeTab, setActiveTab] = useState("main")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteRecordMode, setIsDeleteRecordMode] = useState(false)
  const [isDeleteNoteMode, setIsDeleteNoteMode] = useState(false)

  // Modal state (single state replaces 8 booleans)
  const [activeModal, setActiveModal] = useState<ModalType>("none")
  const [modalEditData, setModalEditData] = useState<ModalEditData>({})

  // Hooks
  const {
    records, selectedRecord, loading: recordsLoading,
    loadRecords, selectRecord, clearSelection, handleSearch,
    handleCreateRecord, handleUpdateRecord, handleDeleteRecord,
    handleAddCriminalRecord, handleUpdateCriminalRecord, handleDeleteCriminalRecord,
    handleAddNote, handleUpdateNote, handleDeleteNote,
    handleIssueWarrant, handleRemoveWarrant,
  } = useMdtRecords()

  const {
    vehicles, loading: boloLoading, filterStatus,
    changeFilter, loadVehicles,
    handleCreate: handleCreateBolo,
    handleUpdate: handleUpdateBolo,
    handleDelete: handleDeleteBolo,
    handleResolve: handleResolveBolo,
  } = useMdtBolo()

  // Gangs for dropdown
  const [gangs, setGangs] = useState<{ id: string; title: string }[]>([])

  // Load data on mount
  useEffect(() => {
    if (user) {
      loadRecords()
      loadVehicles()
      getGangProfiles().then(({ data }) => {
        if (data) setGangs(data.map((g: { id: string; title: string }) => ({ id: g.id, title: g.title })))
      })
    }
  }, [user, loadRecords, loadVehicles])

  const officerName = mtaNick || "NIEZNANY"

  const sectionLabels: Record<string, string> = {
    main: "Ekran Główny",
    kartoteka: "Kartoteki",
    bolo: "Pojazdy BOLO",
    cctv: "Monitoring",
    roster: "Jednostki",
    emergency: "Alarmowe",
  }

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab)
    setIsEditing(false)
    setIsDeleteRecordMode(false)
    setIsDeleteNoteMode(false)
    if (tab !== "kartoteka") clearSelection()
  }, [clearSelection])

  const closeModal = useCallback(() => {
    setActiveModal("none")
    setModalEditData({})
  }, [])

  // ==================== Modal Callbacks ====================

  const onAddCriminalRecord = useCallback(async (form: { date: string; offense: string; code: string; status: string; officer: string }) => {
    if (!selectedRecord || !form.offense.trim()) return
    await handleAddCriminalRecord({
      record_id: selectedRecord.id,
      date: form.date,
      offense: form.offense,
      code: form.code,
      status: form.status,
      officer: form.officer,
    })
  }, [selectedRecord, handleAddCriminalRecord])

  const onSaveEditCriminalRecord = useCallback(async (id: string, form: { date: string; offense: string; code: string; status: string; officer: string }) => {
    if (!selectedRecord) return
    await handleUpdateCriminalRecord(id, form, selectedRecord.id)
  }, [selectedRecord, handleUpdateCriminalRecord])

  const onAddNote = useCallback(async (content: string, officer: string) => {
    if (!selectedRecord || !content.trim()) return
    await handleAddNote({ record_id: selectedRecord.id, content, officer })
  }, [selectedRecord, handleAddNote])

  const onSaveEditNote = useCallback(async (id: string, content: string) => {
    if (!selectedRecord) return
    await handleUpdateNote(id, content, selectedRecord.id)
  }, [selectedRecord, handleUpdateNote])

  const onIssueWarrant = useCallback(async (type: string, reason: string) => {
    if (!selectedRecord || !reason.trim()) return
    await handleIssueWarrant({
      record_id: selectedRecord.id,
      type,
      reason,
      officer: officerName,
      issued_date: new Date().toLocaleDateString("pl-PL"),
    })
  }, [selectedRecord, handleIssueWarrant, officerName])

  const onGeneratePoster = useCallback((reason: string) => {
    if (!reason.trim()) return
    setActiveModal("poster")
    setModalEditData({ posterReason: reason })
  }, [])

  const onCreatePerson = useCallback(async (firstName: string, lastName: string) => {
    if (!firstName.trim() || !lastName.trim()) return
    const newRecord = await handleCreateRecord({
      first_name: firstName,
      last_name: lastName,
      created_by: user?.id,
    })
    if (newRecord) selectRecord(newRecord.id)
  }, [handleCreateRecord, user?.id, selectRecord])

  const onDeleteKartoteka = useCallback(async (confirmText: string) => {
    if (!selectedRecord || confirmText !== "potwierdzam") return
    await handleDeleteRecord(selectedRecord.id)
  }, [selectedRecord, handleDeleteRecord])

  // ==================== Record Action Handlers ====================

  async function handleSaveEdit(updates: Partial<MdtRecord>, newMugshotUrl: string | null) {
    if (!selectedRecord) return
    const finalUpdates = { ...updates }
    if (newMugshotUrl && newMugshotUrl !== selectedRecord.mugshot_url) {
      finalUpdates.mugshot_url = newMugshotUrl
    }
    await handleUpdateRecord(selectedRecord.id, finalUpdates)
    setIsEditing(false)
  }

  function openEditCriminalRecord(crId: string) {
    if (!selectedRecord) return
    const cr = selectedRecord.criminal_records?.find((c) => c.id === crId)
    if (!cr) return
    setModalEditData({ editCrRecordId: crId, editCrForm: { date: cr.date, offense: cr.offense, code: cr.code, status: cr.status, officer: cr.officer } })
    setActiveModal("editRecord")
  }

  function openEditNote(noteId: string) {
    if (!selectedRecord) return
    const note = selectedRecord.mdt_notes?.find((n) => n.id === noteId)
    if (!note) return
    setModalEditData({ editNoteId: noteId, editNoteContent: note.content })
    setActiveModal("editNote")
  }

  function handleMugshotChange(url: string) {
    if (selectedRecord) handleUpdateRecord(selectedRecord.id, { mugshot_url: url })
  }

  async function onRemoveWarrant() {
    if (!selectedRecord) return
    const activeWarrant = selectedRecord.mdt_warrants?.find((w) => w.is_active)
    if (!activeWarrant) return
    await handleRemoveWarrant(activeWarrant.id, selectedRecord.id)
  }

  const currentSection = isEditing ? "Edycja danych" : sectionLabels[activeTab] || "Kartoteki"
  const activeWarrant = selectedRecord?.mdt_warrants?.find((w) => w.is_active)

  // ==================== Access Check ====================

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: "var(--mdt-content)" }}>
        <span className="font-mono text-sm" style={{ color: "var(--mdt-muted-text)" }}>
          ŁADOWANIE... <span className="cursor-blink">_</span>
        </span>
      </div>
    )
  }

  if (!user || (!isCS && division !== "DTU" && division !== "GU")) {
    return (
      <>
        <Navbar />
        <AccessDenied onBack={() => router.push("/divisions")} message="Brak uprawnień do MDT. Wymagany: DTU, GU lub CS+." />
      </>
    )
  }

  // ==================== Render ====================

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: "var(--mdt-content)" }}>
      {!isFullscreen && <Navbar />}

      <div className={`flex-1 overflow-hidden ${!isFullscreen ? "mt-0.5" : ""}`}>
        <div className="panel-raised flex flex-col overflow-hidden h-full" style={{ backgroundColor: "var(--mdt-sidebar)" }}>
          <MdtHeader
            currentSection={currentSection}
            officerName={officerName}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen((p) => !p)}
            onClose={() => router.push(division === "GU" ? "/divisions/GU" : "/divisions/DTU")}
          />

          <SearchPanel
            onSelectRecord={(id) => { handleTabChange("kartoteka"); selectRecord(id) }}
            onSelectBolo={() => handleTabChange("bolo")}
            onSwitchTab={handleTabChange}
            onSearch={(q) => { handleTabChange("kartoteka"); handleSearch(q) }}
          />

          <div className="flex flex-1 overflow-hidden">
            <MdtSidebar activeTab={activeTab} onTabChange={handleTabChange} />

            {activeTab === "main" && (
              <MainDashboard
                onSelectRecord={(id) => { handleTabChange("kartoteka"); selectRecord(id) }}
                onSwitchTab={handleTabChange}
              />
            )}

            {activeTab === "kartoteka" && (
              selectedRecord ? (
                isEditing ? (
                  <EditPlayerRecord record={selectedRecord} onSave={handleSaveEdit} onCancel={() => setIsEditing(false)} gangs={gangs} />
                ) : (
                  <PlayerRecord
                    record={selectedRecord}
                    onMugshotChange={handleMugshotChange}
                    isDeleteRecordMode={isDeleteRecordMode}
                    onDeleteRecord={(id) => selectedRecord && handleDeleteCriminalRecord(id, selectedRecord.id)}
                    isDeleteNoteMode={isDeleteNoteMode}
                    onDeleteNote={(id) => selectedRecord && handleDeleteNote(id, selectedRecord.id)}
                    onEditCriminalRecord={openEditCriminalRecord}
                    onEditNote={openEditNote}
                  />
                )
              ) : (
                <RecordsList
                  records={records}
                  loading={recordsLoading}
                  onSelectRecord={(id) => selectRecord(id)}
                  onCreateNew={() => setActiveModal("createPerson")}
                />
              )
            )}

            {activeTab === "bolo" && (
              <BoloVehiclesPanel
                vehicles={vehicles} loading={boloLoading} filterStatus={filterStatus}
                onChangeFilter={changeFilter} onCreate={handleCreateBolo} onUpdate={handleUpdateBolo}
                onDelete={handleDeleteBolo} onResolve={handleResolveBolo}
                officerName={officerName} userId={user?.id}
              />
            )}

            {activeTab === "gang-kartoteki" && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <GangMembersPage embedded />
              </div>
            )}

            {activeTab === "cctv" && <MonitoringPanel />}
            {activeTab === "roster" && <UnitsPanel />}
            {activeTab === "emergency" && <EmergencyPanel />}

            <RightPanel
              activeTab={activeTab}
              hasSelectedRecord={!!selectedRecord}
              onEditData={() => {
                if (activeTab === "kartoteka" && selectedRecord) {
                  setIsEditing((p) => !p)
                  setIsDeleteRecordMode(false)
                  setIsDeleteNoteMode(false)
                }
              }}
              isEditing={isEditing}
              onAddRecord={() => selectedRecord && setActiveModal("addRecord")}
              onDeleteRecordMode={() => {
                if (selectedRecord) { setIsDeleteRecordMode((p) => !p); setIsDeleteNoteMode(false) }
              }}
              isDeleteRecordMode={isDeleteRecordMode}
              onAddNote={() => selectedRecord && setActiveModal("addNote")}
              onDeleteNoteMode={() => {
                if (selectedRecord) { setIsDeleteNoteMode((p) => !p); setIsDeleteRecordMode(false) }
              }}
              isDeleteNoteMode={isDeleteNoteMode}
              onIssueWarrant={() => selectedRecord && setActiveModal("warrant")}
              onRemoveWarrant={onRemoveWarrant}
              hasWarrant={!!activeWarrant}
              onPrintFile={() => selectedRecord && setActiveModal("print")}
              onDeleteKartoteka={() => selectedRecord && setActiveModal("deleteConfirm")}
              onCreatePerson={() => setActiveModal("createPerson")}
              onCreateBolo={() => {}}
            />
          </div>
        </div>
      </div>

      {/* All Modals */}
      <MdtModals
        activeModal={activeModal}
        editData={modalEditData}
        selectedRecord={selectedRecord}
        officerName={officerName}
        onClose={closeModal}
        onAddCriminalRecord={onAddCriminalRecord}
        onSaveEditCriminalRecord={onSaveEditCriminalRecord}
        onAddNote={onAddNote}
        onSaveEditNote={onSaveEditNote}
        onIssueWarrant={onIssueWarrant}
        onGeneratePoster={onGeneratePoster}
        onCreatePerson={onCreatePerson}
        onDeleteKartoteka={onDeleteKartoteka}
      />
    </div>
  )
}
