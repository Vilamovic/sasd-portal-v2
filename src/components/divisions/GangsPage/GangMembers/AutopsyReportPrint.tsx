'use client';

import type { GangMember, GangMemberReport } from './hooks/useGangMembers';

interface AutopsyReportPrintProps {
  member: GangMember;
  report: GangMemberReport;
  onClose: () => void;
}

function buildBodySvg(markers: Array<{ x: number; y: number; side: string }>, side: 'front' | 'back'): string {
  const sideMarkers = markers.filter((m) => m.side === side);
  const bodyPath = `
    <!-- Head -->
    <ellipse cx="100" cy="35" rx="22" ry="26" fill="#f0f0f0" stroke="#333" stroke-width="1.5"/>
    <!-- Neck -->
    <rect x="91" y="60" width="18" height="14" rx="3" fill="#f0f0f0" stroke="#333" stroke-width="1"/>
    <!-- Torso -->
    <path d="M 65 74 L 60 80 Q 55 85, 52 110 L 50 180 Q 52 200, 60 210 L 70 220 L 85 225 L 100 228 L 115 225 L 130 220 L 140 210 Q 148 200, 150 180 L 148 110 Q 145 85, 140 80 L 135 74" fill="#f0f0f0" stroke="#333" stroke-width="1.5"/>
    <!-- Shoulders connection -->
    <path d="M 65 74 Q 80 68, 100 67 Q 120 68, 135 74" fill="#f0f0f0" stroke="#333" stroke-width="1.5"/>
    <!-- Left arm -->
    <path d="M 55 85 Q 40 95, 32 130 Q 28 155, 25 180 Q 22 195, 20 205" fill="none" stroke="#333" stroke-width="1.5"/>
    <ellipse cx="18" cy="210" rx="6" ry="8" fill="#f0f0f0" stroke="#333" stroke-width="1"/>
    <!-- Right arm -->
    <path d="M 145 85 Q 160 95, 168 130 Q 172 155, 175 180 Q 178 195, 180 205" fill="none" stroke="#333" stroke-width="1.5"/>
    <ellipse cx="182" cy="210" rx="6" ry="8" fill="#f0f0f0" stroke="#333" stroke-width="1"/>
    <!-- Left leg -->
    <path d="M 78 225 Q 75 260, 72 300 Q 70 330, 68 360 L 66 380" fill="none" stroke="#333" stroke-width="1.5"/>
    <ellipse cx="64" cy="386" rx="10" ry="6" fill="#f0f0f0" stroke="#333" stroke-width="1"/>
    <!-- Right leg -->
    <path d="M 122 225 Q 125 260, 128 300 Q 130 330, 132 360 L 134 380" fill="none" stroke="#333" stroke-width="1.5"/>
    <ellipse cx="136" cy="386" rx="10" ry="6" fill="#f0f0f0" stroke="#333" stroke-width="1"/>
    <!-- Inner legs -->
    <path d="M 90 228 Q 88 260, 85 300 Q 83 330, 80 360 L 78 380" fill="none" stroke="#333" stroke-width="1.2"/>
    <path d="M 110 228 Q 112 260, 115 300 Q 117 330, 120 360 L 122 380" fill="none" stroke="#333" stroke-width="1.2"/>
    <!-- Waist line -->
    <line x1="50" y1="180" x2="150" y2="180" stroke="#999" stroke-width="0.5" stroke-dasharray="4,3"/>
  `;
  const markersSvg = sideMarkers.map((m) =>
    `<circle cx="${m.x}" cy="${m.y}" r="8" fill="#3b82f6" opacity="0.8"/><circle cx="${m.x}" cy="${m.y}" r="3" fill="#fff"/>`
  ).join('');

  return `<svg viewBox="0 0 200 400" width="180" height="360">${bodyPath}${markersSvg}<text x="100" y="398" text-anchor="middle" font-family="'Type Machine',monospace" font-size="12" fill="#333">${side === 'front' ? 'PRZÓD' : 'TYŁ'}</text></svg>`;
}

