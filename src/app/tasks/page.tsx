'use client';

import { useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Calendar as CalendarIcon, 
  List, 
  MapPin, 
  Package, 
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  Edit2,
  Trash2,
  Save,
  CheckCircle2
} from 'lucide-react';
import styles from './page.module.css';

const MOCK_PROJECTS = [
  {
    id: 1,
    title: 'Tom Ford Movie',
    client: 'Riccardo',
    location: 'Regia Caserta',
    preparation: 'Pátek 6.3. večer',
    shooting: '9, 11, 12.3.',
    material: '1x LED RGB balloon 3,7m, 2x LED RGB Cloud 8x6, 6x LED Ball 1,4m',
    status: 'Confirmed',
    color: '#dcfce7' // Greenish
  },
  {
    id: 2,
    title: 'Stillking - Schnapps',
    client: 'Stillking',
    location: 'Kostel Gabriel',
    preparation: '8-9.3. neděle/pondělí',
    shooting: '11.3. - 13.3.',
    material: '4x Cloud 8x6 RGBWW, 20 flatlights 8x4',
    status: 'Confirmed',
    color: '#f3e8ff' // Purpleish
  },
  {
    id: 3,
    title: 'GALAXY TWILIGHT',
    client: 'GALAXY',
    location: 'HARRIS OFFICE',
    preparation: 'Úterý 10.3.',
    shooting: '12.3. čtvrtek',
    material: '3x flatlight 8x4, 4ks flatlight 4x4, 1pc Cloud 4,5x 4x5 with helium',
    status: 'Pending',
    color: '#fef3c7' // Yellowish
  }
];

const MOCK_SCHEDULE = [
  { name: 'Marek Rad.', assignments: { '4.5.': 'Camilla', '5.5.': 'Camilla', '7.5.': 'Armelov', '8.5.': 'Armelov' } },
  { name: 'Petr Matej.', assignments: { '4.5.': 'Camilla', '8.5.': 'Armelov', '9.5.': 'Armelov' } },
  { name: 'Jirka Hollan', assignments: { '4.5.': 'Sklad', '5.5.': 'Sklad', '6.5.': 'Sklad' } },
];

