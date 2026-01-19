
import React, { useEffect, useState } from 'react';
import { User, TaskCategory } from '../types';
import { getAIRecommendations } from '../services/geminiService';
import { api } from '../services/api';

interface DashboardProps {
  user: User;
  onNavigateToEarn: () => void;
  onWatchAd: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigateToEarn, onWatchAd }) => {
  const [recommendations, setRecommendations] = useState<{ tips: string[]; recommendation: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchAI = async () => {
      const [aiData, sData] = await Promise.all([
        getAIRecommendations(user.balance, user.completedTasks),
        api.admin.getStats()
      ]);
      setRecommendations(aiData);
      setSettings(sData.settings);
      setLoading(false);
    };
    fetchAI();
  }, [user.balance, user.completedTasks]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-xl transition-all">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-chart-line"></i>
          </div>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Earned</p>
          <p className="text-3xl font-black text-gray-900">${user.totalEarned.toFixed(2)}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-xl transition-all">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-check-double"></i>
          </div>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Completed</p>
          <p className="text-3xl font-black text-gray-900">{user.completedTasks}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-xl transition-all relative overflow-hidden">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-fire"></i>
          </div>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Daily Streak</p>
          <p className="text-3xl font-black text-gray-900">{user.streak} Days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AI Section */}
        <div className="lg:col-span-8 bg-gradient-to-br from-green-600 to-emerald-700 rounded-[3rem] p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-4 tracking-tight flex items-center gap-3">
               <i className="fa-solid fa-brain"></i> AI Personal Coach
            </h2>
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-white/20 rounded-full w-3/4"></div>
                <div className="h-4 bg-white/20 rounded-full w-1/2"></div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-green-50 text-xl font-medium leading-relaxed italic">"{recommendations?.recommendation}"</p>
                <div className="flex flex-wrap gap-2">
                  {recommendations?.tips.map((tip, idx) => (
                    <span key={idx} className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">
                      {tip}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <i className="fa-solid fa-robot absolute -bottom-10 -right-10 text-[240px] opacity-10 rotate-12"></i>
        </div>

        {/* AdMob Rewarded Action */}
        <div className="lg:col-span-4 bg-gray-900 rounded-[3rem] p-10 text-white shadow-xl relative overflow-hidden flex flex-col justify-center">
           <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-2xl shadow-blue-900/50">
                 <i className="fa-solid fa-clapperboard"></i>
              </div>
              <h3 className="text-xl font-black mb-2">Bonus Reward</h3>
              <p className="text-xs text-gray-400 mb-8 leading-relaxed">Watch a short AdMob video and earn a quick cash bonus.</p>
              
              <button 
                onClick={onWatchAd}
                disabled={!settings?.admob?.adsEnabled}
                className="w-full py-5 bg-white text-gray-900 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl disabled:bg-gray-800 disabled:text-gray-600"
              >
                {settings?.admob?.adsEnabled ? 'Watch Bonus Video' : 'Ads Disabled'}
              </button>
           </div>
           <i className="fa-solid fa-play absolute -top-10 -right-10 text-[180px] text-white/5 -rotate-12"></i>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-900 text-xl mb-8 flex items-center gap-3">
            <i className="fa-solid fa-bolt text-yellow-500"></i>
            Quick Earn
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.values(TaskCategory).slice(0, 4).map((cat) => (
              <button
                key={cat}
                onClick={onNavigateToEarn}
                className="p-6 border border-gray-100 rounded-3xl hover:border-green-300 hover:bg-green-50 transition-all text-left group"
              >
                <p className="font-black text-gray-900 text-sm mb-1 group-hover:text-green-600 transition-colors">{cat}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Up to $5.00</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="font-black text-gray-900 text-xl mb-3 flex items-center gap-3">
               <i className="fa-solid fa-people-group text-blue-500"></i>
               Referral Hub
            </h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">Invite partners to EarnPulse and receive <span className="text-green-600 font-black">10% Lifetime Commission</span> from their activity.</p>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <span className="flex-1 font-mono text-xs overflow-hidden text-ellipsis text-gray-400 font-bold">earnpulse.me/u/{user.id.split('@')[0]}</span>
            <button className="text-green-600 hover:text-green-700 text-xs font-black uppercase tracking-widest">Copy Link</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
