/**
 * In-memory state store for marathon data
 * Validates: Requirements 11.1, 11.2, 11.4, 11.5
 */

import { MarathonConfig, MarathonResults, MarathonState, SavedSession } from '../types';

type AppScreen = 'configuration' | 'marathon' | 'results';

interface AppState {
  currentScreen: AppScreen;
  marathonConfig: MarathonConfig | null;
  marathonState: MarathonState | null;
  marathonResults: MarathonResults | null;
  savedSession: SavedSession | null;
}

/**
 * Client-side only state management
 * All data stored in browser memory during active sessions
 */
class MarathonStore {
  private state: AppState = {
    currentScreen: 'configuration',
    marathonConfig: null,
    marathonState: null,
    marathonResults: null,
    savedSession: null,
  };

  private listeners: Set<() => void> = new Set();

  /**
   * Subscribe to state changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state change
   */
  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Get current application state
   */
  getState(): Readonly<AppState> {
    return { ...this.state };
  }

  /**
   * Start a new marathon with the given configuration
   */
  startMarathon(config: MarathonConfig): void {
    this.state = {
      currentScreen: 'marathon',
      marathonConfig: config,
      marathonState: null, // Will be initialized by MarathonInterface
      marathonResults: null,
      savedSession: null,
    };
    this.notify();
  }

  /**
   * Update marathon state during active session
   */
  updateMarathonState(state: MarathonState): void {
    if (this.state.currentScreen !== 'marathon') {
      console.warn('Cannot update marathon state when not in marathon screen');
      return;
    }
    this.state.marathonState = state;
    this.notify();
  }

  /**
   * Complete marathon and navigate to results
   */
  completeMarathon(results: MarathonResults): void {
    this.state = {
      ...this.state,
      currentScreen: 'results',
      marathonResults: results,
      savedSession: null,
    };
    this.notify();
  }

  /**
   * Return to configuration screen (reset state)
   */
  returnToConfiguration(): void {
    this.state = {
      currentScreen: 'configuration',
      marathonConfig: null,
      marathonState: null,
      marathonResults: null,
      savedSession: null,
    };
    this.notify();
  }

  /**
   * Get current screen
   */
  getCurrentScreen(): AppScreen {
    return this.state.currentScreen;
  }

  /**
   * Get marathon configuration
   */
  getMarathonConfig(): MarathonConfig | null {
    return this.state.marathonConfig;
  }

  /**
   * Get marathon results
   */
  getMarathonResults(): MarathonResults | null {
    return this.state.marathonResults;
  }

  /**
   * Resume marathon from a saved session
   */
  resumeMarathon(session: SavedSession): void {
    this.state = {
      currentScreen: 'marathon',
      marathonConfig: session.config,
      marathonState: null,
      marathonResults: null,
      savedSession: session,
    };
    this.notify();
  }

  /**
   * Get saved session
   */
  getSavedSession(): SavedSession | null {
    return this.state.savedSession;
  }
}

// Singleton instance for client-side state management
export const marathonStore = new MarathonStore();
