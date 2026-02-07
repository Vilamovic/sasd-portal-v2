'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { getAllExamTypes, getQuestionsByExamType, addExamQuestion, updateExamQuestion, deleteExamQuestion } from '@/src/utils/supabaseHelpers';
import { notifyExamQuestionAction } from '@/src/utils/discord';
import { Plus, Edit2, Trash2, Save, X, CheckSquare, Square, ChevronLeft, Sparkles, Settings, Clock } from 'lucide-react';

/**
 * ExamQuestions - Premium Sheriff-themed question management
 * - Wybór typu → lista pytań → formularz add/edit/delete
 * - Pytanie, 4 odpowiedzi, multiple choice checkbox
 * - In-place editing (formularz pojawia się na miejscu klikniętego pytania)
 * - Discord webhooks przy add/edit/delete
 */
export default function ExamQuestions({ onBack }) {
  const { role, isAdmin } = useAuth();
  const [examTypes, setExamTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswers: [],
    isMultipleChoice: false,
    timeLimit: 30,
  });
  const formRef = useRef(null);
  const submittingRef = useRef(false);

  // Load exam types
  useEffect(() => {
    loadExamTypes();
  }, []);

  // Load questions when type selected
  useEffect(() => {
    if (selectedType) {
      loadQuestions();
    }
  }, [selectedType]);

  // Scroll to form when editing
  useEffect(() => {
    if ((editingQuestionId || showAddForm) && formRef.current) {
      const timeoutId = setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

      // Cleanup: wyczyść timeout jeśli komponent zostanie unmountowany
      return () => clearTimeout(timeoutId);
    }
  }, [editingQuestionId, showAddForm]);

  const loadExamTypes = async () => {
    try {
      const { data, error } = await getAllExamTypes();
      if (error) throw error;
      setExamTypes(data || []);
    } catch (error) {
      console.error('Error loading exam types:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await getQuestionsByExamType(selectedType.id);
      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correctAnswers: [],
      isMultipleChoice: false,
      timeLimit: 30,
    });
    setEditingQuestionId(null);
    setShowAddForm(false);
  };

  // Start editing
  const startEdit = (question) => {
    const options = question.options || [];
    const correctAnswers = question.correct_answers || [];

    setFormData({
      question: question.question,
      option1: options[0] || '',
      option2: options[1] || '',
      option3: options[2] || '',
      option4: options[3] || '',
      correctAnswers,
      isMultipleChoice: question.is_multiple_choice,
      timeLimit: question.time_limit || 30,
    });
    setEditingQuestionId(question.id);
    setShowAddForm(false);
  };

  // Toggle correct answer
  const toggleCorrectAnswer = (index) => {
    if (formData.isMultipleChoice) {
      // Multiple choice - toggle
      setFormData({
        ...formData,
        correctAnswers: formData.correctAnswers.includes(index)
          ? formData.correctAnswers.filter(a => a !== index)
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

  // Save question (add or edit)
  const handleSave = async () => {
    if (submittingRef.current) return;

    // Validation
    if (!formData.question.trim()) {
      alert('Pytanie nie może być puste.');
      return;
    }

    const options = [
      formData.option1.trim(),
      formData.option2.trim(),
      formData.option3.trim(),
      formData.option4.trim(),
    ];

    if (options.some(opt => !opt)) {
      alert('Wszystkie 4 odpowiedzi muszą być wypełnione.');
      return;
    }

    if (formData.correctAnswers.length === 0) {
      alert('Wybierz przynajmniej jedną poprawną odpowiedź.');
      return;
    }

    submittingRef.current = true;

    try {
      const questionData = {
        exam_type_id: selectedType.id,
        question: formData.question.trim(),
        options,
        correct_answers: formData.correctAnswers,
        is_multiple_choice: formData.isMultipleChoice,
        time_limit: formData.timeLimit,
      };

      if (editingQuestionId) {
        // Update
        const { error } = await updateExamQuestion(editingQuestionId, questionData);
        if (error) throw error;

        // Discord webhook
        notifyExamQuestionAction({
          action: 'edit',
          examType: selectedType.name,
          question: formData.question.trim(),
        });

        alert('Pytanie zaktualizowane.');
      } else {
        // Add
        const { error } = await addExamQuestion(questionData);
        if (error) throw error;

        // Discord webhook
        notifyExamQuestionAction({
          action: 'add',
          examType: selectedType.name,
          question: formData.question.trim(),
        });

        alert('Pytanie dodane.');
      }

      // Reload questions and reset form
      await loadQuestions();
      resetForm();
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Błąd podczas zapisywania pytania.');
    } finally {
      submittingRef.current = false;
    }
  };

  // Delete question
  const handleDelete = async (questionId, questionText) => {
    if (!confirm(`Czy na pewno chcesz usunąć pytanie: "${questionText}"?`)) return;

    try {
      const { error } = await deleteExamQuestion(questionId);
      if (error) throw error;

      // Discord webhook
      notifyExamQuestionAction({
        action: 'delete',
        examType: selectedType.name,
        question: questionText,
      });

      // Reload questions
      await loadQuestions();
      alert('Pytanie usunięte.');
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Błąd podczas usuwania pytania.');
    }
  };

  // Render form
  const renderForm = () => {
    return (
      <div
        ref={formRef}
        className="glass-strong rounded-xl border border-[#c9a227] p-6 mb-4 shadow-xl"
      >
        <h3 className="text-xl font-bold text-white mb-4">
          {editingQuestionId ? 'Edytuj Pytanie' : 'Dodaj Nowe Pytanie'}
        </h3>

        {/* Question */}
        <div className="mb-4">
          <label className="block text-[#8fb5a0] text-sm font-semibold mb-2">
            Pytanie:
          </label>
          <textarea
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-[#051a0f]/80 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-[#c9a227] transition-colors"
            placeholder="Wpisz pytanie..."
          />
        </div>

        {/* Options */}
        <div className="mb-4 space-y-3">
          {[1, 2, 3, 4].map((num) => {
            const optKey = `option${num}`;
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
                  {isCorrect && (
                    formData.isMultipleChoice ? (
                      <CheckSquare className="w-4 h-4 text-white" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-white" />
                    )
                  )}
                </button>
                <input
                  type="text"
                  value={formData[optKey]}
                  onChange={(e) => setFormData({ ...formData, [optKey]: e.target.value })}
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
                      : (formData.correctAnswers.length > 0 ? formData.correctAnswers.slice(0, 1) : []),
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
              onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 30 })}
              min={10}
              max={300}
              className="w-full px-4 py-3 bg-[#051a0f]/80 border border-[#1a4d32] rounded-xl text-white focus:outline-none focus:border-[#c9a227] transition-colors"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-[#22c55e] text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg"
          >
            <Save className="w-4 h-4" />
            Zapisz
          </button>
          <button
            onClick={resetForm}
            className="flex items-center gap-2 px-6 py-3 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
          >
            <X className="w-4 h-4" />
            Anuluj
          </button>
        </div>
      </div>
    );
  };

  // Access control
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#020a06] flex items-center justify-center p-8">
        <div className="text-center">
          <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Brak dostępu</h2>
          <p className="text-[#8fb5a0] mb-6">
            Tylko CS i wyżej mogą zarządzać pytaniami.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-[#c9a227] to-[#e6b830] text-[#020a06] font-bold rounded-xl hover:opacity-90 transition-all duration-300 hover:scale-[1.02] shadow-lg"
          >
            Powrót
          </button>
        </div>
      </div>
    );
  }

  // Type selection screen
  if (!selectedType) {
    return (
      <div className="min-h-screen bg-[#020a06] relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#c9a227]/10 rounded-full blur-[120px] animate-pulse-glow" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#22693f]/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 px-5 py-3 rounded-xl bg-[#051a0f]/80 hover:bg-[#0a2818] border border-[#1a4d32]/50 hover:border-[#c9a227]/30 text-[#8fb5a0] hover:text-white transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Powrót do Egzaminów</span>
          </button>

          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/20 text-[#c9a227] text-sm font-medium mb-6">
              <Settings className="w-4 h-4" />
              <span>Zarządzanie pytaniami</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Zarządzanie <span className="text-gold-gradient">Pytaniami</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#c9a227] to-[#e6b830] rounded-full mb-4" />
            <p className="text-[#8fb5a0]">
              Wybierz typ egzaminu aby zarządzać pytaniami
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type)}
                className="group p-6 glass-strong border border-[#1a4d32]/50 rounded-xl text-left hover:border-[#c9a227]/50 transition-all duration-300 shadow-xl hover:scale-[1.01]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#c9a227] to-[#e6b830] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Settings className="w-6 h-6 text-[#020a06]" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#c9a227] transition-colors">{type.name}</h3>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Questions list
  return (
    <div className="min-h-screen bg-[#020a06] relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#c9a227]/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#22693f]/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => setSelectedType(null)}
          className="mb-6 flex items-center gap-2 px-5 py-3 rounded-xl bg-[#051a0f]/80 hover:bg-[#0a2818] border border-[#1a4d32]/50 hover:border-[#c9a227]/30 text-[#8fb5a0] hover:text-white transition-all duration-200"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Powrót do wyboru typu</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/20 text-[#c9a227] text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                <span>{selectedType.name}</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-2">
                Pytania <span className="text-gold-gradient">Egzaminacyjne</span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#c9a227] to-[#e6b830] rounded-full mb-2" />
              <p className="text-[#8fb5a0]">
                {questions.length} pytań
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-[#22c55e] text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Dodaj Pytanie
            </button>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && renderForm()}

        {/* Questions List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#c9a227] mx-auto mb-4" />
              <p className="text-[#8fb5a0]">Ładowanie pytań...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 glass-strong rounded-xl border border-[#1a4d32] shadow-xl">
              <p className="text-[#8fb5a0]">Brak pytań dla tego typu egzaminu.</p>
            </div>
          ) : (
            questions.map((question, index) => (
              <div key={question.id}>
                {editingQuestionId === question.id && renderForm()}

                {editingQuestionId !== question.id && (
                  <div className="glass-strong rounded-xl border border-[#1a4d32]/50 p-6 hover:border-[#c9a227]/30 transition-colors shadow-xl">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-grow">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-[#c9a227]/20 rounded-lg flex items-center justify-center border border-[#c9a227]/30">
                            <span className="text-[#c9a227] font-bold text-sm">{index + 1}</span>
                          </div>
                          <h3 className="text-white font-semibold leading-relaxed">{question.question}</h3>
                        </div>

                        <div className="ml-11 space-y-1 mb-3">
                          {question.options.map((option, oIndex) => {
                            const isCorrect = question.correct_answers.includes(oIndex);
                            return (
                              <div
                                key={oIndex}
                                className={`text-sm flex items-center gap-2 ${isCorrect ? 'text-[#22c55e]' : 'text-[#8fb5a0]'}`}
                              >
                                <span className={`w-5 h-5 rounded flex items-center justify-center text-xs ${isCorrect ? 'bg-[#22c55e]/20' : 'bg-[#0a2818]'}`}>
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
                          onClick={() => startEdit(question)}
                          className="p-2.5 bg-[#14b8a6]/20 text-[#14b8a6] rounded-lg hover:bg-[#14b8a6]/30 transition-colors border border-[#14b8a6]/30"
                          title="Edytuj"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(question.id, question.question)}
                          className="p-2.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30"
                          title="Usuń"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
