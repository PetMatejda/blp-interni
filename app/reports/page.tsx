'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Filter,
  ArrowUpRight,
  User,
  Loader,
  AlertTriangle
} from 'lucide-react';
import styles from './page.module.css';
import { createBrowserClient } from '@supabase/ssr';
import { format, differenceInSeconds, startOfMonth, endOfMonth, addMonths, subMonths, isWeekend } from 'date-fns';
import { cs } from 'date-fns/locale';

interface Profile {
  id: string;
  full_name: string | null;
}

interface AttendanceRecord {
  id: string;
  user_id: string;
  type: string;
  check_in: string;
  check_out: string | null;
}

export default function ReportsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    const startDate = startOfMonth(currentDate).toISOString();
    const endDate = endOfMonth(currentDate).toISOString();

    const [profilesRes, attendanceRes] = await Promise.all([
      supabase.from('profiles').select('id, full_name'),
      supabase.from('attendance')
        .select('*')
        .gte('check_in', startDate)
        .lte('check_in', endDate)
    ]);

    if (profilesRes.data) setProfiles(profilesRes.data);
    if (attendanceRes.data) setAttendance(attendanceRes.data);
    
    setLoading(false);
  }, [currentDate, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const reportData = useMemo(() => {
    return profiles.map(profile => {
      const userRecords = attendance.filter(r => r.user_id === profile.id);
      
      let hasOverlap = false;
      for (let i = 0; i < userRecords.length; i++) {
        const r1 = userRecords[i];
        if (!r1.check_out) continue;
        const start1 = new Date(r1.check_in).getTime();
        const end1 = new Date(r1.check_out).getTime();
        
        for (let j = i + 1; j < userRecords.length; j++) {
          const r2 = userRecords[j];
          if (!r2.check_out) continue;
          const start2 = new Date(r2.check_in).getTime();
          const end2 = new Date(r2.check_out).getTime();
          
          if (start1 < end2 && start2 < end1) {
            hasOverlap = true;
            break;
          }
        }
        if (hasOverlap) break;
      }

      const stats = {
        name: profile.full_name || 'Neznámý',
        travel: 0,
        tocba: 0,
        rigg: 0,
        sklad: 0,
        sonesvat: 0,
        volnom: 0,
        dovolena: 0,
        nemoc: 0,
        totalHours: 0,
        norma: 168,
        hasOverlap
      };

      userRecords.forEach(r => {
        if (!r.check_out) return; // Skip unfinished sessions
        
        const checkIn = new Date(r.check_in);
        const checkOut = new Date(r.check_out);
        const hours = differenceInSeconds(checkOut, checkIn) / 3600;

        // Add to total
        stats.totalHours += hours;

        // Categorize by type
        const type = r.type.toLowerCase();
        if (type.includes('travel')) stats.travel += hours;
        else if (type.includes('točba')) stats.tocba += hours;
        else if (type.includes('rigg')) stats.rigg += hours;
        else if (type.includes('sklad')) stats.sklad += hours;
        else if (type.includes('volno')) stats.volnom += hours;
        else if (type.includes('dovolená')) stats.dovolena += hours;
        else if (type.includes('nemoc')) stats.nemoc += hours;

        // Weekend logic
        if (isWeekend(checkIn)) {
          stats.sonesvat += hours;
        }
      });

      return {
        ...stats,
        rozdil: stats.totalHours > 0 ? stats.totalHours - stats.norma : null,
        timeStr: `${Math.floor(stats.totalHours)}:${Math.floor((stats.totalHours % 1) * 60).toString().padStart(2, '0')}:00`
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [profiles, attendance]);

  const totalSummary = reportData.reduce((acc, curr) => acc + curr.totalHours, 0);

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
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft size={20} />
          </button>
          <span className={styles.currentMonth}>
            {format(currentDate, 'LLLL yyyy', { locale: cs }).toUpperCase()}
          </span>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight size={20} />
          </button>
        </div>
        <div className={styles.summaryInfo}>
          <span>Celkem zaměstnanců: <strong>{profiles.length}</strong></span>
          <span>Celkem hodin: <strong>{totalSummary.toFixed(1)}</strong></span>
        </div>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Loader className={styles.spinner} size={32} />
          </div>
        ) : (
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
                {reportData.map((row, index) => (
                  <tr key={index}>
                    <td className={styles.stickyCol}>
                      <div className={styles.workerName}>
                        <User size={14} className={styles.workerIcon} />
                        {row.name}
                        {row.hasOverlap && (
                          <span title="Některé záznamy tohoto zaměstnance v tomto měsíci se překrývají v čase." style={{ marginLeft: '4px', display: 'flex', alignItems: 'center' }}>
                            <AlertTriangle 
                              size={14} 
                              color="#ef4444" 
                            />
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{row.travel > 0 ? row.travel.toFixed(1) : '-'}</td>
                    <td>{row.tocba > 0 ? row.tocba.toFixed(1) : '-'}</td>
                    <td>{row.rigg > 0 ? row.rigg.toFixed(1) : '-'}</td>
                    <td>{row.sklad > 0 ? row.sklad.toFixed(1) : '-'}</td>
                    <td>{row.sonesvat > 0 ? row.sonesvat.toFixed(1) : '-'}</td>
                    <td>{row.volnom > 0 ? row.volnom.toFixed(1) : '-'}</td>
                    <td>{row.dovolena > 0 ? row.dovolena.toFixed(1) : '-'}</td>
                    <td>{row.nemoc > 0 ? row.nemoc.toFixed(1) : '-'}</td>
                    <td className={styles.timeCell}>{row.timeStr}</td>
                    <td className={styles.normCell}>{row.norma}</td>
                    <td>
                      {row.rozdil !== null ? (
                        <span className={`${styles.diffBadge} ${row.rozdil >= 0 ? styles.diffPositive : styles.diffNegative}`}>
                          {row.rozdil > 0 ? `+${row.rozdil.toFixed(1)}` : row.rozdil.toFixed(1)}
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
        )}
      </div>
    </div>
  );
}
