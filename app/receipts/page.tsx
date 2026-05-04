'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Upload, 
  FileText, 
  Check, 
  Info, 
  DollarSign, 
  Calendar as CalendarIcon,
  CreditCard,
  Search,
  Eye,
  Filter,
  Trash2,
  XCircle,
  Loader
} from 'lucide-react';
import styles from './page.module.css';
import { useAuth } from '@/components/AuthProvider';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

interface Receipt {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  payment_type: 'company' | 'personal';
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  image_url: string;
  category: string;
  profiles?: { full_name: string | null };
}

export default function ReceiptsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [capturedImage, setCapturedImage] = useState<{ url: string; type: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'upload' | 'confirm'>('upload');
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const isAdmin = profile?.role === 'admin';
  const [adminView, setAdminView] = useState(false); 

  const [extractedData, setExtractedData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'BLP',
    paymentType: 'personal' as 'company' | 'personal'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchReceipts = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('receipts')
        .select('id, user_id, amount, currency, date, description, payment_type, status, category, profiles(full_name)')
        .order('date', { ascending: false });
      
      if (!adminView) {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setReceipts(data as unknown as Receipt[]);
    } catch (err) {
      console.error('Error fetching receipts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, adminView, supabase]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.type;
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage({ url: event.target?.result as string, type: fileType });
        startOcrSimulation();
      };
      reader.readAsDataURL(file);
    }
  };

  const startOcrSimulation = () => {
    setIsProcessing(true);
    setStep('confirm');
    
    // Simulate OCR delay
    setTimeout(() => {
      setExtractedData({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: 'BLP',
        paymentType: 'personal'
      });
      setIsProcessing(false);
    }, 2000);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.from('receipts').insert([{
        user_id: user.id,
        amount: parseFloat(extractedData.amount) || 0,
        currency: 'CZK',
        date: extractedData.date,
        description: extractedData.description,
        payment_type: extractedData.paymentType,
        category: extractedData.category,
        status: 'pending',
        image_url: capturedImage?.url || ''
      }]);

      if (error) throw error;
      
      handleReset();
      fetchReceipts();
    } catch (err) {
      console.error('Chyba při ukládání účtenky:', err);
      alert('Chyba při ukládání účtenky.');
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setStep('upload');
    setExtractedData({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: 'BLP',
      paymentType: 'personal'
    });
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('receipts').update({ status }).eq('id', id);
      if (error) throw error;
      fetchReceipts();
    } catch (err) {
      console.error('Chyba při aktualizaci statusu:', err);
      alert('Nemáte oprávnění nebo došlo k chybě.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tuto účtenku?')) return;
    try {
      const { error } = await supabase.from('receipts').delete().eq('id', id);
      if (error) throw error;
      fetchReceipts();
    } catch (err) {
      console.error('Chyba při mazání:', err);
      alert('Chyba při mazání účtenky.');
    }
  };

  if (authLoading) return <div style={{ padding: '2rem' }}>Načítání...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2>Skenování účtenek</h2>
          <p>Vyfoťte nebo nahrajte doklad pro proplacení nebo evidenci nákladů.</p>
        </div>
        {isAdmin && (
          <button className={styles.adminToggle} onClick={() => setAdminView(!adminView)}>
            {adminView ? 'Zobrazit moje účtenky' : 'Administrace (Admin View)'}
          </button>
        )}
      </div>

      {!adminView ? (
        <div className={styles.userView}>
          {step === 'upload' ? (
            <div className={styles.uploadCard}>
              <div className={styles.dropZone} onClick={() => fileInputRef.current?.click()}>
                <div className={styles.iconCircle}>
                  <Camera size={40} />
                </div>
                <h3>Vyfoťte doklad nebo vyberte z galerie</h3>
                <p>Klikněte pro nahrání (JPG, PNG, PDF)</p>
                <div className={styles.uploadOptions}>
                  <div className={styles.option}><Camera size={16} /> Fotoaparát</div>
                  <div className={styles.option}><Upload size={16} /> Galerie / Soubor</div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  hidden 
                  accept="image/*,application/pdf" 
                  onChange={handleUpload} 
                />
              </div>
              <div className={styles.infoBox}>
                <Info size={20} />
                <p>Systém automaticky vytěží částku, datum a navrhne detaily k uložení.</p>
              </div>
            </div>
          ) : (
            <div className={styles.confirmView}>
              <div className={styles.receiptPreview}>
                {capturedImage?.type === 'application/pdf' ? (
                  <object data={capturedImage.url} type="application/pdf" width="100%" height="400px">
                    <p>PDF náhled není dostupný v tomto prohlížeči.</p>
                  </object>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={capturedImage?.url} alt="Receipt" />
                )}
                {isProcessing && (
                  <div className={styles.ocrOverlay}>
                    <div className={styles.spinner}></div>
                    <span>Vytěžuji data z účtenky...</span>
                  </div>
                )}
              </div>
              
              <div className={styles.formCard}>
                <h3>Potvrzení údajů</h3>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label><DollarSign size={16} /> Částka s DPH (CZK)</label>
                    <input 
                      type="number" 
                      value={extractedData.amount}
                      onChange={(e) => setExtractedData({...extractedData, amount: e.target.value})}
                      placeholder="Zadejte částku"
                    />
                  </div>
                  <div className={styles.field}>
                    <label><CalendarIcon size={16} /> Datum dokladu</label>
                    <input 
                      type="date" 
                      value={extractedData.date}
                      onChange={(e) => setExtractedData({...extractedData, date: e.target.value})}
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <label><Filter size={16} /> Kategorie / Projekt</label>
                    <select 
                      className={styles.select}
                      value={extractedData.category}
                      onChange={(e) => setExtractedData({...extractedData, category: e.target.value})}
                    >
                      <option value="BLP">BLP (Výchozí)</option>
                      <option value="Areál">Areál</option>
                      <option value="Zakázka">Konkrétní zakázka</option>
                    </select>
                  </div>
                  <div className={styles.fieldFull}>
                    <label><FileText size={16} /> Účel / Popis</label>
                    <textarea 
                      placeholder="Za co to bylo? (např. Parkovné, Oběd, Benzín...)"
                      value={extractedData.description}
                      onChange={(e) => setExtractedData({...extractedData, description: e.target.value})}
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <label><CreditCard size={16} /> Typ platby</label>
                    <div className={styles.paymentToggle}>
                      <button 
                        className={extractedData.paymentType === 'company' ? styles.active : ''}
                        onClick={() => setExtractedData({...extractedData, paymentType: 'company'})}
                      >
                        Firemní peníze
                      </button>
                      <button 
                        className={extractedData.paymentType === 'personal' ? styles.active : ''}
                        onClick={() => setExtractedData({...extractedData, paymentType: 'personal'})}
                      >
                        K proplacení
                      </button>
                    </div>
                  </div>
                </div>
                <div className={styles.formActions}>
                  <button className={styles.cancelBtn} onClick={handleReset}>Zrušit</button>
                  <button className={styles.saveBtn} onClick={handleSave} disabled={isProcessing}>
                    <Check size={20} /> Odeslat ke schválení
                  </button>
                </div>
              </div>
            </div>
          )}

          <section className={styles.historySection}>
            <h3>Moje nedávné účtenky</h3>
            {isLoading ? <p>Načítání...</p> : (
              <div className={styles.receiptList}>
                {receipts.length === 0 && <p style={{color: '#666'}}>Zatím žádné účtenky.</p>}
                {receipts.map(r => (
                  <div key={r.id} className={styles.receiptRow}>
                    <div className={styles.rIcon}><FileText size={20} /></div>
                    <div className={styles.rMain}>
                      <strong>{r.description}</strong>
                      <span>{format(new Date(r.date), 'dd.MM.yyyy')}</span>
                    </div>
                    <div className={styles.rAmount}>
                      <strong>{r.amount} {r.currency}</strong>
                      <span className={styles[r.payment_type]}>
                        {r.payment_type === 'company' ? 'Firemní' : 'K proplacení'}
                      </span>
                    </div>
                    <div className={`${styles.status} ${styles[r.status]}`}>
                      {r.status === 'pending' ? 'Čeká' : r.status === 'approved' ? 'Schváleno' : r.status === 'rejected' ? 'Zamítnuto' : r.status}
                    </div>
                    {r.status === 'pending' && (
                      <button className={styles.deleteBtnIcon} onClick={() => handleDelete(r.id)} title="Smazat účtenku">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className={styles.adminView}>
          <div className={styles.adminToolbar}>
            <div className={styles.search}>
              <Search size={18} />
              <input type="text" placeholder="Hledat podle účelu..." />
            </div>
            <div className={styles.filters}>
              <button className={styles.filterBtn}><Filter size={18} /> Filtry</button>
              <button className={styles.exportBtn}><Upload size={18} /> Export</button>
            </div>
          </div>

          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Uživatel</th>
                <th>Datum</th>
                <th>Popis</th>
                <th>Částka</th>
                <th>Typ</th>
                <th>Stav</th>
                <th>Akce</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{textAlign:'center', padding:'2rem'}}><Loader className={styles.spinner} /></td></tr>
              ) : receipts.length === 0 ? (
                <tr><td colSpan={7} style={{textAlign:'center', padding:'2rem', color:'#666'}}>Žádné účtenky k zobrazení.</td></tr>
              ) : (
                receipts.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className={styles.userName}>
                        <div className={styles.miniAvatar}>{r.profiles?.full_name?.charAt(0) || '?'}</div>
                        {r.profiles?.full_name || 'Neznámý'}
                      </div>
                    </td>
                    <td>{format(new Date(r.date), 'dd.MM.yyyy')}</td>
                    <td>{r.description}</td>
                    <td><strong>{r.amount} {r.currency}</strong></td>
                    <td>
                      <span className={`${styles.typeBadge} ${styles[r.payment_type]}`}>
                        {r.payment_type === 'company' ? 'Firemní' : 'Soukromé'}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[r.status]}`}>
                        {r.status === 'pending' ? 'Čeká' : r.status === 'approved' ? 'Schváleno' : r.status === 'rejected' ? 'Zamítnuto' : r.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button title="Zobrazit detail"><Eye size={16} /></button>
                        {r.status === 'pending' && (
                          <>
                            <button className={styles.approveBtn} title="Schválit" onClick={() => updateStatus(r.id, 'approved')}><Check size={16} /></button>
                            <button className={styles.rejectBtn} title="Zamítnout" onClick={() => updateStatus(r.id, 'rejected')}><XCircle size={16} color="#ef4444" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
