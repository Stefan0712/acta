import { useNotifications } from './NotificationContext';
import styles from './Notification.module.css';

export const NotificationDisplay = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className={styles.notificationContainer}>
      {notifications.map(n => (
        <div 
          key={n._id} 
          className={`${styles.notification} ${styles[n.type]}`}
          onClick={() => removeNotification(n._id)}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
};