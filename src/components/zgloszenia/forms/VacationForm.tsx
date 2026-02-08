'use client';

import { useState, useEffect } from 'react';
import { Calendar, Send, AlertTriangle } from 'lucide-react';
import { createSubmission } from '@/src/lib/db/submissions';
import { notifyNewSubmission } from '@/src/lib/webhooks/submissions';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/supabaseClient';

interface VacationFormProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function getCurrentQuarter(): string {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `${now.getFullYear()}-Q${q}`;
}

export default function VacationForm({ userId, onSuccess, onCancel }: VacationFormProps) {
  const { user } = useAuth();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reason, setReason] = useState('');
  const [isSpecial, setIsSpecial] = useState(false);
  const [vacationTotal, setVacationTotal] = useState(21);
  const [vacationUsed, setVacationUsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadVacationDays();
  }, [userId]);

  const loadVacationDays = async () => {
    const { data } = await supabase
      .from('users')
      .select('vacation_days_total, vacation_days_used, vacation_quarter_reset')
      .eq('id', userId)
      .single();

    if (data) {
      const currentQuarter = getCurrentQuarter();

      // Lazy quarterly reset — if quarter changed, reset used days
      if (data.vacation_quarter_reset !== currentQuarter) {
        await supabase
          .from('users')
          .update({ vacation_days_used: 0, vacation_quarter_reset: currentQuarter })
          .eq('id', userId);
        setVacationUsed(0);
      } else {
        setVacationUsed(data.vacation_days_used ?? 0);
      }

      setVacationTotal(data.vacation_days_total ?? 21);
    }
  };

  const availableDays = vacationTotal - vacationUsed;

  const calculateDays = (): number => {
    if (!dateFrom || !dateTo) return 0;
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const diff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(0, diff);
  };

  const requestedDays = calculateDays();
  const isOverLimit = requestedDays > 7;
  const isOverAvailable = requestedDays > availableDays;

  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    if (!dateFrom || !dateTo) {
      setError('Wybierz daty urlopu');
      return;
    }
    if (requestedDays <= 0) {
      setError('Data końcowa musi być po dacie początkowej');
      return;
    }
    if (isOverLimit && !isSpecial) {
      setError('Urlop >7 dni wymaga zaznaczenia "Okoliczności specjalne"');
      return;
    }
    if (!reason.trim()) {
      setError('Podaj powód urlopu');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { error: dbError } = await createSubmission({
        user_id: userId,
        type: 'vacation',
        title: `Urlop ${dateFrom} — ${dateTo} (${requestedDays} dni)${isSpecial ? ' [SPECJALNY]' : ''}`,
        description: reason,
        metadata: {
          date_from: dateFrom,
          date_to: dateTo,
          days_count: requestedDays,
          is_special: isSpecial,
        },
      });

      if (dbError) throw dbError;

      await notifyNewSubmission({
        type: 'vacation',
        title: `Urlop (${requestedDays} dni)${isSpecial ? ' [SPECJALNY]' : ''}`,
        user: { username: user?.user_metadata?.custom_claims?.global_name || '', mta_nick: '' },
        metadata: { date_from: dateFrom, date_to: dateTo },
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas wysyłania wniosku');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
      {/* Blue title bar */}
      <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
        <Calendar className="w-4 h-4 text-white" />
        <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
          Wniosek o Urlop
        </span>
      </div>

      <div className="p-4">
        {error && (
          <div className="panel-inset px-3 py-2 mb-3 font-mono text-xs" style={{ backgroundColor: '#4a1a1a', color: '#ff6b6b' }}>
            {error}
          </div>
        )}

        {/* Vacation days info */}
        <div className="panel-inset p-3 mb-4 flex items-center gap-4 flex-wrap" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
          <div>
            <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Dostępne dni</span>
            <span
              className="font-[family-name:var(--font-vt323)] text-2xl"
              style={{ color: availableDays > 0 ? '#4a9a4a' : '#cc4444' }}
            >
              {availableDays}
            </span>
          </div>
          <div>
            <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Wykorzystane</span>
            <span className="font-[family-name:var(--font-vt323)] text-2xl" style={{ color: 'var(--mdt-content-text)' }}>
              {vacationUsed}
            </span>
          </div>
          <div>
            <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Limit / kwartał</span>
            <span className="font-[family-name:var(--font-vt323)] text-2xl" style={{ color: 'var(--mdt-content-text)' }}>
              {vacationTotal}
            </span>
          </div>
          {requestedDays > 0 && (
            <div className="ml-auto">
              <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Wnioskowane</span>
              <span
                className="font-[family-name:var(--font-vt323)] text-2xl"
                style={{ color: (isOverLimit || isOverAvailable) ? '#cc4444' : 'var(--mdt-blue-bar)' }}
              >
                {requestedDays}
              </span>
            </div>
          )}
        </div>

        {/* Date pickers */}
        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <label className="font-mono text-xs block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
              Data od *
            </label>
            <input
              type="date"
              value={dateFrom}
              min={getTodayString()}
              onChange={(e) => setDateFrom(e.target.value)}
              className="panel-inset w-full px-3 py-2 font-mono text-sm"
              style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
            />
          </div>
          <div className="flex-1">
            <label className="font-mono text-xs block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
              Data do *
            </label>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || getTodayString()}
              onChange={(e) => setDateTo(e.target.value)}
              className="panel-inset w-full px-3 py-2 font-mono text-sm"
              style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
            />
          </div>
        </div>

        {/* Special circumstances checkbox */}
        {(isOverLimit || isOverAvailable) && (
          <div className="panel-inset px-3 py-2 mb-3" style={{ backgroundColor: '#4a3a1a' }}>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#c9a227' }} />
              <div>
                <p className="font-mono text-xs mb-2" style={{ color: '#c9a227' }}>
                  {isOverLimit && 'Urlop przekracza standardowy limit 7 dni. '}
                  {isOverAvailable && `Urlop przekracza dostępne dni (${availableDays}). `}
                  Zaznacz poniżej, aby złożyć wniosek o urlop specjalny. CS/HCS/DEV zdecyduje, czy odliczyć dni z puli.
                </p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSpecial}
                    onChange={(e) => setIsSpecial(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="font-mono text-xs" style={{ color: '#c9a227' }}>
                    Okoliczności specjalne (np. zdrowotne, losowe)
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Reason */}
        <div className="mb-4">
          <label className="font-mono text-xs block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
            Powód urlopu *{isSpecial ? ' (szczegółowe uzasadnienie wymagane)' : ''}
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Podaj powód urlopu..."
            rows={3}
            className="panel-inset w-full px-3 py-2 font-mono text-sm"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none', resize: 'vertical' }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSubmit}
            disabled={submitting || (isOverLimit && !isSpecial) || (isOverAvailable && !isSpecial)}
            className="btn-win95 flex items-center gap-1"
            style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
          >
            <Send className="w-3 h-3" />
            <span className="font-mono text-xs">{submitting ? 'Wysyłanie...' : 'Wyślij Wniosek'}</span>
          </button>
          <button onClick={onCancel} className="btn-win95 font-mono text-xs">
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
}
