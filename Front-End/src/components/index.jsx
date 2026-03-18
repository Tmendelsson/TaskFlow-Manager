const PRIORITY_CONFIG = {
  high: { label: 'Alta', color: '#f87171', dot: '#ef4444' },
  medium: { label: 'Media', color: '#fb923c', dot: '#f97316' },
  low: { label: 'Baixa', color: '#4ade80', dot: '#22c55e' },
};

const TAG_COLORS = {
  bug: '#f43f5e',
  feature: '#6366f1',
  devops: '#06b6d4',
  design: '#a855f7',
  task: '#f59e0b',
};

export function Spinner({ size = 20 }) {
  return (
    <div
      className="spinner"
      style={{
        width: size,
        height: size,
        border: '3px solid #2a2a40',
        borderTopColor: '#6366f1',
        borderRadius: '50%',
      }}
    />
  );
}

export function Avatar({ name, color, size = 28 }) {
  const initials = (name || 'NA').slice(0, 2).toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color || '#6366f1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: 700,
        color: '#fff',
        flexShrink: 0,
        border: '2px solid #1e1e2e',
        fontFamily: 'inherit',
      }}
    >
      {initials}
    </div>
  );
}

export function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.04em',
        color: cfg.color,
        textTransform: 'uppercase',
        background: `${cfg.color}18`,
        padding: '2px 7px',
        borderRadius: 20,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
      {cfg.label}
    </span>
  );
}

export function TagBadge({ tag }) {
  const color = TAG_COLORS[tag] || '#6366f1';
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.06em',
        color,
        background: `${color}22`,
        padding: '2px 8px',
        borderRadius: 20,
        textTransform: 'uppercase',
      }}
    >
      {tag}
    </span>
  );
}

export function StatCard({ label, value, accent }) {
  return (
    <div
      style={{
        background: '#13131f',
        border: `1px solid ${accent}33`,
        borderRadius: 14,
        padding: '14px 16px',
        minWidth: 110,
      }}
    >
      <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: accent, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
    </div>
  );
}
