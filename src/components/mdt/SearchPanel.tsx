"use client"

import React from "react"
import { useState } from "react"
import { Search } from "lucide-react"

interface SearchPanelProps {
  onSearch: (name: string) => void
}

export function SearchPanel({ onSearch }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div
      className="flex items-center gap-3 border-b-2 border-b-[#555] px-5 py-3"
      style={{ backgroundColor: "var(--mdt-sidebar)" }}
    >
      <Search className="h-5 w-5" style={{ color: "#888" }} />
      <label htmlFor="mdt-search" className="sr-only">Szukaj w kartotece</label>
      <input
        id="mdt-search"
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Wpisz imię, nazwisko lub ID..."
        className="panel-inset flex-1 px-3 py-1.5 font-mono text-sm"
        style={{
          backgroundColor: "var(--mdt-input-bg)",
          color: "var(--mdt-content-text)",
          outline: "none",
        }}
      />
      <button onClick={handleSearch} className="btn-win95 text-sm">
        SZUKAJ
      </button>
    </div>
  )
}
