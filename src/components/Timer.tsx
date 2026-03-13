import React, { useEffect, useState, useRef } from 'react';

/**
 * Timer Component
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 4.2, 4.5
 * 
 * Displays a visual countdown timer for each question with the following features:
 * - Initializes to speedLimit value
 * - Updates at 1-second intervals
 * - Changes color to amber (#E74C3C) when timer reaches zero
 * - Maintains answerable state when timer expires
 * - Supports pause/resume functionality that preserves timer state
 */

interface TimerProps {
  speedLimit: number; // seconds
  onTimeExpired: () => void;
  isPaused: boolean;
}

export const Timer: React.FC<TimerProps> = ({ speedLimit, onTimeExpired, isPaused }) => {
  const [remainingTime, setRemainingTime] = useState<number>(speedLimit);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);
  const hasCalledOnTimeExpired = useRef<boolean>(false);

  // Initialize timer to speedLimit when speedLimit changes (new question)
  useEffect(() => {
    setRemainingTime(speedLimit);
    setIsExpired(false);
    hasCalledOnTimeExpired.current = false;
  }, [speedLimit]);

  // Handle countdown logic
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Don't start countdown if paused or already expired
    if (isPaused || isExpired) {
      return;
    }

    // Start countdown interval
    intervalRef.current = window.setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          // Timer reached zero
          setIsExpired(true);
          if (!hasCalledOnTimeExpired.current) {
            hasCalledOnTimeExpired.current = true;
            onTimeExpired();
          }
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, isExpired, onTimeExpired]);

  // Calculate progress percentage for visual display
  const progressPercentage = (remainingTime / speedLimit) * 100;

  // Determine color based on timer state
  const timerColor = isExpired ? '#E74C3C' : '#2ECC71'; // amber when expired, mint green otherwise

  return (
    <div className="timer-container" style={{ width: '100%', marginBottom: '16px' }}>
      {/* Progress bar visual indicator */}
      <div
        className="timer-progress-bar"
        style={{
          width: '100%',
          height: '24px',
          backgroundColor: '#2C3E50',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          className="timer-progress-fill"
          style={{
            width: `${progressPercentage}%`,
            height: '100%',
            backgroundColor: timerColor,
            transition: 'width 1s linear, background-color 0.3s ease',
          }}
        />
        {/* Time display overlay */}
        <div
          className="timer-text"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: '14px',
            fontFamily: 'monospace',
          }}
        >
          {`${remainingTime}s`}
        </div>
      </div>
    </div>
  );
};
