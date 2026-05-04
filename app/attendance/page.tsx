'use client';

import { useState } from 'react';
import { 
  Play, 
  Square, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Plus
} from 'lucide-react';
import styles from './page.module.css';

const ATTENDANCE_TYPES = [
  'Travel', 
  'Točba', 
  'Rigg', 
  'Sklad', 
  'Volno M', 
  'Dovolená', 
  'Nemoc'
];

export default function AttendancePage() {
  const [isActive, setIsActive] = useState(false);
  const [selectedType, setSelectedType] = useState('Točba');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockRecords = [
    { date: 'Dnes, 4. 5.', in: '08:32', out: '--', total: '--', type: 'Točba', note: '-' },
    { date: 'Pátek, 1. 5.', in: '08:15', out: '17:05', total: '8h 50m', type: 'Sklad', note: 'Práce na reklamě' },
    { date: 'Čtvrtek, 30. 4.', in: '09:00', out: '18:12', total: '9h 12m', type: 'Travel', note: '-' },
    { date: 'Středa, 29. 4.', in: '08:45', out: '16:30', total: '7h 45m', type: 'Rigg', note: 'Home office' },
  ];

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
            <span className={styles.timerLabel}>Dnešní čas</span>
            <span className={styles.timerValue}>07:45:12</span>
          </div>
          <div className={styles.typeSelector}>
            <span className={styles.smallLabel}>Typ aktivity:</span>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className={styles.select}
              disabled={isActive}
            >
              {ATTENDANCE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className={styles.controls}>
          {!isActive ? (
            <button 
              className={`${styles.mainBtn} ${styles.btnStart}`}
              onClick={() => setIsActive(true)}
            >
              <Play size={24} fill="currentColor" />
              <span>Zahájit: {selectedType}</span>
            </button>
          ) : (
            <button 
              className={`${styles.mainBtn} ${styles.btnStop}`}
              onClick={() => setIsActive(false)}
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
            <span>Květen 2026</span>
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
              {mockRecords.map((record, index) => (
                <tr key={index}>
                  <td>{record.date}</td>
                  <td>
                    <span className={`${styles.typeBadge} ${styles[`type${record.type.replace(' ', '')}`]}`}>
                      {record.type}
                    </span>
                  </td>
                  <td className={styles.timeCell}>{record.in}</td>
                  <td className={styles.timeCell}>{record.out}</td>
                  <td className={styles.totalCell}>{record.total}</td>
                  <td className={styles.noteCell}>{record.note}</td>
                </tr>
              ))}
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
