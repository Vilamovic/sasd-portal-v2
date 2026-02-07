import { Edit2, Trash2, Clock } from 'lucide-react';

interface QuestionListProps {
  questions: any[];
  loading: boolean;
  onEdit: (question: any) => void;
  onDelete: (questionId: number, questionText: string) => void;
}

/**
 * QuestionList - Lista pytań egzaminacyjnych
 *
 * Features:
 * - Loading state
 * - Empty state
 * - Question cards z opcjami
 * - Edit/Delete buttons
 * - Correct answer highlighting (green)
 * - Multiple choice badge
 * - Time limit badge
 */
export default function QuestionList({
  questions,
  loading,
  onEdit,
  onDelete,
}: QuestionListProps) {
  // Loading
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#c9a227] mx-auto mb-4" />
        <p className="text-[#8fb5a0]">Ładowanie pytań...</p>
      </div>
    );
  }

  // Empty state
  if (questions.length === 0) {
    return (
      <div className="text-center py-12 glass-strong rounded-xl border border-[#1a4d32] shadow-xl">
        <p className="text-[#8fb5a0]">Brak pytań dla tego typu egzaminu.</p>
      </div>
    );
  }

  // Questions list
  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <div
          key={question.id}
          className="glass-strong rounded-xl border border-[#1a4d32]/50 p-6 hover:border-[#c9a227]/30 transition-colors shadow-xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-grow">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-8 h-8 bg-[#c9a227]/20 rounded-lg flex items-center justify-center border border-[#c9a227]/30">
                  <span className="text-[#c9a227] font-bold text-sm">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-white font-semibold leading-relaxed">
                  {question.question}
                </h3>
              </div>

              <div className="ml-11 space-y-1 mb-3">
                {question.options.map((option: string, oIndex: number) => {
                  const isCorrect = question.correct_answers.includes(oIndex);
                  return (
                    <div
                      key={oIndex}
                      className={`text-sm flex items-center gap-2 ${
                        isCorrect ? 'text-[#22c55e]' : 'text-[#8fb5a0]'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center text-xs ${
                          isCorrect
                            ? 'bg-[#22c55e]/20'
                            : 'bg-[#0a2818]'
                        }`}
                      >
                        {isCorrect ? '✓' : '•'}
                      </span>
                      {option}
                    </div>
                  );
                })}
              </div>

              <div className="ml-11 flex items-center gap-2">
                {question.is_multiple_choice && (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-lg border border-purple-500/30">
                    Wielokrotny wybór
                  </span>
                )}
                <span className="px-2 py-1 bg-[#14b8a6]/20 text-[#14b8a6] text-xs rounded-lg border border-[#14b8a6]/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {question.time_limit}s
                </span>
              </div>
            </div>

            <div className="flex-shrink-0 flex items-center gap-2">
              <button
                onClick={() => onEdit(question)}
                className="p-2.5 bg-[#14b8a6]/20 text-[#14b8a6] rounded-lg hover:bg-[#14b8a6]/30 transition-colors border border-[#14b8a6]/30"
                title="Edytuj"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(question.id, question.question)}
                className="p-2.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30"
                title="Usuń"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
