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

interface Project {
  id: string;
  title: string;
  client: string;
  location: string;
  material_list: string;
  status: string;
  color_code: string;
  shooting?: string;
  preparation?: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface Assignment {
  id: string;
  project_id: string;
  user_id: string;
  date: string;
  note?: string;
  profiles?: Profile;
  projects?: { title: string, color_code: string, status: string };
}



export default function TasksPage() {
  const [view, setView] = useState<'list' | 'schedule'>('list');
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<{name: string, date: string} | null>(null);
  const [materialList, setMaterialList] = useState<string[]>([]);
  const [newMaterial, setNewMaterial] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);

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

  const fetchAllAssignments = useCallback(async () => {
    const { data, error } = await supabase
      .from('assignments')
      .select('*, projects(title, color_code, status)');
    
    if (error) console.error('Error fetching all assignments:', error);
    else setAllAssignments(data || []);
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProjects(), fetchProfiles(), fetchAllAssignments()]);
      setLoading(false);
    };
    init();
  }, [fetchProjects, fetchProfiles, fetchAllAssignments]);

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

  const handleAddMaterial = () => {
    if (newMaterial.trim()) {
      setMaterialList([...materialList, newMaterial.trim()]);
      setNewMaterial('');
    }
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterialList(materialList.filter((_, i) => i !== index));
  };

  const handleAddProject = () => {
    setSelectedProject({
      id: 'new',
      title: '',
      client: '',
      location: '',
      material_list: '',
      status: 'pending',
      color_code: '#cbd5e1',
      shooting: '',
      preparation: ''
    });
    setMaterialList([]);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProject = async () => {
      if (!selectedProject) return;
      setIsSaving(true);
      
      const projectData = {
        title: selectedProject.title || 'Nový Projekt',
        client: selectedProject.client || '',
        location: selectedProject.location || '',
        material_list: materialList.join(', '),
        status: selectedProject.status || 'pending',
        color_code: selectedProject.color_code || '#cbd5e1',
        shooting: selectedProject.shooting || '',
        preparation: selectedProject.preparation || ''
      };

      try {
        if (selectedProject.id === 'new') {
          const { error } = await supabase.from('projects').insert([projectData]);
          if (error) {
            console.error('Insert error:', error);
            alert('Chyba při vytváření: ' + error.message);
          } else {
            await fetchProjects();
            setSelectedProject(null);
          }
        } else {
          const { error } = await supabase.from('projects').update(projectData).eq('id', selectedProject.id);
          if (error) {
            console.error('Update error:', error);
            alert('Chyba při aktualizaci: ' + error.message);
          } else {
            await fetchProjects();
            setSelectedProject(null);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        alert('Neočekávaná chyba při ukládání.');
      } finally {
        setIsSaving(false);
      }
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
            <button className={styles.addBtn} onClick={handleAddProject}>
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
                  {[...Array(31)].map((_, i) => (
                    <th key={i}>{i + 1}.5.</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {profiles.map((worker) => (
                  <tr key={worker.id}>
                    <td className={styles.stickyCol}>{worker.full_name}</td>
                    {[...Array(31)].map((_, day) => {
                      const dateStr = `2026-05-${(day + 1).toString().padStart(2, '0')}`;
                      const displayDate = `${day + 1}.5.`;
                      const assignment = allAssignments.find(a => a.user_id === worker.id && a.date === dateStr);
                      return (
                        <td 
                          key={day} 
                          className={styles.clickableCell}
                          onClick={() => setEditingAssignment({ name: worker.full_name, date: displayDate })}
                        >
                          {assignment ? (
                            <div 
                              className={`${styles.assignment} ${styles.defaultAssignment}`}
                              style={assignment.projects?.color_code ? { backgroundColor: assignment.projects.color_code, color: '#000', border: 'none' } : {}}
                              title={assignment.projects?.title}
                            >
                              {assignment.note || assignment.projects?.title || 'Práce'}
                            </div>
                          ) : null}
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
                <input 
                  className={styles.clientLabelInput} 
                  placeholder="KLIENT"
                  value={selectedProject.client || ''} 
                  onChange={e => setSelectedProject({...selectedProject, client: e.target.value})} 
                />
                <input 
                  className={styles.titleInput} 
                  placeholder="Název projektu"
                  value={selectedProject.title || ''} 
                  onChange={e => setSelectedProject({...selectedProject, title: e.target.value})} 
                />
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedProject(null)}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalSidebar}>
                <div className={styles.sidebarSection}>
                  <label>Status</label>
                  <select 
                    className={styles.selectField} 
                    value={selectedProject.status?.toLowerCase() || 'pending'}
                    onChange={e => setSelectedProject({...selectedProject, status: e.target.value})}
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="not confirmed">Not Confirmed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className={styles.sidebarSection}>
                  <label>Lokalita / Set</label>
                  <div className={styles.sidebarValue}>
                    <MapPin size={16} /> 
                    <input 
                      className={styles.sidebarInput} 
                      placeholder="Např. Studio 1"
                      value={selectedProject.location || ''} 
                      onChange={e => setSelectedProject({...selectedProject, location: e.target.value})} 
                    />
                  </div>
                </div>
                <div className={styles.sidebarSection}>
                  <label>Harmonogram</label>
                  <div className={styles.sidebarValue}>
                    <strong>Příprava:</strong>
                    <input 
                      className={styles.sidebarInput} 
                      placeholder="Např. 28.4. rigg"
                      value={selectedProject.preparation || ''} 
                      onChange={e => setSelectedProject({...selectedProject, preparation: e.target.value})} 
                    />
                  </div>
                  <div className={styles.sidebarValue}>
                    <strong>Točení:</strong>
                    <input 
                      className={styles.sidebarInput} 
                      placeholder="Např. 29.4. točba"
                      value={selectedProject.shooting || ''} 
                      onChange={e => setSelectedProject({...selectedProject, shooting: e.target.value})} 
                    />
                  </div>
                </div>
                <div className={styles.sidebarSection}>
                  <label>Barva</label>
                  <input 
                    type="color" 
                    value={selectedProject.color_code || '#cbd5e1'} 
                    onChange={e => setSelectedProject({...selectedProject, color_code: e.target.value})} 
                    style={{width: '100%', height: '40px', padding: '0', border: 'none', borderRadius: '4px'}}
                  />
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
                  {selectedProject.id === 'new' ? (
                    <p className={styles.infoMessage}>Před přiřazením týmu musíte projekt nejprve uložit.</p>
                  ) : (
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
                          <button 
                            className={styles.removeMember}
                            onClick={async () => {
                              if (confirm('Odebrat člena z projektu?')) {
                                const { error } = await supabase.from('assignments').delete().eq('id', assignment.id);
                                if (error) alert(error.message);
                                else fetchAssignments(selectedProject.id);
                              }
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
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
                  )}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setSelectedProject(null)}>Zrušit</button>
              <button 
                className={styles.saveBtn} 
                onClick={handleSaveProject}
                disabled={isSaving}
              >
                {isSaving ? 'Ukládám...' : <><Save size={18} /> Uložit změny</>}
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
