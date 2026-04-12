import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { notificationsAPI } from '../../utils/api';

const DashboardLayout = ({ children, title }) => {
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsAPI.getAll();
      setNotifications(res.data.notifications || []);
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <Sidebar notifCount={unreadCount} />
      <Topbar
        title={title}
        notifCount={unreadCount}
        notifications={notifications}
        onMarkRead={handleMarkAllRead}
      />
      <main className="lg:ml-64 pt-20 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
