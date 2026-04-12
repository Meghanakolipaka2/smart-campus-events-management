import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiCalendar, FiCheck, FiX, FiTrash2, FiShield, FiBarChart2, FiMapPin } from 'react-icons/fi';
import { format } from 'date-fns';
import DashboardLayout from '../components/common/DashboardLayout';
import { eventsAPI, usersAPI, venuesAPI, analyticsAPI } from '../utils/api';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'events', label: 'Event Approvals', icon: FiCalendar },
  { id: 'users', label: 'User Management', icon: FiUsers },
  { id: 'venues', label: 'Venues', icon: FiMapPin },
  { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
];

const AdminPanel = () => {
  const [tab, setTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [venues, setVenues] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [venueForm, setVenueForm] = useState({ name: '', capacity: '', location: '' });

  useEffect(() => { fetchData(); }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'events') {
        const res = await eventsAPI.getAll({ status: 'pending' });
        setEvents(res.data.events || []);
      } else if (tab === 'users') {
        const res = await usersAPI.getAll();
        setUsers(res.data.users || []);
      } else if (tab === 'venues') {
        const res = await venuesAPI.getAll();
        setVenues(res.data.venues || []);
      } else if (tab === 'analytics') {
        const res = await analyticsAPI.getDashboard();
        setAnalytics(res.data);
      }
    } catch {} finally { setLoading(false); }
  };

  const handleEventAction = async (id, action) => {
    try {
      await eventsAPI.update(id, { status: action });
      setEvents(prev => prev.filter(e => e.id !== id));
      toast.success(`Event ${action}`);
    } catch { toast.error('Action failed'); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await usersAPI.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed'); }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await usersAPI.update(id, { role });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
      toast.success('Role updated');
    } catch {}
  };

  const handleAddVenue = async (e) => {
    e.preventDefault();
    try {
      const res = await venuesAPI.create(venueForm);
      setVenues(prev => [...prev, res.data.venue]);
      setVenueForm({ name: '', capacity: '', location: '' });
      toast.success('Venue added');
    } catch { toast.error('Failed to add venue'); }
  };

  const handleDeleteVenue = async (id) => {
    try {
      await venuesAPI.delete(id);
      setVenues(prev => prev.filter(v => v.id !== id));
      toast.success('Venue removed');
    } catch {}
  };

  return (
    <DashboardLayout title="Admin Panel">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
            <FiShield size={16} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.id ? 'bg-indigo-600 text-white' : 'glass text-gray-400 border border-white/10 hover:text-white'
              }`}>
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="glass rounded-2xl p-12 text-center text-gray-400">Loading...</div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Event Approvals */}
            {tab === 'events' && (
              <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass gradient-border rounded-2xl overflow-hidden">
                {events.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-4xl mb-3">✅</div>
                    <p className="text-gray-400">No pending events</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-dark-border">
                          {['Event', 'Organizer', 'Category', 'Date', 'Actions'].map(h => (
                            <th key={h} className="text-left text-gray-500 text-xs font-medium px-6 py-4 uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {events.map((event, i) => (
                          <motion.tr key={event.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="border-b border-dark-border/50 hover:bg-white/2">
                            <td className="px-6 py-4">
                              <div className="text-white text-sm font-medium">{event.title}</div>
                              <div className="text-gray-500 text-xs">{event.venue}</div>
                            </td>
                            <td className="px-6 py-4 text-gray-300 text-sm">{event.organizer_name}</td>
                            <td className="px-6 py-4">
                              <span className="badge bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 capitalize">
                                {event.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-300 text-sm">
                              {format(new Date(event.date), 'MMM d, yyyy')}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <motion.button whileHover={{ scale: 1.05 }}
                                  onClick={() => handleEventAction(event.id, 'approved')}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg text-xs hover:bg-green-600 hover:text-white transition-all">
                                  <FiCheck size={12} /> Approve
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.05 }}
                                  onClick={() => handleEventAction(event.id, 'rejected')}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg text-xs hover:bg-red-600 hover:text-white transition-all">
                                  <FiX size={12} /> Reject
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* Users */}
            {tab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass gradient-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-dark-border">
                        {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                          <th key={h} className="text-left text-gray-500 text-xs font-medium px-6 py-4 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <motion.tr key={u.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-b border-dark-border/50 hover:bg-white/2">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                {u.name?.charAt(0)}
                              </div>
                              <span className="text-white text-sm font-medium">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{u.email}</td>
                          <td className="px-6 py-4">
                            <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}
                              className="bg-dark-card border border-dark-border rounded-lg px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-indigo-500">
                              <option value="student">Student</option>
                              <option value="organizer">Organizer</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {u.created_at ? format(new Date(u.created_at), 'MMM d, yyyy') : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <motion.button whileHover={{ scale: 1.1 }}
                              onClick={() => handleDeleteUser(u.id)}
                              className="w-8 h-8 glass rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors">
                              <FiTrash2 size={14} />
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Venues */}
            {tab === 'venues' && (
              <motion.div key="venues" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <form onSubmit={handleAddVenue} className="glass gradient-border rounded-2xl p-6">
                  <h3 className="text-white font-semibold mb-4">Add New Venue</h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <input placeholder="Venue name" value={venueForm.name}
                      onChange={e => setVenueForm({ ...venueForm, name: e.target.value })}
                      className="input-field text-sm" required />
                    <input type="number" placeholder="Capacity" value={venueForm.capacity}
                      onChange={e => setVenueForm({ ...venueForm, capacity: e.target.value })}
                      className="input-field text-sm" required />
                    <input placeholder="Location" value={venueForm.location}
                      onChange={e => setVenueForm({ ...venueForm, location: e.target.value })}
                      className="input-field text-sm" />
                  </div>
                  <motion.button type="submit" whileHover={{ scale: 1.02 }}
                    className="btn-primary text-sm px-6 py-2.5 mt-4">
                    Add Venue
                  </motion.button>
                </form>

                <div className="glass gradient-border rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-dark-border">
                        {['Name', 'Capacity', 'Location', 'Actions'].map(h => (
                          <th key={h} className="text-left text-gray-500 text-xs font-medium px-6 py-4 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {venues.map((v, i) => (
                        <tr key={v.id} className="border-b border-dark-border/50 hover:bg-white/2">
                          <td className="px-6 py-3 text-white text-sm">{v.name}</td>
                          <td className="px-6 py-3 text-gray-400 text-sm">{v.capacity}</td>
                          <td className="px-6 py-3 text-gray-400 text-sm">{v.location || '—'}</td>
                          <td className="px-6 py-3">
                            <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDeleteVenue(v.id)}
                              className="w-8 h-8 glass rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors">
                              <FiTrash2 size={14} />
                            </motion.button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Analytics */}
            {tab === 'analytics' && analytics && (
              <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Total Users', value: analytics.total_users, icon: '👥' },
                  { label: 'Total Events', value: analytics.total_events, icon: '📅' },
                  { label: 'Registrations', value: analytics.total_registrations, icon: '✅' },
                  { label: 'Active Students', value: analytics.active_students, icon: '🎓' },
                  { label: 'Organizers', value: analytics.total_organizers, icon: '🎪' },
                  { label: 'This Month Events', value: analytics.events_this_month, icon: '📆' },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass gradient-border rounded-2xl p-6 flex items-center gap-4">
                    <div className="text-3xl">{s.icon}</div>
                    <div>
                      <div className="text-2xl font-bold text-white">{s.value ?? '—'}</div>
                      <div className="text-gray-400 text-sm">{s.label}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;
