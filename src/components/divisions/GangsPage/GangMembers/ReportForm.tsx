'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import BodyMapSvg, { type BodyMarker } from './BodyMapSvg';
import type { GangMember } from './hooks/useGangMembers';

interface ReportFormProps {
  member: GangMember;
  officerNick: string;
  saving: boolean;
  onSubmit: (data: {
    member_id: string;
    report_type: 'investigation' | 'autopsy';
    date?: string | null;
    location?: string | null;
    description?: string | null;
    result_status?: string | null;
    officers?: string[] | null;
    evidence_urls?: string[] | null;
    autopsy_data?: Record<string, unknown> | null;
    body_markers?: BodyMarker[] | null;
    signed_by: string;
  }) => void;
  onCancel: () => void;
}

export default function ReportForm({ member, officerNick, saving, onSubmit, onCancel }: ReportFormProps) {
  const [reportType, setReportType] = useState<'investigation' | 'autopsy'>('investigation');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [resultStatus, setResultStatus] = useState('ARRESTED');
  const [officers, setOfficers] = useState(officerNick);
  const [evidenceUrl, setEvidenceUrl] = useState('');

  // Autopsy fields
  const [causeOfDeath, setCauseOfDeath] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [contentsInBlood, setContentsInBlood] = useState('');
  const [rigorMortis, setRigorMortis] = useState('');
  const [liverMortis, setLiverMortis] = useState('');
  const [marksDescription, setMarksDescription] = useState('');
  const [bodyMarkers, setBodyMarkers] = useState<BodyMarker[]>([]);

  const handleSubmit = () => {
    const officerList = officers.split(',').map((o) => o.trim()).filter(Boolean);
    const evidenceList = evidenceUrl.split(',').map((u) => u.trim()).filter(Boolean);

    onSubmit({
      member_id: member.id,
      report_type: reportType,
      date: date || null,
      location: location || null,
      description: description || null,
      result_status: reportType === 'investigation' ? resultStatus : null,
      officers: officerList.length > 0 ? officerList : null,
      evidence_urls: evidenceList.length > 0 ? evidenceList : null,
      autopsy_data: reportType === 'autopsy' ? {
        cause_of_death: causeOfDeath,
        blood_type: bloodType,
        contents_in_blood: contentsInBlood,
        rigor_mortis: rigorMortis,
        liver_mortis: liverMortis,
        marks_description: marksDescription,
      } : null,
      body_markers: reportType === 'autopsy' && bodyMarkers.length > 0 ? bodyMarkers : null,
      signed_by: officerNick,
    });
  };

  const inputClass = 'panel-inset w-full px-2 py-1 font-mono text-xs';
  const inputStyle = { backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)' };
  const labelClass = 'font-mono text-xs block mb-1';
  const labelStyle = { color: 'var(--mdt-muted-text)' };

  return (
    <div className="flex flex-1 flex-col overflow-hidden" style={{ backgroundColor: 'var(--mdt-content)' }}>
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2" style={{ backgroundColor: '#059669' }}>
        <FileText className="w-4 h-4 text-white" />
        <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest text-white uppercase">
          Nowy raport — {member.last_name}, {member.first_name}
        </span>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Report type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} style={labelStyle}>Typ raportu</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value as 'investigation' | 'autopsy')} className={inputClass} style={inputStyle}>
              <option value="investigation">Raport śledczy</option>
              <option value="autopsy">Raport autopsji</option>
            </select>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Data</label>
            <input type="text" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} style={inputStyle} placeholder="DD.MM.RRRR" />
          </div>
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>Lokalizacja</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} style={inputStyle} placeholder="np. Los Santos, Idlewood" />
        </div>

        {/* Investigation-specific fields */}
        {reportType === 'investigation' && (
          <>
            <div>
              <label className={labelClass} style={labelStyle}>Opis zdarzenia</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={`${inputClass} resize-none`}
                style={inputStyle}
                placeholder="Opisz przebieg zdarzenia..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} style={labelStyle}>Rezultat</label>
                <select value={resultStatus} onChange={(e) => setResultStatus(e.target.value)} className={inputClass} style={inputStyle}>
                  <option value="ARRESTED">ARRESTED</option>
                  <option value="DEAD">DEAD</option>
                  <option value="ACTIVE">ACTIVE</option>
                </select>
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Funkcjonariusze (nick, nick...)</label>
                <input type="text" value={officers} onChange={(e) => setOfficers(e.target.value)} className={inputClass} style={inputStyle} />
              </div>
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Dowody / Linki (oddzielone przecinkiem)</label>
              <input type="text" value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} className={inputClass} style={inputStyle} placeholder="https://..." />
            </div>
          </>
        )}

        {/* Autopsy-specific fields */}
        {reportType === 'autopsy' && (
          <>
            <div className="panel-raised p-3" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
              <span className="font-[family-name:var(--font-vt323)] text-sm tracking-widest block mb-3" style={{ color: 'var(--mdt-content-text)' }}>
                DANE AUTOPSJI
              </span>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className={labelClass} style={labelStyle}>Typ krwi</label>
                  <input type="text" value={bloodType} onChange={(e) => setBloodType(e.target.value)} className={inputClass} style={inputStyle} placeholder="A/B/AB/O" />
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>Zawartość we krwi</label>
                  <input type="text" value={contentsInBlood} onChange={(e) => setContentsInBlood(e.target.value)} className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>Rigor Mortis</label>
                  <input type="text" value={rigorMortis} onChange={(e) => setRigorMortis(e.target.value)} className={inputClass} style={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} style={labelStyle}>Liver Mortis</label>
                  <input type="text" value={liverMortis} onChange={(e) => setLiverMortis(e.target.value)} className={inputClass} style={inputStyle} />
                </div>
              </div>
            </div>

            <div className="panel-raised p-3" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
              <span className="font-[family-name:var(--font-vt323)] text-sm tracking-widest block mb-3" style={{ color: 'var(--mdt-content-text)' }}>
                MAPA OBRAŻEŃ
              </span>
              <BodyMapSvg
                markers={bodyMarkers}
                onAddMarker={(m) => setBodyMarkers((prev) => [...prev, m])}
                onRemoveMarker={(idx) => setBodyMarkers((prev) => prev.filter((_, i) => i !== idx))}
              />
              <div className="mt-3">
                <label className={labelClass} style={labelStyle}>Opis obrażeń</label>
                <textarea
                  value={marksDescription}
                  onChange={(e) => setMarksDescription(e.target.value)}
                  rows={3}
                  className={`${inputClass} resize-none`}
                  style={inputStyle}
                  placeholder="Opisz widoczne obrażenia..."
                />
              </div>
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>Prawdopodobna przyczyna śmierci</label>
              <textarea
                value={causeOfDeath}
                onChange={(e) => setCauseOfDeath(e.target.value)}
                rows={2}
                className={`${inputClass} resize-none`}
                style={inputStyle}
                placeholder="np. Obrażenia postrzałowe..."
              />
            </div>
          </>
        )}

        {/* Signature preview */}
        <div className="panel-inset p-3" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
          <span className="font-mono text-[10px] block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>PODPIS:</span>
          <span className="font-[family-name:var(--font-caveat)] text-2xl" style={{ color: 'var(--mdt-content-text)' }}>
            {officerNick}
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 border-t-2 border-t-[#555] px-4 py-3">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="btn-win95 text-xs"
          style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
        >
          {saving ? 'ZAPISYWANIE...' : 'ZAPISZ RAPORT'}
        </button>
        <button onClick={onCancel} className="btn-win95 text-xs">ANULUJ</button>
      </div>
    </div>
  );
}
