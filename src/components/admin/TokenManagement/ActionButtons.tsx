import { Users } from 'lucide-react';
import Link from 'next/link';

export default function ActionButtons() {
  return (
    <div className="mt-8">
      <Link
        href="/admin"
        className="btn-win95 inline-flex items-center gap-2 font-mono text-sm"
      >
        <Users className="w-4 h-4" />
        <span>Panel Użytkowników</span>
      </Link>
    </div>
  );
}
