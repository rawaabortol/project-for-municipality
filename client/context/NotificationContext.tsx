import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppNotification } from '../utils/sampleData';
import { dbInstance } from '../utils/axios';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>(dbInstance.notifications);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Refresh notifications when current user changes
    setNotifications([...dbInstance.notifications]);
  }, [currentUser]);

  const userNotifications = notifications.filter(
    n => n.userId === currentUser.id || currentUser.role === 'ADMINISTRATOR' || (currentUser.role === 'HEALTH_OFFICER' && (n.type === 'CLUSTER_ALERT' || n.type === 'CRITICAL_ALERT'))
  );

  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    const notif = dbInstance.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      dbInstance.persistAll();
      setNotifications([...dbInstance.notifications]);
    }
  };

  const markAllAsRead = () => {
    dbInstance.notifications.forEach(n => { n.isRead = true; });
    dbInstance.persistAll();
    setNotifications([...dbInstance.notifications]);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications: userNotifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        toastMessage,
        showToast
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-slate-900/95 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-teal-500/40 backdrop-blur-md animate-bounce-short">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping"></div>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
