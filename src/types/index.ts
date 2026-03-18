/**
 * Core type definitions for challengeandgrow
 * Validates: Requirements 11.1, 11.2
 */

/**
 * All supported math subjects
 */
export type Subject =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'greater-than-lesser-than'
  | 'fill-the-missing-number';

/**
 * How the player submits answers
 */
export type AnswerMode = 'multiple-choice' | 'fill-in-the-blank';

/**
 * Marathon configuration parameters selected by the user
 */
export interface MarathonConfig {
  subject: Subject;
  digitCountA: number; // 1–6
  digitCountB: number; // 1–6
  volume: number | 'endless'; // 1–999 or 'endless'
  speedLimit: number; // seconds per question, 5–300 multiples of 5
  answerMode: AnswerMode;
  allowDecimals?: boolean; // default false
}

/**
 * A single math problem with its solution
 */
export interface Question {
  operandA: number;
  operandB: number;
  operation: Subject;
  correctAnswer: number | '>' | '<';
  questionNumber: number; // 1-indexed
  missingPosition?: 'operandA' | 'operandB' | 'result'; // fill-the-missing-number only
  baseOperation?: 'addition' | 'subtraction' | 'multiplication' | 'division'; // fill-the-missing-number underlying op
  choices?: Array<number | '>' | '<'>; // multiple-choice only, length 4 (or 2 for GT/LT)
}

/**
 * The outcome of a single question attempt
 */
export interface QuestionResult {
  question: Question;
  userAnswer: number | string;
  isCorrect: boolean;
  pointsAwarded: number; // 0, 0.5, or 1
  answeredAfterExpiry: boolean;
  timeSpent: number; // seconds from question display to answer submission
}

/**
 * Current state of an active marathon session
 */
export interface MarathonState {
  config: MarathonConfig;
  currentQuestion: Question;
  questionHistory: QuestionResult[];
  isPaused: boolean;
  startTime: number; // Unix timestamp in milliseconds
  currentQuestionStartTime: number; // Unix timestamp in milliseconds
  timerRemainingSeconds: number;
  timerExpired: boolean;
}

/**
 * Aggregated data from a completed marathon session
 */
export interface MarathonResults {
  config: MarathonConfig;
  questionResults: QuestionResult[];
  totalScore: number;
  percentage: number;
  totalTime: number; // seconds from start to completion
  completedAt: Date;
}

/**
 * Timer component state
 */
export interface TimerState {
  remainingTime: number; // seconds
  isExpired: boolean;
  visualState: 'active' | 'expired';
}
