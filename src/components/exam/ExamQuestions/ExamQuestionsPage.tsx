'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { getAllExamTypes } from '@/src/lib/db/exams';
import { Plus, X, ChevronLeft } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--mdt-content)' }}>
        <div className="panel-raised text-center p-8" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <div className="panel-inset p-4 mb-4" style={{ backgroundColor: '#e8d0d0' }}>
            <X className="w-10 h-10 mx-auto mb-2" style={{ color: '#8b0000' }} />
            <h2 className="font-[family-name:var(--font-vt323)] text-xl" style={{ color: '#8b0000' }}>Brak dostępu</h2>
          </div>
          <p className="font-mono text-sm mb-4" style={{ color: 'var(--mdt-muted-text)' }}>
            Tylko CS i wyżej mogą zarządzać pytaniami.
          </p>
          <button
            onClick={onBack}
            className="btn-win95"
          >
            <span className="font-mono text-sm">Powrót</span>
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => setSelectedType(null)}
          className="btn-win95 mb-6 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-mono text-sm">Powrót do wyboru typu</span>
        </button>

        {/* Header */}
        <div className="mb-6 panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <div className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
            <div>
              <h2 className="font-[family-name:var(--font-vt323)] text-xl text-white">
                Pytania Egzaminacyjne - {selectedType.name}
              </h2>
              <p className="font-mono text-xs text-white/80">{questions.length} pytań</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="btn-win95 flex items-center gap-2"
              style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
            >
              <Plus className="w-4 h-4" />
              <span className="font-mono text-sm">Dodaj Pytanie</span>
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
        <div className="space-y-3">
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
