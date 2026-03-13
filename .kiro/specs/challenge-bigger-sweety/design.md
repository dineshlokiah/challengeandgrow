# Design Document: challengeBiggerSweety

## Overview

challengeBiggerSweety is a client-side web application that provides gamified math learning through timed question marathons. The system consists of three primary components: a Configuration Suite for pre-marathon setup, a Marathon Interface for the active quiz experience, and a Result Generator for performance reporting.

The application operates entirely in the browser with no backend dependencies, using JavaScript for logic, HTML/CSS for presentation, and client-side file generation for reports. The design prioritizes mobile responsiveness, visual engagement through countdown timers and color feedback, and maintaining learner flow state through encouraging feedback mechanisms.

Key design principles:
- Client-side only architecture (no server communication)
- Mobile-first responsive design with touch-friendly interactions
- Visual feedback system using color and animation
- Graceful handling of time expiration (questions remain answerable)
- Positive reinforcement through encouraging messaging

## Architecture

The application follows a component-based architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Application Shell                     │
│  (Routing, State Management, Component Orchestration)   │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│Configuration │   │   Marathon   │   │    Result    │
│    Suite     │   │  Interface   │   │  Generator   │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        │                   ▼                   │
        │          ┌──────────────┐            │
        │          │   Question   │            │
        │          │  Generator   │            │
        │          └──────────────┘            │
        │                   │                   │
        │                   ▼                   │
        │          ┌──────────────┐            │
        │          │    Timer     │            │
        │          │  Component   │            │
        │          └──────────────┘            │
        │                   │                   │
        │                   ▼                   │
        │          ┌──────────────┐            │
        │          │   Scoring    │            │
        │          │    Engine    │            │
        │          └──────────────┘            │
        │                                       │
        └───────────────────┬───────────────────┘
                            ▼
                   ┌──────────────┐
                   │  State Store │
                   │ (In-Memory)  │
                   └──────────────┘
```

### Component Responsibilities

**Application Shell**: Manages routing between configuration, marathon, and results screens. Maintains global application state in memory.

**Configuration Suite**: Handles parameter selection (subject, complexity, volume, speed). Validates that all required parameters are selected before enabling marathon start.

**Marathon Interface**: Orchestrates the active quiz experience, coordinating between question display, timer, input handling, and scoring.

**Question Generator**: Produces math problems based on configuration parameters. Ensures division problems have whole number results.

**Timer Component**: Manages countdown visualization and state transitions (active → expired). Handles pause/resume functionality.

**Scoring Engine**: Calculates points based on answer correctness and timing. Tracks cumulative score throughout marathon.

**Result Generator**: Aggregates marathon data and generates downloadable text file reports using client-side file APIs.

## Components and Interfaces

### Configuration Suite Component

**Purpose**: Collect marathon parameters from user before starting

**Interface**:
```typescript
interface ConfigurationSuiteProps {
  onStartMarathon: (config: MarathonConfig) => void;
}

interface MarathonConfig {
  subject: 'addition' | 'subtraction' | 'multiplication' | 'division';
  digitCountA: 1 | 2 | 3 | 4;
  digitCountB: 1 | 2 | 3 | 4;
  volume: 10 | 20 | 50 | 'endless';
  speedLimit: 10 | 30 | 60; // seconds
}
```

**Behavior**:
- Renders selection controls for all configuration parameters
- Disables start button until all parameters are selected
- Validates configuration completeness before invoking callback
- Applies visual design system (colors, fonts, spacing)

### Question Generator Component

**Purpose**: Generate math problems based on configuration

**Interface**:
```typescript
interface QuestionGenerator {
  generateQuestion(config: MarathonConfig): Question;
}

interface Question {
  operandA: number;
  operandB: number;
  operation: 'addition' | 'subtraction' | 'multiplication' | 'division';
  correctAnswer: number;
  questionNumber: number;
}
```

**Behavior**:
- Generates random operands within digit count constraints
- For division: ensures operandA is divisible by operandB (whole number result)
- Calculates correct answer based on operation
- Increments question number sequentially

### Timer Component

**Purpose**: Visual countdown timer with state management

**Interface**:
```typescript
interface TimerComponentProps {
  speedLimit: number; // seconds
  onTimeExpired: () => void;
  isPaused: boolean;
}

interface TimerState {
  remainingTime: number; // seconds
  isExpired: boolean;
  visualState: 'active' | 'expired';
}
```

**Behavior**:
- Displays visual countdown (progress bar or circular indicator)
- Updates display at 1-second intervals minimum
- Changes color to amber (#E74C3C) when time reaches zero
- Freezes countdown when isPaused is true
- Resumes from paused value when isPaused becomes false

### Marathon Interface Component

**Purpose**: Orchestrate active quiz experience

**Interface**:
```typescript
interface MarathonInterfaceProps {
  config: MarathonConfig;
  onComplete: (results: MarathonResults) => void;
}

