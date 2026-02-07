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
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#c9a227] to-[#e6b830] hover:opacity-90 text-[#020a06] font-bold transition-all duration-300 hover:scale-[1.02] shadow-lg"
      >
        <Key className="w-5 h-5" />
        <span className="text-sm font-medium">Tokeny Egzaminacyjne</span>
      </Link>
    </div>
  );
}
