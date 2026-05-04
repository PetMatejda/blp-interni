'use client';

import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Filter,
  ArrowUpRight,
  User
} from 'lucide-react';
import styles from './page.module.css';

const MOCK_DATA = [
  { name: 'MACHAJDÍK', travel: 0, tocba: 0, rigg: 0, sklad: 21, sonesvat: 10, volnom: 0, dovolena: 0, nemoc: 0, time: '168:00:00', norma: 168, rozdil: 0 },
  { name: 'KOLODZIEJ', travel: 0, tocba: 12, rigg: 0, sklad: 6, sonesvat: 9, volnom: 4, dovolena: 0, nemoc: 0, time: '188:30:00', norma: 168, rozdil: 20.5 },
  { name: 'MICHAL', travel: 0, tocba: 4, rigg: 12, sklad: 5, sonesvat: 9, volnom: 1, dovolena: 0, nemoc: 0, time: '180:30:00', norma: 168, rozdil: 12 },
  { name: 'HOLLAN', travel: 0, tocba: 0, rigg: 0, sklad: 0, sonesvat: 0, volnom: 0, dovolena: 0, nemoc: 0, time: '0:00:00', norma: 168, rozdil: null },
  { name: 'RADOLF', travel: 0, tocba: 8, rigg: 8, sklad: 6, sonesvat: 6, volnom: 3, dovolena: 0, nemoc: 0, time: '154:30:00', norma: 168, rozdil: -13.5 },
  { name: 'REŽŇÁK', travel: 2, tocba: 9, rigg: 1, sklad: 4, sonesvat: 9, volnom: 2, dovolena: 0, nemoc: 4, time: '182:50:00', norma: 168, rozdil: 14.8 },
];

export default function ReportsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2>Měsíční Reporty</h2>
          <p>Souhrnný přehled docházky a odpracovaných hodin všech zaměstnanců.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn}>
            <Filter size={18} />
            Filtrovat
          </button>
          <button className={styles.exportBtn}>
            <Download size={18} />
            Export (Excel/PDF)
          </button>
        </div>
      </div>

      <div className={styles.reportControls}>
        <div className={styles.dateSelector}>
          <button><ChevronLeft size={20} /></button>
          <span className={styles.currentMonth}>LEDEN 2026</span>
          <button><ChevronRight size={20} /></button>
        </div>
        <div className={styles.summaryInfo}>
          <span>Celkem zaměstnanců: <strong>6</strong></span>
          <span>Celkem hodin: <strong>874.5</strong></span>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.stickyCol}>Pracovník</th>
                <th>TRAVEL</th>
                <th>TOČBA</th>
                <th>RIGG.</th>
                <th>SKLAD</th>
                <th>SO/NE/SVÁT.</th>
                <th>VOLNO-M</th>
                <th>DOVOLENÁ</th>
                <th>NEMOC</th>
                <th>ČAS</th>
                <th>NORMA</th>
                <th>ROZDÍL</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DATA.map((row, index) => (
                <tr key={index}>
                  <td className={styles.stickyCol}>
                    <div className={styles.workerName}>
                      <User size={14} className={styles.workerIcon} />
                      {row.name}
                    </div>
                  </td>
                  <td>{row.travel}</td>
                  <td>{row.tocba}</td>
                  <td>{row.rigg}</td>
                  <td>{row.sklad}</td>
                  <td>{row.sonesvat}</td>
                  <td>{row.volnom}</td>
                  <td>{row.dovolena}</td>
                  <td>{row.nemoc}</td>
                  <td className={styles.timeCell}>{row.time}</td>
                  <td className={styles.normCell}>{row.norma}</td>
                  <td>
                    {row.rozdil !== null ? (
                      <span className={`${styles.diffBadge} ${row.rozdil >= 0 ? styles.diffPositive : styles.diffNegative}`}>
                        {row.rozdil > 0 ? `+${row.rozdil}` : row.rozdil}
                      </span>
                    ) : '-'}
                  </td>
                  <td>
                    <button className={styles.drillDownBtn} title="Zobrazit detail">
                      <ArrowUpRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
