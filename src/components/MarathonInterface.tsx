import React, { useState, useEffect, useRef } from 'react';
import { Timer } from './Timer';
import { QuestionGenerator } from '../utils/QuestionGenerator';
import { ScoringEngine } from '../utils/ScoringEngine';
import type { MarathonConfig, Question, QuestionResult, MarathonResults, SavedSession } from '../types';
import { marathonStore } from '../store/MarathonStore';

const COMPARE_ICONS = ['🍎', '🍦', '⭐', '🐶', '🌸'];
const COUNTING_ICONS = ['🍎', '🍦', '⭐', '🐶', '🌸', '🚗', '🦋', '🐸'];

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
  const compareIconRef = useRef<string>('🍎');
  const countingIconRef = useRef<string>('🍎');
  const [countedIndices, setCountedIndices] = useState<Set<number>>(new Set());

  // Initialize first question
  useEffect(() => {
    const savedSession = marathonStore.getSavedSession();
    questionGeneratorRef.current.reset();

    if (savedSession) {
      setQuestionHistory(savedSession.questionHistory);
      for(let i=0; i<savedSession.questionHistory.length; i++) {
        questionGeneratorRef.current.generateQuestion(config);
      }
      const nextQuestion = questionGeneratorRef.current.generateQuestion(config);
      setCurrentQuestion(nextQuestion);
      startTimeRef.current = savedSession.savedAt;
      currentQuestionStartTimeRef.current = Date.now();
      if (nextQuestion.operation === 'greater-than-lesser-than') {
        compareIconRef.current = COMPARE_ICONS[Math.floor(Math.random() * COMPARE_ICONS.length)];
      }
      if (nextQuestion.operation === 'counting') {
        countingIconRef.current = COUNTING_ICONS[Math.floor(Math.random() * COUNTING_ICONS.length)];
      }
    } else {
      const firstQuestion = questionGeneratorRef.current.generateQuestion(config);
      setCurrentQuestion(firstQuestion);
      startTimeRef.current = Date.now();
      currentQuestionStartTimeRef.current = Date.now();
      if (firstQuestion.operation === 'greater-than-lesser-than') {
        compareIconRef.current = COMPARE_ICONS[Math.floor(Math.random() * COMPARE_ICONS.length)];
      }
      if (firstQuestion.operation === 'counting') {
        countingIconRef.current = COUNTING_ICONS[Math.floor(Math.random() * COUNTING_ICONS.length)];
      }
    }
  }, [config]);

  const writeSession = (history: QuestionResult[]) => {
    const totalScore = scoringEngineRef.current.calculateTotalScore(history);
    const session: SavedSession = {
      config,
      questionHistory: history,
      currentQuestionIndex: history.length,
      currentScore: totalScore,
      savedAt: Date.now()
    };
    localStorage.setItem('challengeandgrow_saved_session', JSON.stringify(session));
  };

  // Handle timer expiration
  const handleTimeExpired = () => {
    setTimerExpired(true);
  };

  // Handle pause button click
  const handlePause = () => {
    setIsPaused(true);
    writeSession(questionHistory);
  };

  // Handle resume button click
  const handleResume = () => {
    setIsPaused(false);
  };

  // Handle answer submission from the text input form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitAnswer(userAnswer);
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

    localStorage.removeItem('challengeandgrow_saved_session');
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
      case 'greater-than-lesser-than': return '?';
      case 'fill-the-missing-number': return '?';
      default: return '';
    }
  };

  // Submit an answer value (used by both form submit and button tap)
  const submitAnswer = (answer: string) => {
    if (!currentQuestion || answer.trim() === '') return;

    // Task 6.4: handle string answers ('>' / '<') vs numeric
    const isCorrect =
      typeof currentQuestion.correctAnswer === 'string'
        ? answer === currentQuestion.correctAnswer
        : parseFloat(answer) === currentQuestion.correctAnswer;

    // For numeric fill-in-the-blank, reject non-numeric input
    if (typeof currentQuestion.correctAnswer !== 'string' && isNaN(parseFloat(answer))) {
      setFeedback('incorrect');
      setUserAnswer('');
      if ('vibrate' in navigator) navigator.vibrate(200);
      setTimeout(() => setFeedback(null), 1000);
      return;
    }

    const timeSpent = (Date.now() - currentQuestionStartTimeRef.current) / 1000;
    const pointsAwarded = scoringEngineRef.current.scoreAnswer(isCorrect, timerExpired);

    if (!isCorrect && 'vibrate' in navigator) navigator.vibrate(200);

    const result: QuestionResult = {
      question: currentQuestion,
      userAnswer: answer,
      isCorrect,
      pointsAwarded,
      answeredAfterExpiry: timerExpired,
      timeSpent
    };

    const updatedHistory = [...questionHistory, result];
    setQuestionHistory(updatedHistory);
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setUserAnswer('');
    writeSession(updatedHistory);

    const isComplete = config.volume !== 'endless' && updatedHistory.length >= config.volume;

    if (isComplete) {
      setTimeout(() => {
        const totalScore = scoringEngineRef.current.calculateTotalScore(updatedHistory);
        const percentage = scoringEngineRef.current.calculatePercentage(totalScore, updatedHistory.length);
        const totalTime = (Date.now() - startTimeRef.current) / 1000;
        localStorage.removeItem('challengeandgrow_saved_session');
        onComplete({ config, questionResults: updatedHistory, totalScore, percentage, totalTime, completedAt: new Date() });
      }, 1000);
    } else {
      setTimeout(() => {
        setFeedback(null);
        setTimerExpired(false);
        setCountedIndices(new Set()); // Reset counted indices
        timerKeyRef.current += 1;
        const nextQuestion = questionGeneratorRef.current.generateQuestion(config);
        setCurrentQuestion(nextQuestion);
        currentQuestionStartTimeRef.current = Date.now();
        if (nextQuestion.operation === 'greater-than-lesser-than') {
          compareIconRef.current = COMPARE_ICONS[Math.floor(Math.random() * COMPARE_ICONS.length)];
        }
        if (nextQuestion.operation === 'counting') {
          countingIconRef.current = COUNTING_ICONS[Math.floor(Math.random() * COUNTING_ICONS.length)];
        }
      }, 1000);
    }
  };

  // Compute the full equation result for fill-the-missing-number display
  const computeFillResult = (q: Question): number => {
    const op = q.baseOperation ?? 'addition';
    switch (op) {
      case 'addition': return Math.round((q.operandA + q.operandB) * 100) / 100;
      case 'subtraction': return Math.round((q.operandA - q.operandB) * 100) / 100;
      case 'multiplication': return Math.round((q.operandA * q.operandB) * 100) / 100;
      case 'division': return q.operandB !== 0 ? Math.round((q.operandA / q.operandB) * 100) / 100 : 0;
      default: return 0;
    }
  };

  const correctAnswersCount = questionHistory.filter(q => q.isCorrect).length;
  const isSingleDigitCompare = currentQuestion?.operation === 'greater-than-lesser-than' && currentQuestion.operandA >= 1 && currentQuestion.operandA <= 9 && currentQuestion.operandB >= 1 && currentQuestion.operandB <= 9;

  const renderIconGrid = (count: number, icon: string) => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'clamp(2px, 1vw, 4px)', justifyItems: 'center' }}>
        {Array.from({ length: count }).map((_, i) => (
          <span key={i} style={{ fontSize: 'clamp(18px, 5vw, 28px)' }}>{icon}</span>
        ))}
      </div>
    );
  };

  const handleIconClick = (index: number) => {
    if (countedIndices.has(index)) return;
    setCountedIndices(prev => new Set(prev).add(index));
  };

  const renderInteractiveIconGrid = (count: number, icon: string) => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', justifyItems: 'center' }}>
        {Array.from({ length: count }).map((_, i) => {
          const isCounted = countedIndices.has(i);
          return (
            <button 
              key={i}
              onClick={() => handleIconClick(i)}
              disabled={isCounted || feedback !== null}
              style={{ 
                fontSize: 'clamp(32px, 8vw, 48px)',
                background: 'none',
                border: 'none',
                padding: '8px',
                cursor: isCounted || feedback !== null ? 'default' : 'pointer',
                opacity: isCounted ? 0.4 : 1,
                transform: isCounted ? 'scale(0.9)' : 'scale(1)',
                transition: 'all 0.2s ease',
                borderRadius: '50%',
                backgroundColor: isCounted ? 'rgba(46, 204, 113, 0.2)' : 'transparent',
                boxShadow: isCounted ? '0 0 0 4px rgba(46, 204, 113, 0.5)' : 'none'
              }}
            >
              {icon}
            </button>
          );
        })}
      </div>
    );
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
      {/* Live Score Counter */}
      <div style={{ width: '100%', maxWidth: '600px', display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '18px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ color: '#2ECC71' }}>✓</span> {correctAnswersCount} / {questionHistory.length}
        </div>
      </div>

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
          {/* Custom renderings for new subjects */}
          {currentQuestion.operation === 'counting' ? (
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Tap to count!</div>
                {renderInteractiveIconGrid(currentQuestion.correctAnswer as number, countingIconRef.current)}
             </div>
          ) : currentQuestion.operation === 'number-bonds' ? (
             <div style={{ fontSize: '48px', fontFamily: 'monospace', textAlign: 'center', lineHeight: '1.5', letterSpacing: '4px' }}>
               <span>{currentQuestion.operandA}</span>
               <span style={{ margin: '0 16px' }}>+</span>
               <span style={{ color: '#FF8C00' }}>?</span>
               <span style={{ margin: '0 16px' }}>=</span>
               <span>{currentQuestion.operandB}</span>
             </div>
          ) : currentQuestion.operation === 'skip-counting' ? (
             <div style={{ fontSize: '48px', fontFamily: 'monospace', textAlign: 'center', lineHeight: '1.5', letterSpacing: '2px' }}>
                {currentQuestion.sequence?.map((val, idx) => (
                  <span key={idx} style={{ color: val === '?' ? '#FF8C00' : '#FFFFFF' }}>
                    {val}{idx < 4 ? ', ' : ''}
                  </span>
                ))}
             </div>
          ) : currentQuestion.operation === 'rounding' ? (
             <div style={{ fontSize: '32px', textAlign: 'center', lineHeight: '1.5' }}>
               Round <span style={{ fontWeight: 'bold', color: '#FF8C00' }}>{currentQuestion.operandA}</span> to the nearest {currentQuestion.roundingTarget}
             </div>
          ) : currentQuestion.operation === 'even-or-odd' || currentQuestion.operation === 'prime-or-not' ? (
             <div style={{ fontSize: '64px', fontFamily: 'monospace', textAlign: 'center', fontWeight: 'bold' }}>
               {currentQuestion.operandA}
             </div>
          ) : isSingleDigitCompare ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr auto 1fr', 
              gridTemplateRows: '1fr auto', 
              gap: 'clamp(8px, 2vw, 16px) clamp(8px, 2vw, 24px)',
              justifyItems: 'center',
              alignItems: 'end',
              width: '100%',
              overflow: 'hidden'
            }}>
              {/* Icons Row */}
              <div style={{ gridColumn: 1, gridRow: 1 }}>
                {renderIconGrid(currentQuestion.operandA, compareIconRef.current)}
              </div>
              
              {/* Answer Line spans both rows, centered vertically */}
              <div style={{ 
                gridColumn: 2,
                gridRow: '1 / span 2', 
                display: 'flex', 
                alignItems: 'center', 
                fontSize: 'clamp(24px, 6vw, 48px)', 
                color: '#FF8C00', 
                fontWeight: 'bold', 
                letterSpacing: 'clamp(1px, 1vw, 4px)' 
              }}>
                ___
              </div>
              
              <div style={{ gridColumn: 3, gridRow: 1 }}>
                {renderIconGrid(currentQuestion.operandB, compareIconRef.current)}
              </div>

              {/* Numbers Row */}
              <div style={{ gridColumn: 1, gridRow: 2, fontSize: '24px', fontFamily: 'monospace', backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '8px' }}>
                {currentQuestion.operandA}
              </div>
              
              <div style={{ gridColumn: 3, gridRow: 2, fontSize: '24px', fontFamily: 'monospace', backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '8px' }}>
                {currentQuestion.operandB}
              </div>
            </div>
          ) : currentQuestion.operation === 'greater-than-lesser-than' ? (
            <div style={{
              fontSize: '48px',
              fontFamily: 'monospace',
              textAlign: 'center',
              lineHeight: '1.5',
              letterSpacing: '4px'
            }}>
              <span>{currentQuestion.operandA}</span>
              <span style={{ margin: '0 16px', color: '#FF8C00' }}>___</span>
              <span>{currentQuestion.operandB}</span>
            </div>
          ) : currentQuestion.operation === 'fill-the-missing-number' ? (
            /* Task 6.2: Fill the Missing Number display */
            <div style={{
              fontSize: '48px',
              fontFamily: 'monospace',
              textAlign: 'center',
              lineHeight: '1.5',
              letterSpacing: '4px'
            }}>
              {currentQuestion.missingPosition === 'operandA' ? (
                <>
                  <span style={{ color: '#FF8C00' }}>__</span>
                  <span style={{ margin: '0 16px' }}>{getOperationSymbol(currentQuestion.baseOperation ?? 'addition')}</span>
                  <span>{currentQuestion.operandB}</span>
                  <span style={{ margin: '0 16px' }}>=</span>
                  <span>{computeFillResult(currentQuestion)}</span>
                </>
              ) : currentQuestion.missingPosition === 'operandB' ? (
                <>
                  <span>{currentQuestion.operandA}</span>
                  <span style={{ margin: '0 16px' }}>{getOperationSymbol(currentQuestion.baseOperation ?? 'addition')}</span>
                  <span style={{ color: '#FF8C00' }}>__</span>
                  <span style={{ margin: '0 16px' }}>=</span>
                  <span>{computeFillResult(currentQuestion)}</span>
                </>
              ) : (
                /* missingPosition === 'result' or undefined */
                <>
                  <span>{currentQuestion.operandA}</span>
                  <span style={{ margin: '0 16px' }}>{getOperationSymbol(currentQuestion.baseOperation ?? 'addition')}</span>
                  <span>{currentQuestion.operandB}</span>
                  <span style={{ margin: '0 16px' }}>=</span>
                  <span style={{ color: '#FF8C00' }}>__</span>
                </>
              )}
            </div>
          ) : currentQuestion.operation === 'addition' || currentQuestion.operation === 'subtraction' ? (
            /* Stacked Layout for Addition and Subtraction */
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                fontSize: '64px',
                fontFamily: 'monospace',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                lineHeight: '1.2'
              }}>
                <div>{currentQuestion.operandA}</div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span>{getOperationSymbol(currentQuestion.operation)}</span>
                  <span>{currentQuestion.operandB}</span>
                </div>
                <hr style={{ width: '100%', border: 'none', borderTop: '4px solid #FFFFFF', margin: '8px 0' }} />
                <div style={{ color: '#FF8C00' }}>?</div>
              </div>
            </div>
          ) : (
            /* Default: A op B = ? */
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
          )}

          {/* Answer input — switches on operation and answerMode */}
          <div style={{ marginTop: '32px' }}>
            {/* Task 6.1: GT/LT always uses two symbol buttons */}
            {currentQuestion.operation === 'greater-than-lesser-than' ? (
              <div style={{ display: 'flex', gap: '16px' }}>
                {(['>', '<'] as const).map((symbol) => (
                  <button
                    key={symbol}
                    disabled={feedback !== null}
                    onClick={() => submitAnswer(symbol)}
                    style={{
                      flex: 1,
                      minHeight: '80px',
                      fontSize: '48px',
                      fontWeight: 'bold',
                      fontFamily: 'monospace',
                      backgroundColor: feedback === 'correct' && userAnswer === symbol ? '#2ECC71'
                        : feedback === 'incorrect' && userAnswer === symbol ? '#E74C3C'
                        : '#FF8C00',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: feedback !== null ? 'not-allowed' : 'pointer',
                      opacity: feedback !== null ? 0.6 : 1,
                      transition: 'opacity 0.3s ease'
                    }}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            ) : config.answerMode === 'multiple-choice' && currentQuestion.choices ? (
              /* Task 6.3: Multiple-choice buttons */
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {currentQuestion.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    disabled={feedback !== null}
                    onClick={() => submitAnswer(String(choice))}
                    style={{
                      minHeight: '72px',
                      fontSize: '32px',
                      fontWeight: 'bold',
                      fontFamily: 'monospace',
                      backgroundColor: '#34495E',
                      color: '#FFFFFF',
                      border: '3px solid #FF8C00',
                      borderRadius: '12px',
                      cursor: feedback !== null ? 'not-allowed' : 'pointer',
                      opacity: feedback !== null ? 0.6 : 1,
                      transition: 'opacity 0.3s ease'
                    }}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            ) : (
              /* fill-in-the-blank: existing text input + Submit */
              <form onSubmit={handleSubmit}>
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
                    marginBottom: '16px',
                    boxSizing: 'border-box'
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
            )}
          </div>

          {/* Interactive counting tracker */}
          {currentQuestion.operation === 'counting' && (
            <div style={{
              marginTop: '24px',
              textAlign: 'center',
              fontSize: '28px',
              fontWeight: 'bold',
              color: countedIndices.size > 0 ? '#2ECC71' : 'rgba(255,255,255,0.3)',
              transition: 'color 0.3s ease'
            }}>
              Counted: {countedIndices.size}
            </div>
          )}

          {/* Feedback message */}
          {feedback && (
            <div style={{
              marginTop: '16px',
              textAlign: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              color: feedback === 'correct' ? '#2ECC71' : '#FFFFFF'
            }}>
              {feedback === 'correct' ? '✓ Correct!' : 'Oops!'}
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
        marginBottom: '80px',
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
