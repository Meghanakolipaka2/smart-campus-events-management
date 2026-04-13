import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { authAPI } from '../utils/api';// ✅ use this only
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiZap } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await authAPI.login(form);

    // ✅ FIX HERE
    login(res.data.user, res.data.token);

    toast.success(`Welcome back, ${res.data.user.name}!`);
    navigate('/dashboard');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};

  // Demo login shortcuts
  const demoLogin = (role) => {
    const demos = {
      student: { email: 'student@demo.com', password: 'demo123' },
      organizer: { email: 'organizer@demo.com', password: 'demo123' },
      admin: { email: 'admin@demo.com', password: 'demo123' },
    };
    setForm(demos[role]);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 relative overflow-hidden">
      
      <div className="relative w-full max-w-md">

        <motion.div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FiZap className="text-white" size={18} />
            </div>
            <span className="text-white font-bold text-xl">CampusHub</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400">Sign in to your account</p>
        </motion.div>

        <motion.div className="glass gradient-border rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-11"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Loading..." : "Sign In"}
            </motion.button>

          </form>

          {/* Demo */}
          <div className="mt-6 flex justify-between gap-3">
  {['student', 'organizer', 'admin'].map((role) => (
    <button
      key={role}
      onClick={() => demoLogin(role)}
      className="px-3 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 transition"
    >
      {role}
    </button>
  ))}
</div>

        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;