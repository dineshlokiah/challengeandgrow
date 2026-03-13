/**
 * ScoringEngine - Calculates points based on answer correctness and timing
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 8.1, 8.2
 */

import { QuestionResult } from '../types';

/**
 * Point constants for scoring
 */
const FULL_POINTS = 1;
const HALF_POINTS = 0.5;
const NO_POINTS = 0;

export class ScoringEngine {
  /**
   * Calculate points for a single answer based on correctness and timing
   * @param isCorrect - Whether the answer is correct
   * @param isTimeExpired - Whether the answer was submitted after timer expiration
   * @returns Points awarded: 1 for correct before expiry, 0.5 for correct after expiry, 0 for incorrect
   * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5
   */
  scoreAnswer(isCorrect: boolean, isTimeExpired: boolean): number {
    if (!isCorrect) {
      return NO_POINTS;
    }
    
    if (isTimeExpired) {
      return HALF_POINTS;
    }
    
    return FULL_POINTS;
  }

  /**
   * Calculate total score by summing all question scores
   * @param results - Array of question results
   * @returns Sum of all pointsAwarded values
   * Validates: Requirements 8.1
   */
  calculateTotalScore(results: QuestionResult[]): number {
    return results.reduce((total, result) => total + result.pointsAwarded, 0);
  }

  /**
   * Calculate percentage score
   * @param totalScore - The total score achieved
   * @param maxPossibleScore - The maximum possible score (number of questions)
   * @returns Percentage as (totalScore / maxPossible) * 100
   * Validates: Requirements 8.2
   */
  calculatePercentage(totalScore: number, maxPossibleScore: number): number {
    if (maxPossibleScore === 0) {
      return 0;
    }
    
    return (totalScore / maxPossibleScore) * 100;
  }
}
