"use client"

const units = [
  { id: "5K13", status: "10-8", statusLabel: "In Service", location: "East LS", officer: "Dep. Morrison", active: true },
  { id: "3L21", status: "10-8", statusLabel: "In Service", location: "Vinewood", officer: "Dep. Garcia", active: true },
  { id: "7A44", status: "10-97", statusLabel: "On Scene", location: "Downtown LS", officer: "Dep. Johnson", active: true },
  { id: "2K07", status: "10-6", statusLabel: "Busy", location: "Pershing Sq", officer: "Dep. Williams", active: true },
  { id: "9L33", status: "10-8", statusLabel: "In Service", location: "Sandy Shores", officer: "Dep. Davis", active: true },
  { id: "4A18", status: "10-7", statusLabel: "Out of Service", location: "Stacja", officer: "Dep. Martinez", active: false },
  { id: "6K52", status: "10-97", statusLabel: "On Scene", location: "Paleto Bay", officer: "Dep. Thompson", active: true },
  { id: "1L09", status: "10-7", statusLabel: "Out of Service", location: "Stacja", officer: "Dep. White", active: false },
  { id: "8A27", status: "10-8", statusLabel: "In Service", location: "Del Perro", officer: "Dep. Brown", active: true },
  { id: "3K41", status: "10-6", statusLabel: "Busy", location: "Mirror Park", officer: "Dep. Hernandez", active: true },
]

function getStatusColor(status: string) {
  switch (status) {
    case "10-8": return "#4ade80"
    case "10-7": return "#888"
    case "10-6": return "#ffc107"
    case "10-97": return "#60a5fa"
    default: return "var(--mdt-content-text)"
  }
}

function getRowBg(status: string, idx: number) {
  if (status === "10-7") return "#1a1a1a"
  if (status === "10-97") return idx % 2 === 0 ? "#0a1a2a" : "#0a1525"
  return idx % 2 === 0 ? "var(--mdt-row-even)" : "var(--mdt-row-odd)"
}

export function UnitsPanel() {
  const activeCount = units.filter(u => u.active).length

  return (
    <div className="flex flex-1 flex-col overflow-hidden" style={{ backgroundColor: "var(--mdt-content)" }}>
      {/* Title bar */}
      <div className="px-4 py-2" style={{ backgroundColor: "var(--mdt-blue-bar)" }}>
        <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
          Lista Jednostek — Dispatch
        </span>
      </div>

      {/* Table */}
      <div className="panel-inset flex-1 overflow-auto m-3" style={{ backgroundColor: "var(--mdt-panel-content)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "var(--mdt-header)" }}>
              <th className="px-3 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">JEDNOSTKA</th>
              <th className="px-3 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">STATUS</th>
              <th className="px-3 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">KOD</th>
              <th className="px-3 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">LOKALIZACJA</th>
              <th className="px-3 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">FUNKCJONARIUSZ</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit, idx) => (
              <tr
                key={unit.id}
                style={{
                  backgroundColor: getRowBg(unit.status, idx),
                  color: unit.active ? "var(--mdt-content-text)" : "#555",
                }}
              >
                <td className="px-3 py-2 font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${unit.active ? "pulse-dot" : ""}`}
                      style={{ backgroundColor: unit.active ? "#4ade80" : "#555" }}
                    />
                    <span className="font-bold">{unit.id}</span>
                  </div>
                </td>
                <td className="px-3 py-2 font-mono text-sm">
                  <span style={{ color: getStatusColor(unit.status), fontWeight: 700 }}>
                    {unit.status}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-xs" style={{ color: "var(--mdt-muted-text)" }}>
                  {unit.statusLabel}
                </td>
                <td className="px-3 py-2 font-mono text-sm">{unit.location}</td>
                <td className="px-3 py-2 font-mono text-sm">{unit.officer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom status */}
      <div className="flex items-center justify-between border-t-2 border-t-[#555] px-4 py-2" style={{ backgroundColor: "var(--mdt-header)" }}>
        <div className="flex items-center gap-2">
          <div className="pulse-dot h-2 w-2 rounded-full bg-green-500" />
          <span className="font-mono text-sm" style={{ color: "#aaa" }}>DISPATCH AKTYWNY</span>
        </div>
        <span className="font-mono text-sm" style={{ color: "#888" }}>
          JEDNOSTKI: {activeCount}/{units.length} AKTYWNYCH
        </span>
      </div>
    </div>
  )
}
