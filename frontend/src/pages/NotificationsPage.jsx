// NotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';
import DashboardLayout from '../components/common/DashboardLayout';
import { notificationsAPI } from '../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsAPI.getAll();
      setNotifications(res.data.notifications || []);
    } catch {} finally { setLoading(false); }
  };

  const markRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All marked as read');
    } catch {}
  };

  const typeColors = {
    info: 'bg-blue-600/20 text-blue-400',
    success: 'bg-green-600/20 text-green-400',
    warning: 'bg-yellow-600/20 text-yellow-400',
    event: 'bg-indigo-600/20 text-indigo-400',
  };

  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <DashboardLayout title="Notifications">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            {unread > 0 && <p className="text-indigo-400 text-sm mt-1">{unread} unread</p>}
          </div>
          {unread > 0 && (
            <motion.button whileHover={{ scale: 1.05 }} onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2 glass border border-white/10 rounded-xl text-gray-300 hover:text-white text-sm transition-all">
              <FiCheck size={14} /> Mark all read
            </motion.button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0,1,2,3].map(i => <div key={i} className="shimmer h-20 rounded-2xl" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">🔔</div>
            <h3 className="text-white font-semibold mb-2">All caught up!</h3>
            <p className="text-gray-400">No notifications yet</p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((n, i) => (
              <motion.div key={n.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`glass gradient-border rounded-2xl p-5 flex gap-4 transition-all ${!n.is_read ? 'border-indigo-500/30' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[n.type] || typeColors.info}`}>
                  <FiBell size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-medium text-sm ${!n.is_read ? 'text-white' : 'text-gray-300'}`}>{n.title}</h3>
                    {!n.is_read && (
                      <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5 animate-pulse" />
                    )}
                  </div>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">{n.message}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-gray-600 text-xs">
                      {n.created_at ? format(new Date(n.created_at), 'MMM d, h:mm a') : ''}
                    </span>
                    {!n.is_read && (
                      <button onClick={() => markRead(n.id)}
                        className="text-indigo-400 text-xs hover:text-indigo-300 transition-colors">
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
