'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { createBrowserClient } from '@supabase/ssr';
import styles from './page.module.css';
import { User, Shield, ShieldAlert, Trash2, Edit } from 'lucide-react';

const ADMIN_EMAIL = 'petmatejda@gmail.com';

interface Profile {
  id: string;
  full_name: string | null;
  role: 'admin' | 'employee';
  updated_at: string;
}

export default function UserManagementPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: true });

      if (fetchError) throw fetchError;
      setProfiles((data as Profile[]) || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching profiles:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (user?.email?.toLowerCase() === ADMIN_EMAIL) {
      fetchProfiles();
    } else if (user) {
      setLoading(false);
    }
  }, [user, fetchProfiles]);

  async function toggleRole(profileId: string, currentRole: string) {
    if (!confirm('Opravdu chcete změnit roli tohoto uživatele?')) return;

    const newRole = currentRole === 'admin' ? 'employee' : 'admin';
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', profileId);

      if (updateError) throw updateError;
      fetchProfiles();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert('Chyba při změně role: ' + errorMessage);
    }
  }

  if (loading) {
    return <div className={styles.container}><p>Načítání...</p></div>;
  }

  if (user?.email?.toLowerCase() !== ADMIN_EMAIL) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <ShieldAlert size={48} style={{ marginBottom: '1rem' }} />
          <h3>Přístup odepřen</h3>
          <p>Tato stránka je dostupná pouze pro hlavního administrátora ({ADMIN_EMAIL}).</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Správa uživatelů</h2>
        <p>Správa rolí a přístupů do interního systému BLP</p>
      </div>

      <div className={styles.adminCard}>
        {error && (
          <div className={styles.error} style={{ marginBottom: '1rem', padding: '1rem' }}>
            Chyba: {error}. Ujistěte se, že jste v Supabase spustili SQL kód pro vytvoření tabulky &apos;profiles&apos;.
          </div>
        )}

        <table className={styles.userTable}>
          <thead>
            <tr>
              <th>Uživatel</th>
              <th>Role</th>
              <th>ID</th>
              <th>Akce</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length > 0 ? (
              profiles.map((profile) => (
                <tr key={profile.id}>
                  <td>
                    <div className={styles.userInfo}>
                      <div className={styles.avatar}>
                        {profile.full_name?.charAt(0) || <User size={14} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{profile.full_name || 'Neznámé jméno'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.roleBadge} ${styles[profile.role]}`}>
                      {profile.role === 'admin' ? 'Administrátor' : 'Zaměstnanec'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#666' }}>
                    {profile.id.substring(0, 8)}...
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button 
                        className={styles.actionBtn} 
                        title="Změnit roli"
                        onClick={() => toggleRole(profile.id, profile.role)}
                      >
                        <Shield size={16} />
                      </button>
                      <button className={styles.actionBtn} title="Upravit">
                        <Edit size={16} />
                      </button>
                      <button className={styles.actionBtn} title="Smazat">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  Žádní uživatelé nenalezeni. Zkuste se nejdříve přihlásit.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
