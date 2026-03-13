/**
 * Unit tests for MarathonStore
 * Validates: Requirements 11.1, 11.2, 11.4, 11.5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { marathonStore } from './MarathonStore';
import { MarathonConfig, MarathonResults, MarathonState } from '../types';

describe('MarathonStore', () => {
  // Reset store before each test
  beforeEach(() => {
    marathonStore.returnToConfiguration();
  });

  describe('Initial State', () => {
    it('should start on configuration screen', () => {
      const state = marathonStore.getState();
      expect(state.currentScreen).toBe('configuration');
      expect(state.marathonConfig).toBeNull();
      expect(state.marathonState).toBeNull();
      expect(state.marathonResults).toBeNull();
    });
  });

  describe('Start Marathon', () => {
    it('should transition to marathon screen with config', () => {
      const config: MarathonConfig = {
        subject: 'addition',
        digitCountA: 2,
        digitCountB: 2,
        volume: 10,
        speedLimit: 30,
      };

      marathonStore.startMarathon(config);

      const state = marathonStore.getState();
      expect(state.currentScreen).toBe('marathon');
      expect(state.marathonConfig).toEqual(config);
      expect(state.marathonState).toBeNull();
      expect(state.marathonResults).toBeNull();
    });

    it('should notify subscribers when starting marathon', () => {
      let notified = false;
      const unsubscribe = marathonStore.subscribe(() => {
        notified = true;
      });

      const config: MarathonConfig = {
        subject: 'multiplication',
        digitCountA: 1,
        digitCountB: 3,
        volume: 20,
        speedLimit: 10,
      };

      marathonStore.startMarathon(config);

      expect(notified).toBe(true);
      unsubscribe();
    });
  });

  describe('Update Marathon State', () => {
    it('should update marathon state during active session', () => {
      const config: MarathonConfig = {
        subject: 'subtraction',
        digitCountA: 3,
        digitCountB: 2,
        volume: 50,
        speedLimit: 60,
      };

      marathonStore.startMarathon(config);

      const marathonState: MarathonState = {
        config,
        currentQuestion: {
          operandA: 123,
          operandB: 45,
          operation: 'subtraction',
          correctAnswer: 78,
          questionNumber: 1,
        },
        questionHistory: [],
        isPaused: false,
        startTime: Date.now(),
        currentQuestionStartTime: Date.now(),
        timerRemainingSeconds: 60,
        timerExpired: false,
      };

      marathonStore.updateMarathonState(marathonState);

      const state = marathonStore.getState();
      expect(state.marathonState).toEqual(marathonState);
    });

    it('should not update state when not in marathon screen', () => {
      const marathonState: MarathonState = {
        config: {
          subject: 'addition',
          digitCountA: 1,
          digitCountB: 1,
          volume: 10,
          speedLimit: 30,
        },
        currentQuestion: {
          operandA: 5,
          operandB: 3,
          operation: 'addition',
          correctAnswer: 8,
          questionNumber: 1,
        },
        questionHistory: [],
        isPaused: false,
        startTime: Date.now(),
        currentQuestionStartTime: Date.now(),
        timerRemainingSeconds: 30,
        timerExpired: false,
      };

      // Try to update state while on configuration screen
      marathonStore.updateMarathonState(marathonState);

      const state = marathonStore.getState();
      expect(state.marathonState).toBeNull();
    });
  });

  describe('Complete Marathon', () => {
    it('should transition to results screen with results', () => {
      const config: MarathonConfig = {
        subject: 'division',
        digitCountA: 2,
        digitCountB: 1,
        volume: 10,
        speedLimit: 30,
      };

      marathonStore.startMarathon(config);

      const results: MarathonResults = {
        config,
        questionResults: [
          {
            question: {
              operandA: 20,
              operandB: 5,
              operation: 'division',
              correctAnswer: 4,
              questionNumber: 1,
            },
            userAnswer: 4,
            isCorrect: true,
            pointsAwarded: 1,
            answeredAfterExpiry: false,
            timeSpent: 15,
          },
        ],
        totalScore: 1,
        percentage: 100,
        totalTime: 15,
        completedAt: new Date(),
      };

      marathonStore.completeMarathon(results);

      const state = marathonStore.getState();
      expect(state.currentScreen).toBe('results');
      expect(state.marathonResults).toEqual(results);
    });

    it('should notify subscribers when completing marathon', () => {
      let notificationCount = 0;
      const unsubscribe = marathonStore.subscribe(() => {
        notificationCount++;
      });

      const config: MarathonConfig = {
        subject: 'addition',
        digitCountA: 1,
        digitCountB: 1,
        volume: 10,
        speedLimit: 10,
      };

      marathonStore.startMarathon(config); // First notification

      const results: MarathonResults = {
        config,
        questionResults: [],
        totalScore: 0,
        percentage: 0,
        totalTime: 0,
        completedAt: new Date(),
      };

      marathonStore.completeMarathon(results); // Second notification

      expect(notificationCount).toBe(2);
      unsubscribe();
    });
  });

  describe('Return to Configuration', () => {
    it('should reset all state and return to configuration screen', () => {
      const config: MarathonConfig = {
        subject: 'multiplication',
        digitCountA: 4,
        digitCountB: 3,
        volume: 'endless',
        speedLimit: 60,
      };

      marathonStore.startMarathon(config);

      const results: MarathonResults = {
        config,
        questionResults: [],
        totalScore: 0,
        percentage: 0,
        totalTime: 0,
        completedAt: new Date(),
      };

      marathonStore.completeMarathon(results);

      // Now return to configuration
      marathonStore.returnToConfiguration();

      const state = marathonStore.getState();
      expect(state.currentScreen).toBe('configuration');
      expect(state.marathonConfig).toBeNull();
      expect(state.marathonState).toBeNull();
      expect(state.marathonResults).toBeNull();
    });
  });

  describe('Subscription Management', () => {
    it('should allow multiple subscribers', () => {
      let listener1Called = false;
      let listener2Called = false;

      const unsubscribe1 = marathonStore.subscribe(() => {
        listener1Called = true;
      });

      const unsubscribe2 = marathonStore.subscribe(() => {
        listener2Called = true;
      });

      const config: MarathonConfig = {
        subject: 'addition',
        digitCountA: 1,
        digitCountB: 1,
        volume: 10,
        speedLimit: 30,
      };

      marathonStore.startMarathon(config);

      expect(listener1Called).toBe(true);
      expect(listener2Called).toBe(true);

      unsubscribe1();
      unsubscribe2();
    });

    it('should stop notifying after unsubscribe', () => {
      let notificationCount = 0;

      const unsubscribe = marathonStore.subscribe(() => {
        notificationCount++;
      });

      const config: MarathonConfig = {
        subject: 'subtraction',
        digitCountA: 2,
        digitCountB: 2,
        volume: 20,
        speedLimit: 30,
      };

      marathonStore.startMarathon(config);
      expect(notificationCount).toBe(1);

      unsubscribe();

      marathonStore.returnToConfiguration();
      expect(notificationCount).toBe(1); // Should not increment
    });
  });

  describe('Getter Methods', () => {
    it('should return current screen', () => {
      expect(marathonStore.getCurrentScreen()).toBe('configuration');

      const config: MarathonConfig = {
        subject: 'addition',
        digitCountA: 1,
        digitCountB: 1,
        volume: 10,
        speedLimit: 30,
      };

      marathonStore.startMarathon(config);
      expect(marathonStore.getCurrentScreen()).toBe('marathon');
    });

    it('should return marathon config', () => {
      expect(marathonStore.getMarathonConfig()).toBeNull();

      const config: MarathonConfig = {
        subject: 'division',
        digitCountA: 3,
        digitCountB: 1,
        volume: 50,
        speedLimit: 60,
      };

      marathonStore.startMarathon(config);
      expect(marathonStore.getMarathonConfig()).toEqual(config);
    });

    it('should return marathon results', () => {
      expect(marathonStore.getMarathonResults()).toBeNull();

      const config: MarathonConfig = {
        subject: 'multiplication',
        digitCountA: 2,
        digitCountB: 2,
        volume: 10,
        speedLimit: 30,
      };

      marathonStore.startMarathon(config);

      const results: MarathonResults = {
        config,
        questionResults: [],
        totalScore: 0,
        percentage: 0,
        totalTime: 0,
        completedAt: new Date(),
      };

      marathonStore.completeMarathon(results);
      expect(marathonStore.getMarathonResults()).toEqual(results);
    });
  });

  describe('Client-Side Only Operation', () => {
    it('should store all data in memory without server communication', () => {
      const config: MarathonConfig = {
        subject: 'addition',
        digitCountA: 2,
        digitCountB: 3,
        volume: 20,
        speedLimit: 30,
      };

      marathonStore.startMarathon(config);

      const state = marathonStore.getState();
      
      // Verify data is accessible in memory
      expect(state.marathonConfig).toBeDefined();
      expect(state.marathonConfig).toEqual(config);
      
      // Verify no localStorage or sessionStorage usage
      expect(localStorage.length).toBe(0);
      expect(sessionStorage.length).toBe(0);
    });
  });
});
