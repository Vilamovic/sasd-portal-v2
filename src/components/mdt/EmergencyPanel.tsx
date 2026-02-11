"use client"

import { useState, useEffect, useRef } from "react"

interface DispatchEvent {
  id: number
  time: string
  priority: "P1" | "P2" | "P3"
  location: string
  description: string
}

const initialEvents: DispatchEvent[] = [
  { id: 1, time: "14:32:17", priority: "P1", location: "Grove St / East LS", description: "Strzały — wielu świadków, słyszano automatyczną broń" },
  { id: 2, time: "14:28:45", priority: "P2", location: "Vinewood Blvd 1200", description: "Włamanie do domu — podejrzany wciąż na miejscu" },
  { id: 3, time: "14:25:11", priority: "P3", location: "Del Perro Pier", description: "Zakłócanie porządku — grupa osób, głośna muzyka" },
  { id: 4, time: "14:22:03", priority: "P2", location: "Downtown LS / Fig", description: "Pościg — biały Sultan RS, tablica 5ABM 221" },
  { id: 5, time: "14:18:44", priority: "P1", location: "Pershing Square", description: "Napad z bronią na sklep — kasjer ranny" },
  { id: 6, time: "14:15:22", priority: "P3", location: "Sandy Shores", description: "Zaginiony turysta — ostatni kontakt 2h temu" },
  { id: 7, time: "14:12:07", priority: "P2", location: "Paleto Bay / Rte 1", description: "Wypadek drogowy — 2 pojazdy, możliwe obrażenia" },
  { id: 8, time: "14:08:51", priority: "P3", location: "Mirror Park", description: "Podejrzany pojazd zaparkowany pod szkołą od 3h" },
  { id: 9, time: "14:05:33", priority: "P1", location: "East LS / Jamestown", description: "Porwanie — świadek widział siłowe wciągnięcie do vana" },
  { id: 10, time: "14:02:18", priority: "P2", location: "La Mesa", description: "Kradzież pojazdu — czarny Crown Vic, LSC 4X21" },
  { id: 11, time: "13:58:44", priority: "P3", location: "Vespucci Beach", description: "Osoba pod wpływem alkoholu — agresywna wobec przechodniów" },
  { id: 12, time: "13:55:02", priority: "P2", location: "Strawberry Ave", description: "Domestic — kłótnia, sąsiedzi zgłaszają krzyki" },
  { id: 13, time: "13:51:37", priority: "P3", location: "Davis / Grove", description: "Podejrzana paczka — parking pod blokiem" },
  { id: 14, time: "13:47:19", priority: "P1", location: "Rancho / Innocence", description: "Strzelanina drive-by — co najmniej 1 ranny" },
  { id: 15, time: "13:43:55", priority: "P3", location: "Little Seoul", description: "Wandalizm — graffiti na budynku rządowym" },
]

const newEventTemplates = [
  { priority: "P1" as const, location: "East LS / Forum Dr", description: "Strzały — pojedynczy strzał, krzyki" },
  { priority: "P2" as const, location: "Vinewood Hills", description: "Alarm antywłamaniowy — rezydencja prywatna" },
  { priority: "P3" as const, location: "Elysian Island", description: "Porzucony pojazd na nabrzeżu" },
  { priority: "P2" as const, location: "Pillbox Hill", description: "Kradzież sklepowa — podejrzany uciekł na północ" },
  { priority: "P1" as const, location: "Chamberlain Hills", description: "Atak nożem — ofiara przytomna, wezwano pogotowie" },
  { priority: "P3" as const, location: "Rockford Hills", description: "Fałszywy alarm — zweryfikowany, kod 4" },
  { priority: "P2" as const, location: "Textile City", description: "Wypadek — motocyklista vs pieton" },
  { priority: "P1" as const, location: "Cypress Flats", description: "Napad na bank — 3 podejrzanych, zakładnicy" },
]

function getPriorityColor(p: string) {
  switch (p) {
    case "P1": return { bg: "#3a1a1a", text: "#ff6b6b", badge: "#c41e1e" }
    case "P2": return { bg: "#3a2a1a", text: "#ffc107", badge: "#b8860b" }
    case "P3": return { bg: "transparent", text: "#4ade80", badge: "#1a6a1a" }
    default: return { bg: "transparent", text: "#ccc", badge: "#555" }
  }
}

export function EmergencyPanel() {
  const [events, setEvents] = useState<DispatchEvent[]>(initialEvents)
  const scrollRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef(initialEvents.length + 1)

  useEffect(() => {
    const interval = setInterval(() => {
      const template = newEventTemplates[Math.floor(Math.random() * newEventTemplates.length)]
      const now = new Date()
      const time = now.toLocaleTimeString("pl-PL", { hour12: false })

      const newEvent: DispatchEvent = {
        id: counterRef.current++,
        time,
        priority: template.priority,
        location: template.location,
        description: template.description,
      }

      setEvents((prev) => [newEvent, ...prev].slice(0, 30))
    }, 6000 + Math.random() * 4000)

    return () => clearInterval(interval)
  }, [])

  // Auto-scroll to top when new event arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [events.length])

  return (
    <div className="flex flex-1 flex-col overflow-hidden" style={{ backgroundColor: "var(--mdt-content)" }}>
      {/* Title bar */}
      <div className="px-4 py-2" style={{ backgroundColor: "var(--mdt-blue-bar)" }}>
        <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
          Centrum Dyspozytorskie — Alarmowe
        </span>
      </div>

      {/* Events list */}
      <div ref={scrollRef} className="panel-inset flex-1 overflow-auto m-3" style={{ backgroundColor: "#0a0a0a" }}>
        {/* Scanline overlay */}
        <div
          className="sticky top-0 left-0 right-0 h-0 pointer-events-none"
          style={{ boxShadow: "0 0 40px 20px rgba(0,255,0,0.02)" }}
        />

        {events.map((event) => {
          const colors = getPriorityColor(event.priority)
          return (
            <div
              key={event.id}
              className="flex items-start gap-3 px-3 py-2 border-b"
              style={{ backgroundColor: colors.bg, borderColor: "#1a1a1a" }}
            >
              <span className="font-mono text-xs shrink-0" style={{ color: "#555" }}>
                [{event.time}]
              </span>
              <span
                className="font-mono text-[10px] font-bold shrink-0 px-1.5 py-0.5"
                style={{ backgroundColor: colors.badge, color: "#fff" }}
              >
                {event.priority}
              </span>
              <span className="font-mono text-xs shrink-0 font-bold" style={{ color: colors.text }}>
                {event.location}
              </span>
              <span className="font-mono text-xs" style={{ color: "#ccc" }}>
                — {event.description}
              </span>
            </div>
          )
        })}
      </div>

      {/* Bottom status */}
      <div className="flex items-center justify-between border-t-2 border-t-[#555] px-4 py-2" style={{ backgroundColor: "var(--mdt-header)" }}>
        <div className="flex items-center gap-2">
          <div className="pulse-dot h-2 w-2 rounded-full bg-red-500" />
          <span className="font-mono text-sm" style={{ color: "#ff6b6b" }}>DISPATCH AKTYWNY — NASŁUCH</span>
        </div>
        <span className="font-mono text-sm" style={{ color: "#888" }}>
          ZDARZENIA: {events.length} | P1: {events.filter(e => e.priority === "P1").length}
        </span>
      </div>
    </div>
  )
}
