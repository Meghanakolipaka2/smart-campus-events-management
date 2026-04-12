import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { FiCalendar, FiMapPin, FiUsers, FiClock, FiShare2, FiBookmark, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { format } from 'date-fns';
import DashboardLayout from '../components/common/DashboardLayout';
import { eventsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const categoryColors = {
  technical: 'from-blue-600 to-cyan-500',
  cultural: 'from-pink-600 to-rose-500',
  sports: 'from-green-600 to-emerald-500',
  workshop: 'from-yellow-600 to-orange-500',
  nss: 'from-orange-600 to-red-500',
  fest: 'from-purple-600 to-indigo-500',
};

const EventDetailPage = () => {
  const { id } = useParams();
  const { user, isAdmin, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await eventsAPI.getById(id);
      setEvent(res.data.event);
      setRegistered(res.data.is_registered || false);
      setBookmarked(res.data.is_bookmarked || false);
    } catch { toast.error('Event not found'); navigate('/events'); }
    finally { setLoading(false); }
  };

  const handleRegister = async () => {
    setRegistering(true);
    try {
      if (registered) {
        await eventsAPI.unregister(id);
        setRegistered(false);
        setEvent(prev => ({ ...prev, registrations_count: prev.registrations_count - 1 }));
        toast.success('Registration cancelled');
      } else {
        await eventsAPI.register(id);
        setRegistered(true);
        setEvent(prev => ({ ...prev, registrations_count: prev.registrations_count + 1 }));
        toast.success('Successfully registered! 🎉');
        setShowQR(true);
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
    finally { setRegistering(false); }
  };

  const handleBookmark = async () => {
    try {
      await eventsAPI.bookmark(id);
      setBookmarked(!bookmarked);
      toast.success(bookmarked ? 'Removed from bookmarks' : 'Bookmarked!');
    } catch {}
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) return (
    <DashboardLayout title="Event Details">
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="shimmer h-64 rounded-2xl" />
        <div className="shimmer h-8 rounded w-1/2" />
        <div className="shimmer h-4 rounded w-3/4" />
      </div>
    </DashboardLayout>
  );

  if (!event) return null;

  const gradient = categoryColors[event.category] || 'from-indigo-600 to-purple-500';
  const spotsLeft = event.max_participants - event.registrations_count;
  const isFull = spotsLeft <= 0;
  const percentage = Math.round((event.registrations_count / event.max_participants) * 100);
  const isPast = new Date(event.date) < new Date();

  return (
    <DashboardLayout title="Event Details">
      <div className="max-w-4xl mx-auto">
        <motion.button onClick={() => navigate(-1)}
          whileHover={{ x: -4 }}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors text-sm">
          <FiArrowLeft size={16} /> Back to Events
        </motion.button>

        {/* Hero Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className={`relative bg-gradient-to-br ${gradient} rounded-3xl p-8 mb-6 overflow-hidden`}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/svg%3E")` }} />
          <div className="relative z-10">
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 capitalize">
              {event.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{event.title}</h1>
            <p className="text-white/80 text-sm">Organized by {event.organizer_name}</p>
          </div>
          {isPast && (
            <div className="absolute top-4 right-4 bg-black/40 text-white text-xs px-3 py-1 rounded-full">
              Event Ended
            </div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6">
            {/* Details Card */}
            <div className="glass gradient-border rounded-2xl p-6">
              <h2 className="text-white font-semibold text-lg mb-4">Event Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: FiCalendar, label: 'Date', value: format(new Date(event.date), 'EEEE, MMMM d, yyyy'), color: 'text-indigo-400' },
                  { icon: FiClock, label: 'Time', value: event.time, color: 'text-purple-400' },
                  { icon: FiMapPin, label: 'Venue', value: event.venue, color: 'text-cyan-400' },
                  { icon: FiUsers, label: 'Capacity', value: `${event.max_participants} participants`, color: 'text-green-400' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                    <Icon size={16} className={`${color} mt-0.5 flex-shrink-0`} />
                    <div>
                      <div className="text-gray-500 text-xs">{label}</div>
                      <div className="text-white text-sm font-medium">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="glass gradient-border rounded-2xl p-6">
              <h2 className="text-white font-semibold text-lg mb-3">About This Event</h2>
              <p className="text-gray-400 leading-relaxed text-sm">{event.description}</p>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="glass gradient-border rounded-2xl p-6">
                <h2 className="text-white font-semibold text-lg mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map(tag => (
                    <span key={tag} className="badge bg-indigo-600/20 text-indigo-400 border border-indigo-600/30">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="space-y-4">
            {/* Registration Card */}
            <div className="glass gradient-border rounded-2xl p-6">
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Capacity</span>
                  <span className="text-white font-medium">{event.registrations_count}/{event.max_participants}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1 }}
                    className={`h-full rounded-full ${isFull ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  />
                </div>
                <p className={`text-xs mt-1 ${isFull ? 'text-red-400' : 'text-gray-500'}`}>
                  {isFull ? 'Event is full' : `${spotsLeft} spots remaining`}
                </p>
              </div>

              {!isAdmin() && !isOrganizer() && !isPast && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRegister}
                  disabled={registering || (isFull && !registered)}
                  className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    registered
                      ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                      : isFull
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30'
                  }`}
                >
                  {registering ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : registered ? (
                    <><FiCheck size={16} /> Registered</>
                  ) : isFull ? 'Event Full' : 'Register Now'}
                </motion.button>
              )}

              <div className="flex gap-2 mt-3">
                <motion.button whileHover={{ scale: 1.05 }} onClick={handleBookmark}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-1 ${
                    bookmarked ? 'border-indigo-500/50 bg-indigo-600/10 text-indigo-400' : 'border-white/10 text-gray-400 hover:text-white glass'
                  }`}>
                  <FiBookmark size={14} className={bookmarked ? 'fill-current' : ''} />
                  {bookmarked ? 'Saved' : 'Save'}
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} onClick={handleShare}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-white/10 glass text-gray-400 hover:text-white transition-all flex items-center justify-center gap-1">
                  <FiShare2 size={14} /> Share
                </motion.button>
              </div>
            </div>

            {/* QR Code */}
            <AnimatePresence>
              {(registered || showQR) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass gradient-border rounded-2xl p-6 text-center"
                >
                  <h3 className="text-white font-semibold mb-3">Your Check-in QR</h3>
                  <div className="bg-white p-3 rounded-xl inline-block">
                    <QRCodeSVG
                      value={`campushub:checkin:${id}:${user?.id}`}
                      size={150}
                      level="H"
                    />
                  </div>
                  <p className="text-gray-500 text-xs mt-3">Show this at the event entrance</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Popularity */}
            <div className="glass gradient-border rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Popularity Score</span>
                <span className="text-white font-bold">{event.popularity_score || 0}/100</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full mt-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"
                  style={{ width: `${event.popularity_score || 0}%` }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EventDetailPage;
