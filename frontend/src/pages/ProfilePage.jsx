import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiEdit2, FiSave, FiLock } from 'react-icons/fi';
import DashboardLayout from '../components/common/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const INTERESTS = ['technical', 'cultural', 'sports', 'workshop', 'nss', 'fest', 'music', 'dance', 'coding', 'debate'];

const ProfilePage = () => {
  const { user, login } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', interests: user?.interests || [] });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '' });
  const [saving, setSaving] = useState(false);

  const toggleInterest = (interest) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authAPI.updateProfile ? authAPI.updateProfile(form) : Promise.resolve({ data: { user: { ...user, ...form } } });
      login(res.data.user || { ...user, ...form }, localStorage.getItem('token'));
      toast.success('Profile updated!');
      setEditing(false);
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white mb-1">My Profile</h1>
          <p className="text-gray-400 text-sm">Manage your account and preferences</p>
        </motion.div>

        {/* Avatar Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass gradient-border rounded-2xl p-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">{user?.name}</h2>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <span className="badge bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 capitalize mt-2 inline-block">
              {user?.role}
            </span>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} onClick={() => setEditing(!editing)}
            className="ml-auto flex items-center gap-2 px-4 py-2 glass border border-white/10 rounded-xl text-gray-300 hover:text-white text-sm transition-all">
            <FiEdit2 size={14} /> {editing ? 'Cancel' : 'Edit'}
          </motion.button>
        </motion.div>

        {/* Profile Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass gradient-border rounded-2xl p-6 space-y-5">
          <h3 className="text-white font-semibold">Personal Information</h3>

          <div>
            <label className="flex items-center gap-2 text-gray-300 text-sm mb-2"><FiUser size={13} /> Full Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              disabled={!editing} className="input-field disabled:opacity-60 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="flex items-center gap-2 text-gray-300 text-sm mb-2"><FiMail size={13} /> Email</label>
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              disabled={!editing} className="input-field disabled:opacity-60 disabled:cursor-not-allowed" />
          </div>

          {editing && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleSave} disabled={saving}
              className="btn-primary flex items-center gap-2 text-sm">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave size={14} />}
              Save Changes
            </motion.button>
          )}
        </motion.div>

        {/* Interests (students) */}
        {user?.role === 'student' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass gradient-border rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-2">My Interests</h3>
            <p className="text-gray-500 text-xs mb-4">Used by AI to recommend events for you</p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(interest => (
                <motion.button key={interest} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => editing && toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-xl text-sm capitalize transition-all ${
                    form.interests.includes(interest)
                      ? 'bg-indigo-600 text-white'
                      : 'glass text-gray-400 border border-white/10 hover:text-white'
                  } ${!editing ? 'cursor-default' : 'cursor-pointer'}`}>
                  {interest}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
