import Link from 'next/link';
import { Key } from 'lucide-react';

/**
 * ActionButtons - Bottom action buttons (Tokens link)
 */
export default function ActionButtons() {
  return (
    <div className="mt-8">
      <Link
        href="/admin/tokens"
        className="btn-win95 inline-flex items-center gap-2 font-mono text-sm"
      >
        <Key className="w-4 h-4" />
        <span>Tokeny Egzaminacyjne</span>
      </Link>
    </div>
  );
}
