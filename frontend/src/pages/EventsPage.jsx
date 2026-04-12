import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiGrid, FiList } from 'react-icons/fi';
import DashboardLayout from '../components/common/DashboardLayout';
import EventCard from '../components/events/EventCard';
import { eventsAPI } from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['all', 'technical', 'cultural', 'sports', 'workshop', 'nss', 'fest'];
const STATUS = ['all', 'upcoming', 'ongoing', 'past'];

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('upcoming');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, [category, status, search, sortBy, page]);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9, sort: sortBy };
      if (category !== 'all') params.category = category;
      if (status !== 'all') params.status = status;
      if (search) params.search = search;

      const res = await eventsAPI.getAll(params);
      setEvents(res.data.events || []);
      setTotal(res.data.total || 0);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  };

  const fetchBookmarks = async () => {
    try {
      const res = await eventsAPI.getBookmarks();
      setBookmarks((res.data.bookmarks || []).map(b => b.event_id));
    } catch {}
  };

  const handleBookmark = async (id) => {
    try {
      await eventsAPI.bookmark(id);
      setBookmarks(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
    } catch {}
  };

  return (
    <DashboardLayout title="Events">
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">All Events</h1>
            <p className="text-gray-400 text-sm mt-1">{total} events available</p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-9 text-sm"
            />
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3">
          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize ${
                  category === cat
                    ? 'bg-indigo-600 text-white'
                    : 'glass text-gray-400 hover:text-white border border-white/10'
                }`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 ml-auto">
            {STATUS.map(s => (
              <button key={s}
                onClick={() => { setStatus(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize ${
                  status === s
                    ? 'bg-purple-600 text-white'
                    : 'glass text-gray-400 hover:text-white border border-white/10'
                }`}>
                {s}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="glass border border-white/10 rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500 bg-transparent">
            <option value="date">Sort: Date</option>
            <option value="popularity">Sort: Popular</option>
            <option value="title">Sort: Name</option>
          </select>
        </motion.div>

        {/* Events Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0,1,2,3,4,5].map(i => (
                <div key={i} className="glass rounded-2xl p-5 space-y-3">
                  <div className="shimmer h-4 rounded w-20" />
                  <div className="shimmer h-6 rounded w-3/4" />
                  <div className="shimmer h-3 rounded w-full" />
                  <div className="shimmer h-3 rounded w-2/3" />
                  <div className="shimmer h-10 rounded-xl mt-4" />
                </div>
              ))}
            </motion.div>
          ) : events.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass rounded-2xl p-16 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-white font-semibold mb-2">No events found</h3>
              <p className="text-gray-400">Try adjusting your filters or search query</p>
            </motion.div>
          ) : (
            <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((event, i) => (
                <motion.div key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}>
                  <EventCard event={event} onBookmark={handleBookmark} isBookmarked={bookmarks.includes(event.id)} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {total > 9 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            {[...Array(Math.ceil(total / 9))].map((_, i) => (
              <button key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-xl text-sm transition-all ${
                  page === i + 1
                    ? 'bg-indigo-600 text-white'
                    : 'glass text-gray-400 hover:text-white border border-white/10'
                }`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EventsPage;
