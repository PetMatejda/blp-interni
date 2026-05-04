'use client';

import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/AuthProvider";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const isLoginPage = pathname === '/login';

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#000',
        color: '#fff'
      }}>
        Načítání systému...
      </div>
    );
  }

  // If on login page, just show children
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If not logged in and not on login page, children will be empty because of AuthProvider redirect,
  // but we should still handle the layout carefully.
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="app-container">
      <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="main-content">
        <header className="main-header">
          <div className="header-content">
            <button className="mobile-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1>{
              pathname === '/' ? 'Dashboard' : 
              pathname === '/attendance' ? 'Docházka' : 
              pathname === '/tasks' ? 'Úkoly & Projekty' : 
              pathname === '/receipts' ? 'Účtenky' : 
              pathname === '/reports' ? 'Reporty' : 
              pathname === '/admin/users' ? 'Správa uživatelů' : 'Systém'
            }</h1>
            <div className="user-profile">
              <div className="avatar">
                {user.email?.substring(0, 2).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{user.user_metadata.full_name || user.email}</span>
                <span className="user-role">
                  {user.email?.toLowerCase() === 'petmatejda@gmail.com' ? 'Administrátor' : 'Zaměstnanec'}
                </span>
              </div>
            </div>
          </div>
        </header>
        <div className="content-wrapper">
          {children}
        </div>
      </main>
      
      <style jsx global>{`
        .app-container {
          display: flex;
          min-height: 100vh;
        }
        
        .main-content {
          flex: 1;
          margin-left: 260px;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        
        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--foreground);
          cursor: pointer;
          padding: 0.5rem;
          margin-right: 0.5rem;
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 45;
          backdrop-filter: blur(4px);
        }
        
        .main-header {
          height: 80px;
          background: var(--card);
          border-bottom: 1px solid var(--border);
          padding: 0 2rem;
          display: flex;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 40;
        }
        
        .header-content {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .user-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .avatar {
          width: 40px;
          height: 40px;
          background: var(--input);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: var(--primary);
          border: 1px solid var(--border);
        }
        
        .user-info {
          display: flex;
          flex-direction: column;
        }
        
        .user-name {
          font-weight: 600;
          font-size: 0.9rem;
        }
        
        .user-role {
          font-size: 0.75rem;
          color: var(--secondary);
        }
        
        .content-wrapper {
          padding: 2rem;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }
        
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
          }
          .mobile-toggle {
            display: block;
          }
          .sidebar-overlay.active {
            display: block;
          }
          .main-header {
            padding: 0 1rem;
          }
          .user-name {
            display: none;
          }
          .content-wrapper {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
