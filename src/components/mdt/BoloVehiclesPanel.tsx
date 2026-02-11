"use client"

import { useState } from "react"
import type { MdtBoloVehicle } from "./types"
import { MdtModal } from "./MdtModal"

interface BoloVehiclesPanelProps {
  vehicles: MdtBoloVehicle[]
  loading: boolean
  filterStatus: string
  onChangeFilter: (status: string) => void
  onCreate: (data: { plate: string; make: string; model: string; color: string; reason: string; reported_by: string; created_by?: string }) => void
  onUpdate: (id: string, data: Partial<MdtBoloVehicle>) => void
  onDelete: (id: string) => void
  onResolve: (id: string) => void
  officerName: string
  userId?: string
}

const emptyForm = { plate: "", make: "", model: "", color: "", reason: "", reported_by: "" }

export function BoloVehiclesPanel({
  vehicles, loading, filterStatus, onChangeFilter,
  onCreate, onUpdate, onDelete, onResolve,
  officerName, userId,
}: BoloVehiclesPanelProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  function openAdd() {
    setForm({ ...emptyForm, reported_by: officerName })
    setEditingId(null)
    setShowAddModal(true)
  }

  function openEdit(v: MdtBoloVehicle) {
    setForm({ plate: v.plate, make: v.make || "", model: v.model || "", color: v.color || "", reason: v.reason || "", reported_by: v.reported_by || "" })
    setEditingId(v.id)
    setShowAddModal(true)
  }

  function handleSubmit() {
    if (!form.plate.trim()) return
    if (editingId) {
      onUpdate(editingId, form)
    } else {
      onCreate({ ...form, created_by: userId })
    }
    setShowAddModal(false)
    setForm(emptyForm)
    setEditingId(null)
  }

  const filters = [
    { id: "ACTIVE", label: "AKTYWNE" },
    { id: "RESOLVED", label: "ZAKOŃCZONE" },
    { id: "ALL", label: "WSZYSTKIE" },
  ]

  return (
    <div className="flex flex-1 flex-col overflow-hidden" style={{ backgroundColor: "var(--mdt-content)" }}>
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: "var(--mdt-blue-bar)" }}>
        <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
          Pojazdy BOLO
        </span>
        <div className="flex items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => onChangeFilter(f.id)}
              className={`btn-win95 text-xs ${filterStatus === f.id ? "btn-win95-active" : ""}`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={openAdd}
            className="btn-win95 text-xs"
            style={{ backgroundColor: "#3a6a3a", color: "#fff", borderColor: "#5a9a5a #1a3a1a #1a3a1a #5a9a5a" }}
          >
            + DODAJ BOLO
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="panel-inset flex-1 overflow-auto m-3" style={{ backgroundColor: "var(--mdt-panel-content)" }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="font-mono text-sm" style={{ color: "var(--mdt-muted-text)" }}>
              ŁADOWANIE... <span className="cursor-blink">_</span>
            </span>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "var(--mdt-header)" }}>
                <th className="px-3 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">TABLICA</th>
                <th className="px-3 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">MARKA/MODEL</th>
                <th className="px-3 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">KOLOR</th>
                <th className="px-3 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">POWÓD</th>
                <th className="px-3 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">STATUS</th>
                <th className="px-3 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">ZGŁOSIŁ</th>
                <th className="px-3 py-2 text-center font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">AKCJE</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v, idx) => (
                <tr
                  key={v.id}
                  style={{
                    backgroundColor: idx % 2 === 0 ? "var(--mdt-row-even)" : "var(--mdt-row-odd)",
                    color: "var(--mdt-content-text)",
                  }}
                >
                  <td className="px-3 py-2 font-mono text-sm font-bold">{v.plate}</td>
                  <td className="px-3 py-2 font-mono text-sm">{v.make} {v.model}</td>
                  <td className="px-3 py-2 font-mono text-sm">{v.color || "—"}</td>
                  <td className="px-3 py-2 font-mono text-sm max-w-48 truncate">{v.reason || "—"}</td>
                  <td className="px-3 py-2 font-mono text-sm">
                    <span style={{
                      color: v.status === "ACTIVE" ? "#4ade80" : "#888",
                      fontWeight: v.status === "ACTIVE" ? 700 : 400,
                    }}>
                      {v.status === "ACTIVE" ? "AKTYWNY" : "ZAKOŃCZONY"}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-sm">{v.reported_by || "—"}</td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(v)} className="btn-win95 text-[10px] px-2 py-0.5">EDYTUJ</button>
                      {v.status === "ACTIVE" && (
                        <button onClick={() => onResolve(v.id)} className="btn-win95 text-[10px] px-2 py-0.5" style={{ color: "#4ade80" }}>
                          ROZWIĄŻ
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(v.id)}
                        className="btn-win95 text-[10px] px-2 py-0.5"
                        style={{ color: "#c41e1e" }}
                      >
                        USUŃ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr style={{ backgroundColor: "var(--mdt-row-even)" }}>
                  <td colSpan={7} className="px-3 py-8 text-center font-mono text-xs" style={{ color: "#888" }}>
                    BRAK POJAZDÓW BOLO
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
        <span className="font-mono text-sm" style={{ color: "#888" }}>POJAZDY: {vehicles.length}</span>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <MdtModal title={editingId ? "Edytuj pojazd BOLO" : "Dodaj pojazd BOLO"} onClose={() => setShowAddModal(false)}>
          <div className="flex flex-col gap-3">
            {[
              { label: "TABLICA", key: "plate", placeholder: "np. LSC 4X21" },
              { label: "MARKA", key: "make", placeholder: "np. Vapid" },
              { label: "MODEL", key: "model", placeholder: "np. Crown Victoria" },
              { label: "KOLOR", key: "color", placeholder: "np. Czarny" },
              { label: "ZGŁOSIŁ", key: "reported_by", placeholder: "np. Dep. Morrison" },
            ].map((f) => (
              <div key={f.key} className="flex items-center gap-2">
                <label className="w-24 shrink-0 font-mono text-xs font-bold" style={{ color: "var(--mdt-muted-text)" }}>
                  {f.label}:
                </label>
                <input
                  type="text"
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  className="panel-inset flex-1 px-2 py-1 font-mono text-xs"
                  style={{ backgroundColor: "var(--mdt-input-bg)", color: "var(--mdt-content-text)", outline: "none" }}
                  placeholder={f.placeholder}
                />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs font-bold" style={{ color: "var(--mdt-muted-text)" }}>POWÓD:</label>
              <textarea
                value={form.reason}
                onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                rows={3}
                className="panel-inset w-full resize-none px-2 py-1 font-mono text-xs"
                style={{ backgroundColor: "var(--mdt-input-bg)", color: "var(--mdt-content-text)", outline: "none" }}
                placeholder="Powód poszukiwania pojazdu..."
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-[#999] pt-3">
              <button
                className="btn-win95 text-xs"
                style={{ backgroundColor: "#3a6a3a", color: "#fff", borderColor: "#5a9a5a #1a3a1a #1a3a1a #5a9a5a" }}
                onClick={handleSubmit}
              >
                {editingId ? "ZAPISZ" : "DODAJ BOLO"}
              </button>
              <button className="btn-win95 text-xs" onClick={() => setShowAddModal(false)}>ANULUJ</button>
            </div>
          </div>
        </MdtModal>
      )}
    </div>
  )
}
