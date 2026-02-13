import { Sparkles, Key } from 'lucide-react';

interface User {
  id: string;
  username: string;
  mta_nick?: string;
  email: string;
}

interface ExamType {
  id: number;
  name: string;
}

interface GenerateTokenFormProps {
  users: User[];
  examTypes: ExamType[];
  selectedUserId: string;
  selectedExamTypeId: string;
  generating: boolean;
  onUserChange: (userId: string) => void;
  onExamTypeChange: (examTypeId: string) => void;
  onGenerate: () => void;
}

export default function GenerateTokenForm({
  users,
  examTypes,
  selectedUserId,
  selectedExamTypeId,
  generating,
  onUserChange,
  onExamTypeChange,
  onGenerate,
}: GenerateTokenFormProps) {
  return (
    <div className="panel-raised mb-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
      <div
        className="px-3 py-2 flex items-center gap-2"
        style={{ backgroundColor: 'var(--mdt-blue-bar)' }}
      >
        <Sparkles className="w-4 h-4 text-white" />
        <h3 className="font-[family-name:var(--font-vt323)] text-white text-lg">
          Wygeneruj Nowy Token
        </h3>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Select User */}
        <div>
          <label className="block font-mono text-sm mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
            Użytkownik
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => onUserChange(e.target.value)}
            className="panel-inset w-full px-3 py-2 font-mono text-sm"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
          >
            <option value="">Wybierz użytkownika...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.mta_nick || u.username || 'Brak nicku'}
              </option>
            ))}
          </select>
        </div>

        {/* Select Exam Type */}
        <div>
          <label className="block font-mono text-sm mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
            Typ Egzaminu
          </label>
          <select
            value={selectedExamTypeId}
            onChange={(e) => onExamTypeChange(e.target.value)}
            className="panel-inset w-full px-3 py-2 font-mono text-sm"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
          >
            <option value="">Wybierz typ egzaminu...</option>
            {examTypes.map((et) => (
              <option key={et.id} value={et.id}>
                {et.name}
              </option>
            ))}
          </select>
        </div>

        {/* Generate Button */}
        <div className="flex items-end">
          <button
            onClick={onGenerate}
            disabled={generating || !selectedUserId || !selectedExamTypeId}
            className="btn-win95 w-full font-mono text-sm flex items-center justify-center gap-2"
            style={
              generating || !selectedUserId || !selectedExamTypeId
                ? { color: 'var(--mdt-border-mid)', cursor: 'not-allowed' }
                : { backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }
            }
          >
            {generating ? (
              <>
                <div
                  className="w-3 h-3 border-2 border-t-transparent animate-spin"
                  style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }}
                />
                Generowanie...
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                Generuj Token
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
