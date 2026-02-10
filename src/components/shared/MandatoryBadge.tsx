interface MandatoryBadgeProps {
  isMandatory: boolean;
}

/**
 * MandatoryBadge - Badge dla oznaczenia obowiązkowości materiału
 * - OBOWIĄZKOWY: czerwony (#c41e1e)
 * - DODATKOWY: szary (var(--mdt-surface-light))
 */
export default function MandatoryBadge({ isMandatory }: MandatoryBadgeProps) {
  return (
    <span
      className="font-mono text-xs px-2 py-0.5 uppercase tracking-wide"
      style={{
        backgroundColor: isMandatory ? '#c41e1e' : 'var(--mdt-surface-light)',
        color: isMandatory ? '#fff' : 'var(--mdt-content-text)',
        border: `1px solid ${isMandatory ? '#800000' : 'var(--mdt-border-mid)'}`,
      }}
    >
      {isMandatory ? 'Obowiązkowy' : 'Dodatkowy'}
    </span>
  );
}
