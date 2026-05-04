'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  Calendar as CalendarIcon, 
  List, 
  MapPin, 
  Package, 
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
  Save,
  CheckCircle2
} from 'lucide-react';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

export default function TasksPage() {
  const { user: currentUser } = useAuth();
  const [view, setView] = useState<'list' | 'schedule'>('list');
  const [projects, setProjects] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<{name: string, date: string} | null>(null);
  const [materialList, setMaterialList] = useState<string[]>([]);
  const [newMaterial, setNewMaterial] = useState('');
  const [assignments, setAssignments] = useState<any[]>([]);

  const fetchProjects = useCallback(async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching projects:', error);
    else setProjects(data || []);
  }, []);

  const fetchProfiles = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) console.error('Error fetching profiles:', error);
    else setProfiles(data || []);
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProjects(), fetchProfiles()]);
      setLoading(false);
    };
    init();
  }, [fetchProjects, fetchProfiles]);

  const fetchAssignments = useCallback(async (projectId: string) => {
    const { data, error } = await supabase
      .from('assignments')
      .select('*, profiles(*)')
      .eq('project_id', projectId);
    
    if (error) console.error('Error fetching assignments:', error);
    else setAssignments(data || []);
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchAssignments(selectedProject.id);
    }
  }, [selectedProject, fetchAssignments]);

  const handleAddMember = async () => {
    const userId = prompt('Zadejte ID uživatele nebo vyberte ze seznamu (v budoucnu):');
    if (!userId || !selectedProject) return;

    const { error } = await supabase
      .from('assignments')
      .insert([{ 
        project_id: selectedProject.id, 
        user_id: userId,
        date: new Date().toISOString().split('T')[0] // Default to today
      }]);

    if (error) {
      alert('Chyba při přidávání člena: ' + error.message);
    } else {
      fetchAssignments(selectedProject.id);
    }
  };

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
            {loading && <p>Načítání projektů...</p>}
            {!loading && projects.length === 0 && <p>Žádné projekty nenalezeny.</p>}
            {projects.map(project => (
              <div key={project.id} className={styles.projectCard} style={{ borderLeftColor: project.color_code || '#cbd5e1' }}>
                <div className={styles.projectHeader}>
                  <div className={styles.projectInfo}>
                    <span className={styles.clientBadge}>{project.client}</span>
                    <h3>{project.title}</h3>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[project.status?.toLowerCase() || 'pending']}`}>
                    {project.status || 'Pending'}
                  </span>
                </div>
                
                <div className={styles.projectDetails}>
                  <div className={styles.detailItem}>
                    <MapPin size={16} />
                    <span>{project.location}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <CalendarIcon size={16} />
                    <span><strong>Točení:</strong> {project.shooting || 'Termín neurčen'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <Package size={16} />
                    <span className={styles.materialText}>{project.material_list?.substring(0, 60) || 'Žádný materiál'}...</span>
                  </div>
                </div>

                <div className={styles.projectFooter}>
                  <div className={styles.assignedTeam}>
                    <Users size={16} />
                    <div className={styles.avatars}>
                      <div className={styles.avatarMini} title="Více info v detailu">?</div>
                    </div>
                  </div>
                  <button 
                    className={styles.detailsBtn}
                    onClick={() => {
                      setSelectedProject(project);
                      setMaterialList(project.material_list ? project.material_list.split(', ') : []);
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
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className={styles.teamMember}>
                        <div className={styles.avatar}>
                          {assignment.profiles?.full_name?.substring(0, 2).toUpperCase() || '??'}
                        </div>
                        <div className={styles.memberInfo}>
                          <strong>{assignment.profiles?.full_name || 'Neznámý'}</strong>
                          <span>{assignment.note || 'Člen týmu'}</span>
                        </div>
                        <button className={styles.removeMember}><Trash2 size={16} /></button>
                      </div>
                    ))}
                    
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Přidat člena:</label>
                      <select 
                        className={styles.selectField}
                        onChange={(e) => {
                          if (e.target.value) {
                            const selectedUser = profiles.find(p => p.id === e.target.value);
                            if (selectedUser && confirm(`Přidat uživatele ${selectedUser.full_name} k projektu?`)) {
                              (async () => {
                                const { error } = await supabase
                                  .from('assignments')
                                  .insert([{ 
                                    project_id: selectedProject.id, 
                                    user_id: selectedUser.id,
                                    date: new Date().toISOString().split('T')[0]
                                  }]);
                                if (error) alert(error.message);
                                else fetchAssignments(selectedProject.id);
                              })();
                            }
                          }
                        }}
                      >
                        <option value="">-- Vyberte zaměstnance --</option>
                        {profiles.map(profile => (
                          <option key={profile.id} value={profile.id}>{profile.full_name || profile.id}</option>
                        ))}
                      </select>
                    </div>
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
