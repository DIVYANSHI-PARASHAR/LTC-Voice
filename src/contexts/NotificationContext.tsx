import React, { createContext, useContext, useState, useCallback } from 'react';

export interface FrontendNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  patientId?: string;
  patientName?: string;
  read: boolean;
  createdAt: Date;
}

interface NotificationContextValue {
  notifications: FrontendNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<FrontendNotification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<FrontendNotification[]>([]);

  const addNotification = useCallback((notification: Omit<FrontendNotification, 'id' | 'read' | 'createdAt'>) => {
    const newNotification: FrontendNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random()}`,
      read: false,
      createdAt: new Date(),
    };

    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
}
