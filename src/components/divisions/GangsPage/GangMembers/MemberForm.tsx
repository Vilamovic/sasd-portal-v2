'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { getSkinUrl } from './skinData';
import SkinPickerModal from './SkinPickerModal';
import type { GangMember, GangOption } from './hooks/useGangMembers';

interface MemberFormProps {
  gangs: GangOption[];
  editingMember?: GangMember | null;
  saving: boolean;
  onSubmit: (data: {
    gang_id: string;
    first_name: string;
    last_name: string;
    alias?: string | null;
    dob?: string | null;
    gender?: string | null;
    race?: string | null;
    height?: string | null;
    weight?: string | null;
    description?: string | null;
    skin_id?: number | null;
    status?: string;
  }) => void;
  onCancel: () => void;
}

export default function MemberForm({ gangs, editingMember, saving, onSubmit, onCancel }: MemberFormProps) {
  const [gangId, setGangId] = useState(editingMember?.gang_id || '');
  const [firstName, setFirstName] = useState(editingMember?.first_name || '');
  const [lastName, setLastName] = useState(editingMember?.last_name || '');
  const [alias, setAlias] = useState(editingMember?.alias || '');
  const [dob, setDob] = useState(editingMember?.dob || '');
  const [gender, setGender] = useState(editingMember?.gender || '');
  const [race, setRace] = useState(editingMember?.race || '');
  const [height, setHeight] = useState(editingMember?.height || '');
  const [weight, setWeight] = useState(editingMember?.weight || '');
  const [description, setDescription] = useState(editingMember?.description || '');
  const [skinId, setSkinId] = useState<number | null>(editingMember?.skin_id ?? null);
  const [status, setStatus] = useState(editingMember?.status || 'ACTIVE');
  const [showSkinPicker, setShowSkinPicker] = useState(false);

  const handleSubmit = () => {
    if (!gangId || !firstName.trim() || !lastName.trim()) return;
    onSubmit({
      gang_id: gangId,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      alias: alias.trim() || null,
      dob: dob || null,
      gender: gender || null,
      race: race || null,
      height: height || null,
      weight: weight || null,
      description: description.trim() || null,
      skin_id: skinId,
      status,
    });
  };

  const inputClass = 'panel-inset w-full px-2 py-1 font-mono text-xs';
  const inputStyle = { backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)' };
  const labelClass = 'font-mono text-xs block mb-1';
  const labelStyle = { color: 'var(--mdt-muted-text)' };

  return (
    <div className="flex flex-1 flex-col overflow-auto" style={{ backgroundColor: 'var(--mdt-content)' }}>
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2" style={{ backgroundColor: '#059669' }}>
        <UserPlus className="w-4 h-4 text-white" />
        <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest text-white uppercase">
          {editingMember ? 'Edytuj członka gangu' : 'Nowy członek gangu'}
        </span>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="flex gap-6">
          {/* Left: Mugshot */}
          <div className="w-40 flex-shrink-0 flex flex-col items-center">
            <div
              className="w-32 h-40 flex items-center justify-center mb-2 overflow-hidden"
              style={{ backgroundColor: '#2a2a2a', border: '3px solid #1a1a1a' }}
            >
              {skinId != null ? (
                <img src={getSkinUrl(skinId)} alt="Skin" className="w-full h-full object-cover object-top" />
              ) : (
                <span className="font-mono text-[10px] text-center" style={{ color: '#888' }}>
                  BRAK<br />ZDJĘCIA
                </span>
              )}
            </div>
            <button
              onClick={() => setShowSkinPicker(true)}
              className="btn-win95 text-xs w-full"
              style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
            >
              WYBIERZ WYGLĄD
            </button>
            {skinId != null && (
              <span className="font-mono text-[10px] mt-1" style={{ color: 'var(--mdt-muted-text)' }}>
                Skin #{skinId}
              </span>
            )}
          </div>

          {/* Right: Form fields */}
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} style={labelStyle}>Gang *</label>
                <select value={gangId} onChange={(e) => setGangId(e.target.value)} className={inputClass} style={inputStyle}>
                  <option value="">-- wybierz gang --</option>
                  {gangs.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass} style={inputStyle}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="INCARCERATED">INCARCERATED</option>
                  <option value="DECEASED">DECEASED</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass} style={labelStyle}>Imię *</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Nazwisko *</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Ksywka</label>
                <input type="text" value={alias} onChange={(e) => setAlias(e.target.value)} className={inputClass} style={inputStyle} placeholder='np. "Knuckles"' />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className={labelClass} style={labelStyle}>Data ur.</label>
                <input type="text" value={dob} onChange={(e) => setDob(e.target.value)} className={inputClass} style={inputStyle} placeholder="DD.MM.RRRR" />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Płeć</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputClass} style={inputStyle}>
                  <option value="">—</option>
                  <option value="M">Mężczyzna</option>
                  <option value="K">Kobieta</option>
                </select>
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Rasa</label>
                <input type="text" value={race} onChange={(e) => setRace(e.target.value)} className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Wzrost</label>
                <input type="text" value={height} onChange={(e) => setHeight(e.target.value)} className={inputClass} style={inputStyle} placeholder="cm" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className={labelClass} style={labelStyle}>Waga</label>
                <input type="text" value={weight} onChange={(e) => setWeight(e.target.value)} className={inputClass} style={inputStyle} placeholder="kg" />
              </div>
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>Opis / Notatki</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
                style={inputStyle}
                placeholder="Dodatkowe informacje o osobie..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 border-t-2 border-t-[#555] px-4 py-3">
        <button
          onClick={handleSubmit}
          disabled={saving || !gangId || !firstName.trim() || !lastName.trim()}
          className="btn-win95 text-xs"
          style={{
            backgroundColor: (!gangId || !firstName.trim() || !lastName.trim()) ? 'var(--mdt-btn-face)' : '#3a6a3a',
            color: (!gangId || !firstName.trim() || !lastName.trim()) ? 'var(--mdt-muted-text)' : '#fff',
            borderColor: (!gangId || !firstName.trim() || !lastName.trim()) ? undefined : '#5a9a5a #1a3a1a #1a3a1a #5a9a5a',
          }}
        >
          {saving ? 'ZAPISYWANIE...' : editingMember ? 'ZAPISZ' : 'DODAJ'}
        </button>
        <button onClick={onCancel} className="btn-win95 text-xs">ANULUJ</button>
      </div>

      {/* Skin Picker Modal */}
      {showSkinPicker && (
        <SkinPickerModal
          currentSkinId={skinId}
          onSelect={(id) => { setSkinId(id); setShowSkinPicker(false); }}
          onClose={() => setShowSkinPicker(false)}
        />
      )}
    </div>
  );
}
