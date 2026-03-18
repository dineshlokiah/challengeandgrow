import React from 'react';

interface StepperProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  label: string;
  unit?: string;
}

export const Stepper: React.FC<StepperProps> = ({ value, min, max, step, onChange, label, unit }) => {
  const decrement = () => {
    const next = Math.max(min, value - step);
    if (next !== value) onChange(next);
  };

  const increment = () => {
    const next = Math.min(max, value + step);
    if (next !== value) onChange(next);
  };

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
      aria-label={label}
    >
      <button
        onClick={decrement}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
        style={{
          minWidth: '44px',
          minHeight: '44px',
          fontSize: '20px',
          fontWeight: 'bold',
          backgroundColor: value <= min ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
          color: value <= min ? 'rgba(255,255,255,0.3)' : '#ffffff',
          border: '2px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          cursor: value <= min ? 'not-allowed' : 'pointer',
        }}
      >
        −
      </button>
      <span style={{
        minWidth: '64px',
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#FF8C00',
        fontFamily: "'Quicksand', sans-serif",
      }}>
        {value}{unit ?? ''}
      </span>
      <button
        onClick={increment}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
        style={{
          minWidth: '44px',
          minHeight: '44px',
          fontSize: '20px',
          fontWeight: 'bold',
          backgroundColor: value >= max ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
          color: value >= max ? 'rgba(255,255,255,0.3)' : '#ffffff',
          border: '2px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          cursor: value >= max ? 'not-allowed' : 'pointer',
        }}
      >
        +
      </button>
    </div>
  );
};
