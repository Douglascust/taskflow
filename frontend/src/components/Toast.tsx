import React, { useEffect, useRef } from 'react';

export interface ToastProps {
  message: string;
  variant?: 'success' | 'error' | 'info';
  /** Milissegundos até auto-fechar; 0 mantém o toast até `onClose`. */
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  variant = 'info',
  duration = 5000,
  onClose,
}) => {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => onCloseRef.current(), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div className="toast-container" role="status" aria-live="polite">
      <div className={`toast ${variant}`}>{message}</div>
    </div>
  );
};