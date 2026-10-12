import React from 'react';
import { IconAlert } from './icons';
import { Button } from './Button';
import './Feedback.css';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="feedback-state error">
      <div className="feedback-icon error">
        <IconAlert />
      </div>
      <h3>Não foi possível carregar</h3>
      <p className="text-muted">{message}</p>
      {onRetry && (
        <div className="feedback-action">
          <Button variant="secondary" onClick={onRetry}>
            Tentar novamente
          </Button>
        </div>
      )}
    </div>
  );
};
