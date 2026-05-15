'use client';

import { useAuth } from '@/components/AuthProvider';
import styles from './page.module.css';
import { LogIn, Mail, Clapperboard } from 'lucide-react';
import { useState } from 'react';

export default function LoginPage() {
  const { signInWithGoogle, signInWithPassword, resetPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
      alert('Přihlášení se nezdařilo. Zkontrolujte konzoli pro detaily.');
    }
  };

  const handleEmailAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      if (isResetMode) {
        await resetPassword(email);
        setEmailSent(true);
      } else {
        await signInWithPassword(email, password);
      }
    } catch (err) {
      const error = err as Error;
      console.error('Email action failed:', error);
      alert('Chyba: ' + (error.message || 'Neznámá chyba'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.logo}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 'bold' }}>
            <Clapperboard size={48} strokeWidth={2} />
            <span style={{ fontSize: '2rem', letterSpacing: '2px' }}>B.L.P.</span>
          </div>
          <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>Interní systém</p>
        </div>
        
        <div className={styles.content}>
          <h2>Vítejte zpět</h2>
          <p>Pro přístup do systému se prosím přihlaste pomocí firemního Google účtu.</p>
          
          <button 
            className={styles.googleButton} 
            onClick={handleLogin}
            disabled={loading || isSubmitting}
          >
            <LogIn size={20} />
            <span>Přihlásit se přes Google</span>
          </button>

          <div className={styles.divider}>Nebo</div>

          {emailSent ? (
            <div style={{ padding: '1rem', background: 'rgba(0, 255, 0, 0.1)', borderRadius: '8px', color: '#86efac', marginBottom: '1rem' }}>
              <p style={{ margin: 0, color: 'inherit' }}>
                Odkaz na obnovu hesla byl odeslán na {email}.<br/>
                Zkontrolujte si e-mailovou schránku.
              </p>
            </div>
          ) : (
            <form onSubmit={handleEmailAction} className={styles.emailForm}>
              <input
                type="email"
                placeholder="Váš e-mail (např. jmeno@seznam.cz)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
              />
              
              {!isResetMode && (
                <input
                  type="password"
                  placeholder="Vaše heslo"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={styles.input}
                />
              )}

              <button 
                type="submit" 
                className={styles.emailButton}
                disabled={loading || isSubmitting || !email || (!isResetMode && !password)}
              >
                <Mail size={20} />
                <span>{isResetMode ? 'Odeslat odkaz na obnovu' : 'Přihlásit se pomocí e-mailu'}</span>
              </button>
            </form>
          )}

          {!emailSent && (
            <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
              <button 
                type="button" 
                onClick={() => setIsResetMode(!isResetMode)} 
                style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {isResetMode ? 'Zpět na přihlášení' : 'Zapomenuté heslo?'}
              </button>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <p>&copy; {new Date().getFullYear()} BLP Production. Všechna práva vyhrazena.</p>
        </div>
      </div>
    </div>
  );
}
