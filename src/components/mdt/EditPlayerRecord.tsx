"use client"

import React from "react"
import { useState, useRef } from "react"
import type { MdtRecord } from "./types"

interface EditPlayerRecordProps {
  record: MdtRecord
  onSave: (updates: Partial<MdtRecord>, newMugshotUrl: string | null) => void
  onCancel: () => void
}

export function EditPlayerRecord({ record, onSave, onCancel }: EditPlayerRecordProps) {
  const [form, setForm] = useState({
    first_name: record.first_name,
    last_name: record.last_name,
    dob: record.dob || "",
    ssn: record.ssn || "",
    gender: record.gender || "Mężczyzna",
    race: record.race || "",
    height: record.height || "",
    weight: record.weight || "",
    hair: record.hair || "",
    eyes: record.eyes || "",
    address: record.address || "",
    phone: record.phone || "",
    license_no: record.license_no || "",
    license_status: record.license_status || "AKTYWNY",
    wanted_status: record.wanted_status || "BRAK",
    gang_affiliation: record.gang_affiliation || "NIEZNANE",
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(record.mugshot_url)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleImportPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  function handleSave() {
    onSave(form, previewUrl)
  }

  const fields: { label: string; key: string; type?: "select"; options?: string[] }[] = [
    { label: "IMIĘ", key: "first_name" },
    { label: "NAZWISKO", key: "last_name" },
    { label: "DATA UR.", key: "dob" },
    { label: "PESEL", key: "ssn" },
    { label: "PŁEĆ", key: "gender", type: "select", options: ["Mężczyzna", "Kobieta"] },
    { label: "RASA", key: "race" },
    { label: "WZROST", key: "height" },
    { label: "WAGA", key: "weight" },
    { label: "WŁOSY", key: "hair" },
    { label: "OCZY", key: "eyes" },
    { label: "ADRES", key: "address" },
    { label: "TELEFON", key: "phone" },
    { label: "NR PRAWA", key: "license_no" },
    { label: "ST. PRAWA", key: "license_status", type: "select", options: ["AKTYWNY", "ZAWIESZONY", "COFNIĘTY"] },
    { label: "POSZUK.", key: "wanted_status", type: "select", options: ["BRAK", "AKTYWNY", "POSZUKIWANY"] },
    { label: "GANG", key: "gang_affiliation" },
  ]

  const licenseId = form.license_no ? form.license_no.split("-").pop() : "N/A"

  return (
    <div
      className="flex flex-1 flex-col overflow-hidden"
      style={{ backgroundColor: "var(--mdt-content)" }}
    >
      {/* Section title bar */}
      <div className="px-3 py-1" style={{ backgroundColor: "var(--mdt-blue-bar)" }}>
        <span className="font-[family-name:var(--font-vt323)] text-sm tracking-widest uppercase text-white">
          Edycja danych - {record.last_name}, {record.first_name}
        </span>
      </div>

      <div className="flex flex-1 overflow-auto">
        {/* Left column - Photo */}
        <div className="flex w-64 flex-col border-r-2 border-r-[#808080] p-3">
          <div
            className="panel-inset mb-2 flex h-44 w-full items-center justify-center"
            style={{ backgroundColor: "var(--mdt-surface-light)" }}
          >
            {previewUrl ? (
              <div className="flex flex-col items-center gap-1">
                <img
                  src={previewUrl}
                  alt={`Zdjęcie ${form.first_name} ${form.last_name}`}
                  className="h-32 w-28 object-cover"
                  style={{ border: "1px solid #555" }}
                />
                <span className="font-mono text-xs" style={{ color: "var(--mdt-content-text)" }}>
                  SASD-{licenseId}
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
                  SASD-{licenseId}
                </span>
              </div>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImportPhoto} />
          <button className="btn-win95 mb-4 w-full text-xs" onClick={() => fileInputRef.current?.click()}>
            IMPORTUJ ZDJĘCIE
          </button>

          <div className="mt-auto flex flex-col gap-1">
            <button
              className="btn-win95 w-full text-xs"
              style={{ backgroundColor: "#3a6a3a", color: "#fff", borderColor: "#5a9a5a #1a3a1a #1a3a1a #5a9a5a" }}
              onClick={handleSave}
            >
              ZAPISZ ZMIANY
            </button>
            <button className="btn-win95 w-full text-xs" onClick={onCancel}>
              ANULUJ
            </button>
          </div>
        </div>

        {/* Right column - Editable fields */}
        <div className="flex flex-1 flex-col p-3">
          <div className="mb-3 px-2 py-1" style={{ backgroundColor: "var(--mdt-header)" }}>
            <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider uppercase" style={{ color: "var(--mdt-header-text)" }}>
              Dane osobowe
            </span>
          </div>

          <div className="panel-inset flex-1 overflow-auto p-3" style={{ backgroundColor: "var(--mdt-surface-light)" }}>
            <div className="flex flex-col gap-2">
              {fields.map((field) => (
                <div key={field.key} className="flex items-center gap-2">
                  <label
                    htmlFor={`edit-${field.key}`}
                    className="w-24 shrink-0 font-mono text-xs font-bold"
                    style={{ color: "var(--mdt-muted-text)" }}
                  >
                    {field.label}:
                  </label>
                  {field.type === "select" ? (
                    <select
                      id={`edit-${field.key}`}
                      value={form[field.key as keyof typeof form]}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="panel-inset flex-1 px-2 py-1 font-mono text-xs"
                      style={{ backgroundColor: "var(--mdt-input-bg)", color: "var(--mdt-content-text)", outline: "none", cursor: "pointer" }}
                    >
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`edit-${field.key}`}
                      type="text"
                      value={form[field.key as keyof typeof form]}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="panel-inset flex-1 px-2 py-1 font-mono text-xs"
                      style={{ backgroundColor: "var(--mdt-input-bg)", color: "var(--mdt-content-text)", outline: "none" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="flex items-center justify-between border-t-2 border-t-[#555] px-3 py-1" style={{ backgroundColor: "var(--mdt-header)" }}>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="font-mono text-xs" style={{ color: "#aaa" }}>TRYB EDYCJI - NIEZAPISANE ZMIANY</span>
        </div>
        <span className="font-mono text-xs" style={{ color: "#888" }}>
          EDYCJA: {new Date().toLocaleDateString("pl-PL")} {new Date().toLocaleTimeString("pl-PL", { hour12: false })}
        </span>
      </div>
    </div>
  )
}
