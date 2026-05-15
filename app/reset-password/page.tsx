'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import styles from '../login/page.module.css';
import { KeyRound, Clapperboard } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      alert('Heslo bylo úspěšně změněno. Nyní se můžete přihlásit.');
      router.push('/login');
    } catch (err) {
      const error = err as Error;
      console.error('Password reset failed:', error);
      alert('Chyba při změně hesla: ' + (error.message || 'Neznámá chyba'));
    } finally {
      setLoading(false);
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
          <h2>Nové heslo</h2>
          <p>Zadejte své nové heslo. Následně budete přesměrováni k přihlášení.</p>
          
          <form onSubmit={handleReset} className={styles.emailForm}>
            <input
              type="password"
              placeholder="Nové heslo"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              minLength={6}
            />
            
            <button 
              type="submit" 
              className={styles.emailButton}
              disabled={loading || !password}
            >
              <KeyRound size={20} />
              <span>Uložit nové heslo</span>
            </button>
          </form>
        </div>

        <div className={styles.footer}>
          <p>&copy; {new Date().getFullYear()} BLP Production. Všechna práva vyhrazena.</p>
        </div>
      </div>
    </div>
  );
}
