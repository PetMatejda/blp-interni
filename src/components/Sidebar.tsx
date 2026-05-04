'use client';

import Link from 'next/link';
import { 
  Home, 
  Clock, 
  FileText, 
  Briefcase, 
  BarChart3, 
  Settings,
  LogOut,
  Receipt
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { useAuth } from './AuthProvider';

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: Clock, label: 'Docházka', href: '/attendance' },
  { icon: Briefcase, label: 'Úkoly & Projekty', href: '/tasks' },
  { icon: Receipt, label: 'Účtenky', href: '/receipts' },
  { icon: BarChart3, label: 'Reporty', href: '/reports' },
];

export default function Sidebar() {
  const { signOut } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>BLP</div>
        <span className={styles.logoText}>Interní</span>
      </div>
      
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={styles.navLink}>
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
