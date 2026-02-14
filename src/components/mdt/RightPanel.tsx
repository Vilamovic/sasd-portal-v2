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
  onDeleteKartoteka?: () => void
  // List actions
  onCreatePerson?: () => void
  // BOLO actions
  onCreateBolo?: () => void
  onEditBolo?: () => void
  onResolveBolo?: () => void
  onDeleteBolo?: () => void
  hasSelectedBolo?: boolean
  selectedBoloStatus?: string
  // Gang kartoteki actions
  onCreateGangMember?: () => void
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
  onDeleteKartoteka,
  onCreatePerson,
  onCreateBolo,
  onEditBolo,
  onResolveBolo,
  onDeleteBolo,
  hasSelectedBolo,
  selectedBoloStatus,
  onCreateGangMember,
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
  const showGangKartotekiActions = activeTab === "gang-kartoteki"

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
            <div className="my-1 border-t border-[#555]" />
            <button
              className="btn-win95 w-full text-sm"
              style={{ color: "#c41e1e" }}
              onClick={onDeleteKartoteka}
            >
              USUŃ KARTOTEKĘ
            </button>
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

        {/* BOLO - vehicle selected */}
        {showBoloActions && hasSelectedBolo && (
          <>
            <button className="btn-win95 w-full text-sm" onClick={onEditBolo}>
              EDYTUJ BOLO
            </button>
            {selectedBoloStatus === "ACTIVE" && (
              <button className="btn-win95 w-full text-sm" style={{ color: "#4ade80" }} onClick={onResolveBolo}>
                ROZWIĄŻ
              </button>
            )}
            <button className="btn-win95 w-full text-sm" style={{ color: "#c41e1e" }} onClick={onDeleteBolo}>
              USUŃ BOLO
            </button>
            <div className="my-1 border-t border-[#555]" />
          </>
        )}

        {/* BOLO - always show add */}
        {showBoloActions && (
          <button
            className="btn-win95 w-full text-sm"
            style={{ backgroundColor: "#3a6a3a", color: "#fff", borderColor: "#5a9a5a #1a3a1a #1a3a1a #5a9a5a" }}
            onClick={onCreateBolo}
          >
            + DODAJ BOLO
          </button>
        )}

        {/* Gang kartoteki */}
        {showGangKartotekiActions && (
          <button
            className="btn-win95 w-full text-sm"
            style={{ backgroundColor: "#3a6a3a", color: "#fff", borderColor: "#5a9a5a #1a3a1a #1a3a1a #5a9a5a" }}
            onClick={onCreateGangMember}
          >
            + DODAJ OSOBĘ
          </button>
        )}

        {/* Other tabs - no specific actions */}
        {!showKartotekaActions && !showKartotekaListActions && !showBoloActions && !showGangKartotekiActions && (
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
