import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiHome, FiCalendar, FiList, FiBell, FiUser, FiBookmark,
  FiAward, FiSettings, FiLogOut, FiZap, FiPlusCircle,
  FiShield, FiMenu, FiX, FiBarChart2
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NavItem = ({ to, icon: Icon, label, badge, onClick }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link to={to} onClick={onClick}>
      <motion.div
        whileHover={{ x: 4 }}
        className={`sidebar-item ${active ? 'active' : ''}`}
      >
        <Icon size={18} />
        <span className="text-sm font-medium">{label}</span>
        {badge > 0 && (
          <span className="ml-auto bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {badge}
          </span>
        )}
      </motion.div>
    </Link>
  );
};

const Sidebar = ({ notifCount = 0 }) => {
  const { user, logout, isAdmin, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const studentNav = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/events', icon: FiList, label: 'Events' },
    { to: '/calendar', icon: FiCalendar, label: 'Calendar' },
    { to: '/bookmarks', icon: FiBookmark, label: 'Bookmarks' },
    { to: '/leaderboard', icon: FiAward, label: 'Leaderboard' },
    { to: '/notifications', icon: FiBell, label: 'Notifications', badge: notifCount },
    { to: '/profile', icon: FiUser, label: 'Profile' },
  ];

  const organizerNav = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/organizer', icon: FiBarChart2, label: 'My Events' },
    { to: '/events/create', icon: FiPlusCircle, label: 'Create Event' },
    { to: '/calendar', icon: FiCalendar, label: 'Calendar' },
    { to: '/notifications', icon: FiBell, label: 'Notifications', badge: notifCount },
    { to: '/profile', icon: FiUser, label: 'Profile' },
  ];

  const adminNav = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/admin', icon: FiShield, label: 'Admin Panel' },
    { to: '/events', icon: FiList, label: 'All Events' },
    { to: '/calendar', icon: FiCalendar, label: 'Calendar' },
    { to: '/notifications', icon: FiBell, label: 'Notifications', badge: notifCount },
    { to: '/profile', icon: FiUser, label: 'Profile' },
  ];

  const navItems = isAdmin() ? adminNav : isOrganizer() ? organizerNav : studentNav;

  const SidebarContent = ({ onItemClick }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <FiZap className="text-white" size={14} />
          </div>
          <span className="text-white font-bold">CampusHub</span>
        </Link>
      </div>

      {/* User */}
      <div className="p-4 mx-3 mt-4 glass rounded-xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
            <div className="text-indigo-400 text-xs capitalize">{user?.role}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => <NavItem key={item.to} {...item} onClick={onItemClick} />)}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/5">
        <motion.button
          whileHover={{ x: 4 }}
          onClick={handleLogout}
          className="sidebar-item w-full text-red-400 hover:bg-red-500/10"
        >
          <FiLogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-dark-card border-r border-dark-border fixed h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 glass p-2.5 rounded-xl text-white"
      >
        <FiMenu size={20} />
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden" />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-dark-card border-r border-dark-border z-50 lg:hidden"
            >
              <button onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <FiX size={20} />
              </button>
              <SidebarContent onItemClick={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
