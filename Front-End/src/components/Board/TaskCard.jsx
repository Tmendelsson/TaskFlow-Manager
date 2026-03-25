import { useState } from 'react';
import { Avatar, TagBadge, PriorityBadge, Modal, Button, Spinner } from '../shared';
import { COLUMNS } from '../../constants';
import { commentsAPI, tasksAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import styles from './TaskCard.module.css';

// ── Task Card (Kanban tile) ─────────────────────────────────
export function TaskCard({ task, projectColor }) {
  const [showDetail, setShowDetail] = useState(false);
  const { moveTask } = useApp();

  return (
    <>
      <div className={styles.card} onClick={() => setShowDetail(true)}>
        {/* Left accent bar */}
        <div className={styles.accentBar} style={{ background: projectColor }} />

        {/* Top row: badges + avatar */}
        <div className={styles.topRow}>
          <div className={styles.badges}>
            <TagBadge tag={task.tag} />
            <PriorityBadge priority={task.priority} />
          </div>
          <Avatar name={task.assignee || '?'} color={projectColor} size={22} />
        </div>

        {/* Title */}
        <div className={styles.title}>{task.title}</div>

        {/* Description */}
        {task.description && (
          <div className={styles.desc}>{task.description}</div>
        )}

        {/* Comment count */}
        {task.comments_count > 0 && (
          <div className={styles.commentCount}>
            <CommentIcon /> {task.comments_count} comentário{task.comments_count > 1 ? 's' : ''}
          </div>
        )}

        {/* Attachment count */}
        {task.attachments_count > 0 && (
          <div className={styles.commentCount}>
            <ClipIcon /> {task.attachments_count} arquivo{task.attachments_count > 1 ? 's' : ''}
          </div>
        )}

        {/* Status buttons */}
        <div className={styles.statusRow} onClick={e => e.stopPropagation()}>
          {COLUMNS.map(col => (
            <button
              key={col.id}
              className={`${styles.statusBtn} ${task.status === col.id ? styles.statusActive : ''}`}
              style={task.status === col.id ? { background: col.accent, color: '#fff' } : {}}
              onClick={() => moveTask(task.id, col.id)}
            >
              {col.label}
            </button>
          ))}
        </div>
      </div>

      <TaskDetailModal
        taskId={task.id}
        open={showDetail}
        onClose={() => setShowDetail(false)}
        projectColor={projectColor}
      />
    </>
  );
}

// ── Task Detail Modal ──────────────────────────────────────
function TaskDetailModal({ taskId, open, onClose, projectColor }) {
  const { tasks, projects, moveTask, updateTask, deleteTask } = useApp();
  const task = tasks.find(t => t.id === taskId);
  const project = projects.find(p => p.id === (task?.project_id || task?.projectId));

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [uploading, setUploading] = useState(false);

  const handleOpen = () => {
    if (!task) return;
    setEditData({ title: task.title, description: task.description, priority: task.priority, assignee: task.assignee });
    setLoadingComments(true);
    commentsAPI.list(taskId)
      .then(res => setComments(res.data))
      .catch(() => setComments(task.comments || []))
      .finally(() => setLoadingComments(false));
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await commentsAPI.create(taskId, { text: newComment });
      setComments(prev => [...prev, res.data]);
      setNewComment('');
    } catch {
      setComments(prev => [...prev, { id: Date.now(), text: newComment, author: 'Eu', created_at: new Date().toISOString() }]);
      setNewComment('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    await updateTask(taskId, editData);
    setEditMode(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    await tasksAPI.uploadFile(taskId, formData).catch(console.error);
    setUploading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Deletar esta tarefa?')) return;
    await deleteTask(taskId);
    onClose();
  };

  if (!task) return null;
  const currentCol = COLUMNS.find(c => c.id === task.status);

  return (
    <Modal open={open} onClose={onClose} title="" width={560}>
      {/* On modal open effect */}
      {open && <span style={{ display: 'none' }} ref={() => handleOpen()} />}

      {/* Header */}
      <div className={styles.detailHeader}>
        <div className={styles.detailBadges}>
          <TagBadge tag={task.tag} />
          <PriorityBadge priority={task.priority} />
          <span className={styles.statusPill} style={{ background: currentCol?.accent + '22', color: currentCol?.accent }}>
            {currentCol?.icon} {currentCol?.label}
          </span>
        </div>

        {editMode ? (
          <input
            value={editData.title}
            onChange={e => setEditData(d => ({ ...d, title: e.target.value }))}
            className={styles.editTitle}
          />
        ) : (
          <h2 className={styles.detailTitle}>{task.title}</h2>
        )}

        <div className={styles.detailMeta}>
          <Avatar name={task.assignee || '?'} color={projectColor} size={22} />
          <span className={styles.metaText}>{task.assignee}</span>
          <span className={styles.metaDot} />
          <span className={styles.metaText}>{project?.name}</span>
        </div>
      </div>

      {/* Description */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Descrição</div>
        {editMode ? (
          <textarea
            value={editData.description}
            onChange={e => setEditData(d => ({ ...d, description: e.target.value }))}
            className={styles.editDesc}
            rows={3}
          />
        ) : (
          <div className={styles.descBox}>{task.description || <em>Sem descrição</em>}</div>
        )}
      </div>

      {/* Edit actions */}
      <div className={styles.editRow}>
        {editMode ? (
          <>
            <Button size="sm" onClick={handleSaveEdit}>Salvar</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditMode(false)}>Cancelar</Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="secondary" onClick={() => setEditMode(true)}>Editar</Button>
            <Button size="sm" variant="danger" onClick={handleDelete}>Deletar</Button>
          </>
        )}
      </div>

      {/* File upload */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Arquivos</div>
        <label className={styles.uploadArea}>
          <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
          {uploading ? <Spinner size={16} /> : <><ClipIcon /> <span>Clique para anexar arquivo</span></>}
        </label>
      </div>

      {/* Move status */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Mover para</div>
        <div className={styles.moveRow}>
          {COLUMNS.map(col => (
            <button
              key={col.id}
              className={`${styles.moveBtn} ${task.status === col.id ? styles.moveBtnActive : ''}`}
              style={task.status === col.id ? { background: col.accent + '22', color: col.accent, borderColor: col.accent + '44' } : {}}
              onClick={() => moveTask(task.id, col.id)}
            >
              {col.icon} {col.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Comentários {comments.length > 0 && `(${comments.length})`}</div>

        {loadingComments ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}><Spinner /></div>
        ) : (
          <div className={styles.commentList}>
            {comments.length === 0 && (
              <p className={styles.noComments}>Sem comentários ainda. Seja o primeiro!</p>
            )}
            {comments.map((c, i) => (
              <div key={c.id || i} className={styles.comment}>
                <Avatar name={c.author || 'EU'} color="#6366f1" size={24} />
                <div className={styles.commentContent}>
                  <div className={styles.commentAuthor}>
                    {c.author || 'Você'}
                    <span className={styles.commentTime}>
                      {c.created_at ? new Date(c.created_at).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : 'agora'}
                    </span>
                  </div>
                  <div className={styles.commentText}>{c.text || c}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.commentForm}>
          <Avatar name="EU" color="#6366f1" size={26} />
          <input
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendComment()}
            placeholder="Adicionar comentário... (Enter para enviar)"
            className={styles.commentInput}
          />
          <Button size="sm" onClick={handleSendComment} disabled={submitting || !newComment.trim()}>
            {submitting ? <Spinner size={14} /> : 'Enviar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Icons
function CommentIcon() {
  return <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><path d="M14 1H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3l3 3 3-3h3a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z" opacity=".7"/></svg>;
}
function ClipIcon() {
  return <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13.5 7.5l-6 6a4 4 0 0 1-5.66-5.66l6-6a2.5 2.5 0 0 1 3.54 3.54l-6 6a1 1 0 0 1-1.42-1.42l5.5-5.5" strokeLinecap="round"/></svg>;
}
