'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { getAllExamTypes } from '@/src/lib/db/exams';
import { Plus, X, ChevronLeft, Sparkles } from 'lucide-react';

// Components
import QuestionTypeSelector from './QuestionTypeSelector';
import QuestionList from './QuestionList';
import QuestionEditor, { QuestionFormData } from './QuestionEditor';

// Hooks
import { useQuestions } from './hooks/useQuestions';

/**
 * ExamQuestionsPage - Orchestrator dla zarządzania pytaniami
 *
 * Odpowiedzialności:
 * - State management (selectedType, editingQuestionId, formData, showAddForm)
 * - Business logic (resetForm, startEdit, handleSave, handleDelete, validation)
 * - Component composition (QuestionTypeSelector + QuestionList + QuestionEditor)
 * - Access control (isAdmin only)
 * - Scroll to form when editing
 *
 * Flow:
 * 1. Access control → 2. Type selection → 3. Questions list + inline editor
 */
export default function ExamQuestionsPage({ onBack }: { onBack?: () => void }) {
  const { isAdmin, user, mtaNick } = useAuth();

  // Actor info for Discord webhooks
  const actor = {
    mta_nick: mtaNick || undefined,
    username: user?.user_metadata?.username || user?.user_metadata?.full_name || user?.user_metadata?.name || undefined,
    email: user?.email || undefined,
  };

  // ==================== STATE ====================
  const [examTypes, setExamTypes] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
    null
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<QuestionFormData>({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswers: [],
    isMultipleChoice: false,
    timeLimit: 30,
  });

  // Refs
  const formRef = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(false);

  // ==================== CUSTOM HOOKS ====================
  const { questions, loading: questionsLoading, loadQuestions, addQuestion, updateQuestion, deleteQuestion } = useQuestions();

  // ==================== EFFECTS ====================

  // Load exam types on mount
  useEffect(() => {
    loadExamTypes();
  }, []);

  // Load questions when type selected
  useEffect(() => {
    if (selectedType) {
      loadQuestions(selectedType.id);
    }
  }, [selectedType, loadQuestions]);

  // Scroll to form when editing/adding
  useEffect(() => {
    if ((editingQuestionId || showAddForm) && formRef.current) {
      const timeoutId = setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [editingQuestionId, showAddForm]);

  // ==================== BUSINESS LOGIC ====================

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
  const startEdit = (question: any) => {
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

    if (options.some((opt) => !opt)) {
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
        question: formData.question.trim(),
        options,
        correct_answers: formData.correctAnswers,
        is_multiple_choice: formData.isMultipleChoice,
        time_limit: formData.timeLimit,
      };

      if (editingQuestionId) {
        // Update
        await updateQuestion(
          editingQuestionId,
          selectedType.id,
          selectedType.name,
          questionData,
          actor
        );
        alert('Pytanie zaktualizowane.');
      } else {
        // Add
        await addQuestion(selectedType.id, selectedType.name, questionData, actor);
        alert('Pytanie dodane.');
      }

      // Reset form
      resetForm();
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Błąd podczas zapisywania pytania.');
    } finally {
      submittingRef.current = false;
    }
  };

  // Delete question
  const handleDelete = async (questionId: number, questionText: string) => {
    if (!confirm(`Czy na pewno chcesz usunąć pytanie: "${questionText}"?`))
      return;

    try {
      await deleteQuestion(
        questionId,
        selectedType.id,
        selectedType.name,
        questionText,
        actor
      );
      alert('Pytanie usunięte.');
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Błąd podczas usuwania pytania.');
    }
  };

  // ==================== CONDITIONAL RENDERING ====================

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
      <QuestionTypeSelector
        examTypes={examTypes}
        onSelectType={(type) => setSelectedType(type)}
        onBack={onBack || (() => {})}
      />
    );
  }

  // Questions list
  return (
    <div className="min-h-screen bg-[#020a06] relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#c9a227]/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#22693f]/20 rounded-full blur-[120px] animate-pulse-glow"
          style={{ animationDelay: '1.5s' }}
        />
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
              <p className="text-[#8fb5a0]">{questions.length} pytań</p>
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
        {showAddForm && (
          <QuestionEditor
            ref={formRef}
            formData={formData}
            setFormData={setFormData}
            onSave={handleSave}
            onCancel={resetForm}
            isEdit={false}
          />
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question.id}>
              {editingQuestionId === question.id && (
                <QuestionEditor
                  ref={formRef}
                  formData={formData}
                  setFormData={setFormData}
                  onSave={handleSave}
                  onCancel={resetForm}
                  isEdit={true}
                />
              )}

              {editingQuestionId !== question.id && (
                <QuestionList
                  questions={[question]}
                  loading={false}
                  onEdit={startEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          ))}

          {questions.length === 0 && (
            <QuestionList
              questions={[]}
              loading={questionsLoading}
              onEdit={startEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
