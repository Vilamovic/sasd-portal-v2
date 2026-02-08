'use client';

import { useState } from 'react';
import { supabase } from '@/src/supabaseClient';
import { AlertCircle } from 'lucide-react';

export default function MtaNickModal({ user, onComplete }: { user: any; onComplete: (nick: string) => void }) {
  const [mtaNick, setMtaNick] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mtaNick.trim()) {
      setError('Nick z serwera SocialProject jest wymagany.');
      return;
    }

    if (mtaNick.trim().length < 3) {
      setError('Nick musi mieć minimum 3 znaki.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ mta_nick: mtaNick.trim() })
        .eq('id', user.id);

      if (updateError) throw updateError;

      onComplete(mtaNick.trim());
    } catch (err) {
      console.error('Error saving MTA nick:', err);
      setError('Błąd podczas zapisywania nicku. Spróbuj ponownie.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="panel-raised flex flex-col w-full max-w-md" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        {/* Blue title bar */}
        <div className="flex items-center justify-between px-3 py-1.5" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
          <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider text-white uppercase">USTAW NICK MTA - PIERWSZE LOGOWANIE</span>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="panel-inset p-3 mb-4" style={{ backgroundColor: 'var(--mdt-panel-alt)' }}>
            <p className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>
              Aby korzystać z portalu, podaj swój nick z serwera MTA SocialProject. Ten nick będzie widoczny w systemie i na certyfikatach.
            </p>
          </div>

          <label className="block font-mono text-sm font-bold mb-2" style={{ color: 'var(--mdt-muted-text)' }}>
            NICK Z SERWERA SOCIALPROJECT *
          </label>
          <input
            type="text"
            value={mtaNick}
            onChange={(e) => {
              setMtaNick(e.target.value);
              setError('');
            }}
            placeholder="np. John_Doe"
            className="panel-inset w-full px-3 py-2 font-mono text-sm mb-4"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
            disabled={saving}
            autoFocus
            maxLength={24}
          />

          {error && (
            <div className="panel-inset flex items-center gap-2 p-2 mb-4" style={{ backgroundColor: '#ffcccc' }}>
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
              <span className="font-mono text-sm text-red-700">{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={saving || !mtaNick.trim()}
              className="btn-win95 text-sm"
              style={(!saving && mtaNick.trim()) ? { backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' } : {}}
            >
              {saving ? 'ZAPISYWANIE...' : 'ZAPISZ I KONTYNUUJ'}
            </button>
          </div>

          <p className="font-mono text-xs text-center mt-4" style={{ color: 'var(--mdt-subtle-text)' }}>
            Nick można zmienić później kontaktując się z administratorem
          </p>
        </form>
      </div>
    </div>
  );
}
