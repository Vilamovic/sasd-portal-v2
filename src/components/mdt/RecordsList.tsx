"use client"

import type { MdtRecord } from "./types"

interface RecordsListProps {
  records: MdtRecord[]
  loading: boolean
  onSelectRecord: (id: string) => void
  onCreateNew: () => void
}

export function RecordsList({ records, loading, onSelectRecord, onCreateNew }: RecordsListProps) {
  return (
    <div
      className="flex flex-1 flex-col overflow-hidden"
      style={{ backgroundColor: "var(--mdt-content)" }}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: "var(--mdt-blue-bar)" }}>
        <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
          Kartoteki — Lista osób
        </span>
        <button
          onClick={onCreateNew}
          className="btn-win95 text-xs"
          style={{ backgroundColor: "#3a6a3a", color: "#fff", borderColor: "#5a9a5a #1a3a1a #1a3a1a #5a9a5a" }}
        >
          + DODAJ OSOBĘ
        </button>
      </div>

      {/* Table */}
      <div className="panel-inset flex-1 overflow-auto m-3" style={{ backgroundColor: "var(--mdt-panel-content)" }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="font-mono text-sm" style={{ color: "var(--mdt-muted-text)" }}>
              ŁADOWANIE DANYCH...
              <span className="cursor-blink ml-1">_</span>
            </span>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "var(--mdt-header)" }}>
                <th className="px-3 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">NAZWISKO</th>
                <th className="px-3 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">IMIĘ</th>
                <th className="px-3 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">NICK</th>
                <th className="px-3 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">STATUS</th>
                <th className="px-3 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">WYROKI</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr
                  key={r.id}
                  onClick={() => onSelectRecord(r.id)}
                  className="cursor-pointer hover:brightness-110"
                  style={{
                    backgroundColor: idx % 2 === 0 ? "var(--mdt-row-even)" : "var(--mdt-row-odd)",
                    color: "var(--mdt-content-text)",
                  }}
                >
                  <td className="px-3 py-2 font-mono text-sm font-bold">{r.last_name}</td>
                  <td className="px-3 py-2 font-mono text-sm">{r.first_name}</td>
                  <td className="px-3 py-2 font-mono text-sm">{r.ssn || "—"}</td>
                  <td className="px-3 py-2 font-mono text-sm">
                    <span style={{
                      color: r.wanted_status === "POSZUKIWANY" ? "#c41e1e" : r.wanted_status === "BRAK" ? "#1a6a1a" : "var(--mdt-content-text)",
                      fontWeight: r.wanted_status === "POSZUKIWANY" ? 700 : 400,
                    }}>
                      {r.wanted_status}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-sm">{r.priors}</td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr style={{ backgroundColor: "var(--mdt-row-even)" }}>
                  <td colSpan={5} className="px-3 py-8 text-center font-mono text-xs" style={{ color: "#888" }}>
                    BRAK REKORDÓW W BAZIE DANYCH
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Bottom status */}
      <div className="flex items-center justify-between border-t-2 border-t-[#555] px-4 py-2" style={{ backgroundColor: "var(--mdt-header)" }}>
        <div className="flex items-center gap-2">
          <div className="pulse-dot h-2 w-2 rounded-full bg-green-500" />
          <span className="font-mono text-sm" style={{ color: "#aaa" }}>POŁĄCZONO Z BAZĄ SASD</span>
        </div>
        <span className="font-mono text-sm" style={{ color: "#888" }}>
          REKORDY: {records.length}
        </span>
      </div>
    </div>
  )
}
