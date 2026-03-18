import { useEffect, useRef } from 'react';
import { TAG_COLORS, PRIORITY_CONFIG } from '../../constants';
import styles from './shared.module.css';

// ── Avatar ──────────────────────────────────────────────
export function Avatar({ name = '', color = '#6366f1', size = 28 }) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div
      className={styles.avatar}
      style={{
        width: size, height: size,
        background: color,
        fontSize: size * 0.38,
        borderWidth: size > 30 ? 2 : 1.5,
      }}
    >
      {initials}
    </div>
  );
}

// ── TagBadge ─────────────────────────────────────────────
export function TagBadge({ tag }) {
  const color = TAG_COLORS[tag] || '#6366f1';
  return (
    <span className={styles.badge} style={{ color, background: color + '22' }}>
      {tag}
    </span>
  );
}

// ── PriorityBadge ─────────────────────────────────────────
export function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  return (
    <span className={styles.badge} style={{ color: cfg.color, background: cfg.color + '18' }}>
      <span className={styles.dot} style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

// ── Button ────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', onClick, disabled, style, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.btn} ${styles[`btn-${variant}`]} ${styles[`btn-${size}`]}`}
      style={style}
    >
      {children}
    </button>
  );
}

// ── Modal ─────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 480 }) {
  const backdropRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      className={styles.backdrop}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className={`${styles.modal} scale-in`} style={{ width, maxWidth: '95vw' }}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>{title}</span>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────
export function Spinner({ size = 20 }) {
  return (
    <div
      className={styles.spinner}
      style={{ width: size, height: size, borderWidth: size < 20 ? 2 : 3 }}
    />
  );
}

// ── Empty State ───────────────────────────────────────────
export function EmptyState({ icon = '○', message = 'Nenhum item aqui' }) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon}>{icon}</span>
      <span>{message}</span>
    </div>
  );
}
