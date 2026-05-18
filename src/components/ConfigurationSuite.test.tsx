/**
 * Unit tests for the redesigned ConfigurationSuite component
 * Validates: Requirements 3.1, 3.8, 4.1, 4.5, 5.1, 6.1, 6.2, 6.6
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ConfigurationSuite from './ConfigurationSuite';

const noop = vi.fn();

function getSettingsCard(heading: string): HTMLElement {
  const h2 = screen.getByText(heading, { selector: 'h2' });
  return h2.parentElement as HTMLElement;
}

function clickInCard(heading: string, buttonText: string) {
  const card = getSettingsCard(heading);
  fireEvent.click(within(card).getByText(buttonText));
}

function completeWizardThroughAnswerMode() {
  fireEvent.click(screen.getByText('Addition'));
  clickInCard('Number A Digits', '2');
  clickInCard('Number B Digits', '2');
  clickInCard('Number of Questions', '20');
  clickInCard('Time Per Question', '30s');
  clickInCard('Answer Mode', 'Multiple Choice');
}

describe('ConfigurationSuite redesigned UI', () => {

  describe('Test 1 Initial render only subject section visible', () => {
    it('shows the Subject section on first render', () => {
      render(<ConfigurationSuite onStartMarathon={noop} />);
      expect(screen.getByText('Subject')).toBeInTheDocument();
    });

    it('hides all non-subject SettingsCard sections on first render', () => {
      render(<ConfigurationSuite onStartMarathon={noop} />);
      const hiddenHeadings = [
        'Number A Digits', 'Number B Digits', 'Number of Questions',
        'Time Per Question', 'Answer Mode', 'Decimal Numbers',
      ];
      for (const heading of hiddenHeadings) {
        expect(getSettingsCard(heading).style.display).toBe('none');
      }
    });
  });

  describe('Test 2 Sticky bar has position fixed and bottom 0', () => {
    it('renders the sticky footer with position fixed and bottom 0', () => {
      const { container } = render(<ConfigurationSuite onStartMarathon={noop} />);
      const fixedBottomDivs = Array.from(container.querySelectorAll('div[style]')).filter((el) => {
        const s = (el as HTMLElement).style;
        return s.position === 'fixed' && s.bottom === '0px';
      });
      expect(fixedBottomDivs.length).toBeGreaterThan(0);
    });
  });

  describe('Test 3 Content area has paddingBottom at least 52px', () => {
    it('applies paddingBottom of at least 52px to the scrollable container', () => {
      const { container } = render(<ConfigurationSuite onStartMarathon={noop} />);
      const outerDiv = container.firstElementChild as HTMLElement;
      expect(parseInt(outerDiv.style.paddingBottom, 10)).toBeGreaterThanOrEqual(52);
    });
  });

  describe('Test 4 Decimal section renders a toggle element not two buttons', () => {
    it('renders a role switch element inside the Decimal Numbers card', () => {
      render(<ConfigurationSuite onStartMarathon={noop} />);
      completeWizardThroughAnswerMode();
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('renders exactly one switch element for the decimal choice', () => {
      render(<ConfigurationSuite onStartMarathon={noop} />);
      completeWizardThroughAnswerMode();
      expect(screen.getAllByRole('switch')).toHaveLength(1);
    });
  });

  describe('Test 5 Toggle labels Whole Numbers and With Decimals are both present', () => {
    it('shows Whole Numbers label when Decimal Numbers card is visible', () => {
      render(<ConfigurationSuite onStartMarathon={noop} />);
      completeWizardThroughAnswerMode();
      expect(screen.getByText('Whole Numbers')).toBeInTheDocument();
    });

    it('shows With Decimals label when Decimal Numbers card is visible', () => {
      render(<ConfigurationSuite onStartMarathon={noop} />);
      completeWizardThroughAnswerMode();
      expect(screen.getByText('With Decimals')).toBeInTheDocument();
    });
  });

  describe('Test 6 Toggle thumb has a CSS transition including 200ms', () => {
    it('applies a transition with 200ms to the toggle thumb div', () => {
      const { container } = render(<ConfigurationSuite onStartMarathon={noop} />);
      completeWizardThroughAnswerMode();
      const allDivs = Array.from(container.querySelectorAll('div[style]')) as HTMLElement[];
      const thumbDiv = allDivs.find((el) => el.style.transition.includes('200ms'));
      expect(thumbDiv).toBeDefined();
    });
  });

  describe('Test 7 The 6 non-subject sections are wrapped in SettingsCard containers', () => {
    it('renders h2 headings for all 6 non-subject SettingsCard sections', () => {
      render(<ConfigurationSuite onStartMarathon={noop} />);
      const expectedHeadings = [
        'Number A Digits', 'Number B Digits', 'Number of Questions',
        'Time Per Question', 'Answer Mode', 'Decimal Numbers',
      ];
      for (const heading of expectedHeadings) {
        expect(screen.getByText(heading, { selector: 'h2' })).toBeInTheDocument();
      }
    });

    it('renders SettingsCard headings with Fredoka One font at 16px', () => {
      render(<ConfigurationSuite onStartMarathon={noop} />);
      const h2 = screen.getByText('Number A Digits', { selector: 'h2' });
      expect(h2.style.fontFamily).toContain('Fredoka One');
      expect(h2.style.fontSize).toBe('16px');
    });
  });

  describe('Test 8 Sticky button disabled when config incomplete enabled when complete', () => {
    it('is disabled on initial render', () => {
      render(<ConfigurationSuite onStartMarathon={noop} />);
      expect(screen.getByText(/Start Marathon/)).toBeDisabled();
    });

    it('is disabled after selecting only the subject', () => {
      render(<ConfigurationSuite onStartMarathon={noop} />);
      fireEvent.click(screen.getByText('Addition'));
      expect(screen.getByText(/Start Marathon/)).toBeDisabled();
    });

    it('is enabled when all required fields are selected', () => {
      render(<ConfigurationSuite onStartMarathon={noop} />);
      completeWizardThroughAnswerMode();
      expect(screen.getByText(/Start Marathon/)).not.toBeDisabled();
    });

    it('calls onStartMarathon when clicked in the enabled state', () => {
      const mockStart = vi.fn();
      render(<ConfigurationSuite onStartMarathon={mockStart} />);
      completeWizardThroughAnswerMode();
      fireEvent.click(screen.getByText(/Start Marathon/));
      expect(mockStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('Test 9 Changing an already-selected subject does not hide downstream sections', () => {
    it('keeps downstream SettingsCards visible after subject change', () => {
      render(<ConfigurationSuite onStartMarathon={noop} />);
      completeWizardThroughAnswerMode();

      expect(getSettingsCard('Decimal Numbers').style.display).not.toBe('none');

      fireEvent.click(screen.getByText('Subtraction'));

      const headingsToCheck = [
        'Number A Digits', 'Number B Digits', 'Number of Questions',
        'Time Per Question', 'Answer Mode', 'Decimal Numbers',
      ];
      for (const heading of headingsToCheck) {
        expect(getSettingsCard(heading).style.display).not.toBe('none');
      }
    });
  });

});
