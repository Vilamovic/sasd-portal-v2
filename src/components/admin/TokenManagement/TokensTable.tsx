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
    <div className="panel-raised overflow-hidden" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: 'var(--mdt-header)' }}>
              <th
                className="px-4 py-2 text-left font-[family-name:var(--font-vt323)] text-base"
                style={{ color: '#ccc' }}
              >
                Użytkownik
              </th>
              <th
                className="px-4 py-2 text-left font-[family-name:var(--font-vt323)] text-base"
                style={{ color: '#ccc' }}
              >
                Nick MTA
              </th>
              <th
                className="px-4 py-2 text-left font-[family-name:var(--font-vt323)] text-base"
                style={{ color: '#ccc' }}
              >
                Typ Egzaminu
              </th>
              <th
                className="px-4 py-2 text-left font-[family-name:var(--font-vt323)] text-base"
                style={{ color: '#ccc' }}
              >
                Token
              </th>
              <th
                className="px-4 py-2 text-left font-[family-name:var(--font-vt323)] text-base"
                style={{ color: '#ccc' }}
              >
                Status
              </th>
              <th
                className="px-4 py-2 text-left font-[family-name:var(--font-vt323)] text-base"
                style={{ color: '#ccc' }}
              >
                Utworzono
              </th>
              <th
                className="px-4 py-2 text-left font-[family-name:var(--font-vt323)] text-base"
                style={{ color: '#ccc' }}
              >
                Wygasa
              </th>
              <th
                className="px-4 py-2 text-left font-[family-name:var(--font-vt323)] text-base"
                style={{ color: '#ccc' }}
              >
                Akcja
              </th>
            </tr>
          </thead>
          <tbody>
            {tokens.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-6 text-center font-mono text-sm"
                  style={{ color: 'var(--mdt-muted-text)' }}
                >
                  Brak tokenów do wyświetlenia
                </td>
              </tr>
            ) : (
              tokens.map((t, index) => {
                const isExpired = new Date(t.expires_at) < new Date();
                const isUsed = t.used;

                const statusStyle: React.CSSProperties = isUsed
                  ? { backgroundColor: '#d1d5db', color: '#374151', border: '1px solid #9ca3af' }
                  : isExpired
                  ? { backgroundColor: '#fca5a5', color: '#7f1d1d', border: '1px solid #dc2626' }
                  : { backgroundColor: '#86efac', color: '#14532d', border: '1px solid #16a34a' };

                return (
                  <tr
                    key={t.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? 'var(--mdt-row-even)' : 'var(--mdt-row-odd)',
                    }}
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-sm"
                          style={{ backgroundColor: 'var(--mdt-surface-light)', color: '#fff', border: '1px solid var(--mdt-border-mid)' }}
                        >
                          {(t.user_username || '?')[0].toUpperCase()}
                        </div>
                        <span className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>
                          {t.user_username || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>
                      {t.user_mta_nick || 'Brak'}
                    </td>
                    <td className="px-4 py-2 font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>
                      {t.exam_type_name || 'N/A'}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => onCopyToken(t.token)}
                        className="btn-win95 flex items-center gap-2 px-2 py-1 font-mono text-xs"
                        title="Kliknij aby skopiować"
                      >
                        <span>{t.token.substring(0, 8)}...</span>
                        {copiedToken === t.token ? (
                          <CheckCircle className="w-3 h-3" style={{ color: '#16a34a' }} />
                        ) : (
                          <Copy className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className="px-2 py-0.5 text-xs font-mono font-semibold"
                        style={statusStyle}
                      >
                        {isUsed ? 'Użyty' : isExpired ? 'Wygasły' : 'Aktywny'}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>
                      {new Date(t.created_at).toLocaleDateString('pl-PL')}
                    </td>
                    <td className="px-4 py-2 font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>
                      {new Date(t.expires_at).toLocaleDateString('pl-PL')}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => onDeleteToken(t.id, t.user_username)}
                        className="btn-win95 p-1"
                        style={{ backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' }}
                        title="Usuń token"
                      >
                        <Trash2 className="w-4 h-4" />
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
