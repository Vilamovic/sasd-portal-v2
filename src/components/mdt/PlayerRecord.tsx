"use client"

import React from "react"
import { useState, useRef } from "react"
import type { PlayerData } from "./types"

interface PlayerRecordProps {
  player: PlayerData
  mugshotUrl: string | null
  onMugshotChange: (url: string | null) => void
  isDeleteRecordMode: boolean
  onDeleteRecord: (idx: number) => void
  isDeleteNoteMode: boolean
  onDeleteNote: (idx: number) => void
}

export function PlayerRecord({
  player,
  mugshotUrl,
  onMugshotChange,
  isDeleteRecordMode,
  onDeleteRecord,
  isDeleteNoteMode,
  onDeleteNote,
}: PlayerRecordProps) {
  const [selectedRecord, setSelectedRecord] = useState<number | null>(null)
  const [accessTime, setAccessTime] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setAccessTime(
      `${new Date().toLocaleDateString("pl-PL")} ${new Date().toLocaleTimeString("pl-PL", { hour12: false })}`
    )
  }, [])

  function handleImportPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      onMugshotChange(url)
    }
  }

  return (
    <div
      className="flex flex-1 flex-col overflow-hidden"
      style={{ backgroundColor: "var(--mdt-content)" }}
    >
      {/* Section title bar */}
      <div className="px-4 py-2" style={{ backgroundColor: "var(--mdt-blue-bar)" }}>
        <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
          Kartoteka karna - {player.lastName}, {player.firstName}
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left column - Personal info + mugshot */}
        <div className="flex w-72 flex-col border-r-2 border-r-[#808080] p-4 overflow-auto">
          {/* Mugshot area */}
          <div
            className="panel-inset mb-2 flex h-44 w-full items-center justify-center"
            style={{ backgroundColor: "var(--mdt-surface-light)" }}
          >
            {mugshotUrl ? (
              <div className="flex flex-col items-center gap-1">
                <img
                  src={mugshotUrl}
                  alt={`Zdjęcie ${player.firstName} ${player.lastName}`}
                  className="h-32 w-28 object-cover"
                  style={{ border: "1px solid #555" }}
                />
                <span className="font-mono text-xs" style={{ color: "var(--mdt-content-text)" }}>
                  SASD-{player.licenseNo.split("-").pop()}
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
                  SASD-{player.licenseNo.split("-").pop()}
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
          >
            IMPORTUJ ZDJĘCIE
          </button>

          {/* Personal details */}
          <div className="flex flex-col gap-1">
            <InfoRow label="NAZWISKO" value={`${player.lastName}, ${player.firstName}`} />
            <InfoRow label="DATA UR." value={player.dob} />
            <InfoRow label="PESEL" value={player.ssn} />
            <InfoRow label="PŁEĆ" value={player.gender} />
            <InfoRow label="RASA" value={player.race} />
            <InfoRow label="WZROST" value={player.height} />
            <InfoRow label="WAGA" value={player.weight} />
            <InfoRow label="WŁOSY" value={player.hair} />
            <InfoRow label="OCZY" value={player.eyes} />

            <div className="my-1 border-t border-[#999]" />

            <InfoRow label="ADRES" value={player.address} />
            <InfoRow label="TELEFON" value={player.phone} />
            <InfoRow label="NR PRAWA" value={player.licenseNo} />
            <InfoRow
              label="ST. PRAWA"
              value={player.licenseStatus}
              valueColor={player.licenseStatus === "ZAWIESZONY" ? "#c41e1e" : "#1a6a1a"}
            />
            <InfoRow label="GANG" value={player.gangAffiliation} />
            <InfoRow label="WYROKI" value={String(player.priors)} />

            {/* Wanted status box */}
            {player.wantedStatus !== "BRAK" && (
              <>
                <div className="my-1 border-t border-[#999]" />
                <div
                  className="glow-red panel-inset p-2"
                  style={{ backgroundColor: "#4a1a1a" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500 pulse-dot" />
                    <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider text-red-400">
                      POSZUKIWANY
                    </span>
                  </div>
                </div>
              </>
            )}
            {player.wantedStatus === "BRAK" && (
              <InfoRow
                label="POSZUK."
                value="BRAK"
                valueColor="#1a6a1a"
              />
            )}

            {/* Warrant display */}
            {player.warrant && (
              <>
                <div className="my-1 border-t border-[#999]" />
                <div
                  className={`panel-inset p-2 ${player.warrant.type === "NO-KNOCK" ? "glow-red" : "glow-amber"}`}
                  style={{
                    backgroundColor: player.warrant.type === "NO-KNOCK" ? "#5a1a1a" : "#4a3a1a",
                  }}
                >
                  <span className="font-[family-name:var(--font-vt323)] text-xs tracking-wider text-white">
                    AKTYWNY NAKAZ
                  </span>
                  <div className="mt-1 flex flex-col gap-0.5">
                    <span
                      className="font-mono text-[10px] font-bold"
                      style={{
                        color: player.warrant.type === "NO-KNOCK" ? "#ff6b6b" : "#ffc107",
                      }}
                    >
                      TYP: NAKAZ {player.warrant.type}
                    </span>
                    <span className="font-mono text-[10px] text-[#ccc]">
                      POWÓD: {player.warrant.reason}
                    </span>
                    <span className="font-mono text-[10px] text-[#ccc]">
                      DATA: {player.warrant.issuedDate}
                    </span>
                    <span className="font-mono text-[10px] text-[#ccc]">
                      WYSTAWIŁ: {player.warrant.officer}
                    </span>
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
                <span className="font-mono text-xs text-red-400">
                  [TRYB USUWANIA]
                </span>
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
                  {isDeleteRecordMode && (
                    <th className="w-8 px-1 py-1 text-center font-[family-name:var(--font-vt323)] text-xs tracking-wider text-[#ccc]" />
                  )}
                </tr>
              </thead>
              <tbody>
                {player.records.map((record, idx) => (
                  <tr
                    key={`${record.date}-${record.code}-${idx}`}
                    onClick={() => !isDeleteRecordMode && setSelectedRecord(selectedRecord === idx ? null : idx)}
                    className="cursor-pointer"
                    style={{
                      backgroundColor:
                        selectedRecord === idx
                          ? "var(--mdt-blue-bar)"
                          : idx % 2 === 0
                            ? "var(--mdt-row-even)"
                            : "var(--mdt-row-odd)",
                      color: selectedRecord === idx ? "#fff" : "var(--mdt-content-text)",
                    }}
                  >
                    <td className="px-3 py-1.5 font-mono text-sm">{record.date}</td>
                    <td className="px-3 py-1.5 font-mono text-sm">{record.offense}</td>
                    <td className="px-3 py-1.5 font-mono text-sm">{record.code}</td>
                    <td className="px-3 py-1.5 font-mono text-sm">
                      <span
                        style={{
                          color:
                            selectedRecord === idx
                              ? "#fff"
                              : record.status === "SKAZANY"
                                ? "#c41e1e"
                                : record.status === "ODDALONO"
                                  ? "#555"
                                  : "var(--mdt-content-text)",
                          fontWeight: record.status === "SKAZANY" ? 700 : 400,
                        }}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 font-mono text-sm">{record.officer}</td>
                    {isDeleteRecordMode && (
                      <td className="px-1 py-1 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteRecord(idx)
                          }}
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
                  </tr>
                ))}
                {player.records.length === 0 && (
                  <tr style={{ backgroundColor: "var(--mdt-row-even)" }}>
                    <td colSpan={isDeleteRecordMode ? 6 : 5} className="px-2 py-3 text-center font-mono text-xs" style={{ color: "#888" }}>
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
                <span className="font-mono text-xs text-red-400">
                  [TRYB USUWANIA]
                </span>
              )}
            </div>
          </div>

          <div className="panel-inset flex-1 overflow-auto p-3" style={{ backgroundColor: "var(--mdt-panel-content)" }}>
            {player.notes.map((note, idx) => (
              <div
                key={`note-${idx}`}
                className="flex items-start gap-2 border-b border-[#999] py-1.5"
              >
                <span className="font-mono text-sm" style={{ color: "var(--mdt-muted-text)" }}>
                  [{String(idx + 1).padStart(2, "0")}]
                </span>
                <span className="flex-1 font-mono text-sm" style={{ color: "var(--mdt-content-text)" }}>
                  {note}
                </span>
                {isDeleteNoteMode && (
                  <button
                    onClick={() => onDeleteNote(idx)}
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
                )}
              </div>
            ))}
            {player.notes.length === 0 && (
              <div className="py-3 text-center font-mono text-xs" style={{ color: "#888" }}>
                BRAK NOTATEK
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div
        className="flex items-center justify-between border-t-2 border-t-[#555] px-4 py-2"
        style={{ backgroundColor: "var(--mdt-header)" }}
      >
        <div className="flex items-center gap-2">
          <div className="pulse-dot h-2 w-2 rounded-full bg-green-500" />
          <span className="font-mono text-sm" style={{ color: "#aaa" }}>
            POŁĄCZONO Z BAZĄ SASD
          </span>
        </div>
        <span className="font-mono text-sm" style={{ color: "#888" }}>
          DOSTĘP: {accessTime || "---"}
        </span>
        <span className="font-mono text-sm" style={{ color: "#888" }}>
          POZIOM DOSTĘPU: 3
        </span>
      </div>
    </div>
  )
}

function InfoRow({
  label,
  value,
  valueColor,
}: {
  label: string
  value: string
  valueColor?: string
}) {
  return (
    <div className="flex gap-2">
      <span className="w-24 shrink-0 font-mono text-sm font-bold" style={{ color: "var(--mdt-muted-text)" }}>
        {label}:
      </span>
      <span className="font-mono text-sm" style={{ color: valueColor || "var(--mdt-content-text)" }}>
        {value}
      </span>
    </div>
  )
}
