import { useApp } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import AppLayout from './pages/AppLayout';
import { Spinner } from './components/shared';

function LoadingScreen() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      background: '#0b0b16',
    }}>
      <div style={{
        width: 42, height: 42,
        borderRadius: 12,
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, fontWeight: 900, color: '#fff',
      }}>T</div>
      <Spinner size={24} />
      <span style={{ color: '#475569', fontSize: 13 }}>Carregando TaskFlow...</span>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, authLoading } = useApp();

  if (authLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <LoginPage />;
  return <AppLayout />;
}
