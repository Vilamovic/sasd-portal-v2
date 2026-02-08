import { useState, useCallback } from 'react';
import {
  getQuestionsByExamType,
  addExamQuestion,
  updateExamQuestion,
  deleteExamQuestion,
} from '@/src/lib/db/exams';
import { notifyExamQuestionAction } from '@/src/lib/webhooks/admin';

export interface QuestionData {
  question: string;
  options: string[];
  correct_answers: number[];
  is_multiple_choice: boolean;
  time_limit: number;
}

/**
 * useQuestions - Hook dla zarządzania pytaniami egzaminacyjnymi
 *
 * Features:
 * - Load questions by exam type
 * - Add new question (with Discord webhook)
 * - Update existing question (with Discord webhook)
 * - Delete question (with Discord webhook)
 * - Auto-refresh after mutations
 *
 * Returns:
 * - questions: any[]
 * - loading: boolean
 * - loadQuestions: (examTypeId: number) => Promise<void>
 * - addQuestion: (examTypeId: number, examTypeName: string, questionData: QuestionData) => Promise<void>
 * - updateQuestion: (questionId: number, examTypeName: string, questionData: QuestionData) => Promise<void>
 * - deleteQuestion: (questionId: number, examTypeName: string, questionText: string) => Promise<void>
 */
export function useQuestions() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Load questions by exam type
   */
  const loadQuestions = useCallback(async (examTypeId: number) => {
    try {
      setLoading(true);
      const { data, error } = await getQuestionsByExamType(examTypeId);
      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add new question
   */
  const addQuestion = useCallback(
    async (
      examTypeId: number,
      examTypeName: string,
      data: QuestionData,
      actor: { mta_nick?: string; username?: string; email?: string }
    ) => {
      try {
        const questionData = {
          exam_type_id: examTypeId,
          question: data.question.trim(),
          options: data.options,
          correct_answers: data.correct_answers,
          is_multiple_choice: data.is_multiple_choice,
          time_limit: data.time_limit,
        };

        const { error } = await addExamQuestion(questionData);
        if (error) throw error;

        // Discord webhook (non-critical)
        try {
          notifyExamQuestionAction({
            action: 'add',
            actor,
            examType: examTypeName,
            question: data.question.trim(),
          });
        } catch (e) {
          console.warn('Webhook failed:', e);
        }

        // Reload questions
        await loadQuestions(examTypeId);
      } catch (error) {
        console.error('Error adding question:', error);
        throw error;
      }
    },
    [loadQuestions]
  );

  /**
   * Update existing question
   */
  const updateQuestion = useCallback(
    async (
      questionId: number,
      examTypeId: number,
      examTypeName: string,
      data: QuestionData,
      actor: { mta_nick?: string; username?: string; email?: string }
    ) => {
      try {
        const questionData = {
          exam_type_id: examTypeId,
          question: data.question.trim(),
          options: data.options,
          correct_answers: data.correct_answers,
          is_multiple_choice: data.is_multiple_choice,
          time_limit: data.time_limit,
        };

        const { error } = await updateExamQuestion(questionId, questionData);
        if (error) throw error;

        // Discord webhook (non-critical)
        try {
          notifyExamQuestionAction({
            action: 'edit',
            actor,
            examType: examTypeName,
            question: data.question.trim(),
          });
        } catch (e) {
          console.warn('Webhook failed:', e);
        }

        // Reload questions
        await loadQuestions(examTypeId);
      } catch (error) {
        console.error('Error updating question:', error);
        throw error;
      }
    },
    [loadQuestions]
  );

  /**
   * Delete question
   */
  const deleteQuestion = useCallback(
    async (
      questionId: number,
      examTypeId: number,
      examTypeName: string,
      questionText: string,
      actor: { mta_nick?: string; username?: string; email?: string }
    ) => {
      try {
        const { error } = await deleteExamQuestion(questionId);
        if (error) throw error;

        // Discord webhook (non-critical)
        try {
          notifyExamQuestionAction({
            action: 'delete',
            actor,
            examType: examTypeName,
            question: questionText,
          });
        } catch (e) {
          console.warn('Webhook failed:', e);
        }

        // Reload questions
        await loadQuestions(examTypeId);
      } catch (error) {
        console.error('Error deleting question:', error);
        throw error;
      }
    },
    [loadQuestions]
  );

  return {
    questions,
    loading,
    loadQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  };
}
