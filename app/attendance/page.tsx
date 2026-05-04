'use client';

import { useState, useEffect } from 'react';
import { 
  Play, 
  Square, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Plus
} from 'lucide-react';
import styles from './page.module.css';
import { useAttendance } from '@/hooks/useAttendance';
import { format, differenceInSeconds } from 'date-fns';
import { cs } from 'date-fns/locale';

export default function AttendancePage() {
  const { activeSession, history, loading, startSession, endSession } = useAttendance();
  const [selectedType, setSelectedType] = useState('Točba');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timer, setTimer] = useState('00:00:00');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSession) {
      interval = setInterval(() => {
        const seconds = differenceInSeconds(new Date(), new Date(activeSession.check_in));
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        setTimer(`${h}:${m}:${s}`);
      }, 1000);
    } else {
      setTimer('00:00:00');
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const ATTENDANCE_TYPES = ['Travel', 'Točba', 'Rigg', 'Sklad', 'Volno M', 'Dovolená', 'Nemoc'];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2>Moje Docházka</h2>
          <p>Sledování času, typů docházky a historie.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Zadat zpětně
          </button>
          <button className={styles.exportBtn}>
            <Download size={18} />
            Export PDF
          </button>
        </div>
      </div>

      <div className={styles.actionCard}>
        <div className={styles.timerDisplay}>
          <div className={styles.timerInfo}>
            <span className={styles.timerLabel}>
              {activeSession ? `Aktivní: ${activeSession.type}` : 'Dnešní čas'}
            </span>
            <span className={styles.timerValue}>{timer}</span>
          </div>
          <div className={styles.typeSelector}>
            <span className={styles.smallLabel}>Typ aktivity:</span>
            <select 
              value={activeSession ? activeSession.type : selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className={styles.select}
              disabled={!!activeSession}
            >
              {ATTENDANCE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className={styles.controls}>
          {!activeSession ? (
            <button 
              className={`${styles.mainBtn} ${styles.btnStart}`}
              onClick={() => startSession(selectedType)}
            >
              <Play size={24} fill="currentColor" />
              <span>Zahájit: {selectedType}</span>
            </button>
          ) : (
            <button 
              className={`${styles.mainBtn} ${styles.btnStop}`}
              onClick={() => endSession()}
            >
              <Square size={24} fill="currentColor" />
              <span>Ukončit práci</span>
            </button>
          )}
          <textarea 
            className={styles.noteInput} 
            placeholder="Nepovinný komentář k činnosti..."
            rows={2}
          />
        </div>
      </div>

      <div className={styles.historySection}>
        <div className={styles.historyHeader}>
          <h3>Historie záznamů</h3>
          <div className={styles.dateSelector}>
            <button><ChevronLeft size={20} /></button>
            <span>{format(new Date(), 'LLLL yyyy', { locale: cs })}</span>
            <button><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Datum</th>
                <th>Typ</th>
                <th>Příchod</th>
                <th>Odchod</th>
                <th>Celkem</th>
                <th>Poznámka</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Zatím žádné záznamy</td>
                </tr>
              )}
              {history.map((record) => {
                const checkIn = new Date(record.check_in);
                const checkOut = record.check_out ? new Date(record.check_out) : null;
                let duration = '--';
                
                if (checkOut) {
                  const diff = differenceInSeconds(checkOut, checkIn);
                  const h = Math.floor(diff / 3600);
                  const m = Math.floor((diff % 3600) / 60);
                  duration = `${h}h ${m}m`;
                }

                return (
                  <tr key={record.id}>
                    <td>{format(checkIn, 'eeee, d. M.', { locale: cs })}</td>
                    <td>
                      <span className={`${styles.typeBadge} ${styles[`type${record.type.replace(' ', '')}`]}`}>
                        {record.type}
                      </span>
                    </td>
                    <td className={styles.timeCell}>{format(checkIn, 'HH:mm')}</td>
                    <td className={styles.timeCell}>{checkOut ? format(checkOut, 'HH:mm') : '--'}</td>
                    <td className={styles.totalCell}>{duration}</td>
                    <td className={styles.noteCell}>{record.comment || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal Placeholder */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Zpětné zadání docházky</h3>
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>Datum</label>
                <input type="date" className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>Typ docházky</label>
                <select className={styles.select}>
                  {ATTENDANCE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Příchod</label>
                  <input type="time" className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label>Odchod</label>
                  <input type="time" className={styles.input} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Komentář</label>
                <textarea className={styles.input} rows={3} />
              </div>
              <div className={styles.modalActions}>
                <button className={styles.secondaryBtn} onClick={() => setIsModalOpen(false)}>Zrušit</button>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setIsModalOpen(false)}>Uložit záznam</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
