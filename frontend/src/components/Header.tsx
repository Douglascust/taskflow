import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IconMenu } from './icons';
import './Header.css';

interface HeaderProps {
  toggleSidebar: () => void;
}

const titles: { match: (path: string) => boolean; crumbs: { label: string; to?: string }[] }[] = [
  { match: (p) => p === '/', crumbs: [{ label: 'Painel' }] },
  {
    match: (p) => p.startsWith('/repositories/') && p !== '/repositories',
    crumbs: [
      { label: 'Repositórios', to: '/repositories' },
      { label: 'Detalhes' },
    ],
  },
  { match: (p) => p === '/repositories', crumbs: [{ label: 'Repositórios' }] },
  { match: (p) => p === '/assistant', crumbs: [{ label: 'Assistente IA' }] },
  { match: (p) => p === '/integration', crumbs: [{ label: 'Integração' }] },
  { match: () => true, crumbs: [{ label: 'Página não encontrada' }] },
];

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { pathname } = useLocation();
  const entry = titles.find((t) => t.match(pathname));
  const crumbs = entry?.crumbs ?? [{ label: 'TaskFlow' }];

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          type="button"
          aria-label="Alternar menu"
        >
          <IconMenu />
        </button>
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/" className="breadcrumb-item">
            TaskFlow
          </Link>
          {crumbs.map((crumb, i) => (
            <React.Fragment key={`${crumb.label}-${i}`}>
              <span className="breadcrumb-separator">/</span>
              {crumb.to ? (
                <Link to={crumb.to} className="breadcrumb-item">
                  {crumb.label}
                </Link>
              ) : (
                <span className="breadcrumb-item active">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>
    </header>
  );
};
