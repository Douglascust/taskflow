import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import './Layout.css';

const MOBILE_BREAKPOINT = 768;

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT
  );
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth > MOBILE_BREAKPOINT : true
  );

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen((open) => !open);
  const closeMobile = () => {
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div className={`app-shell ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {isMobile && sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeMobile} aria-hidden="true" />
      )}
      <Sidebar open={sidebarOpen} isMobile={isMobile} onNavigate={closeMobile} />
      <div className="app-main">
        <Header toggleSidebar={toggleSidebar} />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
};
