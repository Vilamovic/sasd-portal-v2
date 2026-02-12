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
    <ellipse cx="100" cy="40" rx="25" ry="30" fill="none" stroke="#333" stroke-width="1.5"/>
    <line x1="90" y1="70" x2="90" y2="85" stroke="#333" stroke-width="1.5"/>
    <line x1="110" y1="70" x2="110" y2="85" stroke="#333" stroke-width="1.5"/>
    <path d="M 60 85 Q 55 90, 50 130 L 50 220 Q 55 240, 70 250" fill="none" stroke="#333" stroke-width="1.5"/>
    <path d="M 140 85 Q 145 90, 150 130 L 150 220 Q 145 240, 130 250" fill="none" stroke="#333" stroke-width="1.5"/>
    <path d="M 60 85 Q 70 80, 90 85" fill="none" stroke="#333" stroke-width="1.5"/>
    <path d="M 140 85 Q 130 80, 110 85" fill="none" stroke="#333" stroke-width="1.5"/>
    <path d="M 60 85 Q 30 100, 25 160 Q 22 180, 20 200" fill="none" stroke="#333" stroke-width="1.5"/>
    <path d="M 20 200 Q 18 210, 15 215" fill="none" stroke="#333" stroke-width="1.5"/>
    <path d="M 140 85 Q 170 100, 175 160 Q 178 180, 180 200" fill="none" stroke="#333" stroke-width="1.5"/>
    <path d="M 180 200 Q 182 210, 185 215" fill="none" stroke="#333" stroke-width="1.5"/>
    <path d="M 70 250 Q 80 260, 85 260 L 85 270" fill="none" stroke="#333" stroke-width="1.5"/>
    <path d="M 130 250 Q 120 260, 115 260 L 115 270" fill="none" stroke="#333" stroke-width="1.5"/>
    <path d="M 85 270 Q 80 310, 75 350 Q 73 370, 70 390" fill="none" stroke="#333" stroke-width="1.5"/>
    <path d="M 70 390 L 60 395" fill="none" stroke="#333" stroke-width="1.5"/>
    <path d="M 115 270 Q 120 310, 125 350 Q 127 370, 130 390" fill="none" stroke="#333" stroke-width="1.5"/>
    <path d="M 130 390 L 140 395" fill="none" stroke="#333" stroke-width="1.5"/>
    <path d="M 85 270 Q 90 290, 90 310 Q 88 340, 85 370 Q 83 385, 80 395" fill="none" stroke="#333" stroke-width="1.5"/>
    <path d="M 115 270 Q 110 290, 110 310 Q 112 340, 115 370 Q 117 385, 120 395" fill="none" stroke="#333" stroke-width="1.5"/>
  `;
  const markersSvg = sideMarkers.map((m) =>
    `<circle cx="${m.x}" cy="${m.y}" r="8" fill="#3b82f6" opacity="0.8"/><circle cx="${m.x}" cy="${m.y}" r="3" fill="#fff"/>`
  ).join('');

  return `<svg viewBox="0 0 200 400" width="180" height="360">${bodyPath}${markersSvg}<text x="100" y="398" text-anchor="middle" font-family="VT323,monospace" font-size="12" fill="#333">${side === 'front' ? 'PRZÓD' : 'TYŁ'}</text></svg>`;
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
            @import url('https://fonts.googleapis.com/css2?family=VT323&family=Share+Tech+Mono&family=Caveat:wght@400;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { display: flex; justify-content: center; padding: 20px; background: #fff; }
            .report {
              width: 650px;
              border: 3px solid #1a1a1a;
              font-family: 'Share Tech Mono', 'Courier New', monospace;
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
              font-size: 24px;
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
              width: 120px;
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
              font-family: 'Caveat', cursive;
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
              <h1>INVESTIGATIVE STAFF<br/>AUTOPSY REPORT</h1>
              <div class="dept">
                SAN ANDREAS<br/>SHERIFF'S DEPARTMENT<br/>GANG UNIT
              </div>
            </div>
            <div class="meta">
              ${report.date || '—'}<br/>${report.location || 'San Andreas'}
            </div>

            <div class="section-title">WHO IS THE DECEASED?</div>
            <div class="section-body">
              <div class="field-row"><span class="field-label">Name:</span><span class="field-value">${member.first_name} ${member.last_name}</span></div>
              <div class="field-row"><span class="field-label">Alias:</span><span class="field-value">${member.alias || '—'}</span></div>
              <div class="field-row"><span class="field-label">Age:</span><span class="field-value">${member.dob || '—'}</span></div>
              <div class="field-row"><span class="field-label">Sex:</span><span class="field-value">${member.gender || '—'}</span></div>
              <div class="field-row"><span class="field-label">Gang:</span><span class="field-value">${member.gang?.title || '—'}</span></div>
            </div>

            <div class="section-title">PHYSICAL EXAMINATION</div>
            <div class="section-body">
              <div class="physical-grid">
                <div class="cell cell-header">Race</div>
                <div class="cell cell-header">Sex</div>
                <div class="cell cell-header">Height</div>
                <div class="cell cell-header">Weight</div>
                <div class="cell cell-value">${member.race || '—'}</div>
                <div class="cell cell-value">${member.gender || '—'}</div>
                <div class="cell cell-value">${member.height || '—'}</div>
                <div class="cell cell-value">${member.weight || '—'}</div>
              </div>
              <div class="physical-grid" style="margin-top:4px">
                <div class="cell cell-header">Blood Type</div>
                <div class="cell cell-header">Contents in Blood</div>
                <div class="cell cell-header">Rigor Mortis</div>
                <div class="cell cell-header">Liver Mortis</div>
                <div class="cell cell-value">${ad.blood_type || '—'}</div>
                <div class="cell cell-value">${ad.contents_in_blood || '—'}</div>
                <div class="cell cell-value">${ad.rigor_mortis || '—'}</div>
                <div class="cell cell-value">${ad.liver_mortis || '—'}</div>
              </div>
            </div>

            <div class="section-title">MARKS AND WOUNDS</div>
            <div class="section-body">
              <div class="body-maps">
                ${frontBody}
                ${backBody}
              </div>
              <div class="marks-text">${ad.marks_description || 'Brak opisu obrażeń.'}</div>
            </div>

            <div class="cause-box">
              <h3>PROBABLE CAUSE OF DEATH</h3>
              <p>${ad.cause_of_death || '—'}</p>
            </div>

            <div class="footer">
              <div>
                <div class="signature">${report.signed_by}</div>
                <div class="sig-label">INVESTIGATING OFFICER</div>
              </div>
              <div style="text-align:right">
                <div style="font-size:11px;color:#555">Date of Autopsy</div>
                <div style="font-size:13px;font-style:italic">${report.date || new Date(report.created_at).toLocaleDateString('pl-PL')}</div>
                <div style="font-size:11px;color:#555;margin-top:4px">Location</div>
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
                AUTOPSY REPORT
              </span>
            </div>
            <div className="space-y-1" style={{ fontSize: '11px', fontFamily: 'monospace', color: '#1a1a1a' }}>
              <p><strong>Deceased:</strong> {member.first_name} {member.last_name} {member.alias && `"${member.alias}"`}</p>
              <p><strong>Gang:</strong> {member.gang?.title || '—'}</p>
              <p><strong>Date:</strong> {report.date || '—'} | <strong>Location:</strong> {report.location || '—'}</p>
              <p><strong>Blood Type:</strong> {ad.blood_type || '—'} | <strong>Cause:</strong> {ad.cause_of_death || '—'}</p>
              {ad.marks_description && (
                <p style={{ marginTop: '6px' }}><strong>Marks:</strong> {String(ad.marks_description).substring(0, 150)}{String(ad.marks_description).length > 150 ? '...' : ''}</p>
              )}
            </div>
            {markers.length > 0 && (
              <p style={{ fontSize: '10px', color: '#555', marginTop: '6px' }}>
                {markers.length} oznaczeń na mapie ciała
              </p>
            )}
            <div style={{ marginTop: '12px', borderTop: '1px solid #ccc', paddingTop: '8px' }}>
              <span style={{ fontFamily: 'var(--font-caveat)', fontSize: '22px', color: '#1a1a1a' }}>{report.signed_by}</span>
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