interface MarathonState {
  currentQuestion: Question;
  questionHistory: QuestionResult[];
  isPaused: boolean;
  startTime: number; // timestamp
  currentQuestionStartTime: number; // timestamp
}

interface QuestionResult {
  question: Question;
  userAnswer: number;
  isCorrect: boolean;
  pointsAwarded: number;
  answeredAfterExpiry: boolean;
  timeSpent: number; // seconds
}
```

**Behavior**:
- Displays current question with large mono-spaced fonts
- Renders timer component with current speed limit
- Provides pause/resume button (44x44px minimum)
- Hides question content when paused
- Accepts numeric input for answers
- Validates answer on submission
- Awards points based on correctness and timing
- Displays feedback (positive for correct, encouraging for incorrect)
- Updates progress bar (or question count for endless mode)
- Advances to next question after answer submission
- Triggers completion callback when volume is reached or user ends marathon

### Scoring Engine

**Purpose**: Calculate points and track performance

**Interface**:
```typescript
interface ScoringEngine {
  scoreAnswer(isCorrect: boolean, isTimeExpired: boolean): number;
  calculateTotalScore(results: QuestionResult[]): number;
  calculatePercentage(totalScore: number, maxPossibleScore: number): number;
}
```

**Behavior**:
- Awards 1 point for correct answers within time limit
- Awards 0.5 points for correct answers after time expiration
- Awards 0 points for incorrect answers
- Sums all question scores for total
- Calculates percentage as (totalScore / maxPossible) * 100

### Result Generator Component

**Purpose**: Create downloadable performance reports

**Interface**:
```typescript
interface ResultGeneratorProps {
  results: MarathonResults;
  onDownload: () => void;
}

