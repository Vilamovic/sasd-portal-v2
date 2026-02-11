"use client"

import { Shield, Maximize2, Minimize2 } from "lucide-react"

interface MdtHeaderProps {
  currentSection: string
  officerName: string
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
  onClose?: () => void
}

export function MdtHeader({ currentSection, officerName, isFullscreen, onToggleFullscreen, onClose }: MdtHeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-5 py-3"
      style={{ backgroundColor: "var(--mdt-header)" }}
    >
      <div className="flex items-center gap-3">
        <Shield className="h-7 w-7 text-amber-400" />
        <span
          className="font-[family-name:var(--font-vt323)] text-2xl tracking-wider"
          style={{ color: "var(--mdt-header-text)" }}
        >
          SASD
        </span>
        <span
          className="font-[family-name:var(--font-vt323)] text-2xl"
          style={{ color: "#888" }}
        >
          {">>"}
        </span>
        <span
          className="font-[family-name:var(--font-vt323)] text-2xl tracking-wider"
          style={{ color: "var(--mdt-header-text)" }}
        >
          {currentSection}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span
          className="font-[family-name:var(--font-vt323)] text-xl tracking-wide"
          style={{ color: "var(--mdt-header-text)" }}
        >
          {officerName}
        </span>
        <div className="flex gap-1">
          <button
            onClick={onToggleFullscreen}
            className="flex h-7 w-7 items-center justify-center cursor-pointer hover:brightness-110"
            style={{
              backgroundColor: "var(--mdt-blue-bar)",
              color: "#fff",
              border: "1px solid #555",
            }}
            aria-label={isFullscreen ? "Wyjdź z pełnego ekranu" : "Pełny ekran"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center text-base font-bold cursor-pointer hover:brightness-110"
            style={{
              backgroundColor: "#c41e1e",
              color: "#fff",
              border: "1px solid #555",
            }}
            aria-label="Zamknij MDT"
          >
            X
          </button>
        </div>
      </div>
    </header>
  )
}
