import { useApp } from '../../context/AppContext';
import { COLUMNS, PRIORITY_CONFIG } from '../../constants';
import { Avatar } from '../shared';
import styles from './Dashboard.module.css';

function StatCard({ label, value, accent, icon }) {
  return (
    <div className={styles.statCard} style={{ borderColor: accent + '33' }}>
      <div className={styles.statIcon} style={{ color: accent, opacity: .07 }}>{icon}</div>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue} style={{ color: accent }}>{value}</div>
    </div>
  );
}

function ProgressBar({ label, value, total, color }) {
  const pct = total ? Math.round(value / total * 100) : 0;
  return (
    <div className={styles.progressRow}>
      <div className={styles.progressTop}>
        <span className={styles.progressLabel}>{label}</span>
        <span className={styles.progressCount}>{value}</span>
      </div>
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className={styles.progressPct}>{pct}%</div>
    </div>
  );
}

export default function Dashboard() {
  const { tasks, projects, selectedProjectId } = useApp();
  const project = projects.find(p => p.id === selectedProjectId);
  const ft = tasks.filter(t => t.project_id === selectedProjectId || t.projectId === selectedProjectId);

  const todoCount  = ft.filter(t => t.status === 'TODO').length;
  const progCount  = ft.filter(t => t.status === 'IN_PROGRESS').length;
  const doneCount  = ft.filter(t => t.status === 'DONE').length;
  const highCount  = ft.filter(t => t.priority === 'high' && t.status !== 'DONE').length;
  const donePct    = ft.length ? Math.round(doneCount / ft.length * 100) : 0;

  return (
    <div className={styles.dashboard}>

      {/* Project headline */}
      <div className={styles.headline}>
        <div className={styles.headlineDot} style={{ background: project?.color }} />
        <div>
          <h1 className={styles.headlineTitle}>{project?.name || 'Projeto'}</h1>
          <p className={styles.headlineDesc}>{project?.description}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className={styles.statsGrid}>
        <StatCard label="Total de tarefas"      value={ft.length}  accent="#a5b4fc" icon="◈" />
        <StatCard label="A Fazer"               value={todoCount}  accent="#6366f1" icon="○" />
        <StatCard label="Em Progresso"          value={progCount}  accent="#f59e0b" icon="◐" />
        <StatCard label="Concluídas"            value={doneCount}  accent="#10b981" icon="●" />
        <StatCard label="Alta Prioridade"       value={highCount}  accent="#f87171" icon="!" />
        <StatCard label="Projetos ativos"       value={projects.length} accent="#a855f7" icon="⊞" />
      </div>

      {/* Progress section */}
      <div className={styles.gridTwo}>

        {/* Left: Progress by status */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Progresso geral</span>
            <span className={styles.cardBig} style={{ color: '#a5b4fc' }}>{donePct}%</span>
          </div>
          <div className={styles.bigBar}>
            <div className={styles.bigBarFill} style={{ width: `${donePct}%` }} />
          </div>
          <div className={styles.progressList}>
            {COLUMNS.map(col => (
              <ProgressBar
                key={col.id}
                label={col.label}
                value={ft.filter(t => t.status === col.id).length}
                total={ft.length}
                color={col.accent}
              />
            ))}
          </div>
        </div>

        {/* Right: Priority breakdown */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Por prioridade</span>
          </div>
          <div className={styles.progressList}>
            {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
              <ProgressBar
                key={k}
                label={v.label}
                value={ft.filter(t => t.priority === k).length}
                total={ft.length}
                color={v.dot}
              />
            ))}
          </div>
          <div className={styles.priorityCards}>
            {Object.entries(PRIORITY_CONFIG).map(([k, v]) => {
              const count = ft.filter(t => t.priority === k && t.status !== 'DONE').length;
              return (
                <div key={k} className={styles.prioCard} style={{ borderColor: v.dot + '33' }}>
                  <div className={styles.prioDot} style={{ background: v.dot }} />
                  <div className={styles.prioLabel}>{v.label}</div>
                  <div className={styles.prioCount} style={{ color: v.color }}>{count}</div>
                  <div className={styles.prioSub}>pendentes</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Tarefas recentes</span>
        </div>
        <div className={styles.activityList}>
          {ft.slice(-6).reverse().map(task => {
            const col = COLUMNS.find(c => c.id === task.status);
            return (
              <div key={task.id} className={styles.activityItem}>
                <span className={styles.activityIcon} style={{ color: col?.accent }}>{col?.icon}</span>
                <span className={styles.activityTitle}>{task.title}</span>
                <span className={styles.activityTag}
                  style={{ background: col?.accent + '18', color: col?.accent }}>
                  {col?.label}
                </span>
                <Avatar name={task.assignee || '?'} color={project?.color} size={20} />
              </div>
            );
          })}
          {ft.length === 0 && <p className={styles.noActivity}>Nenhuma tarefa ainda neste projeto.</p>}
        </div>
      </div>

    </div>
  );
}
