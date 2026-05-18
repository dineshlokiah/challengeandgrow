/**
 * ConfigurationSuite Component
 * Pre-race setup interface for selecting marathon parameters
 */
import React, { useState, useEffect, useRef } from 'react';
import type { MarathonConfig, Subject, AnswerMode } from '../types';
import { Stepper } from './Stepper';

interface ConfigurationSuiteProps {
  onStartMarathon: (config: MarathonConfig) => void;
}

type PresetVolume = 10 | 20 | 50 | 'endless';
type PresetSpeed = 10 | 30 | 60;
type PresetDigit = 1 | 2 | 3 | 4;

const OPERATION_COLORS: Record<Subject, string> = {
  'addition':                 '#4CAF50',
  'subtraction':              '#F44336',
  'multiplication':           '#9C27B0',
  'division':                 '#2196F3',
  'greater-than-lesser-than': '#FF9800',
  'fill-the-missing-number':  '#009688',
  'counting':                 '#E91E63',
  'number-bonds':             '#3F51B5',
  'skip-counting':            '#FFC107',
  'rounding':                 '#607D8B',
  'even-or-odd':              '#795548',
  'prime-or-not':             '#00BCD4',
};

const STEPS = {
  SUBJECT:  0,
  FILL_OPS: 1,
  DIGIT_A:  2,
  DIGIT_B:  3,
  VOLUME:   4,
  SPEED:    5,
  ANSWER:   6,
  DECIMALS: 7,
} as const;

