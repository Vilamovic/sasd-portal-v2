"use client"

interface MdtSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems = [
  { id: "main", label: "EKRAN GŁÓWNY" },
  { id: "lookup", label: "WYSZUKAJ" },
  { id: "emergency", label: "ALARMOWE" },
  { id: "separator1", label: "" },
  { id: "kartoteka", label: "KARTOTEKA" },
  { id: "roster", label: "JEDNOSTKI" },
  { id: "cctv", label: "MONITORING" },
  { id: "bolo", label: "POJAZDY BOLO" },
]

export function MdtSidebar({ activeTab, onTabChange }: MdtSidebarProps) {
  return (
    <nav
      className="flex w-56 flex-col gap-1.5 p-3"
      style={{ backgroundColor: "var(--mdt-sidebar)" }}
      aria-label="MDT Navigation"
    >
      {navItems.map((item) => {
        if (item.id.startsWith("separator")) {
          return <div key={item.id} className="my-1.5" />
        }

        const isActive = activeTab === item.id

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`btn-win95 w-full text-center ${isActive ? "btn-win95-active" : ""}`}
            style={{
              fontSize: "15px",
              padding: "9px 12px",
            }}
          >
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
