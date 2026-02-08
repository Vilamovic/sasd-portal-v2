import { forwardRef } from 'react';
import { Save, X, CheckSquare } from 'lucide-react';

export interface QuestionFormData {
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctAnswers: number[];
  isMultipleChoice: boolean;
  timeLimit: number;
}

interface QuestionEditorProps {
  formData: QuestionFormData;
  setFormData: (data: QuestionFormData) => void;
  onSave: () => void;
  onCancel: () => void;
  isEdit: boolean;
}

/**
 * QuestionEditor - Formularz do dodawania/edycji pytań
 *
 * Features:
 * - Question textarea
 * - 4 opcje odpowiedzi
 * - Toggle correct answers (single/multiple)
 * - Multiple choice checkbox
 * - Time limit input
 * - MDT Terminal styling
 */
const QuestionEditor = forwardRef<HTMLDivElement, QuestionEditorProps>(
  ({ formData, setFormData, onSave, onCancel, isEdit }, ref) => {
    // Toggle correct answer
    const toggleCorrectAnswer = (index: number) => {
      if (formData.isMultipleChoice) {
        // Multiple choice - toggle
        setFormData({
          ...formData,
          correctAnswers: formData.correctAnswers.includes(index)
            ? formData.correctAnswers.filter((a) => a !== index)
            : [...formData.correctAnswers, index],
        });
      } else {
        // Single choice - replace
        setFormData({
          ...formData,
          correctAnswers: [index],
        });
      }
    };

    return (
      <div
        ref={ref}
        className="panel-raised mb-4"
        style={{ backgroundColor: 'var(--mdt-btn-face)' }}
      >
        <div className="px-4 py-2" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
          <h3 className="font-[family-name:var(--font-vt323)] text-lg text-white">
            {isEdit ? 'Edytuj Pytanie' : 'Dodaj Nowe Pytanie'}
          </h3>
        </div>

        <div className="p-4">
          {/* Question */}
          <div className="mb-4">
            <label className="block font-mono text-xs font-semibold mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
              Pytanie:
            </label>
            <textarea
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              rows={3}
              className="panel-inset w-full px-3 py-2 font-mono text-sm"
              style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
              placeholder="Wpisz pytanie..."
            />
          </div>

          {/* Options */}
          <div className="mb-4 space-y-2">
            {[1, 2, 3, 4].map((num) => {
              const optKey = `option${num}` as keyof QuestionFormData;
              const index = num - 1;
              const isCorrect = formData.correctAnswers.includes(index);

              return (
                <div key={num} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleCorrectAnswer(index)}
                    className="btn-win95 flex-shrink-0 w-6 h-6 flex items-center justify-center p-0"
                    style={isCorrect ? { backgroundColor: '#3a6a3a', color: '#fff' } : {}}
                  >
                    {isCorrect &&
                      (formData.isMultipleChoice ? (
                        <CheckSquare className="w-3 h-3" />
                      ) : (
                        <div className="w-2 h-2" style={{ backgroundColor: '#fff' }} />
                      ))}
                  </button>
                  <input
                    type="text"
                    value={formData[optKey] as string}
                    onChange={(e) =>
                      setFormData({ ...formData, [optKey]: e.target.value })
                    }
                    className="panel-inset flex-grow px-3 py-2 font-mono text-sm"
                    style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
                    placeholder={`Odpowiedź ${num}...`}
                  />
                </div>
              );
            })}
          </div>

          {/* Multiple Choice & Time Limit */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 font-mono text-xs font-semibold cursor-pointer" style={{ color: 'var(--mdt-muted-text)' }}>
                <input
                  type="checkbox"
                  checked={formData.isMultipleChoice}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      isMultipleChoice: e.target.checked,
                      correctAnswers: e.target.checked
                        ? formData.correctAnswers
                        : formData.correctAnswers.length > 0
                        ? formData.correctAnswers.slice(0, 1)
                        : [],
                    });
                  }}
                  className="w-4 h-4"
                />
                <span>Wielokrotny wybór</span>
              </label>
            </div>
            <div>
              <label className="block font-mono text-xs font-semibold mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
                Czas (sekundy):
              </label>
              <input
                type="number"
                value={formData.timeLimit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    timeLimit: parseInt(e.target.value) || 30,
                  })
                }
                min={10}
                max={300}
                className="panel-inset w-full px-3 py-2 font-mono text-sm"
                style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              className="btn-win95 flex items-center gap-2"
              style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
            >
              <Save className="w-4 h-4" />
              <span className="font-mono text-sm">Zapisz</span>
            </button>
            <button
              onClick={onCancel}
              className="btn-win95 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              <span className="font-mono text-sm">Anuluj</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
);

QuestionEditor.displayName = 'QuestionEditor';

export default QuestionEditor;
