import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiUsers, FiBookmark, FiStar } from 'react-icons/fi';
import { format } from 'date-fns';

const categoryColors = {
  technical: { bg: 'bg-blue-600/20', text: 'text-blue-400', border: 'border-blue-600/30' },
  cultural: { bg: 'bg-pink-600/20', text: 'text-pink-400', border: 'border-pink-600/30' },
  sports: { bg: 'bg-green-600/20', text: 'text-green-400', border: 'border-green-600/30' },
  workshop: { bg: 'bg-yellow-600/20', text: 'text-yellow-400', border: 'border-yellow-600/30' },
  nss: { bg: 'bg-orange-600/20', text: 'text-orange-400', border: 'border-orange-600/30' },
  fest: { bg: 'bg-purple-600/20', text: 'text-purple-400', border: 'border-purple-600/30' },
};

const categoryEmojis = {
  technical: '💻',
  cultural: '🎭',
  sports: '⚽',
  workshop: '🛠️',
  nss: '🤝',
  fest: '🎉',
};

const EventCard = ({ event, onBookmark, isBookmarked, showActions = true }) => {
  const colors = categoryColors[event.category] || categoryColors.technical;
  const emoji = categoryEmojis[event.category] || '📅';
  const spotsLeft = event.max_participants - (event.registrations_count || 0);
  const isFull = spotsLeft <= 0;
  const percentage = Math.round(((event.registrations_count || 0) / event.max_participants) * 100);

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="glass gradient-border rounded-2xl overflow-hidden group"
    >
      {/* Header */}
      <div className={`h-2 bg-gradient-to-r ${
        event.category === 'technical' ? 'from-blue-600 to-cyan-500' :
        event.category === 'cultural' ? 'from-pink-600 to-rose-500' :
        event.category === 'sports' ? 'from-green-600 to-emerald-500' :
        event.category === 'workshop' ? 'from-yellow-600 to-orange-500' :
        event.category === 'nss' ? 'from-orange-600 to-red-500' :
        'from-purple-600 to-indigo-500'
      }`} />

      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <div className={`badge ${colors.bg} ${colors.text} border ${colors.border}`}>
            {emoji} {event.category}
          </div>
          <div className="flex items-center gap-2">
            {event.popularity_score > 80 && (
              <div className="flex items-center gap-1 text-yellow-400 text-xs">
                <FiStar size={12} className="fill-current" />
                <span>Hot</span>
              </div>
            )}
            {showActions && onBookmark && (
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.preventDefault(); onBookmark(event.id); }}
                className={`transition-colors ${isBookmarked ? 'text-indigo-400' : 'text-gray-600 hover:text-gray-300'}`}
              >
                <FiBookmark size={16} className={isBookmarked ? 'fill-current' : ''} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Title */}
        <Link to={`/events/${event.id}`}>
          <h3 className="text-white font-semibold text-base mb-1 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
            {event.title}
          </h3>
        </Link>

        <p className="text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed">{event.description}</p>

        {/* Details */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <FiCalendar size={12} className="text-indigo-400 flex-shrink-0" />
            <span>{format(new Date(event.date), 'EEE, MMM d yyyy')} • {event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <FiMapPin size={12} className="text-purple-400 flex-shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <FiUsers size={12} className="text-cyan-400 flex-shrink-0" />
            <span>{event.registrations_count || 0}/{event.max_participants} registered</span>
          </div>
        </div>

        {/* Capacity bar */}
        <div className="mb-4">
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className={`h-full rounded-full ${isFull ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className={`text-xs ${isFull ? 'text-red-400' : 'text-gray-500'}`}>
              {isFull ? 'FULL' : `${spotsLeft} spots left`}
            </span>
            <span className="text-xs text-gray-600">{percentage}%</span>
          </div>
        </div>

        <Link to={`/events/${event.id}`}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isFull}
            className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
              isFull
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 hover:bg-indigo-600 hover:text-white'
            }`}
          >
            {isFull ? 'Event Full' : 'View Details →'}
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
};

export default EventCard;
