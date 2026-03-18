import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import Board from '../components/Board';
import Dashboard from '../components/Dashboard';
import Team from '../components/Team';
import Notifications from '../components/Notifications';
import styles from './AppLayout.module.css';

export default function AppLayout() {
  const {
    projects, selectedProjectId, activeView,
    sidebarOpen, unreadCount, dispatch,
  } = useApp();

  const project = projects.find(p => p.id === selectedProjectId);

  const views = {
    board:  <Board />,
    dash:   <Dashboard />,
    team:   <Team />,
    notif:  <Notifications />,
  };

  return (
    <div className={styles.layout}>
      <Sidebar />

      <div className={styles.main}>
        {/* Top Bar */}
        <header className={styles.topbar}>
          {/* Toggle sidebar */}
          <button
            className={styles.toggleBtn}
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            title={sidebarOpen ? 'Fechar sidebar' : 'Abrir sidebar'}
          >
            <HamburgerIcon />
          </button>

          {/* Project name + status */}
          <div className={styles.projectMeta}>
            {project && (
              <>
                <span className={styles.projectDot} style={{ background: project.color }} />
                <span className={styles.projectName}>{project.name}</span>
                <span className={styles.projectStatus}>Ativo</span>
              </>
            )}
          </div>

          {/* View title */}
          <div className={styles.viewLabel}>
            {activeView === 'board' && 'Kanban Board'}
            {activeView === 'dash'  && 'Dashboard'}
            {activeView === 'team'  && 'Equipe'}
            {activeView === 'notif' && 'Notificações'}
          </div>

          {/* Right actions */}
          <div className={styles.topbarRight}>
            {/* Notification bell shortcut */}
            <button
              className={styles.bellBtn}
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'notif' })}
              title="Notificações"
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span className={styles.bellCount}>{unreadCount}</span>
              )}
            </button>
          </div>
        </header>

        {/* View content */}
        <main className={styles.content}>
          {views[activeView] || <Board />}
        </main>
      </div>
    </div>
  );
}

function HamburgerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <line x1="2" y1="4" x2="14" y2="4"/>
      <line x1="2" y1="8" x2="14" y2="8"/>
      <line x1="2" y1="12" x2="14" y2="12"/>
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1a5 5 0 0 0-5 5v3l-1.5 2H14.5L13 9V6a5 5 0 0 0-5-5z" opacity=".8"/>
      <path d="M6.5 14a1.5 1.5 0 0 0 3 0" opacity=".8"/>
    </svg>
  );
}
