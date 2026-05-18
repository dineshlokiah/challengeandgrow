/**
 * QuestionGenerator - Generates math problems based on configuration
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */

import type { MarathonConfig, Question } from '../types';

export class QuestionGenerator {
  private questionCounter: number = 0;

  private isPrime(n: number): boolean {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
  }

  /**
   * Generates a random number with the specified digit count (1–6)
   * Optionally appends up to 2 decimal places when allowDecimals is true
   */
  private generateRandomNumber(digitCount: number, allowDecimals = false): number {
    const clampedDigits = Math.min(6, Math.max(1, Math.floor(digitCount)));
    const min = clampedDigits === 1 ? 1 : Math.pow(10, clampedDigits - 1);
    const max = Math.pow(10, clampedDigits) - 1;
    const whole = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!allowDecimals) return whole;
    const decimals = Math.floor(Math.random() * 100) / 100;
    return Math.round((whole + decimals) * 100) / 100;
  }

  /**
   * Generates a division question ensuring whole-number (or 2dp) results
   */
  private generateDivisionQuestion(
    digitCountA: number,
    digitCountB: number,
    allowDecimals = false
  ): { operandA: number; operandB: number; correctAnswer: number } {
    if (allowDecimals) {
      let operandB = this.generateRandomNumber(digitCountB, true);
      if (operandB === 0) operandB = 1;
      const operandA = this.generateRandomNumber(digitCountA, true);
      const correctAnswer = Math.round((operandA / operandB) * 100) / 100;
      return { operandA, operandB, correctAnswer };
    }

    let operandB = this.generateRandomNumber(digitCountB);
    const minA = digitCountA === 1 ? 1 : Math.pow(10, digitCountA - 1);
    const maxA = Math.pow(10, digitCountA) - 1;
    const minQuotient = Math.ceil(minA / operandB);
    const maxQuotient = Math.floor(maxA / operandB);
    const quotient = minQuotient <= maxQuotient
      ? Math.floor(Math.random() * (maxQuotient - minQuotient + 1)) + minQuotient
      : minQuotient;
    const operandA = operandB * quotient;
    return { operandA, operandB, correctAnswer: quotient };
  }

  /**
   * Generates 3 plausible distractor values close to the correct answer.
   * Falls back to ±1, ±2, ±3 if random generation stalls.
   */
  private generateDistractors(correct: number): number[] {
    const distractors = new Set<number>();
    const spread = Math.max(3, Math.abs(correct) * 0.2);
    let attempts = 0;

    while (distractors.size < 3 && attempts < 50) {
      attempts++;
      const offset = (Math.floor(Math.random() * 7) - 3) * Math.ceil(spread / 3) || 1;
      const candidate = Math.round((correct + offset) * 100) / 100;
      if (candidate !== correct && !distractors.has(candidate)) {
        distractors.add(candidate);
      }
    }

    // Fallback
    let fb = 1;
    while (distractors.size < 3) {
      const candidate = correct + fb;
      if (!distractors.has(candidate) && candidate !== correct) distractors.add(candidate);
      fb++;
    }

    return Array.from(distractors);
  }

  /**
   * Fisher-Yates shuffle
   */
  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /**
   * Generates a math question based on the provided configuration
   */
  generateQuestion(config: MarathonConfig): Question {
    this.questionCounter++;
    const { subject, digitCountA, digitCountB, allowDecimals = false, answerMode } = config;

    let operandA: number;
    let operandB: number;
    let correctAnswer: number | string;
    let missingPosition: 'operandA' | 'operandB' | 'result' | undefined;
    let fillBaseOperation: 'addition' | 'subtraction' | 'multiplication' | 'division' | undefined;
    let sequence: Array<number | string> | undefined;
    let roundingTarget: 10 | 100 | undefined;

    switch (subject) {
      case 'addition':
        operandA = this.generateRandomNumber(digitCountA, allowDecimals);
        operandB = this.generateRandomNumber(digitCountB, allowDecimals);
        correctAnswer = Math.round((operandA + operandB) * 100) / 100;
        break;

      case 'subtraction': {
        let a = this.generateRandomNumber(digitCountA, allowDecimals);
        let b = this.generateRandomNumber(digitCountB, allowDecimals);
        // Always ensure A >= B so result is never negative
        if (a < b) [a, b] = [b, a];
        operandA = a;
        operandB = b;
        correctAnswer = Math.round((operandA - operandB) * 100) / 100;
        break;
      }

      case 'multiplication':
        operandA = this.generateRandomNumber(digitCountA, allowDecimals);
        operandB = this.generateRandomNumber(digitCountB, allowDecimals);
        correctAnswer = Math.round((operandA * operandB) * 100) / 100;
        break;

      case 'division': {
        const divResult = this.generateDivisionQuestion(digitCountA, digitCountB, allowDecimals);
        operandA = divResult.operandA;
        operandB = divResult.operandB;
        correctAnswer = divResult.correctAnswer;
        break;
      }

      case 'greater-than-lesser-than': {
        do {
          operandA = this.generateRandomNumber(digitCountA, allowDecimals);
          operandB = this.generateRandomNumber(digitCountB, allowDecimals);
        } while (operandA === operandB);
        correctAnswer = operandA > operandB ? '>' : '<';
        break;
      }

      case 'fill-the-missing-number': {
        // Generate a base arithmetic question using one of the allowed operations
        const defaultBaseOps = ['addition', 'subtraction', 'multiplication', 'division'] as const;
        const baseOps = (config.fillOperations && config.fillOperations.length > 0) ? config.fillOperations : defaultBaseOps;
        const baseOp = baseOps[Math.floor(Math.random() * baseOps.length)];

        if (baseOp === 'division') {
          const divResult = this.generateDivisionQuestion(digitCountA, digitCountB, allowDecimals);
          operandA = divResult.operandA;
          operandB = divResult.operandB;
          const result = divResult.correctAnswer;
          const positions: Array<'operandA' | 'operandB' | 'result'> = ['operandA', 'operandB', 'result'];
          missingPosition = positions[Math.floor(Math.random() * positions.length)];
          // Ensure divisor is never zero when it's the missing position
          if (missingPosition === 'operandB' && operandB === 0) missingPosition = 'result';
          correctAnswer = missingPosition === 'operandA' ? operandA
            : missingPosition === 'operandB' ? operandB
            : result;
        } else {
          let a = this.generateRandomNumber(digitCountA, allowDecimals);
          let b = this.generateRandomNumber(digitCountB, allowDecimals);
          if (baseOp === 'subtraction' && a < b) [a, b] = [b, a];
          operandA = a;
          operandB = b;
          const result = baseOp === 'addition'
            ? Math.round((a + b) * 100) / 100
            : baseOp === 'subtraction'
            ? Math.round((a - b) * 100) / 100
            : Math.round((a * b) * 100) / 100;

          const positions: Array<'operandA' | 'operandB' | 'result'> = ['operandA', 'operandB', 'result'];
          missingPosition = positions[Math.floor(Math.random() * positions.length)];
          correctAnswer = missingPosition === 'operandA' ? operandA
            : missingPosition === 'operandB' ? operandB
            : result;
        }

        // Store baseOperation so the display can show the correct arithmetic symbol
        fillBaseOperation = baseOp;
        break;
      }

      case 'counting':
        operandA = Math.floor(Math.random() * 20) + 1;
        operandB = 0;
        correctAnswer = operandA;
        break;

      case 'number-bonds':
        operandB = Math.floor(Math.random() * 20) + 1;
        operandA = Math.floor(Math.random() * operandB);
        correctAnswer = operandB - operandA;
        break;

      case 'skip-counting': {
        const step = [2, 5, 10][Math.floor(Math.random() * 3)];
        const start = Math.floor(Math.random() * 20) + 1;
        const fullSequence = Array.from({ length: 5 }, (_, i) => start + i * step);
        const missingIdx = Math.floor(Math.random() * 4) + 1; // 1-4
        correctAnswer = fullSequence[missingIdx];
        sequence = [...fullSequence];
        sequence[missingIdx] = '?';
        operandA = step;
        operandB = 0;
        break;
      }

      case 'rounding': {
        roundingTarget = Math.random() < 0.5 ? 10 : 100;
        if (roundingTarget === 10) {
          operandA = Math.floor(Math.random() * 99) + 1;
          correctAnswer = Math.round(operandA / 10) * 10;
        } else {
          operandA = Math.floor(Math.random() * 999) + 1;
          correctAnswer = Math.round(operandA / 100) * 100;
        }
        operandB = 0;
        break;
      }

      case 'even-or-odd':
        operandA = Math.floor(Math.random() * 99) + 1;
        operandB = 0;
        correctAnswer = operandA % 2 === 0 ? 'Even' : 'Odd';
        break;

      case 'prime-or-not': {
        const wantsPrime = Math.random() < 0.5;
        let candidate: number;
        do {
          candidate = Math.floor(Math.random() * 49) + 2; // 2-50
        } while (this.isPrime(candidate) !== wantsPrime);
        operandA = candidate;
        operandB = 0;
        correctAnswer = wantsPrime ? 'Prime' : 'Not Prime';
        break;
      }

      default:
        throw new Error(`Unsupported subject: ${subject}`);
    }

    // Build choices for multiple-choice mode
    let choices: Array<number | string> | undefined;
    if (answerMode === 'multiple-choice') {
      if (correctAnswer === '>' || correctAnswer === '<') {
        choices = ['>', '<'];
      } else if (subject === 'even-or-odd') {
        choices = ['Even', 'Odd'];
      } else if (subject === 'prime-or-not') {
        choices = ['Prime', 'Not Prime'];
      } else if (subject === 'counting' || subject === 'number-bonds') {
        const dists = new Set<number>();
        const correctNum = correctAnswer as number;
        const maxVal = 20;
        const minVal = subject === 'counting' ? 1 : 0;
        let offset = 1;
        while(dists.size < 3) {
            if (correctNum - offset >= minVal) dists.add(correctNum - offset);
            if (dists.size === 3) break;
            if (correctNum + offset <= maxVal) dists.add(correctNum + offset);
            offset++;
        }
        choices = this.shuffle([correctNum, ...Array.from(dists)]);
      } else if (subject === 'skip-counting') {
        const dists = new Set<number>();
        const correctNum = correctAnswer as number;
        const step = operandA; // We stored step in operandA
        let offset = 1;
        while(dists.size < 3) {
           if (correctNum - offset * step >= 0) dists.add(correctNum - offset * step);
           if (dists.size === 3) break;
           dists.add(correctNum + offset * step);
           offset++;
        }
        choices = this.shuffle([correctNum, ...Array.from(dists)]);
      } else if (subject === 'rounding') {
         const dists = new Set<number>();
         const correctNum = correctAnswer as number;
         const unit = roundingTarget!;
         let offset = 1;
         while(dists.size < 3) {
            if (correctNum - offset * unit >= 0) dists.add(correctNum - offset * unit);
            if (dists.size === 3) break;
            dists.add(correctNum + offset * unit);
            offset++;
         }
         choices = this.shuffle([correctNum, ...Array.from(dists)]);
      } else {
        const distractors = this.generateDistractors(correctAnswer as number);
        choices = this.shuffle([correctAnswer as number, ...distractors]);
      }
    }

    return {
      operandA,
      operandB,
      operation: subject,
      correctAnswer,
      questionNumber: this.questionCounter,
      ...(missingPosition !== undefined && { missingPosition }),
      ...(fillBaseOperation !== undefined && { baseOperation: fillBaseOperation }),
      ...(sequence !== undefined && { sequence }),
      ...(roundingTarget !== undefined && { roundingTarget }),
      ...(choices !== undefined && { choices }),
    };
  }

  /**
   * Resets the question counter (useful for starting a new marathon)
   */
  reset(): void {
    this.questionCounter = 0;
  }
}
