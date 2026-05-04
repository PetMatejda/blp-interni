'use client';

import { useState, useRef } from 'react';
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
  Filter
} from 'lucide-react';
import styles from './page.module.css';

interface Receipt {
  id: string;
  user: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  paymentType: 'company' | 'personal';
  status: 'pending' | 'approved' | 'paid';
  imageUrl: string;
}

const MOCK_RECEIPTS: Receipt[] = [
  {
    id: '1',
    user: 'Marek Rad.',
    amount: 1540,
    currency: 'CZK',
    date: '2026-05-01',
    description: 'Benzín - Stillking zakázka',
    paymentType: 'company',
    status: 'approved',
    imageUrl: 'https://via.placeholder.com/150'
  },
  {
    id: '2',
    user: 'Petr Matej.',
    amount: 450,
    currency: 'CZK',
    date: '2026-05-03',
    description: 'Oběd s klientem (GALAXY)',
    paymentType: 'personal',
    status: 'pending',
    imageUrl: 'https://via.placeholder.com/150'
  }
];

import { useAuth } from '@/components/AuthProvider';

const ADMIN_EMAIL = 'petmatejda@gmail.com';

export default function ReceiptsPage() {
  const { user } = useAuth();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'upload' | 'confirm'>('upload');
  
  const isUserAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;
  const [isAdmin, setIsAdmin] = useState(false); 

  // OCR simulation state
  const [extractedData, setExtractedData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'BLP',
    paymentType: 'personal' as 'company' | 'personal'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
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
        amount: (Math.random() * 2000 + 100).toFixed(0),
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: 'BLP',
        paymentType: 'personal'
      });
      setIsProcessing(false);
    }, 2000);
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2>Skenování účtenek</h2>
          <p>Vyfoťte nebo nahrajte doklad pro proplacení nebo evidenci nákladů.</p>
        </div>
        {isUserAdmin && (
          <button className={styles.adminToggle} onClick={() => setIsAdmin(!isAdmin)}>
            {isAdmin ? 'Zobrazit moje účtenky' : 'Administrace (Admin View)'}
          </button>
        )}
      </div>

      {!isAdmin ? (
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
                  accept="image/*" 
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={capturedImage!} alt="Receipt" />
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
                        Firemní peníze (karta/hotovost)
                      </button>
                      <button 
                        className={extractedData.paymentType === 'personal' ? styles.active : ''}
                        onClick={() => setExtractedData({...extractedData, paymentType: 'personal'})}
                      >
                        Soukromé peníze (k proplacení)
                      </button>
                    </div>
                  </div>
                </div>
                <div className={styles.formActions}>
                  <button className={styles.cancelBtn} onClick={handleReset}>Zrušit</button>
                  <button className={styles.saveBtn} onClick={handleReset}>
                    <Check size={20} /> Odeslat ke schválení
                  </button>
                </div>
              </div>
            </div>
          )}

          <section className={styles.historySection}>
            <h3>Moje nedávné účtenky</h3>
            <div className={styles.receiptList}>
              {MOCK_RECEIPTS.map(r => (
                <div key={r.id} className={styles.receiptRow}>
                  <div className={styles.rIcon}><FileText size={20} /></div>
                  <div className={styles.rMain}>
                    <strong>{r.description}</strong>
                    <span>{r.date}</span>
                  </div>
                  <div className={styles.rAmount}>
                    <strong>{r.amount} {r.currency}</strong>
                    <span className={styles[r.paymentType]}>
                      {r.paymentType === 'company' ? 'Firemní' : 'K proplacení'}
                    </span>
                  </div>
                  <div className={`${styles.status} ${styles[r.status]}`}>
                    {r.status}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className={styles.adminView}>
          <div className={styles.adminToolbar}>
            <div className={styles.search}>
              <Search size={18} />
              <input type="text" placeholder="Hledat podle jména, účelu..." />
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
              {[...MOCK_RECEIPTS, ...MOCK_RECEIPTS].map((r, i) => (
                <tr key={i}>
                  <td>
                    <div className={styles.userName}>
                      <div className={styles.miniAvatar}>{r.user.charAt(0)}</div>
                      {r.user}
                    </div>
                  </td>
                  <td>{r.date}</td>
                  <td>{r.description}</td>
                  <td><strong>{r.amount} {r.currency}</strong></td>
                  <td>
                    <span className={`${styles.typeBadge} ${styles[r.paymentType]}`}>
                      {r.paymentType === 'company' ? 'Firemní' : 'Soukromé'}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button title="Zobrazit detail"><Eye size={16} /></button>
                      <button className={styles.approveBtn} title="Schválit"><Check size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
