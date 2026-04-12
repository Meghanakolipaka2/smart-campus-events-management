import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiTrendingUp } from 'react-icons/fi';
import DashboardLayout from '../components/common/DashboardLayout';
import { analyticsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const medalColors = ['text-yellow-400', 'text-gray-300', 'text-orange-400'];
const medalEmojis = ['🥇', '🥈', '🥉'];

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLeaderboard(); }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await analyticsAPI.getDashboard();
      setLeaders(res.data.leaderboard || []);
    } catch {} finally { setLoading(false); }
  };

  return (
    <DashboardLayout title="Leaderboard">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
            <FiAward size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
            <p className="text-gray-400 text-sm">Most active students this month</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[0,1,2,3,4].map(i => <div key={i} className="shimmer h-16 rounded-2xl" />)}</div>
        ) : leaders.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">🏆</div>
            <p className="text-gray-400">No leaderboard data yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaders.map((leader, i) => (
              <motion.div key={leader.id || i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`glass gradient-border rounded-2xl p-4 flex items-center gap-4 ${leader.id === user?.id ? 'border-indigo-500/50' : ''}`}>
                <div className={`text-2xl font-bold w-10 text-center flex-shrink-0 ${medalColors[i] || 'text-gray-500'}`}>
                  {i < 3 ? medalEmojis[i] : `#${i + 1}`}
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {leader.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium text-sm flex items-center gap-2">
                    {leader.name}
                    {leader.id === user?.id && <span className="badge bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 text-xs">You</span>}
                  </div>
                  <div className="text-gray-500 text-xs">{leader.events_attended || 0} events attended</div>
                </div>
                <div className="flex items-center gap-1.5 text-indigo-400">
                  <FiTrendingUp size={14} />
                  <span className="font-bold">{leader.points || 0}</span>
                  <span className="text-gray-500 text-xs">pts</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LeaderboardPage;
