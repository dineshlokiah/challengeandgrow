/**
 * Unit tests for ScoringEngine
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 8.1, 8.2
 */

import { describe, it, expect } from 'vitest';
import { ScoringEngine } from './ScoringEngine';
import { QuestionResult, Question } from '../types';

describe('ScoringEngine', () => {
  const scoringEngine = new ScoringEngine();

  describe('scoreAnswer', () => {
    it('should award 1 point for correct answer before timer expiry', () => {
      const score = scoringEngine.scoreAnswer(true, false);
      expect(score).toBe(1);
    });

    it('should award 0.5 points for correct answer after timer expiry', () => {
      const score = scoringEngine.scoreAnswer(true, true);
      expect(score).toBe(0.5);
    });

    it('should award 0 points for incorrect answer before timer expiry', () => {
      const score = scoringEngine.scoreAnswer(false, false);
      expect(score).toBe(0);
    });

    it('should award 0 points for incorrect answer after timer expiry', () => {
      const score = scoringEngine.scoreAnswer(false, true);
      expect(score).toBe(0);
    });
  });

  describe('calculateTotalScore', () => {
    it('should return 0 for empty results array', () => {
      const totalScore = scoringEngine.calculateTotalScore([]);
      expect(totalScore).toBe(0);
    });

    it('should sum all pointsAwarded values', () => {
      const mockQuestion: Question = {
        operandA: 5,
        operandB: 3,
        operation: 'addition',
        correctAnswer: 8,
        questionNumber: 1,
      };

      const results: QuestionResult[] = [
        {
          question: mockQuestion,
          userAnswer: 8,
          isCorrect: true,
          pointsAwarded: 1,
          answeredAfterExpiry: false,
          timeSpent: 5,
        },
        {
          question: mockQuestion,
          userAnswer: 8,
          isCorrect: true,
          pointsAwarded: 0.5,
          answeredAfterExpiry: true,
          timeSpent: 15,
        },
        {
          question: mockQuestion,
          userAnswer: 7,
          isCorrect: false,
          pointsAwarded: 0,
          answeredAfterExpiry: false,
          timeSpent: 3,
        },
      ];

      const totalScore = scoringEngine.calculateTotalScore(results);
      expect(totalScore).toBe(1.5);
    });

    it('should handle all full points', () => {
      const mockQuestion: Question = {
        operandA: 5,
        operandB: 3,
        operation: 'addition',
        correctAnswer: 8,
        questionNumber: 1,
      };

      const results: QuestionResult[] = [
        {
          question: mockQuestion,
          userAnswer: 8,
          isCorrect: true,
          pointsAwarded: 1,
          answeredAfterExpiry: false,
          timeSpent: 5,
        },
        {
          question: mockQuestion,
          userAnswer: 8,
          isCorrect: true,
          pointsAwarded: 1,
          answeredAfterExpiry: false,
          timeSpent: 4,
        },
      ];

      const totalScore = scoringEngine.calculateTotalScore(results);
      expect(totalScore).toBe(2);
    });
  });

  describe('calculatePercentage', () => {
    it('should return 0 when maxPossibleScore is 0', () => {
      const percentage = scoringEngine.calculatePercentage(0, 0);
      expect(percentage).toBe(0);
    });

    it('should calculate percentage correctly for perfect score', () => {
      const percentage = scoringEngine.calculatePercentage(10, 10);
      expect(percentage).toBe(100);
    });

    it('should calculate percentage correctly for partial score', () => {
      const percentage = scoringEngine.calculatePercentage(7.5, 10);
      expect(percentage).toBe(75);
    });

    it('should calculate percentage correctly for zero score', () => {
      const percentage = scoringEngine.calculatePercentage(0, 10);
      expect(percentage).toBe(0);
    });

    it('should calculate percentage correctly with half points', () => {
      const percentage = scoringEngine.calculatePercentage(5.5, 10);
      expect(percentage).toBeCloseTo(55, 2);
    });

    it('should handle decimal results correctly', () => {
      const percentage = scoringEngine.calculatePercentage(2, 3);
      expect(percentage).toBeCloseTo(66.67, 2);
    });
  });
});
