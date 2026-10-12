import React from 'react';

interface BadgeProps {
  type?: 'success' | 'warning' | 'error' | 'info' | 'muted';
  children: React.ReactNode;
  onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({ type = 'muted', children, onClick }) => {
  const className = `badge badge-${type}${onClick ? ' badge-clickable' : ''}`;
  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {children}
      </button>
    );
  }
  return <span className={className}>{children}</span>;
};
