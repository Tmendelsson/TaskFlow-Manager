import { useState } from 'react';
import { Modal, Button, Spinner } from '../shared';
import { useApp } from '../../context/AppContext';
import { PROJECT_COLORS, COLUMNS, TAG_COLORS, PRIORITY_CONFIG } from '../../constants';

// ── Create Project Modal ─────────────────────────────────
export default function CreateProjectModal({ open, onClose }) {
  const { createProject } = useApp();
  const [form, setForm] = useState({ name: '', description: '', color: PROJECT_COLORS[0] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    setError('');
    try {
      await createProject(form);
      setForm({ name: '', description: '', color: PROJECT_COLORS[0] });
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao criar projeto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Novo Projeto" width={420}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && <div style={{ background: 'rgba(244,63,94,.12)', border: '1px solid rgba(244,63,94,.3)', color: '#f87171', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Nome do projeto *</label>
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Ex: App Mobile, API Backend..."
            autoFocus
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Descrição</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Descreva o projeto..."
            style={{ height: 72, resize: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Cor do projeto</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PROJECT_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setForm(f => ({ ...f, color }))}
                style={{
                  width: 28, height: 28,
                  borderRadius: '50%',
                  background: color,
                  border: form.color === color ? `3px solid #fff` : '3px solid transparent',
                  cursor: 'pointer',
                  outline: form.color === color ? `2px solid ${color}` : 'none',
                  outlineOffset: 2,
                  transition: 'all .15s',
                }}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div style={{ background: 'var(--bg-input)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: form.color, flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: form.name ? 'var(--text-primary)' : 'var(--text-ghost)' }}>
            {form.name || 'Nome do projeto'}
          </span>
        </div>

        <Button type="submit" size="lg" disabled={loading || !form.name.trim()} style={{ width: '100%' }}>
          {loading ? <><Spinner size={16} /> Criando...</> : 'Criar Projeto'}
        </Button>
      </form>
    </Modal>
  );
}
