'use client';

import type { GangMember, GangMemberReport } from './hooks/useGangMembers';
import { getSkinUrl } from './skinData';

interface InvestigationReportPrintProps {
  member: GangMember;
  report: GangMemberReport;
  onClose: () => void;
}

export default function InvestigationReportPrint({ member, report, onClose }: InvestigationReportPrintProps) {
  const skinUrl = member.skin_id != null ? getSkinUrl(member.skin_id) : null;

  function handlePrint() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const officers = (report.officers || []).join(', ') || '—';
    const evidence = (report.evidence_urls || []).map((u) => `<a href="${u}" style="color:#1a4a8a">${u}</a>`).join('<br/>') || '—';

    printWindow.document.write(`
      <html>
        <head>
          <title>Raport Śledczy - ${member.last_name}, ${member.first_name}</title>
          <style>
            @font-face { font-family: 'Type Machine'; src: url('/fonts/TypeMachine.ttf'); }
            @font-face { font-family: 'RetroSignature'; src: url('/fonts/RetroSignature.otf'); }
            @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { display: flex; justify-content: center; padding: 20px; background: #fff; }
            .report {
              width: 650px;
              border: 3px solid #1a1a1a;
              padding: 0;
              font-family: 'Type Machine', 'Courier New', monospace;
              background: #fff;
            }
            .header {
              background: #1a1a1a;
              color: #fff;
              padding: 15px 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .header h1 {
              font-family: 'VT323', monospace;
              font-size: 28px;
              letter-spacing: 4px;
            }
            .header .dept {
              font-size: 11px;
              letter-spacing: 2px;
              opacity: 0.8;
              text-align: right;
            }
            .subheader {
              background: #333;
              color: #ccc;
              padding: 6px 20px;
              font-size: 11px;
              letter-spacing: 2px;
              display: flex;
              justify-content: space-between;
            }
            .content { padding: 20px; }
            .section {
              margin-bottom: 16px;
              border: 1px solid #ccc;
            }
            .section-title {
              font-family: 'VT323', monospace;
              font-size: 16px;
              letter-spacing: 3px;
              padding: 4px 10px;
              background: #e8e8e8;
              border-bottom: 1px solid #ccc;
            }
            .section-body { padding: 10px; }
            .info-row {
              display: flex;
              border-bottom: 1px solid #eee;
              padding: 3px 0;
              font-size: 13px;
            }
            .info-label { width: 140px; font-weight: bold; color: #333; }
            .info-value { flex: 1; color: #1a1a1a; }
            .mugshot-area {
              float: right;
              margin: 0 0 10px 15px;
            }
            .mugshot-area img {
              width: 100px;
              height: 130px;
              object-fit: cover;
              object-position: top;
              border: 2px solid #1a1a1a;
              background: #2a2a2a;
            }
            .mugshot-placeholder {
              width: 100px;
              height: 130px;
              background: #d0d0d0;
              border: 2px solid #1a1a1a;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              color: #888;
            }
            .description {
              font-size: 13px;
              line-height: 1.6;
              white-space: pre-wrap;
            }
            .result-badge {
              display: inline-block;
              padding: 3px 12px;
              font-family: 'VT323', monospace;
              font-size: 18px;
              letter-spacing: 2px;
              margin: 8px 0;
            }
            .result-ARRESTED { background: #f59e0b; color: #1a1a1a; }
            .result-DEAD { background: #c41e1e; color: #fff; }
            .result-ACTIVE { background: #4ade80; color: #1a1a1a; }
            .signature-area {
              margin-top: 30px;
              padding-top: 15px;
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
              padding: 0 20px 2px;
            }
            .signature-label {
              font-size: 10px;
              color: #555;
              margin-top: 4px;
            }
            .confidential {
              text-align: center;
              font-family: 'VT323', monospace;
              font-size: 14px;
              letter-spacing: 3px;
              color: #c41e1e;
              margin-top: 15px;
              padding-top: 10px;
              border-top: 1px solid #ccc;
            }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="report">
            <div class="header">
              <div>
                <h1>RAPORT ŚLEDCZY</h1>
                <div style="font-size:11px;letter-spacing:2px;opacity:0.7;margin-top:2px">OPERATION STREETS SAFE BUREAU</div>
              </div>
              <div class="dept">
                SAN ANDREAS<br/>SHERIFF'S DEPARTMENT<br/>OPERATION STREETS SAFE BUREAU
              </div>
            </div>
            <div class="subheader">
              <span>DATA: ${report.date || '—'}</span>
              <span>LOKALIZACJA: ${report.location || '—'}</span>
            </div>
            <div class="content">
              <div class="section">
                <div class="section-title">DANE OSOBY</div>
                <div class="section-body">
                  <div class="mugshot-area">
                    ${skinUrl
                      ? `<img src="${skinUrl}" alt="Mugshot" />`
                      : '<div class="mugshot-placeholder">BRAK ZDJĘCIA</div>'
                    }
                  </div>
                  <div class="info-row"><span class="info-label">NAZWISKO:</span><span class="info-value">${member.last_name}, ${member.first_name}</span></div>
                  <div class="info-row"><span class="info-label">KSYWKA:</span><span class="info-value">${member.alias ? `"${member.alias}"` : '—'}</span></div>
                  <div class="info-row"><span class="info-label">GANG:</span><span class="info-value">${member.gang?.title || '—'}</span></div>
                  <div class="info-row"><span class="info-label">DATA UR.:</span><span class="info-value">${member.dob || '—'}</span></div>
                  <div class="info-row"><span class="info-label">PŁEĆ:</span><span class="info-value">${member.gender || '—'}</span></div>
                  <div class="info-row"><span class="info-label">RASA:</span><span class="info-value">${member.race || '—'}</span></div>
                  <div style="clear:both"></div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">REZULTAT</div>
                <div class="section-body">
                  <span class="result-badge result-${report.result_status || 'ACTIVE'}">${report.result_status || 'ACTIVE'}</span>
                </div>
              </div>

              <div class="section">
                <div class="section-title">OPIS ZDARZENIA</div>
                <div class="section-body">
                  <p class="description">${report.description || 'Brak opisu.'}</p>
                </div>
              </div>

              <div class="section">
                <div class="section-title">FUNKCJONARIUSZE</div>
                <div class="section-body">
                  <p style="font-size:13px">${officers}</p>
                </div>
              </div>

              ${(report.evidence_urls && report.evidence_urls.length > 0) ? `
              <div class="section">
                <div class="section-title">DOWODY</div>
                <div class="section-body">
                  <p style="font-size:12px;word-break:break-all">${evidence}</p>
                </div>
              </div>
              ` : ''}

              <div class="signature-area">
                <div>
                  <div class="signature">${report.signed_by}</div>
                  <div class="signature-label">PODPIS FUNKCJONARIUSZA</div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:11px;color:#555">DATA WYSTAWIENIA</div>
                  <div style="font-size:13px">${new Date(report.created_at).toLocaleDateString('pl-PL')}</div>
                </div>
              </div>

              <div class="confidential">
                POUFNE — WYŁĄCZNIE DO UŻYTKU WEWNĘTRZNEGO OSS BUREAU SASD
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
        <div className="flex items-center justify-between px-3 py-1.5" style={{ backgroundColor: '#1a4a6a' }}>
          <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider text-white uppercase">
            Podgląd raportu śledczego
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
            {/* Mini preview */}
            <div className="text-center mb-3" style={{ backgroundColor: '#1a1a1a', padding: '8px' }}>
              <span style={{ fontFamily: 'var(--font-vt323)', fontSize: '18px', letterSpacing: '3px', color: '#fff' }}>RAPORT ŚLEDCZY</span>
            </div>
            <div className="space-y-1" style={{ fontSize: '11px', fontFamily: 'monospace', color: '#1a1a1a' }}>
              <p><strong>Osoba:</strong> {member.last_name}, {member.first_name} {member.alias && `"${member.alias}"`}</p>
              <p><strong>Gang:</strong> {member.gang?.title || '—'}</p>
              <p><strong>Data:</strong> {report.date || '—'} | <strong>Lokalizacja:</strong> {report.location || '—'}</p>
              <p><strong>Rezultat:</strong> <span style={{ color: report.result_status === 'DEAD' ? '#c41e1e' : report.result_status === 'ARRESTED' ? '#b45309' : '#15803d', fontWeight: 700 }}>{report.result_status}</span></p>
              {report.description && <p style={{ marginTop: '6px', whiteSpace: 'pre-wrap' }}>{report.description.substring(0, 200)}{report.description.length > 200 ? '...' : ''}</p>}
            </div>
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
