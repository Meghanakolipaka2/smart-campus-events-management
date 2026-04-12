import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiCalendar, FiUsers, FiBell, FiStar, FiArrowRight, FiZap } from 'react-icons/fi';

const FloatingCard = ({ icon: Icon, title, color, delay, x, y }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1, y: [0, -15, 0] }}
    transition={{ delay, duration: 4, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
    style={{ left: x, top: y }}
    className="absolute glass rounded-2xl p-4 flex items-center gap-3 hidden lg:flex"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="text-white" size={18} />
    </div>
    <span className="text-white text-sm font-medium">{title}</span>
  </motion.div>
);

const FeatureCard = ({ icon: Icon, title, desc, gradient }) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.02 }}
    className="glass rounded-2xl p-6 card-hover gradient-border"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${gradient}`}>
      <Icon size={22} className="text-white" />
    </div>
    <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

const StatCard = ({ value, label }) => (
  <div className="text-center">
    <div className="gradient-text text-4xl font-bold mb-1">{value}</div>
    <div className="text-gray-400 text-sm">{label}</div>
  </div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-dark-bg overflow-hidden">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FiZap className="text-white" size={16} />
            </div>
            <span className="text-white font-bold text-lg">CampusHub</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Events', 'About', 'Contact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="text-gray-400 hover:text-white transition-colors text-sm">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm px-4 py-2">
              Sign In
            </Link>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-sm px-5 py-2.5"
              >
                Get Started
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        {/* Floating cards */}
        <FloatingCard icon={FiCalendar} title="25 Events Today" color="bg-indigo-600" delay={0.5} x="5%" y="30%" />
        <FloatingCard icon={FiUsers} title="2,400+ Students" color="bg-purple-600" delay={1} x="75%" y="25%" />
        <FloatingCard icon={FiBell} title="Real-time Alerts" color="bg-cyan-600" delay={1.5} x="80%" y="65%" />
        <FloatingCard icon={FiStar} title="AI Recommendations" color="bg-pink-600" delay={2} x="2%" y="65%" />

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-indigo-300 mb-8 border border-indigo-500/30">
              <FiZap size={14} className="text-indigo-400" />
              Powered by AI Recommendations
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6"
          >
            Smart Campus
            <br />
            <span className="gradient-text">Event Management</span>
            <br />
            System
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            One intelligent platform for all campus events — technical, cultural, sports, and more.
            Discover, register, and never miss what matters.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(99,102,241,0.6)' }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-8 py-4 rounded-xl text-lg"
              >
                Get Started Free <FiArrowRight />
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 glass text-white font-medium px-8 py-4 rounded-xl text-lg border border-white/10"
            >
              View Demo
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <StatCard value="500+" label="Events Hosted" />
            <StatCard value="10k+" label="Students" />
            <StatCard value="50+" label="Organizers" />
            <StatCard value="98%" label="Satisfaction" />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything you need, <span className="gradient-text">all in one place</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Powerful features built for modern campuses and event-driven communities.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FiCalendar, title: 'Smart Calendar', desc: 'Interactive calendar with conflict detection. Never double-book a venue again.', gradient: 'bg-gradient-to-br from-indigo-600 to-blue-600' },
              { icon: FiStar, title: 'AI Recommendations', desc: 'Personalized event suggestions based on your interests and history.', gradient: 'bg-gradient-to-br from-purple-600 to-pink-600' },
              { icon: FiBell, title: 'Real-time Notifications', desc: 'Instant alerts for new events, reminders, and personalized suggestions.', gradient: 'bg-gradient-to-br from-cyan-600 to-teal-600' },
              { icon: FiUsers, title: 'Role-based Access', desc: 'Separate dashboards for students, organizers, and admins.', gradient: 'bg-gradient-to-br from-orange-600 to-red-600' },
              { icon: FiZap, title: 'QR Check-in', desc: 'Seamless event attendance tracking with QR code scanning.', gradient: 'bg-gradient-to-br from-green-600 to-emerald-600' },
              { icon: FiArrowRight, title: 'Analytics Dashboard', desc: 'Real-time participation trends, event popularity, and student engagement data.', gradient: 'bg-gradient-to-br from-pink-600 to-rose-600' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass gradient-border rounded-3xl p-16 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">Ready to transform your campus?</h2>
              <p className="text-gray-400 text-lg mb-8">Join thousands of students and organizers already using CampusHub.</p>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(99,102,241,0.5)' }}
                  className="btn-primary text-lg px-10 py-4"
                >
                  Start for Free →
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center">
            <FiZap className="text-white" size={10} />
          </div>
          <span className="text-white font-medium">CampusHub</span>
        </div>
        <p>© 2025 Smart Campus Event Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
