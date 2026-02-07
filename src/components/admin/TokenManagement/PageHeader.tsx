import { Shield, Key } from 'lucide-react';

interface PageHeaderProps {
  tokensCount: number;
}

export default function PageHeader({ tokensCount }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/20 text-[#c9a227] text-sm font-medium mb-6">
        <Shield className="w-4 h-4" />
        <span>Panel administratora</span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Key className="w-8 h-8 text-[#c9a227]" />
        <h2 className="text-4xl font-bold text-white">
          Tokeny <span className="text-gold-gradient">Egzaminacyjne</span>
        </h2>
      </div>
      <div className="w-24 h-1 bg-gradient-to-r from-[#c9a227] to-[#e6b830] rounded-full mb-4" />
      <p className="text-[#8fb5a0]">
        Zarządzanie tokenami dostępu do egzaminów ({tokensCount})
      </p>
    </div>
  );
}
