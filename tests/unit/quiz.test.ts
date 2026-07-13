import { describe, it, expect } from 'vitest';
import {
  getXPForLevel,
  getQuestionDifficulty,
  selectQuestion,
  isCorrectAnswer,
  QuizQuestion,
} from '../../src/game/logic/quiz';

const sampleQuestions: QuizQuestion[] = [
  {
    question: 'What is a firewall?',
    answers: ['A wall of fire', 'Network security device', 'A browser', 'A virus'],
    correct: 1,
    difficulty: 1,
    category: 'networking',
  },
  {
    question: 'What does DNS stand for?',
    answers: ['Domain Name System', 'Data Network Service', 'Digital Node Setup', 'Dynamic Name Server'],
    correct: 0,
    difficulty: 1,
    category: 'networking',
  },
  {
    question: 'What is SQL injection?',
    answers: ['A database tool', 'A code exploit', 'A programming language', 'A network protocol'],
    correct: 1,
    difficulty: 2,
    category: 'security',
  },
  {
    question: 'What is a zero-day exploit?',
    answers: ['A quick fix', 'An unknown vulnerability', 'A backup tool', 'A testing method'],
    correct: 1,
    difficulty: 3,
    category: 'security',
  },
];

describe('quiz logic', () => {
  describe('getXPForLevel', () => {
    it('returns 50 XP needed for level 1', () => {
      // 50 + (1-1)*40 + (1-1)^2 * 5 = 50
      expect(getXPForLevel(1)).toBe(50);
    });

    it('returns 95 XP needed for level 2', () => {
      // 50 + (2-1)*40 + (2-1)^2 * 5 = 50 + 40 + 5 = 95
      expect(getXPForLevel(2)).toBe(95);
    });

    it('returns 150 XP needed for level 3', () => {
      // 50 + (3-1)*40 + (3-1)^2 * 5 = 50 + 80 + 20 = 150
      expect(getXPForLevel(3)).toBe(150);
    });

    it('scales quadratically', () => {
      // 50 + (5-1)*40 + (5-1)^2 * 5 = 50 + 160 + 80 = 290
      expect(getXPForLevel(5)).toBe(290);
    });

    it('returns higher values for higher levels', () => {
      expect(getXPForLevel(10)).toBeGreaterThan(getXPForLevel(5));
    });
  });

  describe('getQuestionDifficulty', () => {
    it('returns difficulty 1 for player levels 1-3', () => {
      expect(getQuestionDifficulty(1)).toBe(1);
      expect(getQuestionDifficulty(2)).toBe(1);
      expect(getQuestionDifficulty(3)).toBe(1);
    });

    it('returns difficulty 2 for player levels 4-7', () => {
      expect(getQuestionDifficulty(4)).toBe(2);
      expect(getQuestionDifficulty(5)).toBe(2);
      expect(getQuestionDifficulty(7)).toBe(2);
    });

    it('returns difficulty 3 for player level 8+', () => {
      expect(getQuestionDifficulty(8)).toBe(3);
      expect(getQuestionDifficulty(10)).toBe(3);
      expect(getQuestionDifficulty(20)).toBe(3);
    });
  });

  describe('selectQuestion', () => {
    it('returns an index of a question at the given difficulty', () => {
      const result = selectQuestion(sampleQuestions, 1, []);
      expect(result).not.toBeNull();
      expect(result === 0 || result === 1).toBe(true);
    });

    it('returns null when no questions at given difficulty', () => {
      const result = selectQuestion(sampleQuestions, 3, [3]);
      expect(result).toBeNull();
    });

    it('skips previously asked questions', () => {
      // Only two difficulty 1 questions at indices 0 and 1
      const result = selectQuestion(sampleQuestions, 1, [0]);
      expect(result).toBe(1);
    });

    it('returns null when all questions at difficulty have been asked', () => {
      const result = selectQuestion(sampleQuestions, 1, [0, 1]);
      expect(result).toBeNull();
    });

    it('returns the only available question', () => {
      const result = selectQuestion(sampleQuestions, 2, []);
      expect(result).toBe(2);
    });

    it('returns null for empty questions array', () => {
      const result = selectQuestion([], 1, []);
      expect(result).toBeNull();
    });
  });

  describe('isCorrectAnswer', () => {
    it('returns true when answer matches correct index', () => {
      expect(isCorrectAnswer(sampleQuestions[0], 1)).toBe(true);
    });

    it('returns false when answer does not match', () => {
      expect(isCorrectAnswer(sampleQuestions[0], 0)).toBe(false);
      expect(isCorrectAnswer(sampleQuestions[0], 2)).toBe(false);
      expect(isCorrectAnswer(sampleQuestions[0], 3)).toBe(false);
    });

    it('works for different questions with different correct indices', () => {
      expect(isCorrectAnswer(sampleQuestions[1], 0)).toBe(true);
      expect(isCorrectAnswer(sampleQuestions[1], 1)).toBe(false);
    });
  });
});
