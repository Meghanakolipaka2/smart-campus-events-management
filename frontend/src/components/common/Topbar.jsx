import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiBell, FiSearch, FiSun, FiMoon, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { eventsAPI, notificationsAPI } from '../../utils/api';

const Topbar = ({ title, notifCount, notifications = [], onMarkRead }) => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const res = await eventsAPI.getAll({ search: q });
      setSearchResults(res.data.events?.slice(0, 5) || []);
    } catch { setSearchResults([]); }
  };

  const categoryColors = {
    technical: 'bg-blue-600/20 text-blue-400',
    cultural: 'bg-pink-600/20 text-pink-400',
    sports: 'bg-green-600/20 text-green-400',
    workshop: 'bg-yellow-600/20 text-yellow-400',
    nss: 'bg-orange-600/20 text-orange-400',
    fest: 'bg-purple-600/20 text-purple-400',
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-20 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
      <div className="flex items-center gap-4 px-6 py-4">
        <h1 className="text-white font-semibold text-lg hidden md:block">{title}</h1>

        {/* Search */}
        <div className="flex-1 max-w-md ml-auto md:ml-0">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
            {/* Search Results Dropdown */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 left-0 right-0 bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-2xl z-50"
                >
                  {searchResults.map(event => (
                    <Link to={`/events/${event.id}`} key={event.id}
                      onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                      <div className={`badge ${categoryColors[event.category] || 'bg-gray-600/20 text-gray-400'}`}>
                        {event.category}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{event.title}</div>
                        <div className="text-gray-500 text-xs">{event.venue}</div>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="w-9 h-9 glass rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
          </motion.button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-9 h-9 glass rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <FiBell size={16} />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full text-white text-xs flex items-center justify-center animate-pulse">
                  {notifCount}
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="flex items-center justify-between p-4 border-b border-dark-border">
                    <span className="text-white font-semibold">Notifications</span>
                    <button onClick={onMarkRead} className="text-indigo-400 text-xs hover:text-indigo-300">Mark all read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 text-sm">No notifications</div>
                    ) : notifications.slice(0, 5).map(n => (
                      <div key={n.id} className={`px-4 py-3 border-b border-dark-border/50 hover:bg-white/5 transition-colors ${!n.is_read ? 'bg-indigo-600/5' : ''}`}>
                        <div className="text-white text-sm font-medium">{n.title}</div>
                        <div className="text-gray-500 text-xs mt-0.5">{n.message}</div>
                      </div>
                    ))}
                  </div>
                  <Link to="/notifications" onClick={() => setNotifOpen(false)}
                    className="block p-3 text-center text-indigo-400 text-sm hover:text-indigo-300 border-t border-dark-border transition-colors">
                    View all notifications →
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar */}
          <Link to="/profile">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
