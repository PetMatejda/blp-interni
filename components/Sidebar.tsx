'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Clock, 
  Briefcase, 
  BarChart3, 
  Settings,
  LogOut,
  Receipt,
  X,
  Clapperboard
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { useAuth } from './AuthProvider';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: Clock, label: 'Docházka', href: '/attendance' },
  { icon: Briefcase, label: 'Úkoly & Projekty', href: '/tasks' },
  { icon: Receipt, label: 'Účtenky', href: '/receipts' },
  { icon: BarChart3, label: 'Reporty', href: '/reports' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { signOut, profile } = useAuth();
  const pathname = usePathname();
  const isAdmin = profile?.role === 'admin';

  const finalNavItems = [...navItems];
  if (isAdmin) {
    finalNavItems.push({ icon: Settings, label: 'Správa uživatelů', href: '/admin/users' });
  }

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.logo}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 'bold' }}>
          <Clapperboard size={28} strokeWidth={2.5} />
          <span style={{ fontSize: '1.4rem', letterSpacing: '1px' }}>B.L.P.</span>
        </div>
        {onClose && (
          <button className={styles.mobileClose} onClick={onClose}>
            <X size={20} />
          </button>
        )}
      </div>
      
      <nav className={styles.nav}>
        {finalNavItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`${styles.navLink} ${pathname === item.href ? styles.active : ''}`}
            onClick={onClose}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      
      <div className={styles.footer}>
        <button className={styles.navLink}>
          <Settings size={20} />
          <span>Nastavení</span>
        </button>
        <button 
          className={`${styles.navLink} ${styles.logout}`}
          onClick={() => signOut()}
        >
          <LogOut size={20} />
          <span>Odhlásit</span>
        </button>
      </div>
    </aside>
  );
}
