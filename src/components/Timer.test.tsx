import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Timer } from './Timer';

/**
 * Unit tests for Timer component
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 4.2, 4.5
 */

describe('Timer Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Timer Initialization', () => {
    it('should initialize timer to speedLimit value', () => {
      const onTimeExpired = vi.fn();
      render(<Timer speedLimit={30} onTimeExpired={onTimeExpired} isPaused={false} />);
      
      expect(screen.getByText('30s')).toBeInTheDocument();
    });

    it('should initialize timer with different speedLimit values', () => {
      const onTimeExpired = vi.fn();
      const { rerender } = render(<Timer speedLimit={10} onTimeExpired={onTimeExpired} isPaused={false} />);
      
      expect(screen.getByText('10s')).toBeInTheDocument();
      
      rerender(<Timer speedLimit={60} onTimeExpired={onTimeExpired} isPaused={false} />);
      expect(screen.getByText('60s')).toBeInTheDocument();
    });
  });

  describe('Countdown Logic', () => {
    it('should countdown at 1-second intervals', () => {
      const onTimeExpired = vi.fn();
      render(<Timer speedLimit={5} onTimeExpired={onTimeExpired} isPaused={false} />);
      
      expect(screen.getByText('5s')).toBeInTheDocument();
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('4s')).toBeInTheDocument();
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('3s')).toBeInTheDocument();
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('2s')).toBeInTheDocument();
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('1s')).toBeInTheDocument();
    });

    it('should stop at zero and call onTimeExpired', () => {
      const onTimeExpired = vi.fn();
      render(<Timer speedLimit={3} onTimeExpired={onTimeExpired} isPaused={false} />);
      
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      
      expect(screen.getByText('0s')).toBeInTheDocument();
      expect(onTimeExpired).toHaveBeenCalledTimes(1);
    });

    it('should not go below zero', () => {
      const onTimeExpired = vi.fn();
      render(<Timer speedLimit={2} onTimeExpired={onTimeExpired} isPaused={false} />);
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      expect(screen.getByText('0s')).toBeInTheDocument();
      expect(onTimeExpired).toHaveBeenCalledTimes(1);
    });
  });

  describe('Visual Display', () => {
    it('should render progress bar', () => {
      const onTimeExpired = vi.fn();
      const { container } = render(<Timer speedLimit={30} onTimeExpired={onTimeExpired} isPaused={false} />);
      
      const progressBar = container.querySelector('.timer-progress-bar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should update progress bar width as time decreases', () => {
      const onTimeExpired = vi.fn();
      const { container } = render(<Timer speedLimit={10} onTimeExpired={onTimeExpired} isPaused={false} />);
      
      const progressFill = container.querySelector('.timer-progress-fill') as HTMLElement;
      expect(progressFill).toBeInTheDocument();
      
      // Initial state: 100% width
      expect(progressFill.style.width).toBe('100%');
      
      // After 5 seconds: 50% width
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(progressFill.style.width).toBe('50%');
      
      // After 9 seconds total: 10% width
      act(() => {
        vi.advanceTimersByTime(4000);
      });
      expect(progressFill.style.width).toBe('10%');
    });
  });

  describe('Color Change on Expiration', () => {
    it('should use mint green color when timer is active', () => {
      const onTimeExpired = vi.fn();
      const { container } = render(<Timer speedLimit={30} onTimeExpired={onTimeExpired} isPaused={false} />);
      
      const progressFill = container.querySelector('.timer-progress-fill') as HTMLElement;
      expect(progressFill.style.backgroundColor).toBe('rgb(46, 204, 113)'); // #2ECC71
    });

    it('should change color to amber when timer reaches zero', () => {
      const onTimeExpired = vi.fn();
      const { container } = render(<Timer speedLimit={2} onTimeExpired={onTimeExpired} isPaused={false} />);
      
      const progressFill = container.querySelector('.timer-progress-fill') as HTMLElement;
      
      // Before expiration
      expect(progressFill.style.backgroundColor).toBe('rgb(46, 204, 113)'); // #2ECC71
      
      // After expiration
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(progressFill.style.backgroundColor).toBe('rgb(231, 76, 60)'); // #E74C3C
    });
  });

  describe('Pause/Resume Functionality', () => {
    it('should freeze countdown when isPaused is true', () => {
      const onTimeExpired = vi.fn();
      const { rerender } = render(<Timer speedLimit={10} onTimeExpired={onTimeExpired} isPaused={false} />);
      
      // Countdown for 3 seconds
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(screen.getByText('7s')).toBeInTheDocument();
      
      // Pause the timer
      rerender(<Timer speedLimit={10} onTimeExpired={onTimeExpired} isPaused={true} />);
      
      // Advance time while paused
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      // Timer should still show 7s
      expect(screen.getByText('7s')).toBeInTheDocument();
    });

    it('should preserve timer state when paused', () => {
      const onTimeExpired = vi.fn();
      const { rerender } = render(<Timer speedLimit={30} onTimeExpired={onTimeExpired} isPaused={false} />);
      
      // Countdown for 12 seconds
      act(() => {
        vi.advanceTimersByTime(12000);
      });
      expect(screen.getByText('18s')).toBeInTheDocument();
      
      // Pause
      rerender(<Timer speedLimit={30} onTimeExpired={onTimeExpired} isPaused={true} />);
      
      // Wait while paused
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(screen.getByText('18s')).toBeInTheDocument();
      
      // Resume
      rerender(<Timer speedLimit={30} onTimeExpired={onTimeExpired} isPaused={false} />);
      
      // Should continue from 18s
      expect(screen.getByText('18s')).toBeInTheDocument();
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('17s')).toBeInTheDocument();
    });

    it('should handle multiple pause/resume cycles', () => {
      const onTimeExpired = vi.fn();
      const { rerender } = render(<Timer speedLimit={20} onTimeExpired={onTimeExpired} isPaused={false} />);
      
      // First countdown
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(screen.getByText('15s')).toBeInTheDocument();
      
      // First pause
      rerender(<Timer speedLimit={20} onTimeExpired={onTimeExpired} isPaused={true} />);
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(screen.getByText('15s')).toBeInTheDocument();
      
      // First resume
      rerender(<Timer speedLimit={20} onTimeExpired={onTimeExpired} isPaused={false} />);
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.getByText('13s')).toBeInTheDocument();
      
      // Second pause
      rerender(<Timer speedLimit={20} onTimeExpired={onTimeExpired} isPaused={true} />);
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(screen.getByText('13s')).toBeInTheDocument();
      
      // Second resume
      rerender(<Timer speedLimit={20} onTimeExpired={onTimeExpired} isPaused={false} />);
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(screen.getByText('10s')).toBeInTheDocument();
    });

    it('should allow pause even after timer expires', () => {
      const onTimeExpired = vi.fn();
      const { rerender } = render(<Timer speedLimit={2} onTimeExpired={onTimeExpired} isPaused={false} />);
      
      // Let timer expire
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.getByText('0s')).toBeInTheDocument();
      
      // Pause after expiration
      rerender(<Timer speedLimit={2} onTimeExpired={onTimeExpired} isPaused={true} />);
      
      // Should still show 0s
      expect(screen.getByText('0s')).toBeInTheDocument();
    });
  });

  describe('Answerable State After Expiration', () => {
    it('should maintain display after timer expires', () => {
      const onTimeExpired = vi.fn();
      render(<Timer speedLimit={3} onTimeExpired={onTimeExpired} isPaused={false} />);
      
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      
      // Timer should still be visible at 0s
      expect(screen.getByText('0s')).toBeInTheDocument();
      
      // Progress bar should still be rendered
      const progressBar = document.querySelector('.timer-progress-bar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should not call onTimeExpired multiple times', () => {
      const onTimeExpired = vi.fn();
      render(<Timer speedLimit={2} onTimeExpired={onTimeExpired} isPaused={false} />);
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      expect(onTimeExpired).toHaveBeenCalledTimes(1);
    });
  });

  describe('Timer Reset on New Question', () => {
    it('should reset timer when speedLimit changes', () => {
      const onTimeExpired = vi.fn();
      const { rerender } = render(<Timer speedLimit={30} onTimeExpired={onTimeExpired} isPaused={false} />);
      
      // Countdown for 10 seconds
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(screen.getByText('20s')).toBeInTheDocument();
      
      // New question with different speedLimit
      rerender(<Timer speedLimit={60} onTimeExpired={onTimeExpired} isPaused={false} />);
      
      // Should reset to new speedLimit
      expect(screen.getByText('60s')).toBeInTheDocument();
    });

    it('should reset expired state when speedLimit changes', () => {
      const onTimeExpired = vi.fn();
      const { rerender, container } = render(<Timer speedLimit={2} onTimeExpired={onTimeExpired} isPaused={false} />);
      
      // Let timer expire
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.getByText('0s')).toBeInTheDocument();
      
      const progressFill = container.querySelector('.timer-progress-fill') as HTMLElement;
      expect(progressFill.style.backgroundColor).toBe('rgb(231, 76, 60)'); // amber
      
      // New question
      rerender(<Timer speedLimit={30} onTimeExpired={onTimeExpired} isPaused={false} />);
      
      // Should reset to active state with mint green color
      expect(screen.getByText('30s')).toBeInTheDocument();
      expect(progressFill.style.backgroundColor).toBe('rgb(46, 204, 113)'); // mint green
    });
  });
});