interface MarathonResults {
  config: MarathonConfig;
  questionResults: QuestionResult[];
  totalScore: number;
  percentage: number;
  totalTime: number; // seconds
  completedAt: Date;
}
```

**Behavior**:
- Displays summary statistics (score, percentage, time)
- Renders "Claim Your Medal" button (44x44px minimum)
- Generates text file with formatted report on button click
- Uses client-side file download APIs (Blob, URL.createObjectURL)
- Formats report with human-readable labels

**Report Format**:
```
challengeBiggerSweety Marathon Report
=====================================
Date: YYYY-MM-DD
Time: HH:MM:SS
Subject: [Addition/Subtraction/Multiplication/Division]
Number A Digits: [1-4]
Number B Digits: [1-4]
Questions Completed: [count]
Total Score: [score] / [max]
Percentage: [percentage]%
Total Time: [MM:SS]
```

## Data Models

### MarathonConfig
Stores user-selected configuration parameters for a marathon session.

```typescript
interface MarathonConfig {
  subject: 'addition' | 'subtraction' | 'multiplication' | 'division';
  digitCountA: 1 | 2 | 3 | 4;
  digitCountB: 1 | 2 | 3 | 4;
  volume: 10 | 20 | 50 | 'endless';
  speedLimit: 10 | 30 | 60; // seconds per question
}
```

**Constraints**:
- All fields are required before marathon can start
- digitCountA and digitCountB must be between 1 and 4 inclusive
- speedLimit must be one of the predefined values

### Question
Represents a single math problem with its solution.

```typescript
interface Question {
  operandA: number;
  operandB: number;
  operation: 'addition' | 'subtraction' | 'multiplication' | 'division';
  correctAnswer: number;
  questionNumber: number; // 1-indexed
}
```

**Constraints**:
- operandA must have digit count matching digitCountA
- operandB must have digit count matching digitCountB
- For division: operandA % operandB === 0 (whole number result)
- correctAnswer must be calculated correctly based on operation
- questionNumber increments sequentially starting from 1

### QuestionResult
Records the outcome of a single question attempt.

```typescript
interface QuestionResult {
  question: Question;
  userAnswer: number;
  isCorrect: boolean;
  pointsAwarded: number; // 0, 0.5, or 1
  answeredAfterExpiry: boolean;
  timeSpent: number; // seconds from question display to answer submission
}
```

**Constraints**:
- isCorrect = (userAnswer === question.correctAnswer)
- pointsAwarded = 1 if correct and !answeredAfterExpiry
- pointsAwarded = 0.5 if correct and answeredAfterExpiry
- pointsAwarded = 0 if !correct
- timeSpent >= 0

### MarathonState
Tracks the current state of an active marathon session.

```typescript
interface MarathonState {
  config: MarathonConfig;
  currentQuestion: Question;
  questionHistory: QuestionResult[];
  isPaused: boolean;
  startTime: number; // Unix timestamp in milliseconds
  currentQuestionStartTime: number; // Unix timestamp in milliseconds
  timerRemainingSeconds: number;
  timerExpired: boolean;
}
```

**Constraints**:
- questionHistory.length < config.volume (unless volume is 'endless')
- currentQuestionStartTime >= startTime
- timerRemainingSeconds >= 0
- timerExpired = true when timerRemainingSeconds === 0

### MarathonResults
Aggregated data from a completed marathon session.

```typescript
interface MarathonResults {
  config: MarathonConfig;
  questionResults: QuestionResult[];
  totalScore: number;
  percentage: number;
  totalTime: number; // seconds from start to completion
  completedAt: Date;
}
```

**Constraints**:
- totalScore = sum of all questionResults[].pointsAwarded
- percentage = (totalScore / questionResults.length) * 100
- totalTime = (completedAt - startTime) / 1000
- questionResults.length > 0


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Configuration Completeness Controls Start Button

For any configuration state, the start marathon button should be enabled if and only if all required parameters (subject, digitCountA, digitCountB, volume, speedLimit) have been selected.

**Validates: Requirements 1.6**

### Property 2: Question Generation Matches Configuration

For any valid marathon configuration, all generated questions should have operands with digit counts matching the configured digitCountA and digitCountB, and the operation should match the configured subject. Additionally, for division operations, operandA must be evenly divisible by operandB (whole number result).

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 3: Volume Determines Question Count

For any marathon configuration with a numeric volume (10, 20, or 50), the marathon should generate exactly that many questions before completion.

**Validates: Requirements 2.5**

### Property 4: Endless Mode Continues Indefinitely

For any marathon configuration with endless volume, the question generator should continue producing valid questions beyond any fixed limit until manually stopped by the user.

**Validates: Requirements 2.6**

### Property 5: Timer Initializes to Speed Limit

For any marathon configuration, when a new question is displayed, the timer should initialize to the configured speedLimit value in seconds.

**Validates: Requirements 3.1**

### Property 6: Pause-Resume Preserves Timer State

For any marathon state with a running timer, pausing and then immediately resuming should restore the timer to its paused value (round-trip property).

**Validates: Requirements 4.2, 4.5**

### Property 7: Scoring Logic Correctness

For any question result, the points awarded should be: 1 point if the answer is correct and submitted before timer expiration, 0.5 points if the answer is correct and submitted after timer expiration, and 0 points if the answer is incorrect (regardless of timing).

**Validates: Requirements 5.1, 5.2, 5.3**

### Property 8: Answer Submission Advances Question

For any marathon state, submitting an answer (correct or incorrect) should increment the current question number by 1.

**Validates: Requirements 5.6**

### Property 9: Progress Tracking Accuracy

For any marathon with numeric volume, the progress indicator should show completed questions divided by total volume, and this value should increase by 1/volume after each answer submission.

**Validates: Requirements 7.1, 7.2**

### Property 10: Total Score Calculation

For any completed marathon, the total score should equal the sum of all individual question scores (pointsAwarded values).

**Validates: Requirements 8.1**

### Property 11: Percentage Calculation

For any completed marathon, the final percentage should equal (totalScore / maximumPossibleScore) * 100, where maximumPossibleScore equals the number of questions completed.

**Validates: Requirements 8.2**

### Property 12: Total Time Calculation

For any completed marathon, the total time should equal the difference in seconds between the marathon start timestamp and the completion timestamp.

**Validates: Requirements 8.3**

### Property 13: Report File Completeness

For any completed marathon, the generated text file should contain all required fields: date, time, subject, digitCountA, digitCountB, total score, final percentage, and total time taken.

**Validates: Requirements 8.4, 8.7**

### Property 14: Interactive Button Minimum Dimensions

For any interactive button in the Marathon Interface or Configuration Suite, the rendered dimensions should be at least 44 pixels by 44 pixels.

**Validates: Requirements 4.1, 8.5, 9.1**

### Property 15: Interactive Element Spacing

For any pair of adjacent interactive elements in the Marathon Interface, the spacing between them should be at least 8 pixels.

**Validates: Requirements 9.5**

### Property 16: No Server Communication

For any marathon session from configuration through completion, no HTTP requests should be made to external servers, and all data should remain in browser memory or be downloaded as client-side generated files.

**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**

## Error Handling

### Input Validation

**Invalid Answer Input**: The Marathon Interface should accept only numeric input for answers. Non-numeric input should be rejected with visual feedback, and the input field should be cleared.

**Division by Zero**: The Question Generator must ensure operandB is never zero for division problems. This is enforced during question generation by selecting non-zero random values.

**Configuration Validation**: The Configuration Suite should prevent marathon start until all parameters are selected. The start button remains disabled until validation passes.

### Timer Edge Cases

**Timer at Zero**: When the timer reaches zero, the question remains answerable (Time_Expired_State). The system should not auto-advance or lock the input.

**Pause During Expired State**: Pausing is allowed even after timer expiration. The expired state should be preserved through pause/resume cycles.

**Rapid Pause/Resume**: Multiple rapid pause/resume actions should not corrupt timer state. Each pause should capture the current timer value, and each resume should restore it.

### State Management

**Browser Refresh**: Since the application stores state only in memory, a browser refresh will lose all marathon progress. This is acceptable given the client-side-only requirement. The application should start fresh at the configuration screen.

**Endless Mode Termination**: For endless volume, the user must manually end the marathon. The interface should provide a clear "End Marathon" button that triggers the results screen.

**Empty Question History**: If a user ends an endless marathon without answering any questions, the Result Generator should handle zero questions gracefully, showing 0 score and 0% percentage.

### File Generation

**Download Failure**: If the browser blocks file download (permissions, popup blocker), the application should display an error message instructing the user to check browser settings.

**Filename Conflicts**: Generated report files should include a timestamp in the filename to avoid overwriting previous reports (e.g., `marathon-report-2024-01-15-14-30-00.txt`).

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** focus on:
- Specific examples of correct behavior (e.g., "addition of 23 + 45 equals 68")
- UI component rendering (e.g., "pause button is visible during active marathon")
- Edge cases (e.g., "timer at zero maintains answerable state")
- Integration points (e.g., "clicking submit button triggers scoring")
- Visual design compliance (e.g., "success feedback uses #2ECC71 color")

**Property-Based Tests** focus on:
- Universal properties across all inputs (e.g., "for any configuration, generated questions match digit counts")
- Scoring logic correctness across all answer/timing combinations
- State transitions and invariants (e.g., "pause-resume preserves timer value")
- Calculation accuracy (e.g., "total score always equals sum of individual scores")

Together, unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across the input space.

### Property-Based Testing Configuration

**Library Selection**: Use `fast-check` for JavaScript/TypeScript property-based testing.

**Test Configuration**: Each property test should run a minimum of 100 iterations to ensure adequate randomized input coverage.

**Tagging Convention**: Each property test must include a comment tag referencing its design document property:
```javascript
// Feature: challenge-bigger-sweety, Property 2: Question Generation Matches Configuration
```

**Generator Strategy**:
- Create custom generators for MarathonConfig, Question, QuestionResult
- Ensure division question generator produces only evenly divisible operands
- Generate digit counts that produce operands within specified ranges
- For timer tests, generate realistic time values (0-60 seconds)

### Unit Testing Focus Areas

**Configuration Suite**:
- Verify all selection options are rendered (subjects, digit counts, volumes, speed limits)
- Test start button enable/disable logic with various incomplete configurations
- Verify visual design system application (colors, fonts)

**Question Generator**:
- Test specific examples for each operation type
- Verify division problems have whole number results
- Test edge cases (1-digit operands, 4-digit operands)

**Timer Component**:
- Test timer initialization with different speed limits
- Verify color change to amber when expired
- Test pause/resume functionality
- Verify question remains answerable after expiration

**Scoring Engine**:
- Test scoring with specific examples (correct before expiry, correct after expiry, incorrect)
- Verify point constants (Full_Points = 1, Half_Points = 0.5)

**Marathon Interface**:
- Test question advancement after answer submission
- Verify progress bar updates
- Test pause button hides question content
- Test resume button restores question content
- Verify feedback messages ("Try Again", "Oops" for incorrect)
- Test endless mode displays question count instead of progress bar

**Result Generator**:
- Test report file contains all required fields
- Verify filename includes timestamp
- Test download trigger on button click
- Verify calculations (total score, percentage, total time)

**Responsive Design**:
- Test button dimensions meet 44x44px minimum
- Test element spacing meets 8px minimum
- Verify mono-spaced fonts on number inputs
- Test touch-friendly interactions

**Client-Side Operation**:
- Verify no network requests during marathon execution
- Test state storage in memory (not localStorage)
- Verify file generation uses Blob/URL APIs

### Testing Tools

- **Test Framework**: Jest or Vitest for JavaScript/TypeScript
- **Property Testing**: fast-check library
- **Component Testing**: React Testing Library or similar for UI components
- **Visual Regression**: Optional - Playwright or Cypress for responsive design validation

### Coverage Goals

- Minimum 90% code coverage for business logic (question generation, scoring, calculations)
- 100% coverage of all correctness properties via property-based tests
- All acceptance criteria covered by at least one unit test or property test
- All error handling paths tested with specific examples
