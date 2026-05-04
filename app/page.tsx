'use client';

import { 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Film,
  Play,
  Square
} from 'lucide-react';
import styles from './page.module.css';
import { useAttendance } from '@/hooks/useAttendance';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

interface Project {
  id: string;
  title: string;
  client: string;
  location: string;
  status: string;
  shooting?: string;
  color_code?: string;
}

interface Task {
  id: string;
  date: string;
  note: string;
  projects?: {
    title: string;
  };
}

export default function Home() {
  const { user: currentUser } = useAuth();
  const { activeSession, startSession, endSession, loading, history } = useAttendance();
  const [dashType, setDashType] = useState('Sklad');
  const [activeProjectsCount, setActiveProjectsCount] = useState(0);
  const [upcomingProjects, setUpcomingProjects] = useState<Project[]>([]);
  const [receiptStats, setReceiptStats] = useState({ count: 0, total: 0 });
  const [myTasks, setMyTasks] = useState<Task[]>([]);

  // Calculate monthly hours from history
  const monthlyHours = history.reduce((acc, record) => {
    if (!record.check_out) return acc;
    const checkIn = new Date(record.check_in);
    const checkOut = new Date(record.check_out);
    const now = new Date();
    
    // Only count records from current month
    if (checkIn.getMonth() === now.getMonth() && checkIn.getFullYear() === now.getFullYear()) {
      const diffHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
      
      // Odečítáme pauzy od celkového času
      if (record.type === 'Volno M' || record.type === 'Pauza') {
        return acc - diffHours;
      }
      
      return acc + diffHours;
    }
    return acc;
  }, 0);

  const lastRecordDate = history.length > 0 ? new Date(history[0].check_in) : null;

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch project count
      const { count: projCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'confirmed');
      
      setActiveProjectsCount(projCount || 0);

      // 2. Fetch upcoming projects (first 2)
      const { data: projData } = await supabase
        .from('projects')
        .select('*')
        .neq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(2);
      
      setUpcomingProjects(projData || []);

      // 3. Fetch receipt stats for current user
      if (currentUser) {
        const { data: recData } = await supabase
          .from('receipts')
          .select('amount')
          .eq('user_id', currentUser.id)
          .eq('status', 'pending');
        
        if (recData) {
          const total = recData.reduce((sum, r) => sum + Number(r.amount), 0);
          setReceiptStats({ count: recData.length, total });
        }

        // 4. Fetch my tasks (assignments)
        const { data: taskData } = await supabase
          .from('assignments')
          .select('*, projects(*)')
          .eq('user_id', currentUser.id)
          .limit(3);
        
        setMyTasks(taskData || []);
      }
    };
    
    fetchData();
  }, [currentUser]);

  const handleStartPauza = async () => {
    const result = await startSession('Volno M', 'Pauza z dashboardu');
    if (result && result.error) {
      console.error(result.error);
      alert('Chyba při zahajování pauzy: ' + JSON.stringify(result.error));
    }
  };

  const handleEndSession = async () => {
    const result = await endSession();
    if (result && result.error) {
      console.error(result.error);
      alert('Chyba při ukončování: ' + JSON.stringify(result.error));
    }
  };

  const handleStartWork = async () => {
    const result = await startSession(dashType);
    if (result && result.error) {
      console.error(result.error);
      alert('Chyba při zahajování: ' + JSON.stringify(result.error));
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={`${styles.card} ${styles.attendanceCard}`}>
        <h2 className={styles.cardTitle}>
          <Clock size={20} />
          Rychlá Docházka
        </h2>
        
        {loading ? (
          <p>Načítání stavu...</p>
        ) : activeSession ? (
          <>
            <div className={`${styles.statusIndicator} ${styles.statusActive}`}>
              <div className={styles.statusDot}></div>
              <span>Aktuálně: <strong>{activeSession.type}</strong> (od {format(new Date(activeSession.check_in), 'HH:mm')})</span>
            </div>

            <div className={styles.buttonGrid}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleEndSession}>
                <Square size={18} fill="currentColor" />
                {activeSession.type === 'Volno M' || activeSession.type === 'Pauza' ? 'Ukončit pauzu' : 'Ukončit'}
              </button>
              {activeSession.type !== 'Volno M' && activeSession.type !== 'Pauza' && (
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleStartPauza}>
                  Pauza
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className={`${styles.statusIndicator}`}>
              <div className={styles.statusDot} style={{ background: '#64748b' }}></div>
              <span>Aktuálně: <strong>Nejste v práci</strong></span>
            </div>

            <div className={styles.typeSelector} style={{ marginBottom: '1rem' }}>
              <select 
                value={dashType} 
                onChange={(e) => setDashType(e.target.value)}
                className={styles.dashSelect}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border)',
                  background: 'var(--input)',
                  color: 'var(--foreground)'
                }}
              >
                {['Travel', 'Točba', 'Rigg', 'Sklad', 'Volno M', 'Dovolená', 'Nemoc'].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className={styles.buttonGrid}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleStartWork}>
                <Play size={18} fill="currentColor" />
                Zahájit: {dashType}
              </button>
            </div>
          </>
        )}
      </div>

      <Link href="/attendance" className={`${styles.card} ${styles.hoursCard}`}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Odpracováno (Tento měsíc)</span>
          <span className={styles.statValue}>{monthlyHours.toFixed(1)} h</span>
          <div className={`${styles.statTrend} ${styles.trendUp}`}>
            <TrendingUp size={12} />
            <span>Naposledy: {lastRecordDate ? format(lastRecordDate, 'd.M. HH:mm') : '--'}</span>
          </div>
        </div>
      </Link>

      <Link href="/tasks" className={`${styles.card} ${styles.upcomingCard}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.cardTitle}>Nadcházející Projekty</h2>
        </div>
        <div className={styles.taskGrid}>
          {upcomingProjects.length === 0 && <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Žádné aktivní projekty.</p>}
          {upcomingProjects.map(project => (
            <div key={project.id} className={styles.taskCard}>
              <div className={styles.taskStatus}>{project.status}</div>
              <h4>{project.title}</h4>
              <p>{project.client} • {project.location}</p>
              <div className={styles.taskMeta}>
                <span>{project.shooting || 'Termín v detailu'}</span>
              </div>
            </div>
          ))}
        </div>
      </Link>

      <div className={styles.statsGrid}>
        <Link href="/tasks" className={styles.card}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Aktivní zakázky</span>
            <span className={styles.statValue}>{activeProjectsCount}</span>
            <div className={styles.statTrend}>
              <span>Aktuálně v běhu</span>
            </div>
          </div>
        </Link>

        <Link href="/receipts" className={styles.card}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Moje účtenky</span>
            <span className={styles.statValue}>{receiptStats.count}</span>
            <div className={`${styles.statTrend} ${receiptStats.count > 0 ? styles.trendDown : styles.trendUp}`}>
              <AlertCircle size={12} />
              <span>Celkem {receiptStats.total.toLocaleString()} Kč</span>
            </div>
          </div>
        </Link>
      </div>

      <Link href="/tasks" className={`${styles.card} ${styles.tasksCard}`}>
        <h2 className={styles.cardTitle}>
          <Film size={20} />
          Moje úkoly (Projekty)
        </h2>
        
        <div className={styles.taskList}>
          {myTasks.length === 0 && <p style={{ fontSize: '0.9rem', color: '#64748b', padding: '1rem' }}>Nemáte přiřazené žádné projekty.</p>}
          {myTasks.map(task => (
            <div key={task.id} className={styles.taskItem}>
              <div className={styles.taskInfo}>
                <span className={styles.taskTitle}>{task.projects?.title}</span>
                <span className={styles.taskMeta}>Datum: {task.date} • {task.note || 'Přiřazeno'}</span>
              </div>
            </div>
          ))}
        </div>
      </Link>
    </div>
  );
}
