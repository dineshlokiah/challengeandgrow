/**
 * QuestionGenerator - Generates math problems based on configuration
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */

import type { MarathonConfig, Question } from '../types';

export class QuestionGenerator {
  private questionCounter: number = 0;

  /**
   * Generates a random number with the specified digit count
   * @param digitCount - Number of digits (1-4)
   * @returns Random number with exactly digitCount digits
   */
  private generateRandomNumber(digitCount: 1 | 2 | 3 | 4): number {
    const min = digitCount === 1 ? 1 : Math.pow(10, digitCount - 1);
    const max = Math.pow(10, digitCount) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generates a division question ensuring whole number results
   * @param digitCountA - Digit count for operand A
   * @param digitCountB - Digit count for operand B
   * @returns Object with operandA, operandB, and correctAnswer
   */
  private generateDivisionQuestion(
    digitCountA: 1 | 2 | 3 | 4,
    digitCountB: 1 | 2 | 3 | 4
  ): { operandA: number; operandB: number; correctAnswer: number } {
    // Generate operandB first (divisor, cannot be zero)
    let operandB = this.generateRandomNumber(digitCountB);
    
    // Generate a quotient that will result in operandA having the correct digit count
    const minA = digitCountA === 1 ? 1 : Math.pow(10, digitCountA - 1);
    const maxA = Math.pow(10, digitCountA) - 1;
    
    // Calculate quotient range to ensure operandA = operandB * quotient has correct digit count
    const minQuotient = Math.ceil(minA / operandB);
    const maxQuotient = Math.floor(maxA / operandB);
    
    // Ensure we have a valid range
    const quotient = minQuotient <= maxQuotient 
      ? Math.floor(Math.random() * (maxQuotient - minQuotient + 1)) + minQuotient
      : minQuotient;
    
    const operandA = operandB * quotient;
    
    return {
      operandA,
      operandB,
      correctAnswer: quotient
    };
  }

  /**
   * Generates a math question based on the provided configuration
   * @param config - Marathon configuration with subject and digit counts
   * @returns A Question object with operands, operation, answer, and question number
   */
  generateQuestion(config: MarathonConfig): Question {
    this.questionCounter++;
    
    const { subject, digitCountA, digitCountB } = config;
    let operandA: number;
    let operandB: number;
    let correctAnswer: number;

    switch (subject) {
      case 'addition':
        operandA = this.generateRandomNumber(digitCountA);
        operandB = this.generateRandomNumber(digitCountB);
        correctAnswer = operandA + operandB;
        break;

      case 'subtraction':
        operandA = this.generateRandomNumber(digitCountA);
        operandB = this.generateRandomNumber(digitCountB);
        correctAnswer = operandA - operandB;
        break;

      case 'multiplication':
        operandA = this.generateRandomNumber(digitCountA);
        operandB = this.generateRandomNumber(digitCountB);
        correctAnswer = operandA * operandB;
        break;

      case 'division':
        const divisionResult = this.generateDivisionQuestion(digitCountA, digitCountB);
        operandA = divisionResult.operandA;
        operandB = divisionResult.operandB;
        correctAnswer = divisionResult.correctAnswer;
        break;

      default:
        throw new Error(`Unsupported subject: ${subject}`);
    }

    return {
      operandA,
      operandB,
      operation: subject,
      correctAnswer,
      questionNumber: this.questionCounter
    };
  }

  /**
   * Resets the question counter (useful for starting a new marathon)
   */
  reset(): void {
    this.questionCounter = 0;
  }
}
