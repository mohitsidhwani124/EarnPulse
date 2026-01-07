
import React, { useEffect, useState } from 'react';
import { User, TaskCategory } from '../types';
import { getAIRecommendations } from '../services/geminiService';

interface DashboardProps {
  user: User;
  onNavigateToEarn: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigateToEarn }) => {
  const [recommendations, setRecommendations] = useState<{ tips: string[]; recommendation: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAI = async () => {
      const data = await getAIRecommendations(user.balance, user.completedTasks);
      setRecommendations(data);
      setLoading(false);
    };
    fetchAI();
  }, [user.balance, user.completedTasks]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-3">
            <i className="fa-solid fa-chart-line text-xl"></i>
          </div>
          <p className="text-gray-500 text-sm">Total Earned</p>
          <p className="text-2xl font-bold text-gray-800">${user.totalEarned.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3">
            <i className="fa-solid fa-check-double text-xl"></i>
          </div>
          <p className="text-gray-500 text-sm">Tasks Completed</p>
          <p className="text-2xl font-bold text-gray-800">{user.completedTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-3">
            <i className="fa-solid fa-fire text-xl"></i>
          </div>
          <p className="text-gray-500 text-sm">Daily Streak</p>
          <p className="text-2xl font-bold text-gray-800">{user.streak} Days</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">AI Personal Coach</h2>
          {loading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-white/20 rounded w-3/4"></div>
              <div className="h-4 bg-white/20 rounded w-1/2"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-green-100 text-lg italic">"{recommendations?.recommendation}"</p>
              <div className="flex flex-wrap gap-2">
                {recommendations?.tips.map((tip, idx) => (
                  <span key={idx} className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                    {tip}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <i className="fa-solid fa-brain absolute -bottom-10 -right-10 text-[180px] opacity-10 rotate-12"></i>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-ranking-star text-yellow-500"></i>
            Quick Earn Categories
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(TaskCategory).slice(0, 4).map((cat) => (
              <button
                key={cat}
                onClick={onNavigateToEarn}
                className="p-4 border border-gray-100 rounded-2xl hover:border-green-300 hover:bg-green-50 transition-all text-left"
              >
                <p className="font-semibold text-gray-700 text-sm">{cat}</p>
                <p className="text-[10px] text-gray-500">Up to $5.00</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Refer & Earn</h3>
            <p className="text-sm text-gray-500 mb-4">Invite your friends and earn 10% of their earnings for life!</p>
          </div>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <span className="flex-1 font-mono text-sm overflow-hidden text-ellipsis whitespace-nowrap">earnpulse.me/u/user123</span>
            <button className="text-green-600 hover:text-green-700 text-sm font-bold">Copy</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
