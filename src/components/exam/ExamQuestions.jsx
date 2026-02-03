'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { getAllExamTypes, getQuestionsByExamType, addExamQuestion, updateExamQuestion, deleteExamQuestion } from '@/src/utils/supabaseHelpers';
import { notifyExamQuestionAction } from '@/src/utils/discord';
import { Plus, Edit2, Trash2, Save, X, CheckSquare, Square } from 'lucide-react';

/**
 * ExamQuestions - Zarządzanie pytaniami egzaminacyjnymi
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
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
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
        className="bg-white/10 backdrop-blur-sm rounded-xl border border-yellow-400 p-6 mb-4"
      >
        <h3 className="text-xl font-bold text-white mb-4">
          {editingQuestionId ? 'Edytuj Pytanie' : 'Dodaj Nowe Pytanie'}
        </h3>

        {/* Question */}
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-semibold mb-2">
            Pytanie:
          </label>
          <textarea
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
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
                      ? 'bg-green-500 border-green-500'
                      : 'bg-transparent border-gray-500'
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
                  className="flex-grow px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
                  placeholder={`Odpowiedź ${num}...`}
                />
              </div>
            );
          })}
        </div>

        {/* Multiple Choice & Time Limit */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-gray-300 text-sm font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isMultipleChoice}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    isMultipleChoice: e.target.checked,
                    correctAnswers: e.target.checked ? formData.correctAnswers : formData.correctAnswers.slice(0, 1),
                  });
                }}
                className="w-4 h-4"
              />
              <span>Wielokrotny wybór</span>
            </label>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Czas (sekundy):
            </label>
            <input
              type="number"
              value={formData.timeLimit}
              onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 30 })}
              min={10}
              max={300}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
          >
            <Save className="w-4 h-4" />
            Zapisz
          </button>
          <button
            onClick={resetForm}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#1a2332] via-[#1e2836] to-[#151c28] flex items-center justify-center p-8">
        <div className="text-center">
          <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Brak dostępu</h2>
          <p className="text-gray-400 mb-6">
            Tylko administratorzy mogą zarządzać pytaniami.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#1a2332] via-[#1e2836] to-[#151c28] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">
              ZARZĄDZANIE PYTANIAMI
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"></div>
            <p className="text-gray-400 mt-4">
              Wybierz typ egzaminu aby zarządzać pytaniami
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type)}
                className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-left hover:bg-white/10 transition-all"
              >
                <h3 className="text-lg font-bold text-white">{type.name}</h3>
              </button>
            ))}
          </div>

          <button
            onClick={onBack}
            className="mt-8 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            ← Powrót
          </button>
        </div>
      </div>
    );
  }

  // Questions list
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#1a2332] via-[#1e2836] to-[#151c28] p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">
                {selectedType.name}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"></div>
              <p className="text-gray-400 mt-4">
                {questions.length} pytań
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
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
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Ładowanie pytań...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <p className="text-gray-400">Brak pytań dla tego typu egzaminu.</p>
            </div>
          ) : (
            questions.map((question, index) => (
              <div key={question.id}>
                {editingQuestionId === question.id && renderForm()}

                {editingQuestionId !== question.id && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <h3 className="text-white font-semibold mb-2">
                          {index + 1}. {question.question}
                        </h3>
                        <div className="space-y-1">
                          {question.options.map((option, oIndex) => {
                            const isCorrect = question.correct_answers.includes(oIndex);
                            return (
                              <div
                                key={oIndex}
                                className={`text-sm ${isCorrect ? 'text-green-400' : 'text-gray-400'}`}
                              >
                                {isCorrect ? '✓' : '•'} {option}
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          {question.is_multiple_choice && (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                              Wielokrotny wybór
                            </span>
                          )}
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                            {question.time_limit}s
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0 ml-4 flex items-center gap-2">
                        <button
                          onClick={() => startEdit(question)}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                          title="Edytuj"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(question.id, question.question)}
                          className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
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

        {/* Back Button */}
        <button
          onClick={() => setSelectedType(null)}
          className="mt-8 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
        >
          ← Powrót do wyboru typu
        </button>
      </div>
    </div>
  );
}
