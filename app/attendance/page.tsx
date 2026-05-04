'use client';

import { useState, useEffect } from 'react';
import { 
  Play, 
  Square, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle
} from 'lucide-react';
import styles from './page.module.css';
import { useAttendance } from '@/hooks/useAttendance';
import { format, differenceInSeconds } from 'date-fns';
import { cs } from 'date-fns/locale';

export default function AttendancePage() {
  const { 
    activeSession, 
    history, 
    loading, 
    startSession, 
    endSession, 
    deleteRecord, 
    updateRecord 
  } = useAttendance();
  const [selectedType, setSelectedType] = useState('Točba');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timer, setTimer] = useState('00:00:00');

  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  
  const handleDelete = async (id: string) => {
    if (confirm('Opravdu chcete smazat tento záznam?')) {
      await deleteRecord(id);
    }
  };

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'Točba',
    check_in: '08:00',
    check_out: '16:00',
    comment: ''
  });

  const handleEdit = (record: any) => {
    const checkInDate = new Date(record.check_in);
    setFormData({
      date: format(checkInDate, 'yyyy-MM-dd'),
      type: record.type,
      check_in: format(checkInDate, 'HH:mm'),
      check_out: record.check_out ? format(new Date(record.check_out), 'HH:mm') : '',
      comment: record.comment || ''
    });
    setEditingRecordId(record.id);
    setIsModalOpen(true);
  };

  const handleSaveModal = async () => {
    const checkInISO = new Date(`${formData.date}T${formData.check_in}`).toISOString();
    const checkOutISO = formData.check_out ? new Date(`${formData.date}T${formData.check_out}`).toISOString() : null;
    
    if (editingRecordId) {
      await updateRecord(editingRecordId, {
        type: formData.type,
        check_in: checkInISO,
        check_out: checkOutISO,
        comment: formData.comment
      });
    }
    setIsModalOpen(false);
    setEditingRecordId(null);
  };

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
                <th>Akce</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Zatím žádné záznamy</td>
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
                  <tr key={record.id} className={record.hasOverlap ? styles.overlapRow : ''}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {record.hasOverlap && (
                          <span title="Tento záznam se překrývá s jiným!">
                            <AlertTriangle size={16} className={styles.warningIcon} />
                          </span>
                        )}
                        {format(checkIn, 'eeee, d. M.', { locale: cs })}
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.typeBadge} ${styles[`type${record.type.replace(' ', '')}`]}`}>
                        {record.type}
                      </span>
                    </td>
                    <td className={styles.timeCell}>{format(checkIn, 'HH:mm')}</td>
                    <td className={styles.timeCell}>{checkOut ? format(checkOut, 'HH:mm') : '--'}</td>
                    <td className={styles.totalCell}>{duration}</td>
                    <td className={styles.noteCell}>{record.comment || '-'}</td>
                    <td className={styles.actionsCell}>
                      <button 
                        className={styles.actionBtn} 
                        title="Upravit"
                        onClick={() => handleEdit(record)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${styles.deleteBtn}`} 
                        title="Smazat"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry / Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>{editingRecordId ? 'Upravit záznam' : 'Zpětné zadání docházky'}</h3>
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>Datum</label>
                <input 
                  type="date" 
                  className={styles.input} 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Typ docházky</label>
                <select 
                  className={styles.select}
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  {['Točba', 'Příprava', 'Sklad', 'Travel', 'Rigg', 'Volno M', 'Dovolená', 'Nemoc', 'Pauza'].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Příchod</label>
                  <input 
                    type="time" 
                    className={styles.input}
                    value={formData.check_in}
                    onChange={(e) => setFormData({...formData, check_in: e.target.value})}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Odchod</label>
                  <input 
                    type="time" 
                    className={styles.input}
                    value={formData.check_out}
                    onChange={(e) => setFormData({...formData, check_out: e.target.value})}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Komentář</label>
                <textarea 
                  className={styles.input} 
                  rows={3}
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                />
              </div>
              <div className={styles.modalActions}>
                <button 
                  className={styles.secondaryBtn}
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingRecordId(null);
                  }}
                >
                  Zrušit
                </button>
                <button 
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={handleSaveModal}
                >
                  Uložit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
