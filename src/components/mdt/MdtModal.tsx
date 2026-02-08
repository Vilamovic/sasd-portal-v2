"use client"

import React from "react"

interface MdtModalProps {
  title: string
  children: React.ReactNode
  onClose: () => void
}

export function MdtModal({ title, children, onClose }: MdtModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div
        className="panel-raised flex w-[460px] flex-col"
        style={{ backgroundColor: "var(--mdt-btn-face)" }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-3 py-1.5"
          style={{ backgroundColor: "var(--mdt-blue-bar)" }}
        >
          <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider text-white uppercase">
            {title}
          </span>
          <button
            className="flex h-4 w-4 items-center justify-center text-[10px] font-bold"
            style={{
              backgroundColor: "#c41e1e",
              color: "#fff",
              border: "1px solid #555",
            }}
            onClick={onClose}
            aria-label="Zamknij"
          >
            X
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          {children}
        </div>
      </div>
    </div>
  )
}
