import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiEye, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import DashboardLayout from '../components/common/DashboardLayout';
import { eventsAPI } from '../utils/api';
import toast from 'react-hot-toast';

const statusStyles = {
  approved: 'bg-green-600/20 text-green-400 border-green-600/30',
  pending: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
  rejected: 'bg-red-600/20 text-red-400 border-red-600/30',
};

const OrganizerPanel = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventsAPI.getAll({ my_events: true });
      setEvents(res.data.events || []);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    setDeletingId(id);
    try {
      await eventsAPI.delete(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      toast.success('Event deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setDeletingId(null); }
  };

  const filtered = activeTab === 'all' ? events : events.filter(e => e.status === activeTab);

  const counts = {
    all: events.length,
    approved: events.filter(e => e.status === 'approved').length,
    pending: events.filter(e => e.status === 'pending').length,
    rejected: events.filter(e => e.status === 'rejected').length,
  };

  return (
    <DashboardLayout title="My Events">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Organizer Panel</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your events</p>
          </div>
          <Link to="/events/create">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="btn-primary flex items-center gap-2 text-sm">
              <FiPlus size={16} /> New Event
            </motion.button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Events', value: counts.all, color: 'text-white' },
            { label: 'Approved', value: counts.approved, color: 'text-green-400' },
            { label: 'Pending', value: counts.pending, color: 'text-yellow-400' },
            { label: 'Rejected', value: counts.rejected, color: 'text-red-400' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass gradient-border rounded-2xl p-5">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-gray-400 text-sm mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {['all', 'approved', 'pending', 'rejected'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                activeTab === tab ? 'bg-indigo-600 text-white' : 'glass text-gray-400 border border-white/10 hover:text-white'
              }`}>
              {tab} ({counts[tab]})
            </button>
          ))}
        </div>

        {/* Events Table */}
        <div className="glass gradient-border rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-gray-400">No events found</p>
              <Link to="/events/create">
                <button className="mt-4 btn-primary text-sm px-6 py-2">Create your first event</button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-border">
                    {['Event', 'Category', 'Date', 'Registrations', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left text-gray-500 text-xs font-medium px-6 py-4 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((event, i) => (
                      <motion.tr key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-dark-border/50 hover:bg-white/2 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-white text-sm font-medium line-clamp-1 max-w-xs">{event.title}</div>
                          <div className="text-gray-500 text-xs mt-0.5">{event.venue}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="badge bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 capitalize">
                            {event.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white text-sm">{format(new Date(event.date), 'MMM d, yyyy')}</div>
                          <div className="text-gray-500 text-xs">{event.time}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <FiUsers size={13} className="text-gray-500" />
                            <span className="text-white text-sm">{event.registrations_count || 0}</span>
                            <span className="text-gray-600 text-xs">/ {event.max_participants}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge border ${statusStyles[event.status] || statusStyles.pending} capitalize`}>
                            {event.status === 'approved' && <FiCheck size={10} className="mr-1" />}
                            {event.status === 'pending' && <FiClock size={10} className="mr-1" />}
                            {event.status === 'rejected' && <FiX size={10} className="mr-1" />}
                            {event.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link to={`/events/${event.id}`}>
                              <motion.button whileHover={{ scale: 1.1 }}
                                className="w-8 h-8 glass rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                <FiEye size={14} />
                              </motion.button>
                            </Link>
                            <motion.button whileHover={{ scale: 1.1 }}
                              onClick={() => navigate(`/events/create?edit=${event.id}`)}
                              className="w-8 h-8 glass rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-400 transition-colors">
                              <FiEdit2 size={14} />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.1 }}
                              onClick={() => handleDelete(event.id)}
                              disabled={deletingId === event.id}
                              className="w-8 h-8 glass rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors">
                              {deletingId === event.id
                                ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                : <FiTrash2 size={14} />}
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrganizerPanel;
