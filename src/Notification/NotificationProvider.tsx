import { useState, type ReactNode } from 'react';
import { NotificationContext, type Notification } from './NotificationContext';

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const newNotification: Notification = {
      _id: crypto.randomUUID(),
      message,
      type,
    };

    setNotifications(prev => [...prev, newNotification]);
    
    setTimeout(() => {
      removeNotification(newNotification._id);
    }, 3000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};