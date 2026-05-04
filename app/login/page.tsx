'use client';

import { useAuth } from '@/components/AuthProvider';
import styles from './page.module.css';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const { signInWithGoogle, loading } = useAuth();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
      alert('Přihlášení se nezdařilo. Zkontrolujte konzoli pro detaily.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.logo}>
          <img src="/logo.png" alt="BLP Logo" style={{ height: '64px', width: 'auto', objectFit: 'contain', background: '#fff', padding: '8px', borderRadius: '8px', marginBottom: '1rem' }} />
          <p>Interní systém</p>
        </div>
        
        <div className={styles.content}>
          <h2>Vítejte zpět</h2>
          <p>Pro přístup do systému se prosím přihlaste pomocí firemního Google účtu.</p>
          
          <button 
            className={styles.googleButton} 
            onClick={handleLogin}
            disabled={loading}
          >
            <LogIn size={20} />
            <span>Přihlásit se přes Google</span>
          </button>
        </div>

        <div className={styles.footer}>
          <p>&copy; {new Date().getFullYear()} BLP Production. Všechna práva vyhrazena.</p>
        </div>
      </div>
    </div>
  );
}
