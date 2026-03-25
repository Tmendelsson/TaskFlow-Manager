import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../shared';
import CreateProjectModal from '../Modals/CreateProjectModal';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { id: 'board',  label: 'Board',         icon: BoardIcon },
  { id: 'dash',   label: 'Dashboard',     icon: DashIcon },
  { id: 'team',   label: 'Equipe',        icon: TeamIcon },
  { id: 'notif',  label: 'Notificações',  icon: BellIcon },
];

export default function Sidebar() {
  const {
    projects, tasks, selectedProjectId, activeView, sidebarOpen,
    unreadCount, user, dispatch, logout, selectProject,
  } = useApp();

  const [showCreateProj, setShowCreateProj] = useState(false);

  const handleSelectProject = (id) => {
    dispatch({ type: 'SELECT_PROJECT', id });
    dispatch({ type: 'SET_VIEW', view: 'board' });
  };

  if (!sidebarOpen) return null;

  return (
    <>
      <aside className={`${styles.sidebar} slide-in`}>

        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoMark}>T</div>
          <div>
            <div className={styles.logoName}>TaskFlow</div>
            <div className={styles.logoSub}>Manager v2</div>
          </div>
        </div>

        {/* Search */}
        <div className={styles.searchWrap}>
          <SearchIcon />
          <input placeholder="Buscar tarefa..." className={styles.searchInput} />
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${isActive ? styles.navActive : ''}`}
                onClick={() => dispatch({ type: 'SET_VIEW', view: item.id })}
              >
                <Icon />
                <span>{item.label}</span>
                {item.id === 'notif' && unreadCount > 0 && (
                  <span className={styles.badge}>{unreadCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Projects */}
        <div className={styles.projectsSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Projetos</span>
            <button className={styles.addBtn} onClick={() => setShowCreateProj(true)}>+</button>
          </div>

          <div className={styles.projectList}>
            {projects.map(proj => {
              const taskCount = tasks.filter(t => t.project_id === proj.id || t.projectId === proj.id).length;
              const isSelected = selectedProjectId === proj.id;
              return (
                <button
                  key={proj.id}
                  className={`${styles.projItem} ${isSelected ? styles.projActive : ''}`}
                  style={isSelected ? { background: proj.color + '18', outline: `1px solid ${proj.color}44` } : {}}
                  onClick={() => handleSelectProject(proj.id)}
                >
                  <span className={styles.projDot} style={{ background: proj.color }} />
                  <span className={styles.projName}>{proj.name}</span>
                  <span className={styles.projCount}>{taskCount}</span>
                </button>
              );
            })}

            {projects.length === 0 && (
              <p className={styles.noProjects}>Nenhum projeto ainda</p>
            )}
          </div>
        </div>

        {/* User */}
        <div className={styles.userSection}>
          <Avatar name={user?.name || 'U'} color="#6366f1" size={30} />
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.name || 'Usuário'}</div>
            <div className={styles.userRole}>{user?.role || 'Membro'}</div>
          </div>
          <button className={styles.logoutBtn} onClick={logout} title="Sair">
            <LogoutIcon />
          </button>
        </div>
      </aside>

      <CreateProjectModal open={showCreateProj} onClose={() => setShowCreateProj(false)} />
    </>
  );
}

// ── SVG Icons ──────────────────────────────────────────────
function SearchIcon() {
  return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}>
    <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 10 L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>;
}
function BoardIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="1" width="6" height="14" rx="2" opacity=".8"/>
    <rect x="9" y="1" width="6" height="8" rx="2" opacity=".8"/>
    <rect x="9" y="11" width="6" height="4" rx="2" opacity=".8"/>
  </svg>;
}
function DashIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="1" width="6" height="7" rx="2" opacity=".7"/>
    <rect x="9" y="1" width="6" height="4" rx="2" opacity=".7"/>
    <rect x="1" y="10" width="6" height="5" rx="2" opacity=".7"/>
    <rect x="9" y="7" width="6" height="8" rx="2" opacity=".7"/>
  </svg>;
}
function TeamIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <circle cx="6" cy="5" r="3" opacity=".7"/>
    <path d="M1 14c0-3 2-5 5-5s5 2 5 5" opacity=".7"/>
    <circle cx="12" cy="5" r="2" opacity=".5"/>
    <path d="M11 14c0-1.5.5-2.5 1.5-3.5" opacity=".5" strokeWidth=".5" fill="none" stroke="currentColor"/>
  </svg>;
}
function BellIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1a5 5 0 0 0-5 5v3l-1.5 2H14.5L13 9V6a5 5 0 0 0-5-5z" opacity=".7"/>
    <path d="M6.5 14a1.5 1.5 0 0 0 3 0" opacity=".7"/>
  </svg>;
}
function LogoutIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>
    <path d="M11 11l3-3-3-3M14 8H6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}
