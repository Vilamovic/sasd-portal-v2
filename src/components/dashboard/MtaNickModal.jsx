'use client';

import { useState } from 'react';
import { supabase } from '@/src/supabaseClient';
import { Gamepad2, AlertCircle, Sparkles } from 'lucide-react';

/**
 * MtaNickModal - Modal for setting MTA nickname on first login
 * Sheriff Dark Green theme
 */
export default function MtaNickModal({ user, onComplete }) {
  const [mtaNick, setMtaNick] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
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
      // Update user's MTA nick in database
      const { error: updateError } = await supabase
        .from('users')
        .update({ mta_nick: mtaNick.trim() })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Call onComplete callback
      onComplete(mtaNick.trim());
    } catch (err) {
      console.error('Error saving MTA nick:', err);
      setError('Błąd podczas zapisywania nicku. Spróbuj ponownie.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="glass-strong rounded-2xl border border-[#c9a227] max-w-md w-full shadow-2xl">
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-transparent via-[#c9a227] to-transparent" />

        {/* Header */}
        <div className="p-6 border-b border-[#1a4d32]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#c9a227] to-[#e6b830] rounded-xl flex items-center justify-center shadow-lg">
              <Gamepad2 className="w-6 h-6 text-[#020a06]" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Witaj w SASD Portal!</h3>
              <p className="text-sm text-[#8fb5a0]">Pierwsze logowanie</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6 p-4 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/30 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#c9a227] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#8fb5a0]">
              Aby korzystać z portalu, podaj swój <span className="text-[#c9a227] font-semibold">nick z serwera MTA SocialProject</span>.
              Ten nick będzie widoczny w systemie i na certyfikatach.
            </div>
          </div>

          <label className="block text-sm font-medium text-[#8fb5a0] mb-2">
            Nick z serwera SocialProject *
          </label>
          <input
            type="text"
            value={mtaNick}
            onChange={(e) => {
              setMtaNick(e.target.value);
              setError('');
            }}
            placeholder="np. John_Doe"
            className="w-full px-4 py-3 bg-[#051a0f]/80 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0]/50 focus:outline-none focus:border-[#c9a227] transition-colors mb-4"
            disabled={saving}
            autoFocus
            maxLength={24}
          />

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !mtaNick.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:opacity-90 text-white font-semibold rounded-xl transition-all disabled:from-[#133524] disabled:to-[#0a2818] disabled:cursor-not-allowed disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Zapisywanie...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Zapisz i Kontynuuj
              </>
            )}
          </button>

          <p className="text-xs text-[#8fb5a0] text-center mt-4">
            Nick można zmienić później kontaktując się z administratorem
          </p>
        </form>
      </div>
    </div>
  );
}
