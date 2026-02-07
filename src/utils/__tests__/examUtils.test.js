/**
 * Tests for examUtils.js
 * Testing exam generation, answer checking, scoring logic
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateExam,
  checkAnswer,
  calculateExamResult,
  getPassingThreshold,
  isPassed,
} from '../examUtils';

describe('examUtils', () => {
  // Mock question pool
  let questionPool;

  beforeEach(() => {
    questionPool = [
      {
        id: 1,
        exam_type_id: 1,
        question: 'What is 2+2?',
        options: ['3', '4', '5', '6'],
        correct_answers: [1], // index 1 = '4'
        is_multiple_choice: false,
        time_limit: 30,
      },
      {
        id: 2,
        exam_type_id: 1,
        question: 'Select even numbers',
        options: ['1', '2', '3', '4'],
        correct_answers: [1, 3], // indices 1,3 = '2','4'
        is_multiple_choice: true,
        time_limit: 45,
      },
      {
        id: 3,
        exam_type_id: 1,
        question: 'Capital of Poland?',
        options: ['Krakow', 'Warsaw', 'Gdansk'],
        correct_answers: [1], // index 1 = 'Warsaw'
        is_multiple_choice: false,
        time_limit: 20,
      },
    ];
  });

  describe('generateExam', () => {
    it('generates exam with correct number of questions', () => {
      const result = generateExam(questionPool, 2);

      expect(result.questions).toHaveLength(2);
      expect(result.questions[0]).toHaveProperty('id');
      expect(result.questions[0]).toHaveProperty('question');
      expect(result.questions[0]).toHaveProperty('shuffledOptions');
      expect(result.questions[0]).toHaveProperty('correct_answers');
    });

    it('shuffles options and maps correct answers correctly', () => {
      const result = generateExam(questionPool, 1);
      const question = result.questions[0];

      // Check that options are shuffled (array of strings)
      expect(question.shuffledOptions).toBeInstanceOf(Array);
      expect(question.shuffledOptions.length).toBeGreaterThan(0);

      // Check that correct_answers is still an array of indices
      expect(question.correct_answers).toBeInstanceOf(Array);
      expect(question.correct_answers.every(idx => typeof idx === 'number')).toBe(true);
    });

    it('handles empty question pool', () => {
      expect(() => generateExam([], 5)).toThrow('Question pool is empty');
      expect(() => generateExam(null, 5)).toThrow('Question pool is empty');
    });

    it('handles requesting more questions than available', () => {
      const result = generateExam(questionPool, 100);

      // Should return all available questions (3)
      expect(result.questions).toHaveLength(3);
    });

    it('validates question structure', () => {
      const invalidPool = [
        {
          id: 1,
          question: 'Test?',
          // Missing options
          correct_answers: [0],
          is_multiple_choice: false,
        },
      ];

      expect(() => generateExam(invalidPool, 1)).toThrow(
        'has invalid or missing options array'
      );
    });

    it('preserves question metadata', () => {
      const result = generateExam(questionPool, 1);
      const question = result.questions[0];

      expect(question).toHaveProperty('id');
      expect(question).toHaveProperty('exam_type_id');
      expect(question).toHaveProperty('is_multiple_choice');
      expect(question).toHaveProperty('time_limit');
    });
  });

  describe('checkAnswer', () => {
    describe('Single choice questions', () => {
      it('returns true for correct answer', () => {
        expect(checkAnswer(1, [1], false)).toBe(true);
        expect(checkAnswer(0, [0], false)).toBe(true);
      });

      it('returns false for incorrect answer', () => {
        expect(checkAnswer(0, [1], false)).toBe(false);
        expect(checkAnswer(2, [1], false)).toBe(false);
      });

      it('returns false for timeout (-1)', () => {
        expect(checkAnswer(-1, [1], false)).toBe(false);
      });

      it('returns false for null/undefined', () => {
        expect(checkAnswer(null, [1], false)).toBe(false);
        expect(checkAnswer(undefined, [1], false)).toBe(false);
      });
    });

    describe('Multiple choice questions', () => {
      it('returns true for correct answers (same order)', () => {
        expect(checkAnswer([1, 3], [1, 3], true)).toBe(true);
        expect(checkAnswer([0, 2], [0, 2], true)).toBe(true);
      });

      it('returns true for correct answers (different order)', () => {
        expect(checkAnswer([3, 1], [1, 3], true)).toBe(true);
        expect(checkAnswer([2, 0, 1], [0, 1, 2], true)).toBe(true);
      });

      it('returns false for incorrect answers', () => {
        expect(checkAnswer([1, 2], [1, 3], true)).toBe(false);
        expect(checkAnswer([0], [0, 1], true)).toBe(false);
      });

      it('returns false for wrong number of selections', () => {
        expect(checkAnswer([1, 3, 2], [1, 3], true)).toBe(false);
        expect(checkAnswer([1], [1, 3], true)).toBe(false);
      });

      it('returns false for non-array user answer', () => {
        expect(checkAnswer(1, [1, 3], true)).toBe(false);
        expect(checkAnswer('invalid', [1, 3], true)).toBe(false);
      });
    });
  });

  describe('calculateExamResult', () => {
    it('calculates score correctly for all correct', () => {
      const examQuestions = [
        { id: 1, correct_answers: [1], is_multiple_choice: false },
        { id: 2, correct_answers: [2], is_multiple_choice: false },
      ];

      const answers = { 1: 1, 2: 2 };
      const result = calculateExamResult(answers, examQuestions);

      expect(result.score).toBe(2);
      expect(result.total).toBe(2);
      expect(result.percentage).toBe(100);
    });

    it('calculates score correctly for mixed results', () => {
      const examQuestions = [
        { id: 1, question: 'Q1', correct_answers: [1], is_multiple_choice: false },
        { id: 2, question: 'Q2', correct_answers: [2], is_multiple_choice: false },
        { id: 3, question: 'Q3', correct_answers: [0], is_multiple_choice: false },
      ];

      const answers = { 1: 1, 2: 0, 3: 0 }; // 2 correct, 1 wrong
      const result = calculateExamResult(answers, examQuestions);

      expect(result.score).toBe(2);
      expect(result.total).toBe(3);
      expect(result.percentage).toBe(66.67);
    });

    it('calculates score correctly for all wrong', () => {
      const examQuestions = [
        { id: 1, correct_answers: [1], is_multiple_choice: false },
        { id: 2, correct_answers: [2], is_multiple_choice: false },
      ];

      const answers = { 1: 0, 2: 0 };
      const result = calculateExamResult(answers, examQuestions);

      expect(result.score).toBe(0);
      expect(result.total).toBe(2);
      expect(result.percentage).toBe(0);
    });

    it('includes detailed results for each question', () => {
      const examQuestions = [
        { id: 1, question: 'Test Q', correct_answers: [1], is_multiple_choice: false },
      ];

      const answers = { 1: 1 };
      const result = calculateExamResult(answers, examQuestions);

      expect(result.details).toHaveLength(1);
      expect(result.details[0]).toMatchObject({
        questionId: 1,
        question: 'Test Q',
        userAnswer: 1,
        correctAnswers: [1],
        isCorrect: true,
        isTimeout: false,
      });
    });

    it('marks timeout questions correctly', () => {
      const examQuestions = [
        { id: 1, question: 'Test Q', correct_answers: [1], is_multiple_choice: false },
      ];

      const answers = { 1: -1 }; // Timeout
      const result = calculateExamResult(answers, examQuestions);

      expect(result.details[0].isCorrect).toBe(false);
      expect(result.details[0].isTimeout).toBe(true);
    });

    it('handles multiple choice questions', () => {
      const examQuestions = [
        { id: 1, question: 'Multi', correct_answers: [0, 2], is_multiple_choice: true },
      ];

      const answers = { 1: [2, 0] }; // Correct but different order
      const result = calculateExamResult(answers, examQuestions);

      expect(result.score).toBe(1);
      expect(result.percentage).toBe(100);
    });
  });

  describe('getPassingThreshold', () => {
    it('returns 50% for trainee exam', () => {
      expect(getPassingThreshold('Trainee')).toBe(50);
      expect(getPassingThreshold('trainee')).toBe(50);
      expect(getPassingThreshold('TRAINEE')).toBe(50);
    });

    it('returns 50% for pościgowy exam', () => {
      expect(getPassingThreshold('Pościgowy')).toBe(50);
      expect(getPassingThreshold('pościgowy')).toBe(50);
    });

    it('returns 50% for SWAT exam', () => {
      expect(getPassingThreshold('SWAT')).toBe(50);
      expect(getPassingThreshold('swat')).toBe(50);
    });

    it('returns 75% for GU exam', () => {
      expect(getPassingThreshold('GU')).toBe(75);
      expect(getPassingThreshold('gu')).toBe(75);
    });

    it('returns 75% for DTU exam', () => {
      expect(getPassingThreshold('DTU')).toBe(75);
      expect(getPassingThreshold('dtu')).toBe(75);
    });

    it('returns 75% for SS exam', () => {
      expect(getPassingThreshold('SS')).toBe(75);
      expect(getPassingThreshold('ss')).toBe(75);
    });

    it('returns 75% for unknown exam types', () => {
      expect(getPassingThreshold('Unknown')).toBe(75);
      expect(getPassingThreshold('Advanced')).toBe(75);
    });
  });

  describe('isPassed', () => {
    it('returns true when percentage meets threshold', () => {
      expect(isPassed(50, 'trainee')).toBe(true);
      expect(isPassed(75, 'GU')).toBe(true);
      expect(isPassed(100, 'trainee')).toBe(true);
    });

    it('returns false when percentage below threshold', () => {
      expect(isPassed(49, 'trainee')).toBe(false);
      expect(isPassed(74, 'GU')).toBe(false);
      expect(isPassed(0, 'trainee')).toBe(false);
    });

    it('returns true when percentage exceeds threshold', () => {
      expect(isPassed(60, 'trainee')).toBe(true);
      expect(isPassed(80, 'GU')).toBe(true);
    });

    it('handles edge cases', () => {
      expect(isPassed(50.01, 'trainee')).toBe(true);
      expect(isPassed(49.99, 'trainee')).toBe(false);
      expect(isPassed(75.01, 'DTU')).toBe(true);
      expect(isPassed(74.99, 'DTU')).toBe(false);
    });
  });
});
