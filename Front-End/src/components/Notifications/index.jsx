import { useApp } from '../../context/AppContext';
import { notificationsAPI } from '../../services/api';
import { Button } from '../shared';
import styles from './Notifications.module.css';

export default function Notifications() {
  const { notifications, dispatch, unreadCount } = useApp();

  const markRead = async (id) => {
    dispatch({ type: 'MARK_NOTIF_READ', id });
    await notificationsAPI.markRead(id).catch(() => {});
  };

  const markAll = async () => {
    dispatch({ type: 'MARK_ALL_READ' });
    await notificationsAPI.markAll().catch(() => {});
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Notificações</h2>
          {unreadCount > 0 && (
            <p className={styles.subtitle}>{unreadCount} não lida{unreadCount > 1 ? 's' : ''}</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAll}>Marcar todas como lidas</Button>
        )}
      </div>

      <div className={styles.list}>
        {notifications.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔔</span>
            <span>Nenhuma notificação ainda</span>
          </div>
        )}
        {notifications.map(n => (
          <div
            key={n.id}
            className={`${styles.item} ${n.read ? styles.read : styles.unread} fade-in`}
            onClick={() => !n.read && markRead(n.id)}
          >
            <span className={styles.dot} style={{ background: n.read ? 'var(--text-ghost)' : n.color }} />
            <div className={styles.content}>
              <div className={styles.text}>{n.text}</div>
              <div className={styles.time}>{n.time || 'agora'}</div>
            </div>
            {!n.read && <span className={styles.newBadge}>Novo</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
