"use client"

import { useState, useEffect } from "react"

const cameras = [
  { id: "CAM-01", location: "EAST LOS SANTOS", status: "online" },
  { id: "CAM-02", location: "VINEWOOD BLVD", status: "online" },
  { id: "CAM-03", location: "DOWNTOWN LS", status: "online" },
  { id: "CAM-04", location: "SANDY SHORES", status: "online" },
  { id: "CAM-05", location: "PALETO BAY", status: "offline" },
  { id: "CAM-06", location: "DEL PERRO PIER", status: "online" },
]

export function MonitoringPanel() {
  const [time, setTime] = useState("")

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString("pl-PL", { hour12: false }))
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-1 flex-col overflow-hidden" style={{ backgroundColor: "var(--mdt-content)" }}>
      {/* Title bar */}
      <div className="px-4 py-2" style={{ backgroundColor: "var(--mdt-blue-bar)" }}>
        <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
          System Monitoringu — CCTV
        </span>
      </div>

      {/* Camera grid */}
      <div className="flex-1 overflow-auto p-3">
        <div className="grid grid-cols-3 gap-2 h-full">
          {cameras.map((cam) => (
            <div
              key={cam.id}
              className="panel-inset relative flex flex-col overflow-hidden"
              style={{ backgroundColor: "#0a0a0a", minHeight: "160px" }}
            >
              {/* Scanline overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.03) 2px, rgba(0,255,0,0.03) 4px)",
                }}
              />

              {cam.status === "offline" ? (
                <div className="flex flex-1 items-center justify-center flex-col gap-2">
                  {/* Static noise pattern */}
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    }}
                  />
                  <span className="font-[family-name:var(--font-vt323)] text-xl tracking-widest text-red-500 z-10">
                    NO SIGNAL
                  </span>
                  <span className="font-mono text-[10px] text-red-500/60 z-10">
                    BRAK POŁĄCZENIA
                  </span>
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center">
                  {/* Fake feed - green tinted dark area with subtle gradient */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "radial-gradient(ellipse at center, rgba(0,40,0,0.3) 0%, rgba(0,10,0,0.8) 100%)",
                    }}
                  />
                  <span className="font-mono text-[10px] z-10" style={{ color: "rgba(74,222,128,0.3)" }}>
                    LIVE FEED
                  </span>
                </div>
              )}

              {/* Camera info overlay */}
              <div className="absolute top-1 left-2 right-2 flex justify-between z-10">
                <span className="font-mono text-[10px] font-bold" style={{ color: "#4ade80" }}>
                  {cam.id}
                </span>
                <span className="font-mono text-[10px]" style={{ color: cam.status === "offline" ? "#c41e1e" : "#4ade80" }}>
                  {cam.status === "offline" ? "OFFLINE" : "REC"}
                </span>
              </div>

              {/* Bottom info */}
              <div className="absolute bottom-1 left-2 right-2 flex justify-between z-10">
                <span className="font-mono text-[10px]" style={{ color: "rgba(74,222,128,0.6)" }}>
                  {cam.location}
                </span>
                <span className="font-mono text-[10px]" style={{ color: "rgba(74,222,128,0.4)" }}>
                  {time}
                </span>
              </div>

              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-3 h-3 border-l border-t z-10" style={{ borderColor: "rgba(74,222,128,0.4)" }} />
              <div className="absolute top-3 right-3 w-3 h-3 border-r border-t z-10" style={{ borderColor: "rgba(74,222,128,0.4)" }} />
              <div className="absolute bottom-3 left-3 w-3 h-3 border-l border-b z-10" style={{ borderColor: "rgba(74,222,128,0.4)" }} />
              <div className="absolute bottom-3 right-3 w-3 h-3 border-r border-b z-10" style={{ borderColor: "rgba(74,222,128,0.4)" }} />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom status */}
      <div className="flex items-center justify-between border-t-2 border-t-[#555] px-4 py-2" style={{ backgroundColor: "var(--mdt-header)" }}>
        <div className="flex items-center gap-2">
          <div className="pulse-dot h-2 w-2 rounded-full bg-green-500" />
          <span className="font-mono text-sm" style={{ color: "#aaa" }}>SYSTEM CCTV AKTYWNY</span>
        </div>
        <span className="font-mono text-sm" style={{ color: "#888" }}>
          KAMERY: {cameras.filter(c => c.status === "online").length}/{cameras.length} ONLINE
        </span>
      </div>
    </div>
  )
}
