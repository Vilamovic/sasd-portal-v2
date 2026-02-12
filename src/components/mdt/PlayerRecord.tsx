"use client"

import React from "react"
import { useState, useRef } from "react"
import type { MdtRecord } from "./types"
import { compressToWebP } from "@/src/lib/imageUtils"
import { uploadMugshot } from "@/src/lib/db/mdt"

interface PlayerRecordProps {
  record: MdtRecord
  onMugshotChange: (url: string) => void
  isDeleteRecordMode: boolean
  onDeleteRecord: (id: string) => void
  isDeleteNoteMode: boolean
  onDeleteNote: (id: string) => void
  onEditCriminalRecord?: (id: string) => void
  onEditNote?: (id: string) => void
}

export function PlayerRecord({
  record,
  onMugshotChange,
  isDeleteRecordMode,
  onDeleteRecord,
  isDeleteNoteMode,
  onDeleteNote,
  onEditCriminalRecord,
  onEditNote,
}: PlayerRecordProps) {
  const [selectedRecordIdx, setSelectedRecordIdx] = useState<string | null>(null)
  const [accessTime, setAccessTime] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setAccessTime(
      `${new Date().toLocaleDateString("pl-PL")} ${new Date().toLocaleTimeString("pl-PL", { hour12: false })}`
    )
  }, [])

  const [uploading, setUploading] = useState(false)

  async function handleImportPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !record.id) return
    setUploading(true)
    try {
      const compressed = await compressToWebP(file, 600, 800, 0.8)
      const { url, error } = await uploadMugshot(record.id, compressed)
      if (error) {
        console.error('Photo upload failed:', error)
        alert('Błąd przesyłania zdjęcia. Sprawdź uprawnienia Storage w Supabase.')
        return
      }
      if (url) onMugshotChange(url)
    } catch (err) {
      console.error('Photo upload failed:', err)
      alert('Błąd przesyłania zdjęcia.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const criminalRecords = record.criminal_records || []
  const notes = record.mdt_notes || []
  const activeWarrant = (record.mdt_warrants || []).find((w) => w.is_active)
  const sasdId = record.record_number ? `SASD-${String(record.record_number).padStart(6, '0')}` : 'SASD-N/A'
  const recordLevel = record.record_level === 2 ? 'II' : 'I'
  const isWanted = record.wanted_status !== 'BRAK' && record.wanted_status !== 'NIE'

  return (
    <div
      className="flex flex-1 flex-col overflow-hidden"
      style={{ backgroundColor: "var(--mdt-content)" }}
    >
      {/* Warning banner for wanted / active warrant */}
      {(isWanted || activeWarrant) && (
        <div
          className="flex items-center gap-3 px-4 py-2"
          style={{ backgroundColor: "#5a1a1a", borderBottom: "2px solid #c41e1e" }}
        >
          <div className="pulse-dot h-3 w-3 rounded-full bg-red-500" />
          <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest text-red-400">
            UWAGA: OSOBA {isWanted ? 'POSZUKIWANA' : ''}{isWanted && activeWarrant ? ' — ' : ''}{activeWarrant ? `AKTYWNY NAKAZ ${activeWarrant.type}` : ''}
          </span>
        </div>
      )}

      {/* Section title bar */}
      <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: "var(--mdt-blue-bar)" }}>
        <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
          Kartoteka karna - {record.last_name}, {record.first_name}
        </span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-white/80">{sasdId}</span>
          <span className="font-mono text-xs px-2 py-0.5" style={{
            backgroundColor: record.record_level === 2 ? '#5a1a1a' : '#1a3a5c',
            color: record.record_level === 2 ? '#ff6b6b' : '#60a5fa',
            border: `1px solid ${record.record_level === 2 ? '#c41e1e' : '#3b82f6'}`,
          }}>
            POZIOM {recordLevel}
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left column - Personal info + mugshot */}
        <div className="flex w-72 flex-col border-r-2 border-r-[#808080] p-4 overflow-auto">
          {/* Mugshot area */}
          <div
            className="panel-inset mb-2 flex h-44 w-full items-center justify-center"
            style={{ backgroundColor: "var(--mdt-surface-light)" }}
          >
            {record.mugshot_url ? (
              <div className="flex flex-col items-center gap-1">
                <img
                  src={record.mugshot_url}
                  alt={`Zdjęcie ${record.first_name} ${record.last_name}`}
                  className="h-32 w-28 object-cover"
                  style={{ border: "1px solid #555" }}
                />
                <span className="font-mono text-xs" style={{ color: "var(--mdt-content-text)" }}>
                  {sasdId}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <div
                  className="flex h-28 w-24 items-center justify-center"
                  style={{ backgroundColor: "#888", border: "1px solid #555" }}
                >
                  <svg width="60" height="70" viewBox="0 0 60 70" className="opacity-40">
                    <circle cx="30" cy="22" r="14" fill="#555" />
                    <ellipse cx="30" cy="58" rx="22" ry="16" fill="#555" />
                  </svg>
                </div>
                <span className="font-mono text-xs" style={{ color: "var(--mdt-content-text)" }}>
                  {sasdId}
                </span>
              </div>
            )}
          </div>

          {/* Import photo button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImportPhoto}
          />
          <button
            className="btn-win95 mb-3 w-full text-xs"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'PRZESYŁANIE...' : 'IMPORTUJ ZDJĘCIE'}
          </button>

          {/* Personal details */}
          <div className="flex flex-col gap-1">
            <InfoRow label="NAZWISKO, IMIĘ" value={`${record.last_name}, ${record.first_name}`} />
            <InfoRow label="DATA UR." value={record.dob || "—"} />
            <InfoRow label="NICK" value={record.ssn || "—"} />
            <InfoRow label="PŁEĆ" value={record.gender || "—"} />
            <InfoRow label="RASA" value={record.race || "—"} />
            <InfoRow label="WZROST" value={record.height || "—"} />
            <InfoRow label="WAGA" value={record.weight || "—"} />
            <InfoRow label="WŁOSY" value={record.hair || "—"} />
            <InfoRow label="OCZY" value={record.eyes || "—"} />

            <div className="my-1 border-t border-[#999]" />

            <InfoRow label="ADRES" value={record.address || "—"} />
            <InfoRow
              label="STATUS PRAWA JAZDY"
              value={record.license_status || "—"}
              valueColor={record.license_status === "COFNIĘTE" || record.license_status === "COFNIĘTY" || record.license_status === "ZAWIESZONY" ? "#c41e1e" : "#1a6a1a"}
            />
            <InfoRow label="GANG" value={record.gang_affiliation || "NIEZNANE"} />
            <InfoRow label="WYROKI" value={String(record.priors)} />

            {/* Wanted status box */}
            {record.wanted_status !== "BRAK" && record.wanted_status !== "NIE" && (
              <>
                <div className="my-1 border-t border-[#999]" />
                <div className="glow-red panel-inset p-2" style={{ backgroundColor: "#4a1a1a" }}>
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500 pulse-dot" />
                    <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider text-red-400">
                      POSZUKIWANY
                    </span>
                  </div>
                </div>
              </>
            )}
            {(record.wanted_status === "BRAK" || record.wanted_status === "NIE") && (
              <InfoRow label="POSZUKIWANY" value="NIE" valueColor="#1a6a1a" />
            )}

            {/* Warrant display */}
            {activeWarrant && (
              <>
                <div className="my-1 border-t border-[#999]" />
                <div
                  className={`panel-inset p-2 ${activeWarrant.type === "NO-KNOCK" ? "glow-red" : "glow-amber"}`}
                  style={{
                    backgroundColor: activeWarrant.type === "NO-KNOCK" ? "#5a1a1a" : "#4a3a1a",
                  }}
                >
                  <span className="font-[family-name:var(--font-vt323)] text-xs tracking-wider text-white">
                    AKTYWNY NAKAZ
                  </span>
                  <div className="mt-1 flex flex-col gap-0.5">
                    <span
                      className="font-mono text-[10px] font-bold"
                      style={{ color: activeWarrant.type === "NO-KNOCK" ? "#ff6b6b" : "#ffc107" }}
                    >
                      TYP: NAKAZ {activeWarrant.type}
                    </span>
                    <span className="font-mono text-[10px] text-[#ccc]">POWÓD: {activeWarrant.reason}</span>
                    <span className="font-mono text-[10px] text-[#ccc]">DATA: {activeWarrant.issued_date}</span>
                    <span className="font-mono text-[10px] text-[#ccc]">WYSTAWIŁ: {activeWarrant.officer}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right column - Criminal records + notes */}
        <div className="flex flex-1 flex-col p-3 overflow-hidden">
          {/* Criminal history header */}
          <div className="mb-2 px-3 py-1.5" style={{ backgroundColor: "var(--mdt-header)" }}>
            <div className="flex items-center justify-between">
              <span className="font-[family-name:var(--font-vt323)] text-base tracking-wider uppercase" style={{ color: "var(--mdt-header-text)" }}>
                Historia karna
              </span>
              {isDeleteRecordMode && (
                <span className="font-mono text-xs text-red-400">[TRYB USUWANIA]</span>
              )}
            </div>
          </div>

          {/* Records table */}
          <div className="panel-inset mb-3 flex-1 overflow-auto" style={{ backgroundColor: "var(--mdt-panel-content)" }}>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "var(--mdt-header)" }}>
                  <th className="px-3 py-1.5 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">DATA</th>
                  <th className="px-3 py-1.5 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">PRZESTĘPSTWO</th>
                  <th className="px-3 py-1.5 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">KOD</th>
                  <th className="px-3 py-1.5 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">STATUS</th>
                  <th className="px-3 py-1.5 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">FUNKCJONARIUSZ</th>
                  <th className="w-8 px-1 py-1" />
                </tr>
              </thead>
              <tbody>
                {criminalRecords.map((cr, idx) => (
                  <tr
                    key={cr.id}
                    onClick={() => !isDeleteRecordMode && setSelectedRecordIdx(selectedRecordIdx === cr.id ? null : cr.id)}
                    className="cursor-pointer"
                    style={{
                      backgroundColor:
                        selectedRecordIdx === cr.id
                          ? "var(--mdt-blue-bar)"
                          : idx % 2 === 0
                            ? "var(--mdt-row-even)"
                            : "var(--mdt-row-odd)",
                      color: selectedRecordIdx === cr.id ? "#fff" : "var(--mdt-content-text)",
                    }}
                  >
                    <td className="px-3 py-1.5 font-mono text-sm">{cr.date}</td>
                    <td className="px-3 py-1.5 font-mono text-sm">{cr.offense}</td>
                    <td className="px-3 py-1.5 font-mono text-sm">{cr.code}</td>
                    <td className="px-3 py-1.5 font-mono text-sm">
                      <span
                        style={{
                          color: selectedRecordIdx === cr.id ? "#fff"
                            : cr.status === "SKAZANY" ? "#c41e1e"
                            : cr.status === "ODDALONO" ? "#555"
                            : "var(--mdt-content-text)",
                          fontWeight: cr.status === "SKAZANY" ? 700 : 400,
                        }}
                      >
                        {cr.status}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 font-mono text-sm">{cr.officer}</td>
                    {isDeleteRecordMode && (
                      <td className="px-1 py-1 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteRecord(cr.id) }}
                          className="inline-flex items-center justify-center hover:opacity-80"
                          title="Usuń wpis"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 4h8l-.5 8H3.5L3 4z" fill="#c41e1e" />
                            <path d="M2.5 3h9v1h-9z" fill="#c41e1e" />
                            <path d="M5 2.5h4v1H5z" fill="#c41e1e" />
                            <path d="M5.5 5.5v5M7 5.5v5M8.5 5.5v5" stroke="#fff" strokeWidth="0.7" />
                          </svg>
                        </button>
                      </td>
                    )}
                    {!isDeleteRecordMode && (
                      <td className="px-1 py-1 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); onEditCriminalRecord?.(cr.id) }}
                          className="inline-flex items-center justify-center hover:opacity-80"
                          title="Edytuj wpis"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2 10.5V12h1.5l6-6L8 4.5l-6 6z" fill="#4ade80" />
                            <path d="M9.5 3l1.5 1.5-1 1L8.5 4l1-1z" fill="#4ade80" />
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {criminalRecords.length === 0 && (
                  <tr style={{ backgroundColor: "var(--mdt-row-even)" }}>
                    <td colSpan={6} className="px-2 py-3 text-center font-mono text-xs" style={{ color: "#888" }}>
                      BRAK WPISÓW W HISTORII KARNEJ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Notes section */}
          <div className="mb-2 px-3 py-1.5" style={{ backgroundColor: "var(--mdt-header)" }}>
            <div className="flex items-center justify-between">
              <span className="font-[family-name:var(--font-vt323)] text-base tracking-wider uppercase" style={{ color: "var(--mdt-header-text)" }}>
                Notatki funkcjonariuszy
              </span>
              {isDeleteNoteMode && (
                <span className="font-mono text-xs text-red-400">[TRYB USUWANIA]</span>
              )}
            </div>
          </div>

          <div className="panel-inset flex-1 overflow-auto p-3" style={{ backgroundColor: "var(--mdt-panel-content)" }}>
            {notes.map((note, idx) => (
              <div key={note.id} className="flex items-start gap-2 border-b border-[#999] py-1.5">
                <span className="font-mono text-sm" style={{ color: "var(--mdt-muted-text)" }}>
                  [{String(idx + 1).padStart(2, "0")}]
                </span>
                <div className="flex flex-1 flex-col">
                  <span className="font-mono text-sm break-words whitespace-pre-wrap" style={{ color: "var(--mdt-content-text)" }}>{note.content}</span>
                  <span className="font-mono text-[10px]" style={{ color: "var(--mdt-muted-text)" }}>— {note.officer}</span>
                </div>
                {isDeleteNoteMode ? (
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="shrink-0 inline-flex items-center justify-center hover:opacity-80"
                    title="Usuń notatkę"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 4h8l-.5 8H3.5L3 4z" fill="#c41e1e" />
                      <path d="M2.5 3h9v1h-9z" fill="#c41e1e" />
                      <path d="M5 2.5h4v1H5z" fill="#c41e1e" />
                      <path d="M5.5 5.5v5M7 5.5v5M8.5 5.5v5" stroke="#fff" strokeWidth="0.7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={() => onEditNote?.(note.id)}
                    className="shrink-0 inline-flex items-center justify-center hover:opacity-80"
                    title="Edytuj notatkę"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 10.5V12h1.5l6-6L8 4.5l-6 6z" fill="#4ade80" />
                      <path d="M9.5 3l1.5 1.5-1 1L8.5 4l1-1z" fill="#4ade80" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            {notes.length === 0 && (
              <div className="py-3 text-center font-mono text-xs" style={{ color: "#888" }}>BRAK NOTATEK</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="flex items-center justify-between border-t-2 border-t-[#555] px-4 py-2" style={{ backgroundColor: "var(--mdt-header)" }}>
        <div className="flex items-center gap-2">
          <div className="pulse-dot h-2 w-2 rounded-full bg-green-500" />
          <span className="font-mono text-sm" style={{ color: "#aaa" }}>POŁĄCZONO Z BAZĄ SASD</span>
        </div>
        <span className="font-mono text-sm" style={{ color: "#888" }}>DOSTĘP: {accessTime || "---"}</span>
        <span className="font-mono text-sm" style={{ color: "#888" }}>POZIOM DOSTĘPU: 3</span>
      </div>
    </div>
  )
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-36 shrink-0 font-mono text-[11px] font-bold" style={{ color: "var(--mdt-muted-text)" }}>{label}:</span>
      <span className="font-mono text-sm" style={{ color: valueColor || "var(--mdt-content-text)" }}>{value}</span>
    </div>
  )
}
