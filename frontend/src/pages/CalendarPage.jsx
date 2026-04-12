import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import { format, isSameDay } from 'date-fns';
import { FiClock, FiMapPin, FiAlertTriangle } from 'react-icons/fi';
import DashboardLayout from '../components/common/DashboardLayout';
import { eventsAPI } from '../utils/api';
import { Link } from 'react-router-dom';

const categoryColors = {
  technical: 'bg-blue-600', cultural: 'bg-pink-600', sports: 'bg-green-600',
  workshop: 'bg-yellow-500', nss: 'bg-orange-600', fest: 'bg-purple-600',
};

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const res = await eventsAPI.getAll({ limit: 200 });
      const evList = res.data.events || [];
      setEvents(evList);
      detectConflicts(evList);
    } catch {} finally { setLoading(false); }
  };

  const detectConflicts = (evList) => {
    const found = [];
    for (let i = 0; i < evList.length; i++) {
      for (let j = i + 1; j < evList.length; j++) {
        const a = evList[i], b = evList[j];
        if (a.date === b.date && a.time === b.time && a.venue === b.venue) {
          found.push({ event1: a, event2: b });
        }
      }
    }
    setConflicts(found);
  };

  const getEventsForDate = (date) =>
    events.filter(ev => isSameDay(new Date(ev.date), date));

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length === 0) return null;
    return (
      <div className="flex justify-center gap-0.5 mt-1 flex-wrap">
        {dayEvents.slice(0, 3).map((ev, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full ${categoryColors[ev.category] || 'bg-indigo-500'}`} />
        ))}
      </div>
    );
  };

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length > 0) return 'has-events';
    return '';
  };

  const selectedEvents = getEventsForDate(selectedDate);

  return (
    <DashboardLayout title="Calendar">
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white mb-1">Event Calendar</h1>
          <p className="text-gray-400 text-sm">Click any date to see scheduled events</p>
        </motion.div>

        {/* Conflict Warnings */}
        <AnimatePresence>
          {conflicts.map((c, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
              <FiAlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-red-400 font-medium text-sm">Venue Conflict Detected</p>
                <p className="text-gray-400 text-xs mt-1">
                  <strong className="text-white">"{c.event1.title}"</strong> and{' '}
                  <strong className="text-white">"{c.event2.title}"</strong> are both scheduled at{' '}
                  <strong className="text-red-300">{c.event1.venue}</strong> on{' '}
                  {format(new Date(c.event1.date), 'MMM d')} at {c.event1.time}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-2 glass gradient-border rounded-2xl p-6">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={tileContent}
              tileClassName={tileClassName}
              className="w-full"
            />

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-white/10">
              {Object.entries(categoryColors).map(([cat, color]) => (
                <div key={cat} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="text-gray-400 text-xs capitalize">{cat}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Selected Day Events */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="space-y-4">
            <div className="glass gradient-border rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-1">
                {format(selectedDate, 'EEEE, MMMM d')}
              </h3>
              <p className="text-gray-500 text-xs">
                {selectedEvents.length === 0 ? 'No events' : `${selectedEvents.length} event${selectedEvents.length > 1 ? 's' : ''}`}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {selectedEvents.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="glass rounded-2xl p-8 text-center">
                  <div className="text-3xl mb-3">📭</div>
                  <p className="text-gray-400 text-sm">No events on this day</p>
                </motion.div>
              ) : (
                <motion.div key="events" className="space-y-3">
                  {selectedEvents.map((ev, i) => (
                    <motion.div key={ev.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}>
                      <Link to={`/events/${ev.id}`}>
                        <div className="glass gradient-border rounded-xl p-4 hover:bg-white/5 transition-colors group">
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-full min-h-[40px] rounded-full flex-shrink-0 ${categoryColors[ev.category] || 'bg-indigo-600'}`} />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white text-sm font-medium group-hover:text-indigo-300 transition-colors truncate">
                                {ev.title}
                              </h4>
                              <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                                <FiClock size={10} />{ev.time}
                              </div>
                              <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                                <FiMapPin size={10} />{ev.venue}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CalendarPage;
