"use client"

import { useState, useEffect } from "react"

interface RightPanelProps {
  activeTab: string
  hasSelectedRecord: boolean
  // Kartoteka actions
  onEditData?: () => void
  isEditing?: boolean
  onAddRecord?: () => void
  onDeleteRecordMode?: () => void
  isDeleteRecordMode?: boolean
  onAddNote?: () => void
  onDeleteNoteMode?: () => void
  isDeleteNoteMode?: boolean
  onIssueWarrant?: () => void
  onRemoveWarrant?: () => void
  hasWarrant?: boolean
  onPrintFile?: () => void
  // List actions
  onCreatePerson?: () => void
  // BOLO actions
  onCreateBolo?: () => void
}

export function RightPanel({
  activeTab,
  hasSelectedRecord,
  onEditData,
  isEditing,
  onAddRecord,
  onDeleteRecordMode,
  isDeleteRecordMode,
  onAddNote,
  onDeleteNoteMode,
  isDeleteNoteMode,
  onIssueWarrant,
  onRemoveWarrant,
  hasWarrant,
  onPrintFile,
  onCreatePerson,
  onCreateBolo,
}: RightPanelProps) {
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString("en-US", { hour12: false }))
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        })
      )
    }
    updateClock()
    const interval = setInterval(updateClock, 1000)
    return () => clearInterval(interval)
  }, [])

  const showKartotekaActions = activeTab === "kartoteka" && hasSelectedRecord
  const showKartotekaListActions = activeTab === "kartoteka" && !hasSelectedRecord
  const showBoloActions = activeTab === "bolo"

  return (
    <aside
      className="flex w-56 flex-col gap-2.5 border-l-2 border-l-[#555] p-3"
      style={{ backgroundColor: "var(--mdt-sidebar)" }}
    >
      {/* Clock */}
      <div className="panel-inset p-3 text-center" style={{ backgroundColor: "#1a1a1a" }}>
        <div className="font-[family-name:var(--font-vt323)] text-2xl tracking-widest text-green-400">{currentTime}</div>
        <div className="font-mono text-sm text-green-400/60">{currentDate}</div>
      </div>

      {/* Unit Info */}
      <div className="px-3 py-1.5" style={{ backgroundColor: "var(--mdt-header)" }}>
        <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider" style={{ color: "var(--mdt-header-text)" }}>
          STATUS JEDNOSTKI
        </span>
      </div>
      <div className="panel-inset p-3" style={{ backgroundColor: "#333" }}>
        <div className="flex flex-col gap-1">
          <StatusRow label="JEDNOSTKA" value="5K13" />
          <StatusRow label="STATUS" value="10-8" color="#4ade80" />
          <StatusRow label="STREFA" value="EAST LS" />
          <StatusRow label="CZEST." value="CH-3" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-3 py-1.5" style={{ backgroundColor: "var(--mdt-header)" }}>
        <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider" style={{ color: "var(--mdt-header-text)" }}>
          SZYBKIE AKCJE
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {/* Kartoteka - record selected */}
        {showKartotekaActions && (
          <>
            <button className={`btn-win95 w-full text-sm ${isEditing ? "btn-win95-active" : ""}`} onClick={onEditData}>
              EDYTUJ DANE
            </button>
            <button className="btn-win95 w-full text-sm" onClick={onAddRecord}>DODAJ WPIS</button>
            <button className={`btn-win95 w-full text-sm ${isDeleteRecordMode ? "btn-win95-active" : ""}`} onClick={onDeleteRecordMode}>
              USUŃ WPIS
            </button>
            <button className="btn-win95 w-full text-sm" onClick={onAddNote}>DODAJ NOTATKĘ</button>
            <button className={`btn-win95 w-full text-sm ${isDeleteNoteMode ? "btn-win95-active" : ""}`} onClick={onDeleteNoteMode}>
              USUŃ NOTATKĘ
            </button>
            <button className="btn-win95 w-full text-sm" onClick={onIssueWarrant}>WYSTAW NAKAZ</button>
            <button className={`btn-win95 w-full text-sm ${!hasWarrant ? "opacity-50" : ""}`} onClick={onRemoveWarrant} disabled={!hasWarrant}>
              ŚCIĄGNIJ NAKAZ
            </button>
            <button className="btn-win95 w-full text-sm" onClick={onPrintFile}>DRUKUJ PLIK</button>
          </>
        )}

        {/* Kartoteka - no selection (list view) */}
        {showKartotekaListActions && (
          <button
            className="btn-win95 w-full text-sm"
            style={{ backgroundColor: "#3a6a3a", color: "#fff", borderColor: "#5a9a5a #1a3a1a #1a3a1a #5a9a5a" }}
            onClick={onCreatePerson}
          >
            + DODAJ OSOBĘ
          </button>
        )}

        {/* BOLO */}
        {showBoloActions && (
          <button
            className="btn-win95 w-full text-sm"
            style={{ backgroundColor: "#3a6a3a", color: "#fff", borderColor: "#5a9a5a #1a3a1a #1a3a1a #5a9a5a" }}
            onClick={onCreateBolo}
          >
            + DODAJ BOLO
          </button>
        )}

        {/* Other tabs - no specific actions */}
        {!showKartotekaActions && !showKartotekaListActions && !showBoloActions && (
          <div className="panel-inset p-3 text-center" style={{ backgroundColor: "#1a1a1a" }}>
            <span className="font-mono text-xs" style={{ color: "#555" }}>
              BRAK DOSTĘPNYCH AKCJI
            </span>
          </div>
        )}
      </div>

      {/* System info */}
      <div className="mt-auto">
        <div className="panel-inset p-3" style={{ backgroundColor: "#1a1a1a" }}>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-[#555]">SASD MDT v2.4.1</span>
            <span className="font-mono text-xs text-[#555]">BAZA: POŁĄCZONO</span>
            <span className="font-mono text-xs text-[#555]">SESJA: 0x4A2F</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

function StatusRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between">
      <span className="font-mono text-xs text-[#777]">{label}</span>
      <span className="font-mono text-xs font-bold" style={{ color: color || "#ccc" }}>{value}</span>
    </div>
  )
}
