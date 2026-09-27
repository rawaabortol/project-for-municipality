import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppNotification } from '../utils/sampleData';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';

const POLL_INTERVAL_MS = 60_000;

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => Promise<void>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const userId = currentUser?.id;

  const refreshNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      setNotifications(await notificationService.getMine());
    } catch (err) {
      console.warn('Failed to load notifications', err);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return;
    }
    refreshNotifications();
    const interval = setInterval(refreshNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [userId, refreshNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    notificationService.markAsRead(id).catch(() => refreshNotifications());
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    notificationService.markAllAsRead().catch(() => refreshNotifications());
  };

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(null), 4500);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
        toastMessage,
        showToast
      }}
    >
      {children}
      {toastMessage && (
        <div role="status" className="pointer-events-none fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] max-w-[90vw] flex items-center gap-3 bg-slate-900/95 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-teal-500/40 backdrop-blur-md animate-bounce-short">
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
