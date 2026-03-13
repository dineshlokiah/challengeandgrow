import React, { useState, useEffect, useRef } from 'react';
import { Timer } from './Timer';
import { QuestionGenerator } from '../utils/QuestionGenerator';
import { ScoringEngine } from '../utils/ScoringEngine';
import type { MarathonConfig, Question, QuestionResult, MarathonResults } from '../types';

/**
 * MarathonInterface Component
 * Validates: Requirements 2.5, 2.6, 5.6, 7.1, 7.2, 7.3, 7.4, 9.2, 10.7
 * 
 * Orchestrates the active quiz experience:
 * - Displays questions with large mono-spaced fonts for numbers
 * - Integrates Timer component with current speed limit
 * - Handles numeric input for answers
 * - Validates and scores answers
 * - Advances questions after submission
 * - Tracks progress (progress bar for numeric volume, counter for endless)
 * - Stores question history with results
 * - Tracks marathon start time and question start times
 */

interface MarathonInterfaceProps {
  config: MarathonConfig;
  onComplete: (results: MarathonResults) => void;
}

export const MarathonInterface: React.FC<MarathonInterfaceProps> = ({ config, onComplete }) => {
  const questionGeneratorRef = useRef(new QuestionGenerator());
  const scoringEngineRef = useRef(new ScoringEngine());
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionHistory, setQuestionHistory] = useState<QuestionResult[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  
  const startTimeRef = useRef<number>(Date.now());
  const currentQuestionStartTimeRef = useRef<number>(Date.now());
  const timerKeyRef = useRef<number>(0);

  // Initialize first question
  useEffect(() => {
    questionGeneratorRef.current.reset();
    const firstQuestion = questionGeneratorRef.current.generateQuestion(config);
    setCurrentQuestion(firstQuestion);
    startTimeRef.current = Date.now();
    currentQuestionStartTimeRef.current = Date.now();
  }, [config]);

  // Handle timer expiration
  const handleTimeExpired = () => {
    setTimerExpired(true);
  };

  // Handle pause button click
  const handlePause = () => {
    setIsPaused(true);
  };

  // Handle resume button click
  const handleResume = () => {
    setIsPaused(false);
  };

  // Handle answer submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentQuestion || userAnswer.trim() === '') {
      return;
    }

    const numericAnswer = parseFloat(userAnswer);
    
    // Validate numeric input
    if (isNaN(numericAnswer)) {
      setFeedback('incorrect');
      setUserAnswer('');
      // Trigger haptic feedback for incorrect answer (where supported)
      if ('vibrate' in navigator) {
        navigator.vibrate(200); // 200ms vibration
      }
      setTimeout(() => setFeedback(null), 1000);
      return;
    }

    const isCorrect = numericAnswer === currentQuestion.correctAnswer;
    const timeSpent = (Date.now() - currentQuestionStartTimeRef.current) / 1000;
    const pointsAwarded = scoringEngineRef.current.scoreAnswer(isCorrect, timerExpired);
    
    // Trigger haptic feedback for incorrect answer (where supported)
    if (!isCorrect && 'vibrate' in navigator) {
      navigator.vibrate(200); // 200ms vibration
    }

    // Create question result
    const result: QuestionResult = {
      question: currentQuestion,
      userAnswer: numericAnswer,
      isCorrect,
      pointsAwarded,
      answeredAfterExpiry: timerExpired,
      timeSpent
    };

    // Update question history
    const updatedHistory = [...questionHistory, result];
    setQuestionHistory(updatedHistory);

    // Show feedback
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    
    // Clear input
    setUserAnswer('');

    // Check if marathon is complete
    const isComplete = config.volume !== 'endless' && updatedHistory.length >= config.volume;
    
    if (isComplete) {
      // Marathon complete - generate results
      setTimeout(() => {
        const totalScore = scoringEngineRef.current.calculateTotalScore(updatedHistory);
        const percentage = scoringEngineRef.current.calculatePercentage(totalScore, updatedHistory.length);
        const totalTime = (Date.now() - startTimeRef.current) / 1000;

        const results: MarathonResults = {
          config,
          questionResults: updatedHistory,
          totalScore,
          percentage,
          totalTime,
          completedAt: new Date()
        };

        onComplete(results);
      }, 1000);
    } else {
      // Advance to next question
      setTimeout(() => {
        setFeedback(null);
        setTimerExpired(false);
        timerKeyRef.current += 1;
        const nextQuestion = questionGeneratorRef.current.generateQuestion(config);
        setCurrentQuestion(nextQuestion);
        currentQuestionStartTimeRef.current = Date.now();
      }, 1000);
    }
  };

  // Handle end marathon for endless mode
  const handleEndMarathon = () => {
    const totalScore = scoringEngineRef.current.calculateTotalScore(questionHistory);
    const percentage = scoringEngineRef.current.calculatePercentage(totalScore, questionHistory.length);
    const totalTime = (Date.now() - startTimeRef.current) / 1000;

    const results: MarathonResults = {
      config,
      questionResults: questionHistory,
      totalScore,
      percentage,
      totalTime,
      completedAt: new Date()
    };

    onComplete(results);
  };

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  // Calculate progress
  const progressPercentage = config.volume !== 'endless' 
    ? (questionHistory.length / config.volume) * 100 
    : 0;

  // Get operation symbol
  const getOperationSymbol = (operation: string) => {
    switch (operation) {
      case 'addition': return '+';
      case 'subtraction': return '-';
      case 'multiplication': return '×';
      case 'division': return '÷';
      default: return '';
    }
  };

  return (
    <div 
      className="marathon-interface"
      style={{
        minHeight: '100vh',
        backgroundColor: '#2C3E50',
        color: '#FFFFFF',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'Quicksand, sans-serif'
      }}
    >
      {/* Progress indicator */}
      <div style={{ width: '100%', maxWidth: '600px', marginBottom: '24px' }}>
        {config.volume !== 'endless' ? (
          <div>
            <div style={{ 
              fontSize: '14px', 
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              Question {questionHistory.length + 1} of {config.volume}
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#34495E',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progressPercentage}%`,
                height: '100%',
                backgroundColor: '#FF8C00',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        ) : (
          <div style={{ 
            fontSize: '18px', 
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            Question {questionHistory.length + 1}
          </div>
        )}
      </div>

      {/* Timer */}
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <Timer 
          key={timerKeyRef.current}
          speedLimit={config.speedLimit} 
          onTimeExpired={handleTimeExpired}
          isPaused={isPaused}
        />
      </div>

      {/* Question display */}
      {!isPaused ? (
        <div style={{
          width: '100%',
          maxWidth: '600px',
          marginTop: '32px',
          marginBottom: '32px'
        }}>
          <div style={{
            fontSize: '48px',
            fontFamily: 'monospace',
            textAlign: 'center',
            lineHeight: '1.5',
            letterSpacing: '4px'
          }}>
            <span>{currentQuestion.operandA}</span>
            <span style={{ margin: '0 16px' }}>{getOperationSymbol(currentQuestion.operation)}</span>
            <span>{currentQuestion.operandB}</span>
            <span style={{ margin: '0 16px' }}>=</span>
            <span style={{ color: '#FF8C00' }}>?</span>
          </div>

          {/* Answer input form */}
          <form onSubmit={handleSubmit} style={{ marginTop: '32px' }}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Your answer"
              disabled={feedback !== null}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '32px',
                fontFamily: 'monospace',
                textAlign: 'center',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: feedback === 'correct' ? '#2ECC71' : feedback === 'incorrect' ? '#E74C3C' : '#FFFFFF',
                color: feedback ? '#FFFFFF' : '#2C3E50',
                transition: 'background-color 0.3s ease',
                marginBottom: '16px'
              }}
              autoFocus
            />
            
            <button
              type="submit"
              disabled={feedback !== null}
              style={{
                width: '100%',
                minHeight: '44px',
                minWidth: '44px',
                padding: '16px',
                fontSize: '18px',
                fontWeight: 'bold',
                backgroundColor: '#FF8C00',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                cursor: feedback !== null ? 'not-allowed' : 'pointer',
                opacity: feedback !== null ? 0.6 : 1,
                transition: 'opacity 0.3s ease'
              }}
            >
              Submit Answer
            </button>
          </form>

          {/* Feedback message */}
          {feedback && (
            <div style={{
              marginTop: '16px',
              textAlign: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              color: feedback === 'correct' ? '#2ECC71' : '#FFFFFF'
            }}>
              {feedback === 'correct' ? '✓ Correct!' : (Math.random() > 0.5 ? 'Try Again!' : 'Oops!')}
            </div>
          )}
        </div>
      ) : (
        <div style={{
          marginTop: '64px',
          textAlign: 'center',
          fontSize: '24px'
        }}>
          Marathon Paused
        </div>
      )}

      {/* Control buttons */}
      <div style={{
        width: '100%',
        maxWidth: '600px',
        display: 'flex',
        gap: '8px',
        marginTop: 'auto',
        paddingTop: '24px'
      }}>
        {!isPaused ? (
          <button
            onClick={handlePause}
            style={{
              flex: 1,
              minHeight: '44px',
              minWidth: '44px',
              padding: '12px',
              fontSize: '16px',
              backgroundColor: '#34495E',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Pause
          </button>
        ) : (
          <button
            onClick={handleResume}
            style={{
              flex: 1,
              minHeight: '44px',
              minWidth: '44px',
              padding: '12px',
              fontSize: '16px',
              backgroundColor: '#2ECC71',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Resume
          </button>
        )}

        {config.volume === 'endless' && (
          <button
            onClick={handleEndMarathon}
            style={{
              flex: 1,
              minHeight: '44px',
              minWidth: '44px',
              padding: '12px',
              fontSize: '16px',
              backgroundColor: '#E74C3C',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            End Marathon
          </button>
        )}
      </div>
    </div>
  );
};
