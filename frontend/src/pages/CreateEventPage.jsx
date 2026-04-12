import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiUsers, FiTag, FiFileText, FiClock, FiAlertTriangle } from 'react-icons/fi';
import DashboardLayout from '../components/common/DashboardLayout';
import { eventsAPI, venuesAPI } from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['technical', 'cultural', 'sports', 'workshop', 'nss', 'fest'];
const TAGS_SUGGESTIONS = ['hackathon', 'competition', 'seminar', 'concert', 'tournament', 'dance', 'music', 'coding', 'debate', 'quiz'];

// KEY FIX: Field component is defined OUTSIDE the main component
// When defined inside, React re-creates it on every keystroke = input loses focus
const Field = ({ label, icon: Icon, children }) => (
  <div>
    <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
      <Icon size={14} className="text-indigo-400" />
      {label}
    </label>
    {children}
  </div>
);

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // Each field has its own state — do NOT use one big form object
  const [title, setTitle]                   = useState('');
  const [description, setDescription]       = useState('');
  const [category, setCategory]             = useState('technical');
  const [date, setDate]                     = useState('');
  const [time, setTime]                     = useState('');
  const [venue, setVenue]                   = useState('');
  const [maxParticipants, setMaxParticipants] = useState(50);
  const [tags, setTags]                     = useState([]);
  const [tagInput, setTagInput]             = useState('');
  const [venuesList, setVenuesList]         = useState([]);
  const [loading, setLoading]               = useState(false);
  const [conflict, setConflict]             = useState(null);

  useEffect(() => {
    fetchVenues();
    if (isEdit) fetchEvent();
  }, []);

  useEffect(() => {
    if (date && time && venue) checkConflict();
  }, [date, time, venue]);

  const fetchVenues = async () => {
    try {
      const res = await venuesAPI.getAll();
      setVenuesList(res.data.venues || []);
    } catch {}
  };

  const fetchEvent = async () => {
    try {
      const res = await eventsAPI.getById(id);
      const ev = res.data.event;
      setTitle(ev.title || '');
      setDescription(ev.description || '');
      setCategory(ev.category || 'technical');
      setDate(ev.date || '');
      setTime(ev.time || '');
      setVenue(ev.venue || '');
      setMaxParticipants(ev.max_participants || 50);
      setTags(ev.tags || []);
    } catch {
      toast.error('Failed to load event');
      navigate('/organizer');
    }
  };

  const checkConflict = async () => {
    try {
      const res = await venuesAPI.checkConflict({ date, time, venue, exclude_id: id });
      setConflict(res.data.conflict || null);
    } catch {}
  };

  const addTag = (tag) => {
    const t = tag.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag));

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (conflict) { toast.error('Please resolve venue conflict before saving'); return; }
    setLoading(true);
    const formData = { title, description, category, date, time, venue, max_participants: maxParticipants, tags };
    try {
      if (isEdit) {
        await eventsAPI.update(id, formData);
        toast.success('Event updated successfully!');
      } else {
        await eventsAPI.create(formData);
        toast.success('Event created! Awaiting admin approval.');
      }
      navigate('/organizer');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <DashboardLayout title={isEdit ? 'Edit Event' : 'Create Event'}>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white mb-1">{isEdit ? 'Edit Event' : 'Create New Event'}</h1>
          <p className="text-gray-400 text-sm mb-8">Fill in the details below. Events require admin approval.</p>

          {conflict && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6">
              <FiAlertTriangle className="text-red-400 flex-shrink-0" size={18} />
              <div>
                <p className="text-red-400 font-medium text-sm">Venue Conflict Detected!</p>
                <p className="text-gray-400 text-xs mt-1">
                  "{conflict.title}" is already booked at this venue on this date and time.
                </p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Basic Info */}
            <div className="glass gradient-border rounded-2xl p-6 space-y-5">
              <Field label="Event Title" icon={FiFileText}>
                <input
                  type="text"
                  placeholder="e.g. National Hackathon 2025"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="input-field"
                  required
                  autoComplete="off"
                />
              </Field>

              <Field label="Description" icon={FiFileText}>
                <textarea
                  placeholder="Describe your event in detail..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="input-field resize-none h-28"
                  required
                />
              </Field>

              <Field label="Category" icon={FiTag}>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat} type="button" onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                        category === cat ? 'bg-indigo-600 text-white' : 'glass text-gray-400 border border-white/10 hover:text-white'
                      }`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            {/* Date, Time, Venue */}
            <div className="glass gradient-border rounded-2xl p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Date" icon={FiCalendar}>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="input-field" required min={today} />
                </Field>
                <Field label="Time" icon={FiClock}>
                  <input type="time" value={time} onChange={e => setTime(e.target.value)}
                    className="input-field" required />
                </Field>
              </div>

              <Field label="Venue" icon={FiMapPin}>
                {venuesList.length > 0 ? (
                  <select value={venue} onChange={e => setVenue(e.target.value)}
                    className="input-field bg-transparent" required>
                    <option value="">Select a venue...</option>
                    {venuesList.map(v => (
                      <option key={v.id} value={v.name}>{v.name} (capacity: {v.capacity})</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" placeholder="e.g. Main Auditorium" value={venue}
                    onChange={e => setVenue(e.target.value)}
                    className="input-field" required autoComplete="off" />
                )}
              </Field>

              <Field label="Max Participants" icon={FiUsers}>
                <input type="number" min="1" max="10000" value={maxParticipants}
                  onChange={e => setMaxParticipants(parseInt(e.target.value) || 1)}
                  className="input-field" required />
              </Field>
            </div>

            {/* Tags */}
            <div className="glass gradient-border rounded-2xl p-6">
              <Field label="Tags" icon={FiTag}>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input type="text" placeholder="Type a tag and press Enter or click Add"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      className="input-field flex-1 text-sm"
                      autoComplete="off"
                    />
                    <button type="button" onClick={() => addTag(tagInput)}
                      className="px-4 py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 rounded-xl text-sm hover:bg-indigo-600 hover:text-white transition-all">
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TAGS_SUGGESTIONS.filter(t => !tags.includes(t)).map(t => (
                      <button key={t} type="button" onClick={() => addTag(t)}
                        className="text-xs px-2.5 py-1 glass border border-white/10 text-gray-400 rounded-lg hover:text-white hover:border-indigo-500/50 transition-all">
                        +{t}
                      </button>
                    ))}
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map(t => (
                        <span key={t} onClick={() => removeTag(t)}
                          className="badge bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 cursor-pointer hover:bg-red-600/20 hover:text-red-400 hover:border-red-600/30 transition-all">
                          #{t} ×
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Field>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button type="button" whileHover={{ scale: 1.02 }} onClick={() => navigate(-1)}
                className="flex-1 py-3 rounded-xl border border-white/10 glass text-gray-300 font-medium hover:text-white transition-all">
                Cancel
              </motion.button>
              <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                disabled={loading || Boolean(conflict)}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : isEdit ? 'Update Event' : 'Create Event'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default CreateEventPage;