const SUBJECT_OPTIONS: { value: Subject; label: string; icon: string }[] = [
  { value: 'addition',                 label: 'Addition',    icon: '➕' },
  { value: 'subtraction',              label: 'Subtraction', icon: '➖' },
  { value: 'multiplication',           label: 'Multiply',    icon: '✖️' },
  { value: 'division',                 label: 'Division',    icon: '➗' },
  { value: 'greater-than-lesser-than', label: 'Compare',     icon: '⚖️' },
  { value: 'fill-the-missing-number',  label: 'Fill Gap',    icon: '🧩' },
  { value: 'counting',                 label: 'Counting',    icon: '🧮' },
  { value: 'number-bonds',             label: 'Number Bonds',icon: '🔗' },
  { value: 'skip-counting',            label: 'Skip Count',  icon: '⏭️' },
  { value: 'rounding',                 label: 'Rounding',    icon: '🎯' },
  { value: 'even-or-odd',              label: 'Even or Odd', icon: '🎲' },
  { value: 'prime-or-not',             label: 'Prime or Not',icon: '🔎' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// ─── SubjectGrid ──────────────────────────────────────────────────────────────

interface SubjectGridProps {
  selected: Subject | null;
  onSelect: (s: Subject) => void;
}

const SubjectGrid: React.FC<SubjectGridProps> = ({ selected, onSelect }) => {
  const [bouncingSubject, setBouncingSubject] = useState<Subject | null>(null);
  const [cols, setCols] = useState<number>(window.innerWidth < 480 ? 2 : 3);

  useEffect(() => {
    const handleResize = () => {
      setCols(window.innerWidth < 480 ? 2 : 3);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClick = (value: Subject) => {
    onSelect(value);
    setBouncingSubject(value);
    setTimeout(() => setBouncingSubject(null), 300);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '12px',
        width: '100%',
      }}
    >
      {SUBJECT_OPTIONS.map((s) => {
        const color = OPERATION_COLORS[s.value];
        const isSelected = selected === s.value;
        const isBouncing = bouncingSubject === s.value;

        return (
          <button
            key={s.value}
            className={isBouncing ? 'bounce' : undefined}
            onClick={() => handleClick(s.value)}
            aria-pressed={isSelected}
            style={{
              minWidth: '80px',
              minHeight: '80px',
              padding: '12px 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              borderRadius: '16px',
              border: `4px solid ${color}`,
              background: isSelected ? color : hexToRgba(color, 0.2),
              cursor: 'pointer',
              outline: 'none',
              transition: 'background 150ms ease',
              boxShadow: '4px 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = `2px solid ${color}`;
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
              e.currentTarget.style.outlineOffset = '0px';
            }}
          >
            <span style={{ fontSize: '32px', lineHeight: '1' }}>{s.icon}</span>
            <span
              style={{
                fontFamily: "'Quicksand', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
              }}
            >
              {s.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// ─── NeumorphicButton ─────────────────────────────────────────────────────────

const neumorphicStyle: React.CSSProperties = {
  boxShadow: '4px 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
  transition: 'box-shadow 150ms ease, transform 150ms ease',
};

const neumorphicActiveStyle: React.CSSProperties = {
  boxShadow: 'none',
  transform: 'translateY(4px)',
};

interface NeumorphicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({ style, children, ...props }) => {
  const [pressed, setPressed] = useState(false);

  const pressHandlers = {
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
    onMouseLeave: () => setPressed(false),
    onTouchStart: () => setPressed(true),
    onTouchEnd: () => setPressed(false),
  };

  return (
    <button
      {...props}
      {...pressHandlers}
      style={{
        ...style,
        ...neumorphicStyle,
        ...(pressed ? neumorphicActiveStyle : {}),
      }}
    >
      {children}
    </button>
  );
};

// ─── DecimalToggle ────────────────────────────────────────────────────────────

interface DecimalToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
  accentColor: string;
}

const DecimalToggle: React.FC<DecimalToggleProps> = ({ value, onChange, accentColor }) => {
  return (
    <button
      role="switch"
      aria-checked={value}
      aria-label={`Decimal numbers toggle, currently ${value ? 'on' : 'off'}`}
      onClick={() => onChange(!value)}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '12px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
      }}
    >
      <span
        style={{
          fontFamily: "'Quicksand', sans-serif",
          fontSize: '14px',
          fontWeight: 600,
          color: value ? 'rgba(255,255,255,0.5)' : '#ffffff',
        }}
      >
        Whole Numbers
      </span>

      {/* Track */}
      <div
        style={{
          width: '48px',
          height: '28px',
          borderRadius: '14px',
          background: value ? accentColor : 'rgba(255,255,255,0.2)',
          position: 'relative',
          flexShrink: 0,
          transition: 'background 200ms ease',
        }}
      >
        {/* Thumb */}
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'white',
            position: 'absolute',
            top: '2px',
            left: '0',
            transition: 'transform 200ms ease',
            transform: value ? 'translateX(22px)' : 'translateX(2px)',
          }}
        />
      </div>

      <span
        style={{
          fontFamily: "'Quicksand', sans-serif",
          fontSize: '14px',
          fontWeight: 600,
          color: value ? '#ffffff' : 'rgba(255,255,255,0.5)',
        }}
      >
        With Decimals
      </span>
    </button>
  );
};

// ─── StickyStartBar ──────────────────────────────────────────────────────────

interface StickyStartBarProps {
  isComplete: boolean;
  accentColor: string;
  onStart: () => void;
}

const StickyStartBar: React.FC<StickyStartBarProps> = ({ isComplete, accentColor, onStart }) => {
  const [pressed, setPressed] = useState(false);

  const buttonBg = isComplete ? accentColor : hexToRgba(accentColor, 0.4);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '12px 20px',
        background: 'rgba(20,20,40,0.95)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <button
        onClick={isComplete ? onStart : undefined}
        disabled={!isComplete}
        aria-disabled={!isComplete}
        onMouseDown={() => isComplete && setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        onTouchStart={() => isComplete && setPressed(true)}
        onTouchEnd={() => setPressed(false)}
        style={{
          width: '100%',
          minHeight: '52px',
          fontFamily: "'Fredoka One', cursive, sans-serif",
          fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
          color: '#ffffff',
          background: buttonBg,
          border: 'none',
          borderRadius: '12px',
          cursor: isComplete ? 'pointer' : 'not-allowed',
          opacity: isComplete ? 1 : 0.4,
          pointerEvents: isComplete ? 'auto' : 'none',
          transform: pressed ? 'translateY(4px)' : 'none',
          boxShadow: pressed ? 'none' : '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'background 150ms ease',
        }}
      >
        Start Marathon 🚀
      </button>
    </div>
  );
};

// ─── SettingsCard ────────────────────────────────────────────────────────────

interface SettingsCardProps {
  label: string;
  visible: boolean;
  accentColor: string;
  children: React.ReactNode;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ label, visible, accentColor, children }) => {
  const [animated, setAnimated] = useState(false);
  const prevVisible = useRef(false);

  useEffect(() => {
    if (visible && !prevVisible.current) {
      setAnimated(true);
    }
    prevVisible.current = visible;
  }, [visible]);

  return (
    <div
      className={animated ? 'fade-slide-in' : undefined}
      style={{
        display: visible ? undefined : 'none',
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.10)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
        padding: '20px 16px',
        marginBottom: '20px',
        borderLeft: `4px solid ${accentColor}`,
      }}
    >
      <h2
        style={{
          fontFamily: "'Fredoka One', cursive, sans-serif",
          fontSize: '16px',
          color: '#ffffff',
          marginBottom: '12px',
          marginTop: 0,
        }}
      >
        {label}
      </h2>
      {children}
    </div>
  );
};

const isDigitsHidden = (s: Subject | null) => 
  s === 'counting' || s === 'number-bonds' || s === 'skip-counting' || 
  s === 'rounding' || s === 'even-or-odd' || s === 'prime-or-not';

const isAnswerModeHidden = (s: Subject | null) => 
  s === 'even-or-odd' || s === 'prime-or-not';

// ─── ConfigurationSuite ───────────────────────────────────────────────────────

const ConfigurationSuite: React.FC<ConfigurationSuiteProps> = ({ onStartMarathon }) => {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [fillOperations, setFillOperations] = useState<Set<'addition' | 'subtraction' | 'multiplication' | 'division'>>(
    new Set(['addition', 'subtraction', 'multiplication', 'division'])
  );
  const [revealedStep, setRevealedStep] = useState<number>(0);

  // Digit counts
  const [digitCountA, setDigitCountA] = useState<number | null>(null);
  const [digitCountB, setDigitCountB] = useState<number | null>(null);
  const [customDigitA, setCustomDigitA] = useState<string>('');
  const [customDigitB, setCustomDigitB] = useState<string>('');

  // Volume
  const [presetVolume, setPresetVolume] = useState<PresetVolume | null>(null);
  const [customVolume, setCustomVolume] = useState<number>(10);
  const [useCustomVolume, setUseCustomVolume] = useState(false);

  // Speed
  const [presetSpeed, setPresetSpeed] = useState<PresetSpeed | null>(null);
  const [customSpeed, setCustomSpeed] = useState<number>(15);
  const [useCustomSpeed, setUseCustomSpeed] = useState(false);

  // Answer mode & decimals
  const [answerMode, setAnswerMode] = useState<AnswerMode | null>(null);
  const [allowDecimals, setAllowDecimals] = useState(false);

  const volume = useCustomVolume ? customVolume : presetVolume;
  const speedLimit = useCustomSpeed ? customSpeed : presetSpeed;

  const accentColor = subject ? OPERATION_COLORS[subject] : '#FF8C00';

  const isConfigComplete =
    subject !== null &&
    (subject !== 'fill-the-missing-number' || fillOperations.size > 0) &&
    (isDigitsHidden(subject) || (digitCountA !== null && digitCountB !== null)) &&
    volume !== null &&
    speedLimit !== null &&
    (isAnswerModeHidden(subject) || answerMode !== null);

  const handleStartMarathon = () => {
    if (isConfigComplete) {
      onStartMarathon({
        subject: subject!,
        digitCountA: digitCountA ?? 1,
        digitCountB: digitCountB ?? 1,
        volume: volume!,
        speedLimit: speedLimit!,
        answerMode: answerMode ?? 'multiple-choice',
        allowDecimals,
        ...(subject === 'fill-the-missing-number' && { fillOperations: Array.from(fillOperations) }),
      });
    }
  };

  const clampDigit = (val: string): number => Math.min(6, Math.max(1, parseInt(val) || 1));

  const handleCustomDigitA = (val: string) => {
    setCustomDigitA(val);
    if (val !== '') {
      setDigitCountA(clampDigit(val));
      setRevealedStep(prev => Math.max(prev, STEPS.DIGIT_A + 1));
    }
  };

  const handleCustomDigitB = (val: string) => {
    setCustomDigitB(val);
    if (val !== '') {
      setDigitCountB(clampDigit(val));
      setRevealedStep(prev => Math.max(prev, STEPS.DIGIT_B + 1));
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>challengeandgrow</h1>
      <p style={styles.subtitle}>Configure Your Math Marathon</p>
      <p style={styles.privacyNote}>
        🔒 Your data never leaves your device — we do not send your data to our servers.
      </p>


      <div style={styles.configSection}>

        {/* Subject — always visible, no SettingsCard wrapper */}
        <div style={styles.parameterGroup}>
          <h2 style={styles.parameterLabel}>Subject</h2>
          <SubjectGrid
            selected={subject}
            onSelect={(s) => {
              setSubject(s);
              if (isAnswerModeHidden(s)) {
                setAnswerMode('multiple-choice');
              }
              let nextStep = STEPS.SUBJECT + 1;
              if (s !== 'fill-the-missing-number' && nextStep === STEPS.FILL_OPS) {
                 nextStep = STEPS.DIGIT_A;
              }
              if (isDigitsHidden(s)) {
                 nextStep = Math.max(nextStep, STEPS.VOLUME);
              }
              setRevealedStep(prev => Math.max(prev, nextStep));
            }}
          />
        </div>

        {/* Fill Operations */}
        {subject === 'fill-the-missing-number' && (
          <SettingsCard label="Allowed Operations" visible={revealedStep >= STEPS.FILL_OPS} accentColor={accentColor}>
            <div style={{ ...styles.buttonGrid, gridTemplateColumns: '1fr 1fr' }}>
              {(['addition', 'subtraction', 'multiplication', 'division'] as const).map((op) => (
                <NeumorphicButton
                  key={op}
                  onClick={() => {
                    const next = new Set(fillOperations);
                    if (next.has(op)) next.delete(op);
                    else next.add(op);
                    setFillOperations(next);
                    setRevealedStep(prev => Math.max(prev, STEPS.DIGIT_A));
                  }}
                  style={{
                    ...styles.optionButton,
                    ...(fillOperations.has(op) ? styles.selected : {})
                  }}
                  aria-pressed={fillOperations.has(op)}
                >
                  {op.charAt(0).toUpperCase() + op.slice(1)}
                </NeumorphicButton>
              ))}
            </div>
          </SettingsCard>
        )}

        {/* Number A Digits */}
        {!isDigitsHidden(subject) && (
        <SettingsCard label="Number A Digits" visible={revealedStep >= STEPS.DIGIT_A} accentColor={accentColor}>
          <div style={styles.buttonGrid}>
            {([1, 2, 3, 4] as PresetDigit[]).map((d) => (
              <NeumorphicButton
                key={d}
                onClick={() => { setDigitCountA(d); setCustomDigitA(''); setRevealedStep(prev => Math.max(prev, STEPS.DIGIT_A + 1)); }}
                style={{ ...styles.optionButton, ...(digitCountA === d && customDigitA === '' ? styles.selected : {}) }}
                aria-pressed={digitCountA === d && customDigitA === ''}
              >
                {d}
              </NeumorphicButton>
            ))}
            <div style={styles.customInputWrap}>
              <input
                type="number"
                min={1}
                max={6}
                placeholder="5–6"
                value={customDigitA}
                onChange={(e) => handleCustomDigitA(e.target.value)}
                onBlur={(e) => {
                  if (e.target.value !== '') {
                    const clamped = clampDigit(e.target.value);
                    setCustomDigitA(String(clamped));
                    setDigitCountA(clamped);
                  }
                }}
                style={styles.customInput}
                aria-label="Custom digit count for Number A"
              />
            </div>
          </div>
        </SettingsCard>
        )}

        {/* Number B Digits */}
        {!isDigitsHidden(subject) && (
        <SettingsCard label="Number B Digits" visible={revealedStep >= STEPS.DIGIT_B} accentColor={accentColor}>
          <div style={styles.buttonGrid}>
            {([1, 2, 3, 4] as PresetDigit[]).map((d) => (
              <NeumorphicButton
                key={d}
                onClick={() => { setDigitCountB(d); setCustomDigitB(''); setRevealedStep(prev => Math.max(prev, STEPS.DIGIT_B + 1)); }}
                style={{ ...styles.optionButton, ...(digitCountB === d && customDigitB === '' ? styles.selected : {}) }}
                aria-pressed={digitCountB === d && customDigitB === ''}
              >
                {d}
              </NeumorphicButton>
            ))}
            <div style={styles.customInputWrap}>
              <input
                type="number"
                min={1}
                max={6}
                placeholder="5–6"
                value={customDigitB}
                onChange={(e) => handleCustomDigitB(e.target.value)}
                onBlur={(e) => {
                  if (e.target.value !== '') {
                    const clamped = clampDigit(e.target.value);
                    setCustomDigitB(String(clamped));
                    setDigitCountB(clamped);
                  }
                }}
                style={styles.customInput}
                aria-label="Custom digit count for Number B"
              />
            </div>
          </div>
        </SettingsCard>
        )}

        {/* Number of Questions */}
        <SettingsCard label="Number of Questions" visible={revealedStep >= STEPS.VOLUME} accentColor={accentColor}>
          <div style={styles.inlineRow}>
            {([10, 20, 50] as PresetVolume[]).map((v) => (
              <NeumorphicButton
                key={v}
                onClick={() => { setPresetVolume(v); setUseCustomVolume(false); setRevealedStep(prev => Math.max(prev, STEPS.VOLUME + 1)); }}
                style={{ ...styles.optionButton, ...styles.compactButton, ...(!useCustomVolume && presetVolume === v ? styles.selected : {}) }}
                aria-pressed={!useCustomVolume && presetVolume === v}
              >
                {v}
              </NeumorphicButton>
            ))}
            <NeumorphicButton
              onClick={() => { setPresetVolume('endless'); setUseCustomVolume(false); setRevealedStep(prev => Math.max(prev, STEPS.VOLUME + 1)); }}
              style={{ ...styles.optionButton, ...styles.compactButton, ...(!useCustomVolume && presetVolume === 'endless' ? styles.selected : {}) }}
              aria-pressed={!useCustomVolume && presetVolume === 'endless'}
            >
              ∞
            </NeumorphicButton>
            <div style={styles.inlineStepper}>
              <Stepper
                value={customVolume}
                min={1}
                max={999}
                step={1}
                label="Custom question count"
                onChange={(v) => { setCustomVolume(v); setUseCustomVolume(true); setPresetVolume(null); setRevealedStep(prev => Math.max(prev, STEPS.VOLUME + 1)); }}
              />
            </div>
          </div>
        </SettingsCard>

        {/* Time Per Question */}
        <SettingsCard label="Time Per Question" visible={revealedStep >= STEPS.SPEED} accentColor={accentColor}>
          <div style={styles.inlineRow}>
            {([10, 30, 60] as PresetSpeed[]).map((s) => (
              <NeumorphicButton
                key={s}
                onClick={() => { setPresetSpeed(s); setUseCustomSpeed(false); setRevealedStep(prev => Math.max(prev, STEPS.SPEED + 1)); }}
                style={{ ...styles.optionButton, ...styles.compactButton, ...(!useCustomSpeed && presetSpeed === s ? styles.selected : {}) }}
                aria-pressed={!useCustomSpeed && presetSpeed === s}
              >
                {s}s
              </NeumorphicButton>
            ))}
            <div style={styles.inlineStepper}>
              <Stepper
                value={customSpeed}
                min={5}
                max={300}
                step={5}
                unit="s"
                label="Custom time per question"
                onChange={(v) => { setCustomSpeed(v); setUseCustomSpeed(true); setPresetSpeed(null); setRevealedStep(prev => Math.max(prev, STEPS.SPEED + 1)); }}
              />
            </div>
          </div>
        </SettingsCard>

        {/* Answer Mode */}
        {!isAnswerModeHidden(subject) && (
        <SettingsCard label="Answer Mode" visible={revealedStep >= STEPS.ANSWER} accentColor={accentColor}>
          <div style={styles.buttonGrid}>
            <NeumorphicButton
              onClick={() => { setAnswerMode('multiple-choice'); setRevealedStep(prev => Math.max(prev, STEPS.ANSWER + 1)); }}
              style={{ ...styles.optionButton, ...(answerMode === 'multiple-choice' ? styles.selected : {}) }}
              aria-pressed={answerMode === 'multiple-choice'}
            >
              <span style={{ fontSize: '18px' }}>🔘</span>
              <span style={styles.optionLabel}>Multiple Choice</span>
            </NeumorphicButton>
            <NeumorphicButton
              onClick={() => { setAnswerMode('fill-in-the-blank'); setRevealedStep(prev => Math.max(prev, STEPS.ANSWER + 1)); }}
              style={{ ...styles.optionButton, ...(answerMode === 'fill-in-the-blank' ? styles.selected : {}) }}
              aria-pressed={answerMode === 'fill-in-the-blank'}
            >
              <span style={{ fontSize: '18px' }}>✏️</span>
              <span style={styles.optionLabel}>Fill in Blank</span>
            </NeumorphicButton>
          </div>
        </SettingsCard>
        )}

        {/* Decimal Numbers */}
        {!isDigitsHidden(subject) && (
        <SettingsCard label="Decimal Numbers" visible={revealedStep >= STEPS.DECIMALS} accentColor={accentColor}>
          <DecimalToggle
            value={allowDecimals}
            onChange={(v) => { setAllowDecimals(v); setRevealedStep(prev => Math.max(prev, STEPS.DECIMALS + 1)); }}
            accentColor={accentColor}
          />
        </SettingsCard>
        )}

      </div>

      <StickyStartBar
        isComplete={isConfigComplete}
        accentColor={accentColor}
        onStart={handleStartMarathon}
      />
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    paddingBottom: '80px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    fontFamily: "'Fredoka One', cursive, sans-serif",
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    color: '#FF8C00',
    marginBottom: '0.5rem',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: "'Quicksand', sans-serif",
    fontSize: 'clamp(1rem, 3vw, 1.5rem)',
    color: '#ffffff',
    marginBottom: '0.5rem',
    textAlign: 'center',
  },
  privacyNote: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '1.5rem',
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    border: '1px solid rgba(46, 204, 113, 0.3)',
    borderRadius: '6px',
    padding: '6px 12px',
    textAlign: 'center',
  },
  configSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    marginBottom: '2rem',
  },
  parameterGroup: { width: '100%' },
  parameterLabel: {
    fontFamily: "'Fredoka One', cursive, sans-serif",
    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '12px',
    textAlign: 'center',
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
    gap: '12px',
    width: '100%',
  },
  optionButton: {
    minWidth: '44px',
    minHeight: '44px',
    padding: '12px 16px',
    fontFamily: "'Quicksand', sans-serif",
    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
    fontWeight: 600,
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
  selected: {
    backgroundColor: '#FF8C00',
    borderColor: '#FF8C00',
    transform: 'scale(1.05)',
  },
  optionLabel: {
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    fontWeight: 400,
  },
  customInputWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customInput: {
    width: '100%',
    minHeight: '44px',
    padding: '8px 12px',
    fontSize: '16px',
    fontFamily: "'Quicksand', sans-serif",
    fontWeight: 600,
    color: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '2px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    textAlign: 'center',
    outline: 'none',
  },
  customLabel: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subjectButton: {
    minHeight: '80px',
    padding: '14px 10px',
    borderRadius: '16px',
    background: 'linear-gradient(145deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
  },
  subjectIcon: {
    fontSize: '32px',
    lineHeight: '1',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
  },
  subjectLabel: {
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    fontWeight: 600,
    marginTop: '4px',
  },
  inlineRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
    width: '100%',
    alignItems: 'center',
  },
  compactButton: {
    flex: '0 0 auto',
    minWidth: '56px',
    padding: '10px 12px',
  },
  inlineStepper: {
    flex: '1 1 160px',
    minWidth: '160px',
  },
  startButton: {
    minWidth: '200px',
    minHeight: '44px',
    padding: '16px 32px',
    fontFamily: "'Fredoka One', cursive",
    fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
    color: '#ffffff',
    backgroundColor: '#FF8C00',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '1rem',
  },
  startButtonDisabled: {
    backgroundColor: 'rgba(255, 140, 0, 0.3)',
    cursor: 'not-allowed',
    opacity: 0.5,
  },
};

export default ConfigurationSuite;
