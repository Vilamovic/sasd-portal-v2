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
    <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 shadow-xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-[#c9a227]" />
        <h3 className="text-xl font-bold text-white">Wygeneruj Nowy Token</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Select User */}
        <div>
          <label className="block text-sm font-medium text-[#8fb5a0] mb-2">Użytkownik</label>
          <select
            value={selectedUserId}
            onChange={(e) => onUserChange(e.target.value)}
            className="w-full px-4 py-3 bg-[#051a0f]/80 border border-[#1a4d32] rounded-xl text-white focus:outline-none focus:border-[#c9a227] transition-colors"
          >
            <option value="">Wybierz użytkownika...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.mta_nick || u.username || u.email}
              </option>
            ))}
          </select>
        </div>

        {/* Select Exam Type */}
        <div>
          <label className="block text-sm font-medium text-[#8fb5a0] mb-2">Typ Egzaminu</label>
          <select
            value={selectedExamTypeId}
            onChange={(e) => onExamTypeChange(e.target.value)}
            className="w-full px-4 py-3 bg-[#051a0f]/80 border border-[#1a4d32] rounded-xl text-white focus:outline-none focus:border-[#c9a227] transition-colors"
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
            className="w-full px-6 py-3 bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:opacity-90 text-white font-semibold rounded-xl transition-all disabled:from-[#133524] disabled:to-[#0a2818] disabled:cursor-not-allowed disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
