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
      <div className="text-center py-8 panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        <p className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>Ładowanie pytań...</p>
      </div>
    );
  }

  // Empty state
  if (questions.length === 0) {
    return (
      <div className="text-center py-8 panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>Brak pytań dla tego typu egzaminu.</p>
      </div>
    );
  }

  // Questions list
  return (
    <div className="space-y-3">
      {questions.map((question, index) => (
        <div
          key={question.id}
          className="panel-raised"
          style={{ backgroundColor: 'var(--mdt-btn-face)' }}
        >
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-grow">
                <div className="flex items-start gap-2 mb-2">
                  <div className="panel-inset flex-shrink-0 w-7 h-7 flex items-center justify-center" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
                    <span className="font-mono font-bold text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="font-mono text-sm font-semibold leading-relaxed" style={{ color: 'var(--mdt-content-text)' }}>
                    {question.question}
                  </h3>
                </div>

                <div className="ml-9 space-y-1 mb-2">
                  {question.options.map((option: string, oIndex: number) => {
                    const isCorrect = question.correct_answers.includes(oIndex);
                    return (
                      <div
                        key={oIndex}
                        className="font-mono text-xs flex items-center gap-2"
                        style={{ color: isCorrect ? '#006400' : 'var(--mdt-muted-text)' }}
                      >
                        <span
                          className="w-4 h-4 flex items-center justify-center font-bold"
                          style={{
                            backgroundColor: isCorrect ? '#d0e8d0' : '#e0e0e0',
                            color: isCorrect ? '#006400' : 'var(--mdt-muted-text)',
                          }}
                        >
                          {isCorrect ? '✓' : '•'}
                        </span>
                        {option}
                      </div>
                    );
                  })}
                </div>

                <div className="ml-9 flex items-center gap-2">
                  {question.is_multiple_choice && (
                    <span className="panel-inset px-2 py-0.5 font-mono text-xs" style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-muted-text)' }}>
                      Wielokrotny wybór
                    </span>
                  )}
                  <span className="panel-inset px-2 py-0.5 font-mono text-xs flex items-center gap-1" style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-muted-text)' }}>
                    <Clock className="w-3 h-3" />
                    {question.time_limit}s
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 flex items-center gap-2">
                <button
                  onClick={() => onEdit(question)}
                  className="btn-win95 p-1.5"
                  title="Edytuj"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onDelete(question.id, question.question)}
                  className="btn-win95 p-1.5"
                  style={{ backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' }}
                  title="Usuń"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
