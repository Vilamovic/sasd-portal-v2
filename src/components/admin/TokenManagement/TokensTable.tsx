import { Trash2, Copy, CheckCircle } from 'lucide-react';

interface Token {
  id: string;
  user_username?: string;
  user_mta_nick?: string;
  exam_type_name?: string;
  token: string;
  used: boolean;
  created_at: string;
  expires_at: string;
}

interface TokensTableProps {
  tokens: Token[];
  copiedToken: string | null;
  onCopyToken: (token: string) => void;
  onDeleteToken: (tokenId: string, username?: string) => void;
}

export default function TokensTable({
  tokens,
  copiedToken,
  onCopyToken,
  onDeleteToken,
}: TokensTableProps) {
  return (
    <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#051a0f]/50 border-b border-[#1a4d32]/50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">
                Użytkownik
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">
                Nick MTA
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">
                Typ Egzaminu
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">Token</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">
                Utworzono
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">
                Wygasa
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">
                Akcja
              </th>
            </tr>
          </thead>
          <tbody>
            {tokens.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-[#8fb5a0]">
                  Brak tokenów do wyświetlenia
                </td>
              </tr>
            ) : (
              tokens.map((t) => {
                const isExpired = new Date(t.expires_at) < new Date();
                const isUsed = t.used;

                return (
                  <tr
                    key={t.id}
                    className="border-b border-[#1a4d32]/50 hover:bg-[#051a0f]/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a4d32] to-[#22693f] flex items-center justify-center text-white font-bold">
                          {(t.user_username || '?')[0].toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{t.user_username || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#8fb5a0]">{t.user_mta_nick || 'Brak'}</td>
                    <td className="px-6 py-4 text-[#8fb5a0]">{t.exam_type_name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onCopyToken(t.token)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a4d32]/50 hover:bg-[#c9a227]/20 transition-colors group"
                        title="Kliknij aby skopiować"
                      >
                        <span className="text-white font-mono text-xs">
                          {t.token.substring(0, 8)}...
                        </span>
                        {copiedToken === t.token ? (
                          <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                        ) : (
                          <Copy className="w-4 h-4 text-[#8fb5a0] group-hover:text-[#c9a227]" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                          isUsed
                            ? 'bg-[#8fb5a0]/20 text-[#8fb5a0] border-[#8fb5a0]/30'
                            : isExpired
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30'
                        }`}
                      >
                        {isUsed ? 'Użyty' : isExpired ? 'Wygasły' : 'Aktywny'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#8fb5a0] text-sm">
                      {new Date(t.created_at).toLocaleDateString('pl-PL')}
                    </td>
                    <td className="px-6 py-4 text-[#8fb5a0] text-sm">
                      {new Date(t.expires_at).toLocaleDateString('pl-PL')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onDeleteToken(t.id, t.user_username)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 transition-all duration-200 group"
                        title="Usuń token"
                      >
                        <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
