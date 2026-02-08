import { STATUS_LABELS } from '../types';

interface SubmissionStatusBadgeProps {
  status: string;
}

export default function SubmissionStatusBadge({ status }: SubmissionStatusBadgeProps) {
  const config = STATUS_LABELS[status] || { label: status, color: 'var(--mdt-muted-text)' };

  return (
    <span
      className="font-mono text-xs px-2 py-0.5 panel-raised inline-block"
      style={{ backgroundColor: config.color, color: '#fff' }}
    >
      {config.label}
    </span>
  );
}
