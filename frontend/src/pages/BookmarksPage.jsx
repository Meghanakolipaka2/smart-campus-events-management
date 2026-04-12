import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/common/DashboardLayout';
import EventCard from '../components/events/EventCard';
import { eventsAPI } from '../utils/api';

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBookmarks(); }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await eventsAPI.getBookmarks();
      const bm = res.data.bookmarks || [];
      setBookmarks(bm.map(b => b.event_id));
      setEvents(bm.map(b => b.event).filter(Boolean));
    } catch {} finally { setLoading(false); }
  };

  const handleBookmark = async (id) => {
    try {
      await eventsAPI.bookmark(id);
      setBookmarks(prev => prev.filter(b => b !== id));
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch {}
  };

  return (
    <DashboardLayout title="Bookmarks">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Saved Events</h1>
          <p className="text-gray-400 text-sm mt-1">{events.length} bookmarked events</p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0,1,2].map(i => <div key={i} className="shimmer h-64 rounded-2xl" />)}
          </div>
        ) : events.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">🔖</div>
            <h3 className="text-white font-semibold mb-2">No saved events</h3>
            <p className="text-gray-400">Bookmark events to find them quickly later</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event, i) => (
              <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <EventCard event={event} onBookmark={handleBookmark} isBookmarked={bookmarks.includes(event.id)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BookmarksPage;
