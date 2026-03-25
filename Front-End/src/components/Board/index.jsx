import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TaskCard } from './TaskCard';
import { EmptyState, Spinner, Button } from '../shared';
import { COLUMNS, TAG_COLORS, PRIORITY_CONFIG } from '../../constants';
import styles from './Board.module.css';

// ── Kanban Column ──────────────────────────────────────────
function KanbanColumn({ column, tasks, projectColor }) {
  return (
    <div className={styles.column}>
      {/* Column header */}
      <div className={styles.columnHeader}>
        <div className={styles.columnLeft}>
          <span className={styles.colIcon} style={{ color: column.accent }}>{column.icon}</span>
          <span className={styles.colLabel}>{column.label}</span>
        </div>
        <span className={styles.colCount} style={{ background: column.accent + '22', color: column.accent }}>
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <div className={styles.cardList}>
        {tasks.length === 0 ? (
          <EmptyState icon={column.icon} message="Nenhuma tarefa aqui" />
        ) : (
          tasks.map(task => (
            <div key={task.id} className="fade-in">
              <TaskCard task={task} projectColor={projectColor} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Board ──────────────────────────────────────────────────
export default function Board() {
  const { tasks, projects, selectedProjectId, loadingTasks, createTask } = useApp();
  const project = projects.find(p => p.id === selectedProjectId);

  const [filterUser, setFilterUser]     = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', status: 'TODO',
    priority: 'medium', tag: 'task', assignee: 'AV',
  });
  const [submitting, setSubmitting] = useState(false);

  const filtered = tasks.filter(t => {
    const byUser     = !filterUser     || t.assignee === filterUser;
    const byPriority = !filterPriority || t.priority === filterPriority;
    return byUser && byPriority;
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      await createTask(form);
      setForm({ title: '', description: '', status: 'TODO', priority: 'medium', tag: 'task', assignee: 'AV' });
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTasks) {
    return (
      <div className={styles.loading}>
        <Spinner size={32} />
        <span>Carregando tarefas...</span>
      </div>
    );
  }

  return (
    <div className={styles.board}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <select value={filterUser} onChange={e => setFilterUser(e.target.value)} className={styles.filterSelect}>
            <option value="">Todos usuários</option>
            <option value="AV">AV — Alexsander</option>
            <option value="BM">BM — Bruno</option>
            <option value="CL">CL — Carol</option>
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className={styles.filterSelect}>
            <option value="">Toda prioridade</option>
            {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          {(filterUser || filterPriority) && (
            <button className={styles.clearBtn} onClick={() => { setFilterUser(''); setFilterPriority(''); }}>
              Limpar filtros ×
            </button>
          )}
        </div>
        <Button onClick={() => setShowForm(v => !v)}>
          {showForm ? '× Fechar' : '+ Nova Tarefa'}
        </Button>
      </div>

      {/* Task creation form */}
      {showForm && (
        <form className={`${styles.createForm} fade-in`} onSubmit={handleCreate}>
          <input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="✦  Título da tarefa *"
            className={styles.formTitle}
            autoFocus
          />
          <div className={styles.formRow}>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Descrição..."
              className={styles.formDesc}
              rows={2}
            />
          </div>
          <div className={styles.formSelects}>
            <select value={form.status}   onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label} prioridade</option>)}
            </select>
            <select value={form.tag}      onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}>
              {Object.keys(TAG_COLORS).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}>
              <option value="AV">AV — Alexsander</option>
              <option value="BM">BM — Bruno</option>
              <option value="CL">CL — Carol</option>
            </select>
          </div>
          <div className={styles.formActions}>
            <Button type="submit" disabled={submitting || !form.title.trim()}>
              {submitting ? 'Criando...' : 'Criar Tarefa'}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      {/* Columns */}
      <div className={styles.columns}>
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={filtered.filter(t => t.status === col.id)}
            projectColor={project?.color || '#6366f1'}
          />
        ))}
      </div>
    </div>
  );
}