export default function AutopsyReportPrint({ member, report, onClose }: AutopsyReportPrintProps) {
  const ad = (report.autopsy_data || {}) as Record<string, string>;
  const markers = (report.body_markers || []) as Array<{ x: number; y: number; side: string }>;

  function handlePrint() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const frontBody = buildBodySvg(markers, 'front');
    const backBody = buildBodySvg(markers, 'back');

    printWindow.document.write(`
      <html>
        <head>
          <title>Raport Autopsji - ${member.last_name}, ${member.first_name}</title>
          <style>
            @font-face { font-family: 'Type Machine'; src: url('/fonts/TypeMachine.ttf'); }
            @font-face { font-family: 'RetroSignature'; src: url('/fonts/RetroSignature.otf'); }
            @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { display: flex; justify-content: center; padding: 20px; background: #fff; }
            .report {
              width: 650px;
              border: 3px solid #1a1a1a;
              font-family: 'Type Machine', 'Courier New', monospace;
              background: #fff;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 15px 20px;
              border-bottom: 3px solid #1a1a1a;
            }
            .header h1 {
              font-family: 'VT323', monospace;
              font-size: 22px;
              letter-spacing: 3px;
            }
            .header .dept {
              font-size: 10px;
              letter-spacing: 1px;
              text-align: right;
              color: #555;
            }
            .meta {
              background: #f0f0f0;
              padding: 8px 20px;
              font-size: 12px;
              text-align: center;
              border-bottom: 2px solid #1a1a1a;
              font-style: italic;
            }
            .section-title {
              font-family: 'VT323', monospace;
              font-size: 14px;
              letter-spacing: 2px;
              padding: 4px 10px;
              background: #e0e0e0;
              border-top: 2px solid #1a1a1a;
              border-bottom: 1px solid #999;
            }
            .section-body { padding: 10px 15px; }
            .field-row {
              display: flex;
              border-bottom: 1px solid #ddd;
              padding: 4px 0;
              font-size: 13px;
            }
            .field-label {
              width: 140px;
              font-size: 11px;
              color: #555;
              padding-right: 8px;
            }
            .field-value {
              flex: 1;
              font-style: italic;
              color: #1a1a1a;
            }
            .physical-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 0;
              border: 1px solid #999;
            }
            .physical-grid .cell {
              padding: 6px 8px;
              font-size: 11px;
              border: 1px solid #ddd;
              text-align: center;
            }
            .physical-grid .cell-header {
              font-weight: bold;
              font-size: 10px;
              background: #f0f0f0;
            }
            .physical-grid .cell-value {
              font-style: italic;
              font-size: 14px;
            }
            .body-maps {
              display: flex;
              justify-content: center;
              gap: 20px;
              padding: 10px;
            }
            .marks-text {
              font-size: 13px;
              font-style: italic;
              line-height: 1.5;
              padding: 8px;
              border: 1px solid #ddd;
              min-height: 60px;
              white-space: pre-wrap;
            }
            .cause-box {
              border: 2px solid #1a1a1a;
              padding: 10px;
              margin: 10px 15px;
            }
            .cause-box h3 {
              font-family: 'VT323', monospace;
              font-size: 14px;
              letter-spacing: 2px;
              margin-bottom: 6px;
            }
            .cause-box p {
              font-size: 14px;
              font-style: italic;
              line-height: 1.5;
            }
            .footer {
              padding: 15px 20px;
              border-top: 2px solid #1a1a1a;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .signature {
              font-family: 'RetroSignature', cursive;
              font-size: 32px;
              color: #1a1a1a;
              border-bottom: 1px solid #1a1a1a;
              padding: 0 15px 2px;
            }
            .sig-label {
              font-size: 10px;
              color: #555;
              margin-top: 3px;
            }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="report">
            <div class="header">
              <h1>OPERATION SAFE STREETS<br/>BUREAU AUTOPSY REPORT</h1>
              <div class="dept">
                SAN ANDREAS<br/>SHERIFF'S DEPARTMENT<br/>OPERATION SAFE STREETS BUREAU
              </div>
            </div>
            <div class="meta">
              ${report.date || '—'}<br/>${report.location || 'San Andreas'}
            </div>

            <div class="section-title">KIM JEST ZMARŁY?</div>
            <div class="section-body">
              <div class="field-row"><span class="field-label">Imię i nazwisko:</span><span class="field-value">${member.first_name} ${member.last_name}</span></div>
              <div class="field-row"><span class="field-label">Pseudonim:</span><span class="field-value">${member.alias || '—'}</span></div>
              <div class="field-row"><span class="field-label">Wiek:</span><span class="field-value">${member.dob || '—'}</span></div>
              <div class="field-row"><span class="field-label">Płeć:</span><span class="field-value">${member.gender || '—'}</span></div>
              <div class="field-row"><span class="field-label">Gang:</span><span class="field-value">${member.gang?.title || '—'}</span></div>
            </div>

            <div class="section-title">BADANIE FIZYCZNE</div>
            <div class="section-body">
              <div class="physical-grid">
                <div class="cell cell-header">Rasa</div>
                <div class="cell cell-header">Płeć</div>
                <div class="cell cell-header">Wzrost</div>
                <div class="cell cell-header">Waga</div>
                <div class="cell cell-value">${member.race || '—'}</div>
                <div class="cell cell-value">${member.gender || '—'}</div>
                <div class="cell cell-value">${member.height || '—'}</div>
                <div class="cell cell-value">${member.weight || '—'}</div>
              </div>
              <div class="physical-grid" style="margin-top:4px">
                <div class="cell cell-header">Grupa krwi</div>
                <div class="cell cell-header">Substancje we krwi</div>
                <div class="cell cell-header">Stężenie pośmiertne</div>
                <div class="cell cell-header">Plamy opadowe</div>
                <div class="cell cell-value">${ad.blood_type || '—'}</div>
                <div class="cell cell-value">${ad.contents_in_blood || '—'}</div>
                <div class="cell cell-value">${ad.rigor_mortis || '—'}</div>
                <div class="cell cell-value">${ad.liver_mortis || '—'}</div>
              </div>
            </div>

            <div class="section-title">OBRAŻENIA I ŚLADY</div>
            <div class="section-body">
              <div class="body-maps">
                ${frontBody}
                ${backBody}
              </div>
              <div class="marks-text">${ad.marks_description || 'Brak opisu obrażeń.'}</div>
            </div>

            <div class="cause-box">
              <h3>PRAWDOPODOBNA PRZYCZYNA ŚMIERCI</h3>
              <p>${ad.cause_of_death || '—'}</p>
            </div>

            <div class="footer">
              <div>
                <div class="signature">${report.signed_by}</div>
                <div class="sig-label">PODPIS FUNKCJONARIUSZA</div>
              </div>
              <div style="text-align:right">
                <div style="font-size:11px;color:#555">Data autopsji</div>
                <div style="font-size:13px;font-style:italic">${report.date || new Date(report.created_at).toLocaleDateString('pl-PL')}</div>
                <div style="font-size:11px;color:#555;margin-top:4px">Lokalizacja</div>
                <div style="font-size:13px;font-style:italic">${report.location || 'San Andreas'}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="panel-raised flex flex-col max-h-[90vh] w-[550px] mx-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        {/* Title bar */}
        <div className="flex items-center justify-between px-3 py-1.5" style={{ backgroundColor: '#8b1a1a' }}>
          <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider text-white uppercase">
            Podgląd raportu autopsji
          </span>
          <button
            className="flex h-4 w-4 items-center justify-center text-[10px] font-bold"
            style={{ backgroundColor: '#c41e1e', color: '#fff', border: '1px solid #555' }}
            onClick={onClose}
          >
            X
          </button>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto p-4">
          <div className="mx-auto p-4" style={{ backgroundColor: '#fff', border: '2px solid #1a1a1a', maxWidth: '480px' }}>
            <div className="text-center mb-3">
              <span style={{ fontFamily: 'var(--font-vt323)', fontSize: '16px', letterSpacing: '2px', color: '#1a1a1a' }}>
                RAPORT AUTOPSJI
              </span>
            </div>
            <div className="space-y-1" style={{ fontSize: '11px', fontFamily: 'monospace', color: '#1a1a1a' }}>
              <p><strong>Zmarły:</strong> {member.first_name} {member.last_name} {member.alias && `"${member.alias}"`}</p>
              <p><strong>Gang:</strong> {member.gang?.title || '—'}</p>
              <p><strong>Data:</strong> {report.date || '—'} | <strong>Lokalizacja:</strong> {report.location || '—'}</p>
              <p><strong>Grupa krwi:</strong> {ad.blood_type || '—'} | <strong>Przyczyna:</strong> {ad.cause_of_death || '—'}</p>
              {ad.marks_description && (
                <p style={{ marginTop: '6px' }}><strong>Obrażenia:</strong> {String(ad.marks_description).substring(0, 150)}{String(ad.marks_description).length > 150 ? '...' : ''}</p>
              )}
            </div>
            {markers.length > 0 && (
              <p style={{ fontSize: '10px', color: '#555', marginTop: '6px' }}>
                {markers.length} oznaczeń na mapie ciała
              </p>
            )}
            <div style={{ marginTop: '12px', borderTop: '1px solid #ccc', paddingTop: '8px' }}>
              <span style={{ fontFamily: 'var(--font-retro-signature)', fontSize: '22px', color: '#1a1a1a' }}>{report.signed_by}</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 border-t-2 border-t-[#999] p-2">
          <button className="btn-win95 text-xs" onClick={handlePrint}>DRUKUJ</button>
          <button className="btn-win95 text-xs" onClick={onClose}>ZAMKNIJ</button>
        </div>
      </div>
    </div>
  );
}