export default function TasksPage() {
  const [view, setView] = useState<'list' | 'schedule'>('list');
  const [selectedProject, setSelectedProject] = useState<typeof MOCK_PROJECTS[0] | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<{name: string, date: string} | null>(null);
  const [materialList, setMaterialList] = useState(MOCK_PROJECTS[0].material.split(', '));
  const [newMaterial, setNewMaterial] = useState('');

  const handleAddMaterial = () => {
    if (newMaterial.trim()) {
      setMaterialList([...materialList, newMaterial.trim()]);
      setNewMaterial('');
    }
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterialList(materialList.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2>Tabulka Prací & Projekty</h2>
          <p>Správa filmových zakázek a plánování kapacit týmu.</p>
        </div>
        <div className={styles.viewToggle}>
          <button 
            className={`${styles.toggleBtn} ${view === 'list' ? styles.active : ''}`}
            onClick={() => setView('list')}
          >
            <List size={18} />
            Seznam projektů
          </button>
          <button 
            className={`${styles.toggleBtn} ${view === 'schedule' ? styles.active : ''}`}
            onClick={() => setView('schedule')}
          >
            <CalendarIcon size={18} />
            Harmonogram týmu
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className={styles.listView}>
          <div className={styles.toolbar}>
            <div className={styles.searchBar}>
              <Search size={18} />
              <input type="text" placeholder="Hledat projekt, lokalitu nebo klienta..." />
            </div>
            <button className={styles.addBtn}>
              <Plus size={18} />
              Nový Projekt
            </button>
          </div>

          <div className={styles.projectGrid}>
            {MOCK_PROJECTS.map(project => (
              <div key={project.id} className={styles.projectCard} style={{ borderLeftColor: project.color }}>
                <div className={styles.projectHeader}>
                  <div className={styles.projectInfo}>
                    <span className={styles.clientBadge}>{project.client}</span>
                    <h3>{project.title}</h3>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[project.status.toLowerCase()]}`}>
                    {project.status}
                  </span>
                </div>
                
                <div className={styles.projectDetails}>
                  <div className={styles.detailItem}>
                    <MapPin size={16} />
                    <span>{project.location}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <CalendarIcon size={16} />
                    <span><strong>Příprava:</strong> {project.preparation}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <CalendarIcon size={16} />
                    <span><strong>Točení:</strong> {project.shooting}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <Package size={16} />
                    <span className={styles.materialText}>{project.material.substring(0, 60)}...</span>
                  </div>
                </div>

                <div className={styles.projectFooter}>
                  <div className={styles.assignedTeam}>
                    <Users size={16} />
                    <div className={styles.avatars}>
                      <div className={styles.avatarMini} title="Marek R.">MR</div>
                      <div className={styles.avatarMini} title="Petr M.">PM</div>
                    </div>
                  </div>
                  <button 
                    className={styles.detailsBtn}
                    onClick={() => {
                      setSelectedProject(project);
                      setMaterialList(project.material.split(', '));
                    }}
                  >
                    Detail projektu
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.scheduleView}>
          <div className={styles.scheduleHeader}>
            <div className={styles.scheduleNav}>
              <button><ChevronLeft size={20} /></button>
              <h3>Květen 2026</h3>
              <button><ChevronRight size={20} /></button>
            </div>
            <div className={styles.legend}>
              <div className={styles.legendItem}><span className={styles.dot} style={{background: '#dcfce7'}}></span> Točba</div>
              <div className={styles.legendItem}><span className={styles.dot} style={{background: '#fef3c7'}}></span> Sklad</div>
              <div className={styles.legendItem}><span className={styles.dot} style={{background: '#f3e8ff'}}></span> Příprava</div>
            </div>
          </div>

          <div className={styles.scheduleTableWrapper}>
            <table className={styles.scheduleTable}>
              <thead>
                <tr>
                  <th className={styles.stickyCol}>Jméno</th>
                  {[...Array(15)].map((_, i) => (
                    <th key={i}>{i + 1}.5.</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_SCHEDULE.map((worker, i) => (
                  <tr key={i}>
                    <td className={styles.stickyCol}>{worker.name}</td>
                    {[...Array(15)].map((_, day) => {
                      const dateStr = `${day + 1}.5.`;
                      const assignment = worker.assignments[dateStr as keyof typeof worker.assignments];
                      return (
                        <td 
                          key={day} 
                          className={styles.clickableCell}
                          onClick={() => setEditingAssignment({ name: worker.name, date: dateStr })}
                        >
                          {assignment ? (
                            <div className={`${styles.assignment} ${styles[assignment.toLowerCase()] || styles.defaultAssignment}`}>
                              {assignment.charAt(0)}
                            </div>
                          ) : (
                            <div className={styles.emptyCell}>+</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <span className={styles.clientLabel}>{selectedProject.client}</span>
                <h2>{selectedProject.title}</h2>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedProject(null)}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalSidebar}>
                <div className={styles.sidebarSection}>
                  <label>Status</label>
                  <select className={styles.selectField} defaultValue={selectedProject.status.toLowerCase()}>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className={styles.sidebarSection}>
                  <label>Lokalita</label>
                  <div className={styles.sidebarValue}>
                    <MapPin size={16} /> {selectedProject.location}
                  </div>
                </div>
                <div className={styles.sidebarSection}>
                  <label>Harmonogram</label>
                  <div className={styles.sidebarValue}>
                    <strong>Příprava:</strong><br /> {selectedProject.preparation}
                  </div>
                  <div className={styles.sidebarValue}>
                    <strong>Točení:</strong><br /> {selectedProject.shooting}
                  </div>
                </div>
              </div>

              <div className={styles.modalMain}>
                <div className={styles.section}>
                  <h3><Package size={20} /> Seznam materiálu</h3>
                  <div className={styles.materialManager}>
                    <div className={styles.addMaterial}>
                      <input 
                        type="text" 
                        placeholder="Přidat techniku..." 
                        value={newMaterial}
                        onChange={(e) => setNewMaterial(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddMaterial()}
                      />
                      <button onClick={handleAddMaterial}><Plus size={18} /></button>
                    </div>
                    <div className={styles.materialsList}>
                      {materialList.map((item, idx) => (
                        <div key={idx} className={styles.materialItem}>
                          <span>{item}</span>
                          <button onClick={() => handleRemoveMaterial(idx)}><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.section}>
                  <h3><Users size={20} /> Přiřazený tým</h3>
                  <div className={styles.teamGrid}>
                    <div className={styles.teamMember}>
                      <div className={styles.avatar}>MR</div>
                      <div className={styles.memberInfo}>
                        <strong>Marek Rad.</strong>
                        <span>Main Rigger</span>
                      </div>
                      <button className={styles.removeMember}><Trash2 size={16} /></button>
                    </div>
                    <div className={styles.teamMember}>
                      <div className={styles.avatar}>PM</div>
                      <div className={styles.memberInfo}>
                        <strong>Petr Matej.</strong>
                        <span>Technik</span>
                      </div>
                      <button className={styles.removeMember}><Trash2 size={16} /></button>
                    </div>
                    <button className={styles.addMemberBtn}><Plus size={18} /> Přidat člena</button>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setSelectedProject(null)}>Zrušit</button>
              <button className={styles.saveBtn}>
                <Save size={18} /> Uložit změny
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Edit Modal */}
      {editingAssignment && (
        <div className={styles.modalOverlay}>
          <div className={styles.smallModal}>
            <div className={styles.modalHeader}>
              <h3>Přiřazení práce</h3>
              <button onClick={() => setEditingAssignment(null)}><X size={20} /></button>
            </div>
            <div className={styles.assignmentForm}>
              <p><strong>Kdo:</strong> {editingAssignment.name}</p>
              <p><strong>Datum:</strong> {editingAssignment.date}</p>
              <div className={styles.formGroup}>
                <label>Vyberte projekt / aktivitu</label>
                <select className={styles.selectField}>
                  <option value="">-- Žádná práce --</option>
                  <option value="tom ford">Tom Ford Movie</option>
                  <option value="schnapps">Stillking - Schnapps</option>
                  <option value="galaxy">GALAXY TWILIGHT</option>
                  <option value="sklad">Práce ve skladu</option>
                  <option value="volno">Volno</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Poznámka</label>
                <textarea className={styles.textareaField} placeholder="Např. rigging, cesta letadlem..."></textarea>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setEditingAssignment(null)}>Zavřít</button>
              <button className={styles.saveBtn} onClick={() => setEditingAssignment(null)}>
                <CheckCircle2 size={18} /> Potvrdit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
