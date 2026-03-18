import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { authAPI } from '../services/api';
import { Button, Spinner } from '../components/shared';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { login } = useApp();
  const [mode, setMode]       = useState('login'); // 'login' | 'register'
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await authAPI.register({ name: form.name, email: form.email, password: form.password });
        await login({ email: form.email, password: form.password });
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao autenticar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>

      {/* Background decoration */}
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />

      <div className={styles.card}>

        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoMark}>T</div>
          <div>
            <div className={styles.logoName}>TaskFlow</div>
            <div className={styles.logoSub}>Manager</div>
          </div>
        </div>

        <h1 className={styles.title}>
          {mode === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}
        </h1>
        <p className={styles.subtitle}>
          {mode === 'login'
            ? 'Faça login para acessar seus projetos'
            : 'Crie sua conta para começar'}
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'register' && (
            <div className={styles.field}>
              <label>Nome completo</label>
              <input
                type="text"
                placeholder="Seu nome"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
          )}

          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              minLength={6}
            />
          </div>

          <Button type="submit" size="lg" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
            {loading ? <><Spinner size={16} /> Aguarde...</> : (mode === 'login' ? 'Entrar' : 'Criar conta')}
          </Button>
        </form>

        <div className={styles.toggle}>
          {mode === 'login' ? (
            <>Não tem conta?{' '}
              <button onClick={() => { setMode('register'); setError(''); }}>Criar conta</button>
            </>
          ) : (
            <>Já tem conta?{' '}
              <button onClick={() => { setMode('login'); setError(''); }}>Entrar</button>
            </>
          )}
        </div>

        {/* Demo credentials hint */}
        <div className={styles.demo}>
          <span>Demo: </span>
          <code>admin@taskflow.com</code>
          <span> / </span>
          <code>admin123</code>
        </div>
      </div>
    </div>
  );
}
