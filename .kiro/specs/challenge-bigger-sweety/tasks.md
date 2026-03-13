# Implementation Plan: challengeBiggerSweety

## Overview

This implementation plan breaks down the challengeBiggerSweety math marathon application into discrete coding tasks. The application is a client-side web app built with TypeScript/JavaScript, HTML, and CSS. The implementation follows a component-based architecture with clear separation between configuration, marathon execution, and results generation.

The plan progresses from foundational data models and utilities through core components, ending with integration and visual polish. Each task references specific requirements to maintain traceability.

## Tasks

- [x] 1. Set up project structure and core data models
  - Create project directory structure (src/, components/, utils/, types/)
  - Define TypeScript interfaces for MarathonConfig, Question, QuestionResult, MarathonState, and MarathonResults
  - Set up build configuration (TypeScript, bundler)
  - Create index.html with basic structure and meta tags for mobile responsiveness
  - _Requirements: 11.1, 11.2_

- [ ]* 1.1 Write property test for data model validation
  - **Property 2: Question Generation Matches Configuration**
  - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

- [ ] 2. Implement Question Generator component
  - [x] 2.1 Create QuestionGenerator class with generateQuestion method
    - Implement random number generation for operands based on digit count constraints
    - Implement addition, subtraction, multiplication question generation
    - Implement division question generation ensuring whole number results (operandA % operandB === 0)
    - Calculate correct answers for each operation type
    - Track and increment question numbers sequentially
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 2.2 Write property test for question generation
    - **Property 2: Question Generation Matches Configuration**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

  - [ ]* 2.3 Write unit tests for QuestionGenerator
    - Test specific examples for each operation (addition, subtraction, multiplication, division)
    - Test edge cases (1-digit operands, 4-digit operands)
    - Verify division problems always have whole number results
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 3. Implement Scoring Engine
  - [x] 3.1 Create ScoringEngine class with scoring methods
    - Implement scoreAnswer method (1 point for correct before expiry, 0.5 for correct after expiry, 0 for incorrect)
    - Implement calculateTotalScore method (sum of all question scores)
    - Implement calculatePercentage method ((totalScore / maxPossible) * 100)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 8.1, 8.2_

  - [ ]* 3.2 Write property test for scoring logic
    - **Property 7: Scoring Logic Correctness**
    - **Validates: Requirements 5.1, 5.2, 5.3**

  - [ ]* 3.3 Write property test for total score calculation
    - **Property 10: Total Score Calculation**
    - **Validates: Requirements 8.1**

  - [ ]* 3.4 Write property test for percentage calculation
    - **Property 11: Percentage Calculation**
    - **Validates: Requirements 8.2**

  - [ ]* 3.5 Write unit tests for ScoringEngine
    - Test specific scoring examples (correct before/after expiry, incorrect)
    - Verify point constants (Full_Points = 1, Half_Points = 0.5)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 4. Implement Timer Component
  - [x] 4.1 Create Timer component with countdown functionality
    - Implement timer initialization to speedLimit value
    - Implement countdown logic with 1-second interval updates
    - Implement visual display (progress bar or circular indicator)
    - Implement color change to amber (#E74C3C) when timer reaches zero
    - Implement pause/resume functionality that preserves timer state
    - Maintain answerable state when timer expires
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.2, 4.5_

  - [ ]* 4.2 Write property test for timer initialization
    - **Property 5: Timer Initializes to Speed Limit**
    - **Validates: Requirements 3.1**

  - [ ]* 4.3 Write property test for pause-resume
    - **Property 6: Pause-Resume Preserves Timer State**
    - **Validates: Requirements 4.2, 4.5**

  - [ ]* 4.4 Write unit tests for Timer component
    - Test timer initialization with different speed limits (10s, 30s, 60s)
    - Test color change to amber when expired
    - Test pause/resume functionality
    - Verify question remains answerable after expiration
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.2, 4.5_

- [x] 5. Checkpoint - Ensure core logic tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement Configuration Suite component
  - [x] 6.1 Create ConfigurationSuite component with parameter selection
    - Implement subject selection UI (Addition, Subtraction, Multiplication, Division)
    - Implement digit count selection for Number A (1-4 digits)
    - Implement digit count selection for Number B (1-4 digits)
    - Implement volume selection (10, 20, 50, Endless)
    - Implement speed limit selection (10s, 30s, 60s)
    - Implement start button enable/disable logic (enabled only when all parameters selected)
    - Apply visual design system (colors, fonts, spacing)
    - Ensure mobile responsiveness (320px-1920px viewport width)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 9.3, 9.4, 10.5_

  - [ ]* 6.2 Write property test for configuration completeness
    - **Property 1: Configuration Completeness Controls Start Button**
    - **Validates: Requirements 1.6**

  - [ ]* 6.3 Write unit tests for ConfigurationSuite
    - Verify all selection options are rendered
    - Test start button enable/disable with various incomplete configurations
    - Verify visual design system application
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [ ] 7. Implement Marathon Interface component
  - [x] 7.1 Create MarathonInterface component with question display and interaction
    - Implement question display with large mono-spaced fonts for numbers
    - Integrate Timer component with current speed limit
    - Implement numeric input field for answers
    - Implement answer validation and submission logic
    - Implement question advancement after answer submission
    - Implement progress bar for numeric volume (completed / total)
    - Implement question counter for endless mode
    - Track marathon start time and question start times
    - Store question history with results
    - _Requirements: 2.5, 2.6, 5.6, 7.1, 7.2, 7.3, 7.4, 9.2, 10.7_

  - [x] 7.2 Implement pause/resume functionality in Marathon Interface
    - Create pause button (minimum 44x44px)
    - Implement pause action (freeze timer, hide question content)
    - Create resume button (displayed when paused)
    - Implement resume action (restore timer, show question content)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 9.1_

  - [x] 7.3 Implement answer feedback system
    - Display "Try Again" or "Oops" messaging for incorrect answers
    - Display positive visual feedback using success color (#2ECC71) for correct answers
    - Implement haptic feedback for incorrect answers (where supported)
    - Ensure no "X" marks or negative symbols for incorrect answers
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 10.2_

  - [x] 7.4 Implement marathon completion logic
    - Detect when volume is reached (for numeric volumes)
    - Provide "End Marathon" button for endless mode
    - Calculate total time taken (completion timestamp - start timestamp)
    - Transition to results screen on completion
    - _Requirements: 2.6, 7.4, 8.3_

  - [ ]* 7.5 Write property test for volume-based completion
    - **Property 3: Volume Determines Question Count**
    - **Validates: Requirements 2.5**

  - [ ]* 7.6 Write property test for endless mode
    - **Property 4: Endless Mode Continues Indefinitely**
    - **Validates: Requirements 2.6**

  - [ ]* 7.7 Write property test for answer submission advancement
    - **Property 8: Answer Submission Advances Question**
    - **Validates: Requirements 5.6**

  - [ ]* 7.8 Write property test for progress tracking
    - **Property 9: Progress Tracking Accuracy**
    - **Validates: Requirements 7.1, 7.2**

  - [ ]* 7.9 Write property test for total time calculation
    - **Property 12: Total Time Calculation**
    - **Validates: Requirements 8.3**

  - [ ]* 7.10 Write unit tests for Marathon Interface
    - Test question advancement after answer submission
    - Verify progress bar updates
    - Test pause button hides question content
    - Test resume button restores question content
    - Verify feedback messages for incorrect answers
    - Test endless mode displays question count instead of progress bar
    - _Requirements: 4.3, 4.6, 5.6, 6.1, 7.1, 7.2, 7.3_

- [x] 8. Checkpoint - Ensure marathon interface tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement Result Generator component
  - [x] 9.1 Create ResultGenerator component with report generation
    - Display summary statistics (total score, percentage, total time)
    - Create "Claim Your Medal" button (minimum 44x44px)
    - Implement text file generation with all required fields (date, time, subject, complexity, score, percentage, time)
    - Format report with human-readable labels
    - Include timestamp in filename to avoid conflicts (e.g., marathon-report-2024-01-15-14-30-00.txt)
    - Implement client-side file download using Blob and URL.createObjectURL APIs
    - Handle download failures with error messaging
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 9.1, 11.3_

  - [ ]* 9.2 Write property test for report completeness
    - **Property 13: Report File Completeness**
    - **Validates: Requirements 8.4, 8.7**

  - [ ]* 9.3 Write unit tests for Result Generator
    - Test report file contains all required fields
    - Verify filename includes timestamp
    - Test download trigger on button click
    - Verify calculations (total score, percentage, total time)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.7_

- [ ] 10. Implement Application Shell and routing
  - [x] 10.1 Create Application Shell with state management and routing
    - Implement in-memory state store for marathon data
    - Create routing logic between configuration, marathon, and results screens
    - Implement component orchestration and data flow
    - Ensure no server communication (client-side only)
    - Ensure no user authentication or account creation
    - _Requirements: 11.1, 11.2, 11.4, 11.5_

  - [ ]* 10.2 Write property test for no server communication
    - **Property 16: No Server Communication**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**

  - [ ]* 10.3 Write unit tests for Application Shell
    - Verify no network requests during marathon execution
    - Test state storage in memory (not localStorage)
    - Test routing between screens
    - _Requirements: 11.1, 11.2, 11.4, 11.5_

- [ ] 11. Apply visual design system and mobile responsiveness
  - [x] 11.1 Implement color palette across all components
    - Apply vivid orange (#FF8C00) for primary action buttons
    - Apply mint green (#2ECC71) for success feedback and correct answer indicators
    - Apply soft coral (#E74C3C) for timer alerts in expired state
    - Apply deep navy (#2C3E50) or soft grey as background color
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 11.2 Implement typography system
    - Apply rounded, chunky fonts (Fredoka One or Quicksand) for headings
    - Apply large mono-spaced fonts for question numbers and numeric inputs
    - _Requirements: 10.6, 10.7_

  - [x] 11.3 Implement responsive design and touch-friendly interactions
    - Ensure all interactive buttons are minimum 44x44px
    - Ensure minimum 8px spacing between interactive elements
    - Test layout adaptation for viewport widths 320px-1920px
    - Verify touch-friendly spacing throughout
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 11.4 Write property test for button dimensions
    - **Property 14: Interactive Button Minimum Dimensions**
    - **Validates: Requirements 4.1, 8.5, 9.1**

  - [ ]* 11.5 Write property test for element spacing
    - **Property 15: Interactive Element Spacing**
    - **Validates: Requirements 9.5**

  - [ ]* 11.6 Write visual regression tests
    - Test responsive design at various viewport sizes
    - Verify color palette application
    - Verify typography system
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.6, 10.7_

- [ ] 12. Final integration and end-to-end testing
  - [x] 12.1 Wire all components together in Application Shell
    - Connect Configuration Suite to Marathon Interface
    - Connect Marathon Interface to Result Generator
    - Verify data flow through complete marathon lifecycle
    - Test configuration → marathon → results flow
    - _Requirements: All requirements_

  - [ ]* 12.2 Write integration tests for complete marathon flow
    - Test full marathon lifecycle (configuration → execution → results)
    - Test endless mode termination
    - Test empty question history handling
    - Test browser refresh behavior (state loss is acceptable)
    - _Requirements: All requirements_

- [x] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation uses TypeScript for type safety and better developer experience
- All property-based tests should use fast-check library with minimum 100 iterations
- Property tests must include comment tags referencing design document properties
- The application is entirely client-side with no backend dependencies
- Focus on mobile-first responsive design with touch-friendly interactions
- Visual design emphasizes engagement through color, animation, and positive feedback
