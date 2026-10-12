import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input className={`input ${error ? 'input-error' : ''} ${className}`.trim()} {...props} />
      {error && (
        <span className="error-text" style={{ color: 'var(--color-error)', fontSize: '0.75rem' }}>
          {error}
        </span>
      )}
    </div>
  );
};
