"use client"

import { useEffect } from "react"
import { useMdtDashboard } from "./hooks/useMdtDashboard"

interface MainDashboardProps {
  onSelectRecord: (id: string) => void
  onSwitchTab: (tab: string) => void
}

export function MainDashboard({ onSelectRecord, onSwitchTab }: MainDashboardProps) {
  const { stats, mostWanted, recentActivity, latestBolos, loading, loadDashboard } = useMdtDashboard()

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center" style={{ backgroundColor: "var(--mdt-content)" }}>
        <span className="font-mono text-sm" style={{ color: "var(--mdt-muted-text)" }}>
          INICJALIZACJA SYSTEMU... <span className="cursor-blink">_</span>
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden" style={{ backgroundColor: "var(--mdt-content)" }}>
      {/* Title bar */}
      <div className="px-4 py-2" style={{ backgroundColor: "var(--mdt-blue-bar)" }}>
        <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
          SASD Mobile Data Terminal — Ekran Główny
        </span>
      </div>

      {/* Dashboard grid */}
      <div className="flex-1 overflow-auto p-3">
        <div className="grid grid-cols-2 gap-3 h-full">
          {/* TOP LEFT: Most Wanted */}
          <div className="panel-inset flex flex-col" style={{ backgroundColor: "#0a0f0a" }}>
            <div className="px-3 py-1.5" style={{ backgroundColor: "var(--mdt-header)" }}>
              <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider" style={{ color: "#ff6b6b" }}>
                !! NAJBARDZIEJ POSZUKIWANI !!
              </span>
            </div>
            <div className="flex-1 p-3 overflow-auto">
              <div className="font-mono text-xs mb-2" style={{ color: "#555" }}>
                +--------------------------------------+
              </div>
              {mostWanted.length === 0 ? (
                <div className="font-mono text-xs" style={{ color: "#555" }}>
                  {"> "}BRAK REKORDÓW W SYSTEMIE
                </div>
              ) : (
                mostWanted.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => { onSwitchTab("kartoteka"); onSelectRecord(p.id) }}
                    className="flex w-full items-center gap-2 py-1 text-left hover:brightness-125 cursor-pointer"
                  >
                    <span className="font-mono text-xs font-bold" style={{ color: "#4ade80" }}>
                      {">"}{" "}
                    </span>
                    <span className="font-mono text-xs" style={{ color: p.wanted_status === "POSZUKIWANY" ? "#ff6b6b" : "#4ade80" }}>
                      {String(idx + 1).padStart(2, "0")}. {p.last_name.toUpperCase()}, {p.first_name}
                    </span>
                    <span className="ml-auto font-mono text-xs" style={{ color: "#ffc107" }}>
                      [{p.priors} wyr.]
                    </span>
                  </button>
                ))
              )}
              <div className="font-mono text-xs mt-2" style={{ color: "#555" }}>
                +--------------------------------------+
              </div>
            </div>
          </div>

          {/* TOP RIGHT: Latest BOLO */}
          <div className="panel-inset flex flex-col" style={{ backgroundColor: "#0a0a0f" }}>
            <div className="px-3 py-1.5" style={{ backgroundColor: "var(--mdt-header)" }}>
              <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider" style={{ color: "#ffc107" }}>
                POJAZDY BOLO — AKTYWNE
              </span>
            </div>
            <div className="flex-1 p-3 overflow-auto">
              {latestBolos.length === 0 ? (
                <div className="font-mono text-xs" style={{ color: "#555" }}>
                  BRAK AKTYWNYCH ALERTÓW BOLO
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left font-mono text-[10px] pb-1" style={{ color: "#888" }}>TABLICA</th>
                      <th className="text-left font-mono text-[10px] pb-1" style={{ color: "#888" }}>POJAZD</th>
                      <th className="text-left font-mono text-[10px] pb-1" style={{ color: "#888" }}>KOLOR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestBolos.map((b) => (
                      <tr key={b.id} className="cursor-pointer hover:brightness-125" onClick={() => onSwitchTab("bolo")}>
                        <td className="py-0.5 font-mono text-xs font-bold" style={{ color: "#4ade80" }}>{b.plate}</td>
                        <td className="py-0.5 font-mono text-xs" style={{ color: "#ccc" }}>{b.make} {b.model}</td>
                        <td className="py-0.5 font-mono text-xs" style={{ color: "#ccc" }}>{b.color}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* BOTTOM LEFT: Recent Activity */}
          <div className="panel-inset flex flex-col" style={{ backgroundColor: "#0a0a0a" }}>
            <div className="px-3 py-1.5" style={{ backgroundColor: "var(--mdt-header)" }}>
              <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider" style={{ color: "var(--mdt-header-text)" }}>
                OSTATNIA AKTYWNOŚĆ
              </span>
            </div>
            <div className="flex-1 p-3 overflow-auto">
              {recentActivity.length === 0 ? (
                <div className="font-mono text-xs" style={{ color: "#555" }}>
                  BRAK AKTYWNOŚCI W SYSTEMIE
                </div>
              ) : (
                recentActivity.map((a) => {
                  const time = a.created_at ? new Date(a.created_at).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }) : "--:--"
                  const rec = Array.isArray(a.record) ? a.record[0] : a.record
                  const personName = rec
                    ? `${rec.last_name}, ${rec.first_name}`
                    : "Nieznany"
                  return (
                    <div key={a.id} className="flex items-center gap-2 py-0.5 border-b border-[#1a1a1a]">
                      <span className="font-mono text-[10px] shrink-0" style={{ color: "#555" }}>[{time}]</span>
                      <span className="font-mono text-[10px]" style={{ color: a.status === "SKAZANY" ? "#c41e1e" : "#4ade80" }}>
                        WPIS
                      </span>
                      <span className="font-mono text-[10px] truncate" style={{ color: "#ccc" }}>
                        {a.offense} — {personName}
                      </span>
                      <span className="ml-auto font-mono text-[10px] shrink-0" style={{ color: "#888" }}>
                        ({a.officer})
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* BOTTOM RIGHT: System Stats */}
          <div className="panel-inset flex flex-col" style={{ backgroundColor: "#0a0a0a" }}>
            <div className="px-3 py-1.5" style={{ backgroundColor: "var(--mdt-header)" }}>
              <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider" style={{ color: "var(--mdt-header-text)" }}>
                STATYSTYKI SYSTEMU
              </span>
            </div>
            <div className="flex-1 p-4 flex flex-col justify-center gap-4">
              <StatBar label="KARTOTEKI" value={stats.totalRecords} max={50} color="#4ade80" />
              <StatBar label="AKT. NAKAZY" value={stats.activeWarrants} max={20} color="#ff6b6b" />
              <StatBar label="AKT. BOLO" value={stats.activeBolos} max={20} color="#ffc107" />

              <div className="mt-4 border-t border-[#333] pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="pulse-dot h-2 w-2 rounded-full bg-green-500" />
                  <span className="font-[family-name:var(--font-vt323)] text-sm" style={{ color: "#4ade80" }}>
                    SYSTEM STATUS: ONLINE
                  </span>
                </div>
                <div className="font-mono text-[10px] flex flex-col gap-0.5" style={{ color: "#555" }}>
                  <span>WERSJA: SASD MDT v2.4.1</span>
                  <span>BAZA DANYCH: POŁĄCZONO</span>
                  <span>SZYFROWANIE: AES-256</span>
                  <span>UPTIME: 99.7%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-mono text-xs" style={{ color: "#888" }}>{label}</span>
        <span className="font-mono text-xs font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-3 w-full" style={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}>
        <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.8 }} />
      </div>
    </div>
  )
}
