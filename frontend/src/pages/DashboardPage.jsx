import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FiCalendar, FiUsers, FiTrendingUp, FiStar, FiArrowRight } from 'react-icons/fi';
import DashboardLayout from '../components/common/DashboardLayout';
import EventCard from '../components/events/EventCard';
import { eventsAPI, analyticsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, change, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass gradient-border rounded-2xl p-5"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
        {change && <p className="text-green-400 text-xs mt-1 flex items-center gap-1"><FiTrendingUp size={10} />{change}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
  </motion.div>
);

const SkeletonCard = () => (
  <div className="glass rounded-2xl p-5 space-y-3">
    <div className="shimmer h-4 rounded w-20" />
    <div className="shimmer h-6 rounded w-32" />
    <div className="shimmer h-3 rounded w-24" />
  </div>
);

const DashboardPage = () => {
  const { user, isAdmin, isOrganizer } = useAuth();
  const [events, setEvents] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, analyticsRes] = await Promise.all([
        eventsAPI.getAll({ limit: 6, upcoming: true }),
        analyticsAPI.getDashboard(),
      ]);
      setEvents(eventsRes.data.events || []);
      setAnalytics(analyticsRes.data);

      if (!isAdmin() && !isOrganizer()) {
        const [recRes, bmRes] = await Promise.all([
          eventsAPI.getRecommended(),
          eventsAPI.getBookmarks(),
        ]);
        setRecommended(recRes.data.events || []);
        setBookmarks((bmRes.data.bookmarks || []).map(b => b.event_id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (id) => {
    try {
      await eventsAPI.bookmark(id);
      setBookmarks(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
    } catch {}
  };

  const chartData = analytics?.monthly_registrations || [
    { month: 'Aug', count: 30 }, { month: 'Sep', count: 55 },
    { month: 'Oct', count: 80 }, { month: 'Nov', count: 45 },
    { month: 'Dec', count: 70 }, { month: 'Jan', count: 95 },
  ];

  const categoryData = analytics?.category_breakdown || [
    { name: 'Technical', count: 12 }, { name: 'Cultural', count: 8 },
    { name: 'Sports', count: 6 }, { name: 'Workshop', count: 10 },
    { name: 'NSS', count: 4 }, { name: 'Fest', count: 5 },
  ];

  const stats = isAdmin()
    ? [
        { icon: FiUsers, label: 'Total Users', value: analytics?.total_users || '—', color: 'bg-indigo-600', change: '+12% this month', delay: 0 },
        { icon: FiCalendar, label: 'Total Events', value: analytics?.total_events || '—', color: 'bg-purple-600', change: '+5 this week', delay: 0.1 },
        { icon: FiTrendingUp, label: 'Registrations', value: analytics?.total_registrations || '—', color: 'bg-cyan-600', change: '+23% this month', delay: 0.2 },
        { icon: FiStar, label: 'Pending Approvals', value: analytics?.pending_events || '0', color: 'bg-orange-600', delay: 0.3 },
      ]
    : isOrganizer()
    ? [
        { icon: FiCalendar, label: 'My Events', value: analytics?.my_events || '—', color: 'bg-indigo-600', delay: 0 },
        { icon: FiUsers, label: 'My Registrations', value: analytics?.my_registrations || '—', color: 'bg-purple-600', change: '+8% this week', delay: 0.1 },
        { icon: FiTrendingUp, label: 'Upcoming Events', value: analytics?.upcoming_events || '—', color: 'bg-cyan-600', delay: 0.2 },
        { icon: FiStar, label: 'Avg Popularity', value: analytics?.avg_popularity || '—', color: 'bg-green-600', delay: 0.3 },
      ]
    : [
        { icon: FiCalendar, label: 'Events Registered', value: analytics?.registered_events || '—', color: 'bg-indigo-600', delay: 0 },
        { icon: FiStar, label: 'Bookmarked', value: analytics?.bookmarked || '—', color: 'bg-purple-600', delay: 0.1 },
        { icon: FiTrendingUp, label: 'Upcoming Events', value: analytics?.upcoming_events || '—', color: 'bg-cyan-600', delay: 0.2 },
        { icon: FiUsers, label: 'Leaderboard Rank', value: analytics?.leaderboard_rank || '#—', color: 'bg-green-600', delay: 0.3 },
      ];

  return (
    <DashboardLayout title={`Welcome back, ${user?.name?.split(' ')[0]} 👋`}>
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? [0,1,2,3].map(i => <SkeletonCard key={i} />) :
            stats.map((s, i) => <StatCard key={i} {...s} />)
          }
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 glass gradient-border rounded-2xl p-6"
          >
            <h2 className="text-white font-semibold mb-6">Registration Trends</h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass gradient-border rounded-2xl p-6"
          >
            <h2 className="text-white font-semibold mb-6">By Category</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} layout="vertical">
                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={60} />
                <Tooltip
                  contentStyle={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', color: '#e2e8f0' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* AI Recommendations (students only) */}
        {!isAdmin() && !isOrganizer() && recommended.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <FiStar size={12} className="text-white" />
                </div>
                <h2 className="text-white font-semibold">AI Recommended for You</h2>
                <span className="badge bg-indigo-600/20 text-indigo-400 border border-indigo-600/30">Personalized</span>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommended.slice(0, 3).map(event => (
                <EventCard key={event.id} event={event} onBookmark={handleBookmark}
                  isBookmarked={bookmarks.includes(event.id)} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Upcoming Events */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Upcoming Events</h2>
            <a href="/events" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1 transition-colors">
              View all <FiArrowRight size={14} />
            </a>
          </div>
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0,1,2].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : events.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="text-4xl mb-4">📅</div>
              <p className="text-gray-400">No upcoming events</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map(event => (
                <EventCard key={event.id} event={event} onBookmark={handleBookmark}
                  isBookmarked={bookmarks.includes(event.id)} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
