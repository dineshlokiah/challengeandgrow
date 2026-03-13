/**
 * Unit tests for QuestionGenerator
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { QuestionGenerator } from './QuestionGenerator';
import type { MarathonConfig } from '../types';

describe('QuestionGenerator', () => {
  let generator: QuestionGenerator;

  beforeEach(() => {
    generator = new QuestionGenerator();
  });

  describe('Addition questions', () => {
    it('should generate addition questions with correct digit counts', () => {
      const config: MarathonConfig = {
        subject: 'addition',
        digitCountA: 2,
        digitCountB: 3,
        volume: 10,
        speedLimit: 30
      };

      const question = generator.generateQuestion(config);

      expect(question.operation).toBe('addition');
      expect(question.operandA).toBeGreaterThanOrEqual(10);
      expect(question.operandA).toBeLessThanOrEqual(99);
      expect(question.operandB).toBeGreaterThanOrEqual(100);
      expect(question.operandB).toBeLessThanOrEqual(999);
      expect(question.correctAnswer).toBe(question.operandA + question.operandB);
      expect(question.questionNumber).toBe(1);
    });

    it('should generate correct answer for addition', () => {
      const config: MarathonConfig = {
        subject: 'addition',
        digitCountA: 1,
        digitCountB: 1,
        volume: 10,
        speedLimit: 30
      };

      const question = generator.generateQuestion(config);
      expect(question.correctAnswer).toBe(question.operandA + question.operandB);
    });
  });

  describe('Subtraction questions', () => {
    it('should generate subtraction questions with correct digit counts', () => {
      const config: MarathonConfig = {
        subject: 'subtraction',
        digitCountA: 3,
        digitCountB: 2,
        volume: 10,
        speedLimit: 30
      };

      const question = generator.generateQuestion(config);

      expect(question.operation).toBe('subtraction');
      expect(question.operandA).toBeGreaterThanOrEqual(100);
      expect(question.operandA).toBeLessThanOrEqual(999);
      expect(question.operandB).toBeGreaterThanOrEqual(10);
      expect(question.operandB).toBeLessThanOrEqual(99);
      expect(question.correctAnswer).toBe(question.operandA - question.operandB);
    });

    it('should generate correct answer for subtraction', () => {
      const config: MarathonConfig = {
        subject: 'subtraction',
        digitCountA: 2,
        digitCountB: 1,
        volume: 10,
        speedLimit: 30
      };

      const question = generator.generateQuestion(config);
      expect(question.correctAnswer).toBe(question.operandA - question.operandB);
    });
  });

  describe('Multiplication questions', () => {
    it('should generate multiplication questions with correct digit counts', () => {
      const config: MarathonConfig = {
        subject: 'multiplication',
        digitCountA: 1,
        digitCountB: 2,
        volume: 10,
        speedLimit: 30
      };

      const question = generator.generateQuestion(config);

      expect(question.operation).toBe('multiplication');
      expect(question.operandA).toBeGreaterThanOrEqual(1);
      expect(question.operandA).toBeLessThanOrEqual(9);
      expect(question.operandB).toBeGreaterThanOrEqual(10);
      expect(question.operandB).toBeLessThanOrEqual(99);
      expect(question.correctAnswer).toBe(question.operandA * question.operandB);
    });

    it('should generate correct answer for multiplication', () => {
      const config: MarathonConfig = {
        subject: 'multiplication',
        digitCountA: 2,
        digitCountB: 2,
        volume: 10,
        speedLimit: 30
      };

      const question = generator.generateQuestion(config);
      expect(question.correctAnswer).toBe(question.operandA * question.operandB);
    });
  });

  describe('Division questions', () => {
    it('should generate division questions with correct digit counts', () => {
      const config: MarathonConfig = {
        subject: 'division',
        digitCountA: 2,
        digitCountB: 1,
        volume: 10,
        speedLimit: 30
      };

      const question = generator.generateQuestion(config);

      expect(question.operation).toBe('division');
      expect(question.operandA).toBeGreaterThanOrEqual(10);
      expect(question.operandA).toBeLessThanOrEqual(99);
      expect(question.operandB).toBeGreaterThanOrEqual(1);
      expect(question.operandB).toBeLessThanOrEqual(9);
    });

    it('should ensure division results in whole numbers', () => {
      const config: MarathonConfig = {
        subject: 'division',
        digitCountA: 3,
        digitCountB: 2,
        volume: 10,
        speedLimit: 30
      };

      // Test multiple questions to ensure consistency
      for (let i = 0; i < 20; i++) {
        const question = generator.generateQuestion(config);
        
        // Verify operandA is evenly divisible by operandB
        expect(question.operandA % question.operandB).toBe(0);
        
        // Verify correct answer is a whole number
        expect(Number.isInteger(question.correctAnswer)).toBe(true);
        
        // Verify correct answer calculation
        expect(question.correctAnswer).toBe(question.operandA / question.operandB);
      }
    });

    it('should generate correct answer for division', () => {
      const config: MarathonConfig = {
        subject: 'division',
        digitCountA: 2,
        digitCountB: 1,
        volume: 10,
        speedLimit: 30
      };

      const question = generator.generateQuestion(config);
      expect(question.correctAnswer).toBe(question.operandA / question.operandB);
      expect(question.operandA % question.operandB).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle 1-digit operands', () => {
      const config: MarathonConfig = {
        subject: 'addition',
        digitCountA: 1,
        digitCountB: 1,
        volume: 10,
        speedLimit: 30
      };

      const question = generator.generateQuestion(config);

      expect(question.operandA).toBeGreaterThanOrEqual(1);
      expect(question.operandA).toBeLessThanOrEqual(9);
      expect(question.operandB).toBeGreaterThanOrEqual(1);
      expect(question.operandB).toBeLessThanOrEqual(9);
    });

    it('should handle 4-digit operands', () => {
      const config: MarathonConfig = {
        subject: 'multiplication',
        digitCountA: 4,
        digitCountB: 4,
        volume: 10,
        speedLimit: 30
      };

      const question = generator.generateQuestion(config);

      expect(question.operandA).toBeGreaterThanOrEqual(1000);
      expect(question.operandA).toBeLessThanOrEqual(9999);
      expect(question.operandB).toBeGreaterThanOrEqual(1000);
      expect(question.operandB).toBeLessThanOrEqual(9999);
    });
  });

  describe('Question numbering', () => {
    it('should increment question numbers sequentially', () => {
      const config: MarathonConfig = {
        subject: 'addition',
        digitCountA: 2,
        digitCountB: 2,
        volume: 10,
        speedLimit: 30
      };

      const question1 = generator.generateQuestion(config);
      const question2 = generator.generateQuestion(config);
      const question3 = generator.generateQuestion(config);

      expect(question1.questionNumber).toBe(1);
      expect(question2.questionNumber).toBe(2);
      expect(question3.questionNumber).toBe(3);
    });

    it('should reset question counter', () => {
      const config: MarathonConfig = {
        subject: 'addition',
        digitCountA: 2,
        digitCountB: 2,
        volume: 10,
        speedLimit: 30
      };

      generator.generateQuestion(config);
      generator.generateQuestion(config);
      
      generator.reset();
      
      const question = generator.generateQuestion(config);
      expect(question.questionNumber).toBe(1);
    });
  });
});
