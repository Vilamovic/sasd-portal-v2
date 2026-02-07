import { Users } from 'lucide-react';
import Link from 'next/link';

export default function ActionButtons() {
  return (
    <div className="mt-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90 text-white font-bold transition-all duration-300 hover:scale-[1.02] shadow-lg"
      >
        <Users className="w-5 h-5" />
        <span className="text-sm font-medium">Panel Użytkowników</span>
      </Link>
    </div>
  );
}
