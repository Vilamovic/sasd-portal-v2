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
 * - Sheriff Theme styling
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
        className="glass-strong rounded-xl border border-[#c9a227] p-6 mb-4 shadow-xl"
      >
        <h3 className="text-xl font-bold text-white mb-4">
          {isEdit ? 'Edytuj Pytanie' : 'Dodaj Nowe Pytanie'}
        </h3>

        {/* Question */}
        <div className="mb-4">
          <label className="block text-[#8fb5a0] text-sm font-semibold mb-2">
            Pytanie:
          </label>
          <textarea
            value={formData.question}
            onChange={(e) =>
              setFormData({ ...formData, question: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-3 bg-[#051a0f]/80 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-[#c9a227] transition-colors"
            placeholder="Wpisz pytanie..."
          />
        </div>

        {/* Options */}
        <div className="mb-4 space-y-3">
          {[1, 2, 3, 4].map((num) => {
            const optKey = `option${num}` as keyof QuestionFormData;
            const index = num - 1;
            const isCorrect = formData.correctAnswers.includes(index);

            return (
              <div key={num} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleCorrectAnswer(index)}
                  className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    isCorrect
                      ? 'bg-[#22c55e] border-[#22c55e]'
                      : 'bg-transparent border-[#8fb5a0]'
                  }`}
                >
                  {isCorrect &&
                    (formData.isMultipleChoice ? (
                      <CheckSquare className="w-4 h-4 text-white" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-white" />
                    ))}
                </button>
                <input
                  type="text"
                  value={formData[optKey] as string}
                  onChange={(e) =>
                    setFormData({ ...formData, [optKey]: e.target.value })
                  }
                  className="flex-grow px-4 py-3 bg-[#051a0f]/80 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-[#c9a227] transition-colors"
                  placeholder={`Odpowiedź ${num}...`}
                />
              </div>
            );
          })}
        </div>

        {/* Multiple Choice & Time Limit */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-[#8fb5a0] text-sm font-semibold cursor-pointer">
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
            <label className="block text-[#8fb5a0] text-sm font-semibold mb-2">
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
              className="w-full px-4 py-3 bg-[#051a0f]/80 border border-[#1a4d32] rounded-xl text-white focus:outline-none focus:border-[#c9a227] transition-colors"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-6 py-3 bg-[#22c55e] text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg"
          >
            <Save className="w-4 h-4" />
            Zapisz
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-6 py-3 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
          >
            <X className="w-4 h-4" />
            Anuluj
          </button>
        </div>
      </div>
    );
  }
);

QuestionEditor.displayName = 'QuestionEditor';

export default QuestionEditor;
