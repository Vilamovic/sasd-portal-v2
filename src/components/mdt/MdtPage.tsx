"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/src/components/dashboard/Navbar"
import { MdtHeader } from "@/src/components/mdt/MdtHeader"
import { MdtSidebar } from "@/src/components/mdt/MdtSidebar"
import { PlayerRecord } from "@/src/components/mdt/PlayerRecord"
import { EditPlayerRecord } from "@/src/components/mdt/EditPlayerRecord"
import { SearchPanel } from "@/src/components/mdt/SearchPanel"
import { RightPanel } from "@/src/components/mdt/RightPanel"
import { MdtModal } from "@/src/components/mdt/MdtModal"
import { WantedPoster } from "@/src/components/mdt/WantedPoster"
import { defaultPlayer } from "@/src/components/mdt/types"
import type { PlayerData, CriminalRecord } from "@/src/components/mdt/types"

export default function MdtPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("kartoteka")
  const [player, setPlayer] = useState<PlayerData>(defaultPlayer)
  const [mugshotUrl, setMugshotUrl] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Modal states
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [showAddNote, setShowAddNote] = useState(false)
  const [showWarrantModal, setShowWarrantModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [showPoster, setShowPoster] = useState(false)
  const [printReason, setPrintReason] = useState("")

  // Delete mode states
  const [isDeleteRecordMode, setIsDeleteRecordMode] = useState(false)
  const [isDeleteNoteMode, setIsDeleteNoteMode] = useState(false)

  // Add record form state
  const [newRecord, setNewRecord] = useState<CriminalRecord>({
    date: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
    offense: "",
    code: "",
    status: "W TOKU",
    officer: "",
  })

  // Add note state
  const [newNote, setNewNote] = useState("")

  // Warrant type + reason
  const [warrantType, setWarrantType] = useState<"PRZESZUKANIA" | "ARESZTOWANIA" | "NO-KNOCK">("PRZESZUKANIA")
  const [warrantReason, setWarrantReason] = useState("")

  const sectionLabels: Record<string, string> = {
    main: "Ekran Główny",
    lookup: "Wyszukaj",
    emergency: "Alarmowe",
    kartoteka: "Kartoteka",
    roster: "Lista Jednostek",
    cctv: "Monitoring",
    bolo: "Pojazdy BOLO",
  }

  function handleSaveEdit(updated: PlayerData, newMugshotUrl: string | null) {
    setPlayer(updated)
    setMugshotUrl(newMugshotUrl)
    setIsEditing(false)
  }

  function handleCancelEdit() {
    setIsEditing(false)
  }

  function handleAddRecord() {
    if (!newRecord.offense.trim()) return
    setPlayer((prev) => ({
      ...prev,
      records: [newRecord, ...prev.records],
      priors: prev.priors + 1,
    }))
    setNewRecord({
      date: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
      offense: "",
      code: "",
      status: "W TOKU",
      officer: "",
    })
    setShowAddRecord(false)
  }

  function handleDeleteRecord(idx: number) {
    setPlayer((prev) => ({
      ...prev,
      records: prev.records.filter((_, i) => i !== idx),
      priors: Math.max(0, prev.priors - 1),
    }))
  }

  function handleAddNote() {
    if (!newNote.trim()) return
    setPlayer((prev) => ({
      ...prev,
      notes: [...prev.notes, newNote],
    }))
    setNewNote("")
    setShowAddNote(false)
  }

  function handleDeleteNote(idx: number) {
    setPlayer((prev) => ({
      ...prev,
      notes: prev.notes.filter((_, i) => i !== idx),
    }))
  }

  function handleIssueWarrant() {
    if (!warrantReason.trim()) return
    setPlayer((prev) => ({
      ...prev,
      warrant: {
        type: warrantType,
        reason: warrantReason,
        issuedDate: new Date().toLocaleDateString("pl-PL"),
        officer: "H. Esparragoza",
      },
      wantedStatus: "POSZUKIWANY",
    }))
    setWarrantReason("")
    setShowWarrantModal(false)
  }

  function handleRemoveWarrant() {
    setPlayer((prev) => ({
      ...prev,
      warrant: null,
      wantedStatus: "BRAK",
    }))
  }

  function handleGeneratePoster() {
    if (!printReason.trim()) return
    setShowPrintModal(false)
    setShowPoster(true)
  }

  const currentSection = isEditing
    ? "Edycja danych"
    : sectionLabels[activeTab] || "Kartoteka"

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: "var(--mdt-content)" }}>
      <Navbar />

      {/* MDT Terminal Window - fills remaining space */}
      <div className="flex-1 overflow-hidden">
        <div
          className="panel-raised flex flex-col overflow-hidden h-full"
          style={{ backgroundColor: "var(--mdt-sidebar)" }}
        >
          <MdtHeader
            currentSection={currentSection}
            officerName="H. Esparragoza"
            onClose={() => router.push("/divisions/DTU")}
          />
          <SearchPanel onSearch={(name) => console.log("Searching:", name)} />

          <div className="flex flex-1 overflow-hidden">
            <MdtSidebar
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab)
                setIsEditing(false)
                setIsDeleteRecordMode(false)
                setIsDeleteNoteMode(false)
              }}
            />

            {/* Center content */}
            {activeTab === "kartoteka" ? (
              isEditing ? (
                <EditPlayerRecord
                  player={player}
                  mugshotUrl={mugshotUrl}
                  onSave={handleSaveEdit}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <PlayerRecord
                  player={player}
                  mugshotUrl={mugshotUrl}
                  onMugshotChange={setMugshotUrl}
                  isDeleteRecordMode={isDeleteRecordMode}
                  onDeleteRecord={handleDeleteRecord}
                  isDeleteNoteMode={isDeleteNoteMode}
                  onDeleteNote={handleDeleteNote}
                />
              )
            ) : (
              <div
                className="flex flex-1 items-center justify-center"
                style={{ backgroundColor: "var(--mdt-content)" }}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="font-[family-name:var(--font-vt323)] text-2xl tracking-widest" style={{ color: "#888" }}>
                    {sectionLabels[activeTab]?.toUpperCase() || "UNKNOWN"}
                  </span>
                  <span className="font-mono text-xs" style={{ color: "#999" }}>
                    Sekcja w budowie...
                  </span>
                  <div
                    className="cursor-blink mt-2 inline-block px-1 font-mono text-xs"
                    style={{ color: "var(--mdt-content-text)" }}
                  >
                    _
                  </div>
                </div>
              </div>
            )}

            {/* Right panel */}
            <RightPanel
              onEditData={() => {
                if (activeTab === "kartoteka") {
                  setIsEditing((prev) => !prev)
                  setIsDeleteRecordMode(false)
                  setIsDeleteNoteMode(false)
                }
              }}
              isEditing={isEditing}
              onAddRecord={() => activeTab === "kartoteka" && setShowAddRecord(true)}
              onDeleteRecordMode={() => {
                if (activeTab === "kartoteka") {
                  setIsDeleteRecordMode((prev) => !prev)
                  setIsDeleteNoteMode(false)
                }
              }}
              isDeleteRecordMode={isDeleteRecordMode}
              onAddNote={() => activeTab === "kartoteka" && setShowAddNote(true)}
              onDeleteNoteMode={() => {
                if (activeTab === "kartoteka") {
                  setIsDeleteNoteMode((prev) => !prev)
                  setIsDeleteRecordMode(false)
                }
              }}
              isDeleteNoteMode={isDeleteNoteMode}
              onIssueWarrant={() => activeTab === "kartoteka" && setShowWarrantModal(true)}
              onRemoveWarrant={() => activeTab === "kartoteka" && handleRemoveWarrant()}
              hasWarrant={!!player.warrant}
              onPrintFile={() => {
                if (activeTab === "kartoteka") {
                  setPrintReason("")
                  setShowPrintModal(true)
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* MODAL: Add Record */}
      {showAddRecord && (
        <MdtModal title="Dodaj wpis do historii karnej" onClose={() => setShowAddRecord(false)}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="rec-date" className="w-32 shrink-0 font-mono text-xs font-bold" style={{ color: "var(--mdt-muted-text)" }}>
                DATA:
              </label>
              <input
                id="rec-date"
                type="text"
                value={newRecord.date}
                onChange={(e) => setNewRecord((p) => ({ ...p, date: e.target.value }))}
                className="panel-inset flex-1 px-2 py-1 font-mono text-xs"
                style={{ backgroundColor: "var(--mdt-input-bg)", color: "var(--mdt-content-text)", outline: "none" }}
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="rec-offense" className="w-32 shrink-0 font-mono text-xs font-bold" style={{ color: "var(--mdt-muted-text)" }}>
                PRZESTĘPSTWO:
              </label>
              <input
                id="rec-offense"
                type="text"
                value={newRecord.offense}
                onChange={(e) => setNewRecord((p) => ({ ...p, offense: e.target.value }))}
                className="panel-inset flex-1 px-2 py-1 font-mono text-xs"
                style={{ backgroundColor: "var(--mdt-input-bg)", color: "var(--mdt-content-text)", outline: "none" }}
                placeholder="np. Kradzież pojazdu"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="rec-code" className="w-32 shrink-0 font-mono text-xs font-bold" style={{ color: "var(--mdt-muted-text)" }}>
                KOD:
              </label>
              <input
                id="rec-code"
                type="text"
                value={newRecord.code}
                onChange={(e) => setNewRecord((p) => ({ ...p, code: e.target.value }))}
                className="panel-inset flex-1 px-2 py-1 font-mono text-xs"
                style={{ backgroundColor: "var(--mdt-input-bg)", color: "var(--mdt-content-text)", outline: "none" }}
                placeholder="np. PC 487(d)(1)"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="rec-status" className="w-32 shrink-0 font-mono text-xs font-bold" style={{ color: "var(--mdt-muted-text)" }}>
                STATUS:
              </label>
              <select
                id="rec-status"
                value={newRecord.status}
                onChange={(e) => setNewRecord((p) => ({ ...p, status: e.target.value }))}
                className="panel-inset flex-1 px-2 py-1 font-mono text-xs"
                style={{ backgroundColor: "var(--mdt-input-bg)", color: "var(--mdt-content-text)", outline: "none", cursor: "pointer" }}
              >
                <option value="W TOKU">W TOKU</option>
                <option value="SKAZANY">SKAZANY</option>
                <option value="ODDALONO">ODDALONO</option>
                <option value="OCZEKUJE">OCZEKUJE</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="rec-officer" className="w-32 shrink-0 font-mono text-xs font-bold" style={{ color: "var(--mdt-muted-text)" }}>
                FUNKCJONARIUSZ:
              </label>
              <input
                id="rec-officer"
                type="text"
                value={newRecord.officer}
                onChange={(e) => setNewRecord((p) => ({ ...p, officer: e.target.value }))}
                className="panel-inset flex-1 px-2 py-1 font-mono text-xs"
                style={{ backgroundColor: "var(--mdt-input-bg)", color: "var(--mdt-content-text)", outline: "none" }}
                placeholder="np. Dep. Kowalski"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-[#999] pt-3">
              <button
                className="btn-win95 text-xs"
                style={{ backgroundColor: "#3a6a3a", color: "#fff", borderColor: "#5a9a5a #1a3a1a #1a3a1a #5a9a5a" }}
                onClick={handleAddRecord}
              >
                DODAJ WPIS
              </button>
              <button className="btn-win95 text-xs" onClick={() => setShowAddRecord(false)}>
                ANULUJ
              </button>
            </div>
          </div>
        </MdtModal>
      )}

      {/* MODAL: Add Note */}
      {showAddNote && (
        <MdtModal title="Dodaj notatkę" onClose={() => setShowAddNote(false)}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="note-text" className="font-mono text-xs font-bold" style={{ color: "var(--mdt-muted-text)" }}>
                TREŚĆ NOTATKI:
              </label>
              <textarea
                id="note-text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={4}
                className="panel-inset w-full resize-none px-2 py-1 font-mono text-xs"
                style={{ backgroundColor: "var(--mdt-input-bg)", color: "var(--mdt-content-text)", outline: "none" }}
                placeholder="Wpisz treść notatki..."
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-[#999] pt-3">
              <button
                className="btn-win95 text-xs"
                style={{ backgroundColor: "#3a6a3a", color: "#fff", borderColor: "#5a9a5a #1a3a1a #1a3a1a #5a9a5a" }}
                onClick={handleAddNote}
              >
                DODAJ
              </button>
              <button className="btn-win95 text-xs" onClick={() => setShowAddNote(false)}>
                ANULUJ
              </button>
            </div>
          </div>
        </MdtModal>
      )}

      {/* MODAL: Issue Warrant */}
      {showWarrantModal && (
        <MdtModal title="Wystaw nakaz" onClose={() => setShowWarrantModal(false)}>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs" style={{ color: "var(--mdt-muted-text)" }}>
              Wybierz rodzaj nakazu dla: <strong>{player.lastName}, {player.firstName}</strong>
            </span>
            <div className="flex flex-col gap-2">
              {(
                [
                  { id: "PRZESZUKANIA", label: "NAKAZ PRZESZUKANIA", color: "#ffc107" },
                  { id: "ARESZTOWANIA", label: "NAKAZ ARESZTOWANIA", color: "#f97316" },
                  { id: "NO-KNOCK", label: "NAKAZ NO-KNOCK", color: "#c41e1e" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  className={`btn-win95 w-full text-xs ${warrantType === opt.id ? "btn-win95-active" : ""}`}
                  onClick={() => setWarrantType(opt.id)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 border-2"
                      style={{
                        borderColor: "#555",
                        backgroundColor: warrantType === opt.id ? opt.color : "transparent",
                      }}
                    />
                    {opt.label}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="warrant-reason" className="font-mono text-xs font-bold" style={{ color: "var(--mdt-muted-text)" }}>
                POWÓD WYSTAWIENIA:
              </label>
              <textarea
                id="warrant-reason"
                value={warrantReason}
                onChange={(e) => setWarrantReason(e.target.value)}
                rows={3}
                className="panel-inset w-full resize-none px-2 py-1 font-mono text-xs"
                style={{ backgroundColor: "var(--mdt-input-bg)", color: "var(--mdt-content-text)", outline: "none" }}
                placeholder="Wpisz powód wystawienia nakazu..."
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-[#999] pt-3">
              <button
                className="btn-win95 text-xs"
                style={{ backgroundColor: "#3a6a3a", color: "#fff", borderColor: "#5a9a5a #1a3a1a #1a3a1a #5a9a5a" }}
                onClick={handleIssueWarrant}
              >
                WYSTAW NAKAZ
              </button>
              <button className="btn-win95 text-xs" onClick={() => setShowWarrantModal(false)}>
                ANULUJ
              </button>
            </div>
          </div>
        </MdtModal>
      )}

      {/* MODAL: Print (enter reason) */}
      {showPrintModal && (
        <MdtModal title="Drukuj list gończy" onClose={() => setShowPrintModal(false)}>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs" style={{ color: "var(--mdt-muted-text)" }}>
              Generowanie listu gończego dla: <strong>{player.lastName}, {player.firstName}</strong>
            </span>
            <div className="flex flex-col gap-1">
              <label htmlFor="print-reason" className="font-mono text-xs font-bold" style={{ color: "var(--mdt-muted-text)" }}>
                POWÓD POSZUKIWANIA:
              </label>
              <textarea
                id="print-reason"
                value={printReason}
                onChange={(e) => setPrintReason(e.target.value)}
                rows={4}
                className="panel-inset w-full resize-none px-2 py-1 font-mono text-xs"
                style={{ backgroundColor: "var(--mdt-input-bg)", color: "var(--mdt-content-text)", outline: "none" }}
                placeholder="Wpisz powód poszukiwania osoby..."
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-[#999] pt-3">
              <button
                className="btn-win95 text-xs"
                style={{ backgroundColor: "#3a6a3a", color: "#fff", borderColor: "#5a9a5a #1a3a1a #1a3a1a #5a9a5a" }}
                onClick={handleGeneratePoster}
              >
                GENERUJ PLAKAT
              </button>
              <button className="btn-win95 text-xs" onClick={() => setShowPrintModal(false)}>
                ANULUJ
              </button>
            </div>
          </div>
        </MdtModal>
      )}

      {/* Wanted Poster */}
      {showPoster && (
        <WantedPoster
          player={player}
          mugshotUrl={mugshotUrl}
          reason={printReason}
          onClose={() => setShowPoster(false)}
        />
      )}
    </div>
  )
}
