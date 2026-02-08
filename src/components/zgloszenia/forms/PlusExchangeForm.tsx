'use client';

import { useState } from 'react';
import { ArrowLeftRight, Send } from 'lucide-react';
import { createSubmission } from '@/src/lib/db/submissions';
import { notifyNewSubmission } from '@/src/lib/webhooks/submissions';
import { useAuth } from '@/src/contexts/AuthContext';

interface PlusExchangeFormProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const BENEFITS = [
  { id: 'premia', label: 'Premia Finansowa', cost: 5, description: 'Jednorazowa premia finansowa' },
  { id: 'pojazd', label: 'Pojazd Wyżej', cost: 3, description: 'Dostęp do pojazdu wyższej klasy' },
  { id: 'norma', label: 'Obniżenie Normy Minutowej', cost: 4, description: 'Obniżenie wymaganej normy minutowej' },
];

export default function PlusExchangeForm({ userId, onSuccess, onCancel }: PlusExchangeFormProps) {
  const { user, plusCount } = useAuth();
  const [selectedBenefit, setSelectedBenefit] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedBenefitData = BENEFITS.find((b) => b.id === selectedBenefit);
  const canAfford = selectedBenefitData ? plusCount >= selectedBenefitData.cost : false;

  const handleSubmit = async () => {
    if (!selectedBenefitData) {
      setError('Wybierz benefit');
      return;
    }
    if (!canAfford) {
      setError(`Nie masz wystarczającej liczby plusów (potrzeba: ${selectedBenefitData.cost}, masz: ${plusCount})`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { error: dbError } = await createSubmission({
        user_id: userId,
        type: 'plus_exchange',
        title: `Wymiana plusów — ${selectedBenefitData.label}`,
        description: `Wniosek o wymianę ${selectedBenefitData.cost} plusów na: ${selectedBenefitData.label}`,
        metadata: {
          benefit: selectedBenefitData.label,
          benefit_id: selectedBenefitData.id,
          cost: selectedBenefitData.cost,
        },
      });

      if (dbError) throw dbError;

      await notifyNewSubmission({
        type: 'plus_exchange',
        title: `Wymiana plusów — ${selectedBenefitData.label}`,
        user: { username: user?.user_metadata?.custom_claims?.global_name || '', mta_nick: '' },
        metadata: { benefit: selectedBenefitData.label, cost: selectedBenefitData.cost },
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
        <ArrowLeftRight className="w-4 h-4 text-white" />
        <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
          Wymiana Plusów
        </span>
      </div>

      <div className="p-4">
        {error && (
          <div className="panel-inset px-3 py-2 mb-3 font-mono text-xs" style={{ backgroundColor: '#4a1a1a', color: '#ff6b6b' }}>
            {error}
          </div>
        )}

        {/* Plus balance */}
        <div className="panel-inset p-3 mb-4 flex items-center gap-4" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
          <div>
            <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Twoje plusy</span>
            <span
              className="font-[family-name:var(--font-vt323)] text-3xl"
              style={{ color: plusCount > 0 ? '#4a9a4a' : '#cc4444' }}
            >
              +{plusCount}
            </span>
          </div>
          {selectedBenefitData && (
            <>
              <div className="font-[family-name:var(--font-vt323)] text-xl" style={{ color: 'var(--mdt-content-text)' }}>→</div>
              <div>
                <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Koszt</span>
                <span
                  className="font-[family-name:var(--font-vt323)] text-3xl"
                  style={{ color: canAfford ? '#5588cc' : '#cc4444' }}
                >
                  -{selectedBenefitData.cost}
                </span>
              </div>
              <div className="font-[family-name:var(--font-vt323)] text-xl" style={{ color: 'var(--mdt-content-text)' }}>=</div>
              <div>
                <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Pozostanie</span>
                <span
                  className="font-[family-name:var(--font-vt323)] text-3xl"
                  style={{ color: canAfford ? '#4a9a4a' : '#cc4444' }}
                >
                  +{Math.max(0, plusCount - selectedBenefitData.cost)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Benefit selection */}
        <div className="mb-4">
          <label className="font-mono text-xs block mb-2" style={{ color: 'var(--mdt-muted-text)' }}>
            Wybierz benefit *
          </label>
          <div className="flex flex-col gap-2">
            {BENEFITS.map((benefit) => {
              const affordable = plusCount >= benefit.cost;
              const isSelected = selectedBenefit === benefit.id;

              return (
                <button
                  key={benefit.id}
                  onClick={() => setSelectedBenefit(benefit.id)}
                  disabled={!affordable}
                  className={`btn-win95 text-left px-4 py-3 flex items-center justify-between ${isSelected ? 'btn-win95-active' : ''} ${!affordable ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={isSelected ? { backgroundColor: 'var(--mdt-blue-bar)', color: '#fff' } : {}}
                >
                  <div>
                    <span className="font-mono text-xs block" style={{ color: isSelected ? '#fff' : 'var(--mdt-content-text)' }}>
                      {benefit.label}
                    </span>
                    <span className="font-mono text-[10px]" style={{ color: isSelected ? '#aaccff' : 'var(--mdt-muted-text)' }}>
                      {benefit.description}
                    </span>
                  </div>
                  <span
                    className="font-[family-name:var(--font-vt323)] text-lg shrink-0 ml-4"
                    style={{ color: isSelected ? '#fff' : affordable ? '#4a9a4a' : '#cc4444' }}
                  >
                    {benefit.cost} PLUSÓW
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {plusCount === 0 && (
          <div className="panel-inset px-3 py-2 mb-3 font-mono text-xs" style={{ backgroundColor: '#4a3a1a', color: '#c9a227' }}>
            Nie posiadasz żadnych plusów do wymiany.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSubmit}
            disabled={submitting || !canAfford || !selectedBenefit}
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
