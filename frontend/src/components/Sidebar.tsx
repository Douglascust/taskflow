import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IconFolder, IconGitHub, IconLayout, IconSparkles } from './icons';
import './Sidebar.css';

const navItems = [
  { path: '/', label: 'Painel', icon: IconLayout },
  { path: '/repositories', label: 'Repositórios', icon: IconFolder },
  { path: '/assistant', label: 'Assistente IA', icon: IconSparkles },
  { path: '/integration', label: 'Integração', icon: IconGitHub },
];

interface SidebarProps {
  open: boolean;
  isMobile: boolean;
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, isMobile, onNavigate }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const expanded = isMobile ? true : open;

  return (
    <aside className={`sidebar ${open ? 'open' : 'collapsed'} ${isMobile ? 'mobile' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">TF</div>
          {expanded && <span className="logo-text">TaskFlow</span>}
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Principal">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${active ? 'active' : ''}`}
              onClick={onNavigate}
              title={item.label}
            >
              <span className="nav-icon">
                <Icon size={20} />
              </span>
              {expanded && <span className="nav-label">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
