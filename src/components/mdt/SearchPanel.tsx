"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import { Search } from "lucide-react"
import { searchMdtRecords, searchBoloVehicles } from "@/src/lib/db/mdt"
import type { SearchSuggestion } from "./types"

interface SearchPanelProps {
  onSelectRecord: (id: string) => void
  onSelectBolo: () => void
  onSwitchTab: (tab: string) => void
  onSearch: (query: string) => void
}

export function SearchPanel({ onSelectRecord, onSelectBolo, onSwitchTab, onSearch }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const lastPersonCount = useRef(0)
  const lastVehicleCount = useRef(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    const [recordsRes, boloRes] = await Promise.all([
      searchMdtRecords(query),
      searchBoloVehicles(query),
    ])

    const results: SearchSuggestion[] = []

    if (recordsRes.data) {
      recordsRes.data.forEach((r) => {
        results.push({
          type: "person",
          id: r.id,
          label: `${r.last_name}, ${r.first_name}`,
          sublabel: r.wanted_status !== "BRAK" ? "POSZUKIWANY" : `${r.priors} wyroków`,
        })
      })
    }

    if (boloRes.data) {
      boloRes.data.forEach((v) => {
        results.push({
          type: "vehicle",
          id: v.id,
          label: v.plate,
          sublabel: `${v.make} ${v.model} - ${v.color}`,
        })
      })
    }

    const persons = results.filter((r) => r.type === "person")
    const vehicles = results.filter((r) => r.type === "vehicle")
    lastPersonCount.current = persons.length
    lastVehicleCount.current = vehicles.length
    setSuggestions(results)
    setShowDropdown(results.length > 0)
  }, [])

  const handleInputChange = (value: string) => {
    setSearchQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setShowDropdown(false)
      if (lastPersonCount.current === 0 && lastVehicleCount.current > 0) {
        onSwitchTab("bolo")
      } else {
        onSwitchTab("kartoteka")
        onSearch(searchQuery)
      }
    }
    if (e.key === "Escape") {
      setShowDropdown(false)
    }
  }

  const handleSelectSuggestion = (s: SearchSuggestion) => {
    setShowDropdown(false)
    setSearchQuery("")
    if (s.type === "person") {
      onSwitchTab("kartoteka")
      onSelectRecord(s.id)
    } else {
      onSwitchTab("bolo")
      onSelectBolo()
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const personSuggestions = suggestions.filter((s) => s.type === "person")
  const vehicleSuggestions = suggestions.filter((s) => s.type === "vehicle")

  return (
    <div
      ref={containerRef}
      className="relative flex items-center gap-3 border-b-2 border-b-[#555] px-5 py-3"
      style={{ backgroundColor: "var(--mdt-sidebar)" }}
    >
      <Search className="h-5 w-5" style={{ color: "#888" }} />
      <label htmlFor="mdt-search" className="sr-only">Szukaj w kartotece</label>
      <input
        id="mdt-search"
        type="text"
        value={searchQuery}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        placeholder="Wpisz imię, nazwisko, nick, gang, tablicę rej..."
        className="panel-inset flex-1 px-3 py-1.5 font-mono text-sm"
        style={{
          backgroundColor: "var(--mdt-input-bg)",
          color: "var(--mdt-content-text)",
          outline: "none",
        }}
        autoComplete="off"
      />
      <button
        onClick={() => {
          setShowDropdown(false)
          onSwitchTab("kartoteka")
          onSearch(searchQuery)
        }}
        className="btn-win95 text-sm"
      >
        SZUKAJ
      </button>

      {/* Suggestions dropdown */}
      {showDropdown && (
        <div
          className="absolute left-5 right-5 top-full z-[100] max-h-64 overflow-auto panel-raised"
          style={{ backgroundColor: "var(--mdt-sidebar)", border: "2px solid #555" }}
        >
          {personSuggestions.length > 0 && (
            <>
              <div className="px-3 py-1" style={{ backgroundColor: "var(--mdt-header)" }}>
                <span className="font-[family-name:var(--font-vt323)] text-xs tracking-wider" style={{ color: "var(--mdt-header-text)" }}>
                  OSOBY
                </span>
              </div>
              {personSuggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSuggestion(s)}
                  className="flex w-full items-center justify-between px-3 py-2 font-mono text-xs hover:brightness-110 cursor-pointer"
                  style={{
                    backgroundColor: "var(--mdt-panel-content)",
                    color: "var(--mdt-content-text)",
                    borderBottom: "1px solid #555",
                  }}
                >
                  <span>{s.label}</span>
                  <span style={{ color: s.sublabel === "POSZUKIWANY" ? "#c41e1e" : "var(--mdt-muted-text)" }}>
                    {s.sublabel}
                  </span>
                </button>
              ))}
            </>
          )}
          {vehicleSuggestions.length > 0 && (
            <>
              <div className="px-3 py-1" style={{ backgroundColor: "var(--mdt-header)" }}>
                <span className="font-[family-name:var(--font-vt323)] text-xs tracking-wider" style={{ color: "var(--mdt-header-text)" }}>
                  POJAZDY BOLO
                </span>
              </div>
              {vehicleSuggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSuggestion(s)}
                  className="flex w-full items-center justify-between px-3 py-2 font-mono text-xs hover:brightness-110 cursor-pointer"
                  style={{
                    backgroundColor: "var(--mdt-panel-content)",
                    color: "var(--mdt-content-text)",
                    borderBottom: "1px solid #555",
                  }}
                >
                  <span className="font-bold">{s.label}</span>
                  <span style={{ color: "var(--mdt-muted-text)" }}>{s.sublabel}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
