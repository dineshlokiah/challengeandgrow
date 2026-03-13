/**
 * Unit tests for ConfigurationSuite component
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfigurationSuite from './ConfigurationSuite';
import { MarathonConfig } from '../types';

describe('ConfigurationSuite', () => {
  describe('Parameter Selection Rendering', () => {
    it('should render all subject options', () => {
      const mockCallback = vi.fn();
      render(<ConfigurationSuite onStartMarathon={mockCallback} />);

      expect(screen.getByText('Addition')).toBeInTheDocument();
      expect(screen.getByText('Subtraction')).toBeInTheDocument();
      expect(screen.getByText('Multiplication')).toBeInTheDocument();
      expect(screen.getByText('Division')).toBeInTheDocument();
    });

    it('should render digit count options for Number A', () => {
      const mockCallback = vi.fn();
      render(<ConfigurationSuite onStartMarathon={mockCallback} />);

      expect(screen.getByText('Number A Digits')).toBeInTheDocument();
      const digitButtons = screen.getAllByText(/^[1-4]$/);
      expect(digitButtons.length).toBeGreaterThanOrEqual(4);
    });

    it('should render digit count options for Number B', () => {
      const mockCallback = vi.fn();
      render(<ConfigurationSuite onStartMarathon={mockCallback} />);

      expect(screen.getByText('Number B Digits')).toBeInTheDocument();
    });

    it('should render volume options', () => {
      const mockCallback = vi.fn();
      render(<ConfigurationSuite onStartMarathon={mockCallback} />);

      expect(screen.getByText('Questions')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('∞')).toBeInTheDocument();
    });

    it('should render speed limit options', () => {
      const mockCallback = vi.fn();
      render(<ConfigurationSuite onStartMarathon={mockCallback} />);

      expect(screen.getByText('Time Per Question')).toBeInTheDocument();
      expect(screen.getByText('10s')).toBeInTheDocument();
      expect(screen.getByText('30s')).toBeInTheDocument();
      expect(screen.getByText('60s')).toBeInTheDocument();
    });
  });

  describe('Start Button Enable/Disable Logic', () => {
    it('should disable start button when no parameters are selected', () => {
      const mockCallback = vi.fn();
      render(<ConfigurationSuite onStartMarathon={mockCallback} />);

      const startButton = screen.getByText('Start Marathon');
      expect(startButton).toBeDisabled();
    });

    it('should disable start button when only subject is selected', () => {
      const mockCallback = vi.fn();
      render(<ConfigurationSuite onStartMarathon={mockCallback} />);

      fireEvent.click(screen.getByText('Addition'));
      const startButton = screen.getByText('Start Marathon');
      expect(startButton).toBeDisabled();
    });

    it('should disable start button when subject and digit counts are selected but volume and speed are missing', () => {
      const mockCallback = vi.fn();
      render(<ConfigurationSuite onStartMarathon={mockCallback} />);

      fireEvent.click(screen.getByText('Addition'));
      const digitButtons = screen.getAllByText('1');
      fireEvent.click(digitButtons[0]); // Number A
      fireEvent.click(digitButtons[1]); // Number B

      const startButton = screen.getByText('Start Marathon');
      expect(startButton).toBeDisabled();
    });

    it('should enable start button when all parameters are selected', () => {
      const mockCallback = vi.fn();
      render(<ConfigurationSuite onStartMarathon={mockCallback} />);

      // Select all parameters
      fireEvent.click(screen.getByText('Addition'));
      const digitButtons = screen.getAllByText('2');
      fireEvent.click(digitButtons[0]); // Number A
      fireEvent.click(digitButtons[1]); // Number B
      fireEvent.click(screen.getByText('20'));
      fireEvent.click(screen.getByText('30s'));

      const startButton = screen.getByText('Start Marathon');
      expect(startButton).not.toBeDisabled();
    });
  });

  describe('Configuration Submission', () => {
    it('should call onStartMarathon with correct config when all parameters are selected', () => {
      const mockCallback = vi.fn();
      render(<ConfigurationSuite onStartMarathon={mockCallback} />);

      // Select all parameters
      fireEvent.click(screen.getByText('Multiplication'));
      const digitButtons = screen.getAllByText('3');
      fireEvent.click(digitButtons[0]); // Number A
      fireEvent.click(digitButtons[1]); // Number B
      fireEvent.click(screen.getByText('50'));
      fireEvent.click(screen.getByText('60s'));

      const startButton = screen.getByText('Start Marathon');
      fireEvent.click(startButton);

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith({
        subject: 'multiplication',
        digitCountA: 3,
        digitCountB: 3,
        volume: 50,
        speedLimit: 60,
      } as MarathonConfig);
    });

    it('should handle endless volume selection', () => {
      const mockCallback = vi.fn();
      render(<ConfigurationSuite onStartMarathon={mockCallback} />);

      // Select all parameters with endless volume
      fireEvent.click(screen.getByText('Division'));
      const digitButtons = screen.getAllByText('4');
      fireEvent.click(digitButtons[0]); // Number A
      fireEvent.click(digitButtons[1]); // Number B
      fireEvent.click(screen.getByText('∞'));
      fireEvent.click(screen.getByText('10s'));

      const startButton = screen.getByText('Start Marathon');
      fireEvent.click(startButton);

      expect(mockCallback).toHaveBeenCalledWith({
        subject: 'division',
        digitCountA: 4,
        digitCountB: 4,
        volume: 'endless',
        speedLimit: 10,
      } as MarathonConfig);
    });
  });

  describe('Visual Design System', () => {
    it('should apply selected state styling when option is clicked', () => {
      const mockCallback = vi.fn();
      render(<ConfigurationSuite onStartMarathon={mockCallback} />);

      const additionButton = screen.getByText('Addition').closest('button');
      fireEvent.click(additionButton!);

      expect(additionButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have minimum button dimensions (44x44px)', () => {
      const mockCallback = vi.fn();
      const { container } = render(<ConfigurationSuite onStartMarathon={mockCallback} />);

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        const styles = window.getComputedStyle(button);
        const minWidth = parseInt(styles.minWidth);
        const minHeight = parseInt(styles.minHeight);
        
        expect(minWidth).toBeGreaterThanOrEqual(44);
        expect(minHeight).toBeGreaterThanOrEqual(44);
      });
    });
  });

  describe('Parameter Selection State', () => {
    it('should allow changing subject selection', () => {
      const mockCallback = vi.fn();
      render(<ConfigurationSuite onStartMarathon={mockCallback} />);

      const additionButton = screen.getByText('Addition').closest('button');
      const subtractionButton = screen.getByText('Subtraction').closest('button');

      fireEvent.click(additionButton!);
      expect(additionButton).toHaveAttribute('aria-pressed', 'true');

      fireEvent.click(subtractionButton!);
      expect(subtractionButton).toHaveAttribute('aria-pressed', 'true');
      expect(additionButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should maintain independent state for Number A and Number B digit counts', () => {
      const mockCallback = vi.fn();
      render(<ConfigurationSuite onStartMarathon={mockCallback} />);

      // Select different digit counts for A and B
      fireEvent.click(screen.getByText('Addition'));
      const digitButtons = screen.getAllByText('2');
      fireEvent.click(digitButtons[0]); // Number A = 2
      
      const digit4Buttons = screen.getAllByText('4');
      fireEvent.click(digit4Buttons[1]); // Number B = 4

      fireEvent.click(screen.getByText('10'));
      fireEvent.click(screen.getByText('30s'));

      const startButton = screen.getByText('Start Marathon');
      fireEvent.click(startButton);

      expect(mockCallback).toHaveBeenCalledWith({
        subject: 'addition',
        digitCountA: 2,
        digitCountB: 4,
        volume: 10,
        speedLimit: 30,
      } as MarathonConfig);
    });
  });
});
