/**
 * Integration tests for complete application flow
 * Validates: Requirements 11.1, 11.2, 11.4, 11.5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { marathonStore } from '../store/MarathonStore';
import { MarathonConfig, MarathonResults } from '../types';

describe('Application Flow Integration', () => {
  beforeEach(() => {
    marathonStore.returnToConfiguration();
  });

  it('should handle complete marathon flow from configuration to results', () => {
    // Step 1: Start at configuration screen
    expect(marathonStore.getCurrentScreen()).toBe('configuration');
    expect(marathonStore.getMarathonConfig()).toBeNull();

    // Step 2: Configure and start marathon
    const config: MarathonConfig = {
      subject: 'addition',
      digitCountA: 2,
      digitCountB: 3,
      volume: 10,
      speedLimit: 30,
    };

    marathonStore.startMarathon(config);

    // Verify transition to marathon screen
    expect(marathonStore.getCurrentScreen()).toBe('marathon');
    expect(marathonStore.getMarathonConfig()).toEqual(config);

    // Step 3: Complete marathon with results
    const results: MarathonResults = {
      config,
      questionResults: [
        {
          question: {
            operandA: 45,
            operandB: 123,
            operation: 'addition',
            correctAnswer: 168,
            questionNumber: 1,
          },
          userAnswer: 168,
          isCorrect: true,
          pointsAwarded: 1,
          answeredAfterExpiry: false,
          timeSpent: 15,
        },
        {
          question: {
            operandA: 78,
            operandB: 456,
            operation: 'addition',
            correctAnswer: 534,
            questionNumber: 2,
          },
          userAnswer: 534,
          isCorrect: true,
          pointsAwarded: 0.5,
          answeredAfterExpiry: true,
          timeSpent: 35,
        },
      ],
      totalScore: 1.5,
      percentage: 75,
      totalTime: 50,
      completedAt: new Date(),
    };

    marathonStore.completeMarathon(results);

    // Verify transition to results screen
    expect(marathonStore.getCurrentScreen()).toBe('results');
    expect(marathonStore.getMarathonResults()).toEqual(results);

    // Step 4: Return to configuration
    marathonStore.returnToConfiguration();

    // Verify state is reset
    expect(marathonStore.getCurrentScreen()).toBe('configuration');
    expect(marathonStore.getMarathonConfig()).toBeNull();
    expect(marathonStore.getMarathonResults()).toBeNull();
  });

  it('should maintain data integrity throughout the flow', () => {
    const config: MarathonConfig = {
      subject: 'multiplication',
      digitCountA: 3,
      digitCountB: 2,
      volume: 20,
      speedLimit: 60,
    };

    marathonStore.startMarathon(config);

    // Verify config is preserved
    const retrievedConfig = marathonStore.getMarathonConfig();
    expect(retrievedConfig).toEqual(config);
    expect(retrievedConfig?.subject).toBe('multiplication');
    expect(retrievedConfig?.digitCountA).toBe(3);
    expect(retrievedConfig?.digitCountB).toBe(2);
    expect(retrievedConfig?.volume).toBe(20);
    expect(retrievedConfig?.speedLimit).toBe(60);

    const results: MarathonResults = {
      config,
      questionResults: [],
      totalScore: 0,
      percentage: 0,
      totalTime: 0,
      completedAt: new Date(),
    };

    marathonStore.completeMarathon(results);

    // Verify results contain original config
    const retrievedResults = marathonStore.getMarathonResults();
    expect(retrievedResults?.config).toEqual(config);
  });

  it('should support endless mode configuration', () => {
    const config: MarathonConfig = {
      subject: 'division',
      digitCountA: 4,
      digitCountB: 2,
      volume: 'endless',
      speedLimit: 10,
    };

    marathonStore.startMarathon(config);

    expect(marathonStore.getMarathonConfig()?.volume).toBe('endless');
  });

  it('should handle all subject types', () => {
    const subjects: Array<'addition' | 'subtraction' | 'multiplication' | 'division'> = [
      'addition',
      'subtraction',
      'multiplication',
      'division',
    ];

    subjects.forEach((subject) => {
      marathonStore.returnToConfiguration();

      const config: MarathonConfig = {
        subject,
        digitCountA: 2,
        digitCountB: 2,
        volume: 10,
        speedLimit: 30,
      };

      marathonStore.startMarathon(config);

      expect(marathonStore.getMarathonConfig()?.subject).toBe(subject);
    });
  });

  it('should handle all volume options', () => {
    const volumes: Array<10 | 20 | 50 | 'endless'> = [10, 20, 50, 'endless'];

    volumes.forEach((volume) => {
      marathonStore.returnToConfiguration();

      const config: MarathonConfig = {
        subject: 'addition',
        digitCountA: 1,
        digitCountB: 1,
        volume,
        speedLimit: 30,
      };

      marathonStore.startMarathon(config);

      expect(marathonStore.getMarathonConfig()?.volume).toBe(volume);
    });
  });

  it('should handle all speed limit options', () => {
    const speedLimits: Array<10 | 30 | 60> = [10, 30, 60];

    speedLimits.forEach((speedLimit) => {
      marathonStore.returnToConfiguration();

      const config: MarathonConfig = {
        subject: 'addition',
        digitCountA: 1,
        digitCountB: 1,
        volume: 10,
        speedLimit,
      };

      marathonStore.startMarathon(config);

      expect(marathonStore.getMarathonConfig()?.speedLimit).toBe(speedLimit);
    });
  });

  it('should operate entirely client-side without external storage', () => {
    const config: MarathonConfig = {
      subject: 'subtraction',
      digitCountA: 3,
      digitCountB: 2,
      volume: 50,
      speedLimit: 30,
    };

    marathonStore.startMarathon(config);

    // Verify no localStorage usage
    expect(localStorage.length).toBe(0);

    // Verify no sessionStorage usage
    expect(sessionStorage.length).toBe(0);

    // Verify data is in memory
    expect(marathonStore.getMarathonConfig()).toBeDefined();
  });
});
