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
import { MdtModal } from "./MdtModal"
import { WantedPoster } from "./WantedPoster"
import { useMdtRecords } from "./hooks/useMdtRecords"
import { useMdtBolo } from "./hooks/useMdtBolo"
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

  const [activeTab, setActiveTab] = useState("main")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Delete modes
  const [isDeleteRecordMode, setIsDeleteRecordMode] = useState(false)
  const [isDeleteNoteMode, setIsDeleteNoteMode] = useState(false)

  // Modal states
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [showAddNote, setShowAddNote] = useState(false)
  const [showWarrantModal, setShowWarrantModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [showPoster, setShowPoster] = useState(false)
  const [showCreatePerson, setShowCreatePerson] = useState(false)

  // Form states
  const [newRecordForm, setNewRecordForm] = useState({ date: "", offense: "", code: "", status: "W TOKU", officer: "" })
  const [newNote, setNewNote] = useState("")
  const [warrantType, setWarrantType] = useState<"PRZESZUKANIA" | "ARESZTOWANIA" | "NO-KNOCK">("PRZESZUKANIA")
  const [warrantReason, setWarrantReason] = useState("")
  const [printReason, setPrintReason] = useState("")
  const [newPersonForm, setNewPersonForm] = useState({ first_name: "", last_name: "" })

  // Hooks
  const {
    records, selectedRecord, loading: recordsLoading,
    loadRecords, selectRecord, clearSelection, handleSearch,
    handleCreateRecord, handleUpdateRecord, handleDeleteRecord,
    handleAddCriminalRecord, handleDeleteCriminalRecord,
    handleAddNote, handleDeleteNote,
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

  // Load data on mount
  useEffect(() => {
    if (user) {
      loadRecords()
      loadVehicles()
    }
  }, [user, loadRecords, loadVehicles])

  // Reset new record form date
  useEffect(() => {
    setNewRecordForm((p) => ({
      ...p,
      date: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
      officer: mtaNick || "",
    }))
  }, [mtaNick])

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

  const handleSelectRecordFromSearch = useCallback((id: string) => {
    selectRecord(id)
  }, [selectRecord])

  // Save edit
  async function handleSaveEdit(updates: Partial<MdtRecord>, newMugshotUrl: string | null) {
    if (!selectedRecord) return
    const finalUpdates = { ...updates }
    if (newMugshotUrl && newMugshotUrl !== selectedRecord.mugshot_url) {
      finalUpdates.mugshot_url = newMugshotUrl
    }
    await handleUpdateRecord(selectedRecord.id, finalUpdates)
    setIsEditing(false)
  }

  // Add criminal record
  async function onAddCriminalRecord() {
    if (!selectedRecord || !newRecordForm.offense.trim()) return
    await handleAddCriminalRecord({
      record_id: selectedRecord.id,
      date: newRecordForm.date,
      offense: newRecordForm.offense,
      code: newRecordForm.code,
      status: newRecordForm.status,
      officer: newRecordForm.officer,
    })
    setNewRecordForm({
      date: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
      offense: "", code: "", status: "W TOKU", officer: officerName,
    })
    setShowAddRecord(false)
  }

  // Delete criminal record
  async function onDeleteCriminalRecord(id: string) {
    if (!selectedRecord) return
    await handleDeleteCriminalRecord(id, selectedRecord.id)
  }

  // Add note
  async function onAddNote() {
    if (!selectedRecord || !newNote.trim()) return
    await handleAddNote({ record_id: selectedRecord.id, content: newNote, officer: officerName })
    setNewNote("")
    setShowAddNote(false)
  }

  // Delete note
  async function onDeleteNote(id: string) {
    if (!selectedRecord) return
    await handleDeleteNote(id, selectedRecord.id)
  }

  // Issue warrant
  async function onIssueWarrant() {
    if (!selectedRecord || !warrantReason.trim()) return
    await handleIssueWarrant({
      record_id: selectedRecord.id,
      type: warrantType,
      reason: warrantReason,
      officer: officerName,
      issued_date: new Date().toLocaleDateString("pl-PL"),
    })
    setWarrantReason("")
    setShowWarrantModal(false)
  }

  // Remove warrant
  async function onRemoveWarrant() {
    if (!selectedRecord) return
    const activeWarrant = selectedRecord.mdt_warrants?.find((w) => w.is_active)
    if (!activeWarrant) return
    await handleRemoveWarrant(activeWarrant.id, selectedRecord.id)
  }

  // Create person
  async function onCreatePerson() {
    if (!newPersonForm.first_name.trim() || !newPersonForm.last_name.trim()) return
    const newRecord = await handleCreateRecord({
      first_name: newPersonForm.first_name,
      last_name: newPersonForm.last_name,
      created_by: user?.id,
    })
    setNewPersonForm({ first_name: "", last_name: "" })
    setShowCreatePerson(false)
    if (newRecord) {
      selectRecord(newRecord.id)
    }
  }

  // Generate poster
  function onGeneratePoster() {
    if (!printReason.trim()) return
    setShowPrintModal(false)
    setShowPoster(true)
  }

  // Mugshot change handler
  function handleMugshotChange(url: string) {
    if (selectedRecord) {
      handleUpdateRecord(selectedRecord.id, { mugshot_url: url })
    }
  }

  const currentSection = isEditing
    ? "Edycja danych"
    : sectionLabels[activeTab] || "Kartoteki"

  const activeWarrant = selectedRecord?.mdt_warrants?.find((w) => w.is_active)

  // Access check
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: "var(--mdt-content)" }}>
        <span className="font-mono text-sm" style={{ color: "var(--mdt-muted-text)" }}>
          ŁADOWANIE... <span className="cursor-blink">_</span>
        </span>
      </div>
    )
  }

  if (!user || (!isCS && division !== "DTU")) {
    return (
      <>
        <Navbar />
        <AccessDenied onBack={() => router.push("/divisions/DTU")} message="Brak uprawnień do MDT. Wymagany: DTU lub CS+." />
      </>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: "var(--mdt-content)" }}>
      {!isFullscreen && <Navbar />}

      {/* MDT Terminal Window */}
      <div className={`flex-1 overflow-hidden ${!isFullscreen ? "mt-0.5" : ""}`}>
        <div
          className="panel-raised flex flex-col overflow-hidden h-full"
          style={{ backgroundColor: "var(--mdt-sidebar)" }}
        >
          <MdtHeader
            currentSection={currentSection}
            officerName={officerName}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen((p) => !p)}
            onClose={() => router.push("/divisions/DTU")}
          />

          <SearchPanel
            onSelectRecord={(id) => {
              handleTabChange("kartoteka")
              selectRecord(id)
            }}
            onSelectBolo={() => handleTabChange("bolo")}
            onSwitchTab={handleTabChange}
            onSearch={(q) => {
              handleTabChange("kartoteka")
              handleSearch(q)
            }}
          />

          <div className="flex flex-1 overflow-hidden">
            <MdtSidebar activeTab={activeTab} onTabChange={handleTabChange} />

            {/* Center content */}
            {activeTab === "main" && (
              <MainDashboard
                onSelectRecord={(id) => { handleTabChange("kartoteka"); selectRecord(id) }}
                onSwitchTab={handleTabChange}
              />
            )}

            {activeTab === "kartoteka" && (
              selectedRecord ? (
                isEditing ? (
                  <EditPlayerRecord
                    record={selectedRecord}
                    onSave={handleSaveEdit}
                    onCancel={() => setIsEditing(false)}
                  />
                ) : (
                  <PlayerRecord
                    record={selectedRecord}
                    onMugshotChange={handleMugshotChange}
                    isDeleteRecordMode={isDeleteRecordMode}
                    onDeleteRecord={onDeleteCriminalRecord}
                    isDeleteNoteMode={isDeleteNoteMode}
                    onDeleteNote={onDeleteNote}
                  />
                )
              ) : (
                <RecordsList
                  records={records}
                  loading={recordsLoading}
                  onSelectRecord={(id) => selectRecord(id)}
                  onCreateNew={() => setShowCreatePerson(true)}
                />
              )
            )}

            {activeTab === "bolo" && (
              <BoloVehiclesPanel
                vehicles={vehicles}
                loading={boloLoading}
                filterStatus={filterStatus}
                onChangeFilter={changeFilter}
                onCreate={handleCreateBolo}
                onUpdate={handleUpdateBolo}
                onDelete={handleDeleteBolo}
                onResolve={handleResolveBolo}
                officerName={officerName}
                userId={user?.id}
              />
            )}

            {activeTab === "cctv" && <MonitoringPanel />}
            {activeTab === "roster" && <UnitsPanel />}
            {activeTab === "emergency" && <EmergencyPanel />}

            {/* Right panel */}
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
              onAddRecord={() => selectedRecord && setShowAddRecord(true)}
              onDeleteRecordMode={() => {
                if (selectedRecord) {
                  setIsDeleteRecordMode((p) => !p)
                  setIsDeleteNoteMode(false)
                }
              }}
              isDeleteRecordMode={isDeleteRecordMode}
              onAddNote={() => selectedRecord && setShowAddNote(true)}
              onDeleteNoteMode={() => {
                if (selectedRecord) {
                  setIsDeleteNoteMode((p) => !p)
                  setIsDeleteRecordMode(false)
                }
              }}
              isDeleteNoteMode={isDeleteNoteMode}
              onIssueWarrant={() => selectedRecord && setShowWarrantModal(true)}
              onRemoveWarrant={onRemoveWarrant}
              hasWarrant={!!activeWarrant}
              onPrintFile={() => {
                if (selectedRecord) {
                  setPrintReason("")
                  setShowPrintModal(true)
                }
              }}
              onCreatePerson={() => setShowCreatePerson(true)}
              onCreateBolo={() => {/* BoloVehiclesPanel has its own modal */}}
            />
          </div>
        </div>
      </div>

      {/* MODAL: Add Criminal Record */}
      {showAddRecord && selectedRecord && (
        <MdtModal title="Dodaj wpis do historii karnej" onClose={() => setShowAddRecord(false)}>
          <div className="flex flex-col gap-3">
            {[
              { label: "DATA", key: "date", placeholder: "" },
              { label: "PRZESTĘPSTWO", key: "offense", placeholder: "np. Kradzież pojazdu" },
              { label: "KOD", key: "code", placeholder: "np. PC 487(d)(1)" },
              { label: "FUNKCJONARIUSZ", key: "officer", placeholder: "np. Dep. Kowalski" },
            ].map((f) => (
              <div key={f.key} className="flex items-center gap-2">
                <label className="w-32 shrink-0 font-mono text-xs font-bold" style={{ color: "var(--mdt-muted-text)" }}>
                  {f.label}:
                </label>
                <input
                  type="text"
                  value={newRecordForm[f.key as keyof typeof newRecordForm]}
                  onChange={(e) => setNewRecordForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  className="panel-inset flex-1 px-2 py-1 font-mono text-xs"
                  style={{ backgroundColor: "var(--mdt-input-bg)", color: "var(--mdt-content-text)", outline: "none" }}
                  placeholder={f.placeholder}
                />
              </div>
            ))}
            <div className="flex items-center gap-2">
              <label className="w-32 shrink-0 font-mono text-xs font-bold" style={{ color: "var(--mdt-muted-text)" }}>STATUS:</label>
              <select
                value={newRecordForm.status}
                onChange={(e) => setNewRecordForm((p) => ({ ...p, status: e.target.value }))}
                className="panel-inset flex-1 px-2 py-1 font-mono text-xs"
                style={{ backgroundColor: "var(--mdt-input-bg)", color: "var(--mdt-content-text)", outline: "none", cursor: "pointer" }}
              >
                <option value="W TOKU">W TOKU</option>
                <option value="SKAZANY">SKAZANY</option>
                <option value="ODDALONO">ODDALONO</option>
                <option value="OCZEKUJE">OCZEKUJE</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#999] pt-3">
              <button
                className="btn-win95 text-xs"
                style={{ backgroundColor: "#3a6a3a", color: "#fff", borderColor: "#5a9a5a #1a3a1a #1a3a1a #5a9a5a" }}
                onClick={onAddCriminalRecord}
              >
                DODAJ WPIS
              </button>
              <button className="btn-win95 text-xs" onClick={() => setShowAddRecord(false)}>ANULUJ</button>
            </div>
          </div>
        </MdtModal>
      )}

      {/* MODAL: Add Note */}
      {showAddNote && selectedRecord && (
        <MdtModal title="Dodaj notatkę" onClose={() => setShowAddNote(false)}>
          <div className="flex flex-col gap-3">
            <label className="font-mono text-xs font-bold" style={{ color: "var(--mdt-muted-text)" }}>TREŚĆ NOTATKI:</label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
              className="panel-inset w-full resize-none px-2 py-1 font-mono text-xs"
              style={{ backgroundColor: "var(--mdt-input-bg)", color: "var(--mdt-content-text)", outline: "none" }}
              placeholder="Wpisz treść notatki..."
            />
            <div className="flex justify-end gap-2 border-t border-[#999] pt-3">
              <button
                className="btn-win95 text-xs"
                style={{ backgroundColor: "#3a6a3a", color: "#fff", borderColor: "#5a9a5a #1a3a1a #1a3a1a #5a9a5a" }}
                onClick={onAddNote}
              >
                DODAJ
              </button>
              <button className="btn-win95 text-xs" onClick={() => setShowAddNote(false)}>ANULUJ</button>
            </div>
          </div>
        </MdtModal>
      )}

      {/* MODAL: Issue Warrant */}
      {showWarrantModal && selectedRecord && (
        <MdtModal title="Wystaw nakaz" onClose={() => setShowWarrantModal(false)}>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs" style={{ color: "var(--mdt-muted-text)" }}>
              Wybierz rodzaj nakazu dla: <strong>{selectedRecord.last_name}, {selectedRecord.first_name}</strong>
            </span>
            <div className="flex flex-col gap-2">
              {([
                { id: "PRZESZUKANIA" as const, label: "NAKAZ PRZESZUKANIA", color: "#ffc107" },
                { id: "ARESZTOWANIA" as const, label: "NAKAZ ARESZTOWANIA", color: "#f97316" },
                { id: "NO-KNOCK" as const, label: "NAKAZ NO-KNOCK", color: "#c41e1e" },
              ]).map((opt) => (
                <button
                  key={opt.id}
                  className={`btn-win95 w-full text-xs ${warrantType === opt.id ? "btn-win95-active" : ""}`}
                  onClick={() => setWarrantType(opt.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 border-2" style={{ borderColor: "#555", backgroundColor: warrantType === opt.id ? opt.color : "transparent" }} />
                    {opt.label}
                  </div>
                </button>
              ))}
            </div>
            <label className="font-mono text-xs font-bold" style={{ color: "var(--mdt-muted-text)" }}>POWÓD WYSTAWIENIA:</label>
            <textarea
              value={warrantReason}
              onChange={(e) => setWarrantReason(e.target.value)}
              rows={3}
              className="panel-inset w-full resize-none px-2 py-1 font-mono text-xs"
              style={{ backgroundColor: "var(--mdt-input-bg)", color: "var(--mdt-content-text)", outline: "none" }}
              placeholder="Wpisz powód wystawienia nakazu..."
            />
            <div className="flex justify-end gap-2 border-t border-[#999] pt-3">
              <button
                className="btn-win95 text-xs"
                style={{ backgroundColor: "#3a6a3a", color: "#fff", borderColor: "#5a9a5a #1a3a1a #1a3a1a #5a9a5a" }}
                onClick={onIssueWarrant}
              >
                WYSTAW NAKAZ
              </button>
              <button className="btn-win95 text-xs" onClick={() => setShowWarrantModal(false)}>ANULUJ</button>
            </div>
          </div>
        </MdtModal>
      )}

      {/* MODAL: Print */}
      {showPrintModal && selectedRecord && (
        <MdtModal title="Drukuj list gończy" onClose={() => setShowPrintModal(false)}>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs" style={{ color: "var(--mdt-muted-text)" }}>
              Generowanie listu gończego dla: <strong>{selectedRecord.last_name}, {selectedRecord.first_name}</strong>
            </span>
            <label className="font-mono text-xs font-bold" style={{ color: "var(--mdt-muted-text)" }}>POWÓD POSZUKIWANIA:</label>
            <textarea
              value={printReason}
              onChange={(e) => setPrintReason(e.target.value)}
              rows={4}
              className="panel-inset w-full resize-none px-2 py-1 font-mono text-xs"
              style={{ backgroundColor: "var(--mdt-input-bg)", color: "var(--mdt-content-text)", outline: "none" }}
              placeholder="Wpisz powód poszukiwania osoby..."
            />
            <div className="flex justify-end gap-2 border-t border-[#999] pt-3">
              <button
                className="btn-win95 text-xs"
                style={{ backgroundColor: "#3a6a3a", color: "#fff", borderColor: "#5a9a5a #1a3a1a #1a3a1a #5a9a5a" }}
                onClick={onGeneratePoster}
              >
                GENERUJ PLAKAT
              </button>
              <button className="btn-win95 text-xs" onClick={() => setShowPrintModal(false)}>ANULUJ</button>
            </div>
          </div>
        </MdtModal>
      )}

      {/* MODAL: Create Person */}
      {showCreatePerson && (
        <MdtModal title="Dodaj nową kartotekę" onClose={() => setShowCreatePerson(false)}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <label className="w-24 shrink-0 font-mono text-xs font-bold" style={{ color: "var(--mdt-muted-text)" }}>IMIĘ:</label>
              <input
                type="text"
                value={newPersonForm.first_name}
                onChange={(e) => setNewPersonForm((p) => ({ ...p, first_name: e.target.value }))}
                className="panel-inset flex-1 px-2 py-1 font-mono text-xs"
                style={{ backgroundColor: "var(--mdt-input-bg)", color: "var(--mdt-content-text)", outline: "none" }}
                placeholder="Imię osoby"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 shrink-0 font-mono text-xs font-bold" style={{ color: "var(--mdt-muted-text)" }}>NAZWISKO:</label>
              <input
                type="text"
                value={newPersonForm.last_name}
                onChange={(e) => setNewPersonForm((p) => ({ ...p, last_name: e.target.value }))}
                className="panel-inset flex-1 px-2 py-1 font-mono text-xs"
                style={{ backgroundColor: "var(--mdt-input-bg)", color: "var(--mdt-content-text)", outline: "none" }}
                placeholder="Nazwisko osoby"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-[#999] pt-3">
              <button
                className="btn-win95 text-xs"
                style={{ backgroundColor: "#3a6a3a", color: "#fff", borderColor: "#5a9a5a #1a3a1a #1a3a1a #5a9a5a" }}
                onClick={onCreatePerson}
              >
                UTWÓRZ KARTOTEKĘ
              </button>
              <button className="btn-win95 text-xs" onClick={() => setShowCreatePerson(false)}>ANULUJ</button>
            </div>
          </div>
        </MdtModal>
      )}

      {/* Wanted Poster */}
      {showPoster && selectedRecord && (
        <WantedPoster
          record={selectedRecord}
          mugshotUrl={selectedRecord.mugshot_url}
          reason={printReason}
          onClose={() => setShowPoster(false)}
        />
      )}
    </div>
  )
}
