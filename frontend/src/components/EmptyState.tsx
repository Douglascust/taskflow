import React from 'react';
import { IconInbox } from './icons';
import './Feedback.css';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => {
  return (
    <div className="feedback-state">
      <div className="feedback-icon">
        <IconInbox />
      </div>
      <h3>{title}</h3>
      {description && <p className="text-muted">{description}</p>}
      {action && <div className="feedback-action">{action}</div>}
    </div>
  );
};
