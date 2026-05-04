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
import { cs } from 'date-fns/locale';

export default function Home() {
  const { activeSession, startSession, endSession, loading } = useAttendance();

  const handleStartPauza = () => {
    // In this simple system, Pause is just another attendance type
    startSession('Volno M', 'Pauza z dashboardu');
  };

  const handleEndSession = () => {
    endSession();
  };
  return (
    <div className={styles.dashboard}>
      <div className={styles.statsGrid}>
        <div className={styles.card}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Odpracováno (Tento měsíc)</span>
            <span className={styles.statValue}>124.5 h</span>
            <div className={`${styles.statTrend} ${styles.trendUp}`}>
              <TrendingUp size={12} />
              <span>+12% oproti min. měsíci</span>
            </div>
          </div>
        </div>
        {/* Tasks Section */}
        <section className={styles.tasksSection}>
          <div className={styles.sectionHeader}>
            <h3>Nadcházející Projekty</h3>
            <button className={styles.viewAll}>Zobrazit vše</button>
          </div>
          <div className={styles.taskGrid}>
            <div className={styles.taskCard}>
              <div className={styles.taskStatus}>Confirmed</div>
              <h4>Tom Ford Movie</h4>
              <p>Regia Caserta • Točení: 9-12.3.</p>
              <div className={styles.taskMeta}>
                <span>Riccardo</span>
                <div className={styles.teamAvatars}>
                  <div className={styles.miniAvatar}>MR</div>
                  <div className={styles.miniAvatar}>PM</div>
                </div>
              </div>
            </div>
            <div className={styles.taskCard}>
              <div className={styles.taskStatus}>Pending</div>
              <h4>GALAXY TWILIGHT</h4>
              <p>HARRIS OFFICE • Točení: 12.3.</p>
              <div className={styles.taskMeta}>
                <span>GALAXY</span>
                <div className={styles.teamAvatars}>
                  <div className={styles.miniAvatar}>JH</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className={styles.card}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Aktivní zakázky</span>
            <span className={styles.statValue}>8</span>
            <div className={styles.statTrend}>
              <span>3 končí tento týden</span>
            </div>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Nevyúčtované účtenky</span>
            <span className={styles.statValue}>12</span>
            <div className={`${styles.statTrend} ${styles.trendDown}`}>
              <AlertCircle size={12} />
              <span>Celkem 3 450 Kč</span>
            </div>
          </div>
        </div>
      </div>

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
                Ukončit
              </button>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleStartPauza}>
                Pauza
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={`${styles.statusIndicator}`}>
              <div className={styles.statusDot} style={{ background: '#64748b' }}></div>
              <span>Aktuálně: <strong>Nejste v práci</strong></span>
            </div>

            <div className={styles.buttonGrid}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => startSession('Sklad')}>
                <Play size={18} fill="currentColor" />
                Zahájit práci
              </button>
            </div>
          </>
        )}
      </div>

      <div className={`${styles.card} ${styles.tasksCard}`}>
        <h2 className={styles.cardTitle}>
          <Film size={20} />
          Moje úkoly (Filmy)
        </h2>
        
        <div className={styles.taskList}>
          <div className={styles.taskItem}>
            <div className={styles.taskInfo}>
              <span className={styles.taskTitle}>Korelace barev - Reklama Škoda</span>
              <span className={styles.taskMeta}>Termín: Zítra • Priorita: Vysoká</span>
            </div>
          </div>
          <div className={styles.taskItem}>
            <div className={styles.taskInfo}>
              <span className={styles.taskTitle}>Střih teaseru - Dokument Alpy</span>
              <span className={styles.taskMeta}>Termín: 12. 5. • Priorita: Střední</span>
            </div>
          </div>
          <div className={styles.taskItem}>
            <div className={styles.taskInfo}>
              <span className={styles.taskTitle}>Záloha dat - Projekt Praha</span>
              <span className={styles.taskMeta}>Termín: Dnes • Priorita: Nízká</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
