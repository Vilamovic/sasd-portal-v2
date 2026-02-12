"use client"

import { useRef } from "react"
import type { MdtRecord } from "./types"

interface WantedPosterProps {
  record: MdtRecord
  mugshotUrl: string | null
  reason: string
  onClose: () => void
}

export function WantedPoster({ record, mugshotUrl, reason, onClose }: WantedPosterProps) {
  const posterRef = useRef<HTMLDivElement>(null)

  const activeWarrant = record.mdt_warrants?.find((w) => w.is_active)
  const sasdId = record.record_number ? `SASD-${String(record.record_number).padStart(6, '0')}` : 'SASD-N/A'

  function handlePrint() {
    const content = posterRef.current
    if (!content) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>List Gończy - ${record.last_name}, ${record.first_name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=VT323&family=Share+Tech+Mono&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { display: flex; justify-content: center; padding: 20px; background: #fff; }
            .poster {
              width: 600px;
              border: 8px double #1a1a1a;
              padding: 30px;
              font-family: 'Share Tech Mono', 'Courier New', monospace;
              background: #f5f0e0;
            }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 {
              font-family: 'VT323', monospace;
              font-size: 52px;
              letter-spacing: 8px;
              border-bottom: 4px solid #1a1a1a;
              border-top: 4px solid #1a1a1a;
              padding: 8px 0;
              margin-bottom: 4px;
            }
            .header h2 {
              font-family: 'VT323', monospace;
              font-size: 28px;
              letter-spacing: 4px;
              color: #333;
            }
            .sasd-line {
              font-size: 11px;
              letter-spacing: 2px;
              color: #555;
              margin-top: 6px;
            }
            .mugshot-area {
              text-align: center;
              margin: 20px 0;
            }
            .mugshot-area img {
              width: 200px;
              height: 240px;
              object-fit: cover;
              border: 3px solid #1a1a1a;
            }
            .mugshot-placeholder {
              width: 200px;
              height: 240px;
              background: #d0d0d0;
              border: 3px solid #1a1a1a;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              color: #888;
              font-size: 14px;
            }
            .info-section { margin: 16px 0; }
            .info-row {
              display: flex;
              border-bottom: 1px solid #ccc;
              padding: 4px 0;
              font-size: 14px;
            }
            .info-label { width: 140px; font-weight: bold; color: #333; }
            .info-value { flex: 1; color: #1a1a1a; }
            .reason-box {
              border: 2px solid #1a1a1a;
              padding: 12px;
              margin: 16px 0;
              background: #fff;
            }
            .reason-box h3 {
              font-family: 'VT323', monospace;
              font-size: 20px;
              letter-spacing: 3px;
              margin-bottom: 8px;
            }
            .reason-box p { font-size: 14px; line-height: 1.5; }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 11px;
              color: #555;
              border-top: 2px solid #1a1a1a;
              padding-top: 10px;
            }
            .warning {
              font-family: 'VT323', monospace;
              font-size: 18px;
              text-align: center;
              letter-spacing: 3px;
              color: #c41e1e;
              margin: 12px 0;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="poster">
            <div class="header">
              <h1>POSZUKIWANY</h1>
              <h2>${record.last_name.toUpperCase()}, ${record.first_name.toUpperCase()}</h2>
              <div class="sasd-line">SAN ANDREAS SHERIFF'S DEPARTMENT</div>
            </div>
            <div class="mugshot-area">
              ${mugshotUrl
                ? `<img src="${mugshotUrl}" alt="Zdjęcie poszukiwanego" />`
                : '<div class="mugshot-placeholder">BRAK ZDJĘCIA</div>'
              }
            </div>
            ${activeWarrant ? `<div class="warning">POZIOM NAKAZU: ${activeWarrant.type}</div>` : ""}
            <div class="info-section">
              <div class="info-row"><span class="info-label">NAZWISKO:</span><span class="info-value">${record.last_name}, ${record.first_name}</span></div>
              <div class="info-row"><span class="info-label">DATA UR.:</span><span class="info-value">${record.dob || "—"}</span></div>
              <div class="info-row"><span class="info-label">PŁEĆ:</span><span class="info-value">${record.gender || "—"}</span></div>
              <div class="info-row"><span class="info-label">RASA:</span><span class="info-value">${record.race || "—"}</span></div>
              <div class="info-row"><span class="info-label">WZROST:</span><span class="info-value">${record.height || "—"}</span></div>
              <div class="info-row"><span class="info-label">WAGA:</span><span class="info-value">${record.weight || "—"}</span></div>
              <div class="info-row"><span class="info-label">WŁOSY:</span><span class="info-value">${record.hair || "—"}</span></div>
              <div class="info-row"><span class="info-label">OCZY:</span><span class="info-value">${record.eyes || "—"}</span></div>
              <div class="info-row"><span class="info-label">OSTATNI ADRES:</span><span class="info-value">${record.address || "—"}</span></div>
            </div>
            <div class="reason-box">
              <h3>POWÓD POSZUKIWANIA:</h3>
              <p>${reason}</p>
            </div>
            <div class="footer">
              JEŚLI POSIADASZ INFORMACJE O MIEJSCU POBYTU TEJ OSOBY,<br/>
              SKONTAKTUJ SIĘ Z SAN ANDREAS SHERIFF'S DEPARTMENT<br/>
              TELEFON: (555) 911-SASD | PRZYPADEK NR: ${sasdId}<br/>
              <br/>
              DATA WYSTAWIENIA: ${new Date().toLocaleDateString("pl-PL")}
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
      <div
        className="panel-raised flex max-h-[90vh] w-[500px] flex-col"
        style={{ backgroundColor: "var(--mdt-btn-face)" }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-3 py-1.5"
          style={{ backgroundColor: "var(--mdt-blue-bar)" }}
        >
          <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider text-white uppercase">
            Podgląd listu gończego
          </span>
          <button
            className="flex h-4 w-4 items-center justify-center text-[10px] font-bold"
            style={{ backgroundColor: "#c41e1e", color: "#fff", border: "1px solid #555" }}
            onClick={onClose}
            aria-label="Zamknij"
          >
            X
          </button>
        </div>

        {/* Poster preview */}
        <div className="flex-1 overflow-auto p-3">
          <div
            ref={posterRef}
            className="mx-auto flex flex-col items-center p-5"
            style={{ backgroundColor: "#f5f0e0", border: "4px double #1a1a1a" }}
          >
            <span className="font-[family-name:var(--font-vt323)] text-4xl tracking-[6px]" style={{ color: "#1a1a1a", borderTop: "3px solid #1a1a1a", borderBottom: "3px solid #1a1a1a", padding: "4px 12px" }}>
              POSZUKIWANY
            </span>
            <span className="mt-1 font-[family-name:var(--font-vt323)] text-xl tracking-widest" style={{ color: "#333" }}>
              {record.last_name.toUpperCase()}, {record.first_name.toUpperCase()}
            </span>
            <span className="mt-1 font-mono text-[9px] tracking-widest" style={{ color: "#555" }}>
              {"SAN ANDREAS SHERIFF'S DEPARTMENT"}
            </span>

            {/* Mugshot */}
            <div className="my-3">
              {mugshotUrl ? (
                <img src={mugshotUrl} alt="Zdjęcie" className="h-36 w-28 object-cover" style={{ border: "2px solid #1a1a1a" }} />
              ) : (
                <div className="flex h-36 w-28 items-center justify-center font-mono text-[10px]" style={{ backgroundColor: "#d0d0d0", border: "2px solid #1a1a1a", color: "#888" }}>
                  BRAK ZDJĘCIA
                </div>
              )}
            </div>

            {activeWarrant && (
              <span className="font-[family-name:var(--font-vt323)] text-sm tracking-widest" style={{ color: "#c41e1e" }}>
                POZIOM NAKAZU: {activeWarrant.type}
              </span>
            )}

            {/* Info */}
            <div className="mt-2 w-full space-y-0.5 px-2">
              {[
                ["NAZWISKO", `${record.last_name}, ${record.first_name}`],
                ["DATA UR.", record.dob || "—"],
                ["PŁEĆ", record.gender || "—"],
                ["RASA", record.race || "—"],
                ["WZROST", record.height || "—"],
                ["WAGA", record.weight || "—"],
                ["WŁOSY", record.hair || "—"],
                ["OCZY", record.eyes || "—"],
              ].map(([label, val]) => (
                <div key={label} className="flex border-b border-[#ccc] py-0.5">
                  <span className="w-24 shrink-0 font-mono text-[10px] font-bold" style={{ color: "#333" }}>{label}:</span>
                  <span className="font-mono text-[10px]" style={{ color: "#1a1a1a" }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Reason */}
            <div className="mt-3 w-full border-2 border-[#1a1a1a] p-2" style={{ backgroundColor: "#fff" }}>
              <span className="font-[family-name:var(--font-vt323)] text-sm tracking-widest" style={{ color: "#1a1a1a" }}>POWÓD POSZUKIWANIA:</span>
              <p className="mt-1 font-mono text-[10px] leading-relaxed" style={{ color: "#1a1a1a" }}>{reason}</p>
            </div>

            <div className="mt-3 text-center">
              <p className="font-mono text-[8px] leading-relaxed" style={{ color: "#555" }}>
                JEŚLI POSIADASZ INFORMACJE SKONTAKTUJ SIĘ Z SASD<br />
                TEL: (555) 911-SASD | NR: {sasdId}<br />
                DATA: {new Date().toLocaleDateString("pl-PL")}
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 border-t-2 border-t-[#999] p-2">
          <button className="btn-win95 text-xs" onClick={handlePrint}>
            DRUKUJ
          </button>
          <button className="btn-win95 text-xs" onClick={onClose}>
            ZAMKNIJ
          </button>
        </div>
      </div>
    </div>
  )
}
