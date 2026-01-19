
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { User, Task, Transaction, TaskCategory } from '../types';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'payouts' | 'users' | 'tasks' | 'monetization' | 'settings'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, u, t, tx] = await Promise.all([
        api.admin.getStats(),
        api.admin.getUsers(),
        api.tasks.getAll(),
        api.admin.getTransactions()
      ]);
      setStats(s);
      setUsers(u);
      setTasks(t);
      setTransactions(tx);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const adminRevenue = useMemo(() => {
    const earnings = transactions.filter(t => t.type === 'Earning' && t.status === 'Completed');
    const commission = stats?.settings?.globalCommission || 40;
    
    const taskProfit = earnings.reduce((acc, tx) => {
      const task = tasks.find(tk => tx.description.includes(tk.title));
      if (task && task.providerValue) {
        return acc + (task.providerValue - task.reward);
      }
      const gross = tx.amount / ((100 - commission) / 100);
      return acc + (gross - tx.amount);
    }, 0);

    const totalAds = users.reduce((acc, u) => acc + (u.adsWatched || 0), 0);
    const cpm = stats?.settings?.admob?.estimatedCPM || 10;
    const adRevenue = (totalAds / 1000) * cpm;

    return {
      netProfit: taskProfit + adRevenue,
      taskProfit,
      adRevenue,
      totalAds,
      grossRevenue: earnings.reduce((acc, tx) => acc + (tx.amount / ((100 - commission) / 100)), 0),
      margin: commission
    };
  }, [transactions, stats, tasks, users]);

  const pendingWithdrawals = useMemo(() => 
    transactions.filter(t => t.type === 'Payout' && t.status === 'Pending'),
  [transactions]);

  const handleUpdateSetting = async (key: string, val: any) => {
    if (key.startsWith('admob.')) {
        const subKey = key.split('.')[1];
        await api.admin.updateSettings({ admob: { ...stats.settings.admob, [subKey]: val } });
    } else {
        await api.admin.updateSettings({ [key]: val });
    }
    fetchData();
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const taskData: Task = {
      id: editingTask.id || Date.now().toString(),
      title: editingTask.title || 'New Task',
      description: editingTask.description || '',
      reward: Number(editingTask.reward) || 0,
      providerValue: Number(editingTask.providerValue) || Number(editingTask.reward) * 1.6,
      category: (editingTask.category as TaskCategory) || TaskCategory.SURVEY,
      estimatedTime: editingTask.estimatedTime || '5m',
      difficulty: (editingTask.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Easy',
      icon: editingTask.icon || 'fa-star',
      videoUrl: editingTask.videoUrl || '',
      requiredWatchTime: Number(editingTask.requiredWatchTime) || 0
    };
    await api.admin.upsertTask(taskData);
    setShowTaskModal(false);
    fetchData();
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Delete this offer from inventory?')) {
      await api.admin.deleteTask(id);
      fetchData();
    }
  };

  if (loading && !stats) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Syncing Master Node</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 animate-in fade-in duration-700">
      {/* Revenue Performance Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-gradient-to-br from-gray-900 to-black p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total Net Yield</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end gap-12">
               <div>
                  <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">Cumulative Profit</p>
                  <h2 className="text-7xl font-black tracking-tighter text-white">${adminRevenue.netProfit.toFixed(2)}</h2>
               </div>
               <div className="pb-2">
                  <div className="flex flex-col gap-2">
                    <span className="bg-blue-600/20 text-blue-400 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-600/30">
                       Ad Revenue: ${adminRevenue.adRevenue.toFixed(2)}
                    </span>
                    <span className="bg-green-600/20 text-green-400 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-green-600/30">
                       Task Yield: {adminRevenue.margin}%
                    </span>
                  </div>
               </div>
            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/5">
               <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Ad Impressions</p>
                  <p className="text-xl font-bold">{adminRevenue.totalAds}</p>
               </div>
               <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Gross Inflow</p>
                  <p className="text-xl font-bold">${adminRevenue.grossRevenue.toFixed(2)}</p>
               </div>
               <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">User Balance</p>
                  <p className="text-xl font-bold text-orange-400">${stats?.totalBalance.toFixed(2)}</p>
               </div>
               <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">System Users</p>
                  <p className="text-xl font-bold text-blue-400">{stats?.totalUsers}</p>
               </div>
            </div>
          </div>
          <i className="fa-solid fa-money-bill-trend-up absolute -bottom-10 -right-10 text-[320px] text-white/5 rotate-12"></i>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm flex-1 flex flex-col justify-center text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">AdMob Status</p>
              <div className="flex items-center justify-center gap-2 mb-2">
                 <div className={`w-3 h-3 rounded-full ${stats?.settings?.admob?.adsEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                 <p className="text-2xl font-black text-gray-900">{stats?.settings?.admob?.adsEnabled ? 'Active' : 'Offline'}</p>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">CPM: ${stats?.settings?.admob?.estimatedCPM.toFixed(2)}</p>
           </div>
           <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm flex-1 flex flex-col justify-center text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payout Queue</p>
              <p className="text-4xl font-black text-blue-600">{pendingWithdrawals.length}</p>
              <button onClick={() => setActiveTab('payouts')} className="mt-4 text-[10px] font-black text-gray-400 uppercase hover:text-gray-900 transition-colors">Manage Payouts &rarr;</button>
           </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Dashboard', icon: 'fa-chart-line' },
          { id: 'payouts', label: 'Withdrawals', icon: 'fa-money-bill-transfer' },
          { id: 'tasks', label: 'Inventory', icon: 'fa-box-open' },
          { id: 'monetization', label: 'AdMob & Profit', icon: 'fa-sack-dollar' },
          { id: 'settings', label: 'System', icon: 'fa-gears' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <i className={`fa-solid ${tab.icon} text-xs`}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="min-h-[400px]">
        {activeTab === 'monetization' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
             <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-xl space-y-12">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center text-3xl">
                      <i className="fa-brands fa-google"></i>
                   </div>
                   <div>
                      <h3 className="text-3xl font-black text-gray-900 tracking-tight">AdMob Integration</h3>
                      <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">Connect your advertising engine</p>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100">
                      <div>
                         <p className="font-black text-sm uppercase tracking-widest text-gray-900">Enable Mobile Ads</p>
                         <p className="text-xs text-gray-400 font-medium">Activate rewarded video ads globally</p>
                      </div>
                      <button 
                        onClick={() => handleUpdateSetting('admob.adsEnabled', !stats?.settings?.admob?.adsEnabled)}
                        className={`w-14 h-8 rounded-full relative transition-all ${stats?.settings?.admob?.adsEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                      >
                         <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${stats?.settings?.admob?.adsEnabled ? 'left-7' : 'left-1'}`}></div>
                      </button>
                   </div>

                   <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 ml-2 tracking-widest">AdMob App ID</label>
                        <input 
                          type="text" 
                          value={stats?.settings?.admob?.appId}
                          onChange={(e) => handleUpdateSetting('admob.appId', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 text-xs font-mono font-bold outline-none focus:ring-4 focus:ring-blue-900/5 transition-all" 
                          placeholder="ca-app-pub-..." 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 ml-2 tracking-widest">Rewarded Video Unit ID</label>
                        <input 
                          type="text" 
                          value={stats?.settings?.admob?.rewardedId}
                          onChange={(e) => handleUpdateSetting('admob.rewardedId', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 text-xs font-mono font-bold outline-none focus:ring-4 focus:ring-blue-900/5 transition-all" 
                          placeholder="ca-app-pub-..."
                        />
                      </div>
                   </div>

                   <div>
                      <div className="flex justify-between items-end mb-6">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Simulated eCPM ($)</label>
                         <div className="text-right">
                            <span className="text-4xl font-black text-blue-600">${stats?.settings?.admob?.estimatedCPM.toFixed(2)}</span>
                         </div>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        value={stats?.settings?.admob?.estimatedCPM}
                        onChange={(e) => handleUpdateSetting('admob.estimatedCPM', Number(e.target.value))}
                        className="w-full accent-blue-600 h-3 bg-gray-100 rounded-full appearance-none cursor-pointer"
                      />
                   </div>
                </div>
             </div>

             <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-xl space-y-12">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center text-3xl">
                      <i className="fa-solid fa-percent"></i>
                   </div>
                   <div>
                      <h3 className="text-3xl font-black text-gray-900 tracking-tight">Platform Arbitrage</h3>
                      <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">Control task profit margins</p>
                   </div>
                </div>

                <div className="space-y-12">
                   <div>
                      <div className="flex justify-between items-end mb-8">
                         <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Global Commission Fee</label>
                         <div className="text-right">
                            <span className="text-6xl font-black text-gray-900">{stats?.settings?.globalCommission}%</span>
                         </div>
                      </div>
                      <input 
                        type="range" 
                        min="5" 
                        max="90" 
                        value={stats?.settings?.globalCommission}
                        onChange={(e) => handleUpdateSetting('globalCommission', Number(e.target.value))}
                        className="w-full accent-gray-900 h-4 bg-gray-100 rounded-full appearance-none cursor-pointer"
                      />
                   </div>

                   <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6">Arbitrage Breakdown (Example)</p>
                      <div className="flex justify-between items-center mb-4">
                         <span className="text-xs font-medium">External Advertiser Pays</span>
                         <span className="font-black">$1.00</span>
                      </div>
                      <div className="flex justify-between items-center mb-4 text-green-400">
                         <span className="text-xs font-medium">User Receives</span>
                         <span className="font-black">${(1 * ((100 - (stats?.settings?.globalCommission || 40))/100)).toFixed(2)}</span>
                      </div>
                      <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                         <span className="text-xs font-black uppercase">Your Net Profit</span>
                         <span className="text-xl font-black text-blue-400">${(1 * ((stats?.settings?.globalCommission || 40)/100)).toFixed(2)}</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6 animate-in fade-in">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-black text-gray-900">Inventory Manager</h3>
                <button 
                  onClick={() => { setEditingTask({}); setShowTaskModal(true); }}
                  className="bg-gray-900 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl shadow-gray-200"
                >
                  <i className="fa-solid fa-plus"></i> New Offer
                </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tasks.map(t => (
                  <div key={t.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex items-center justify-between group hover:shadow-xl transition-all">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-green-50 group-hover:text-green-600 transition-colors shadow-inner">
                           <i className={`fa-solid ${t.icon}`}></i>
                        </div>
                        <div>
                           <h4 className="font-black text-gray-900 text-lg mb-1">{t.title}</h4>
                           <div className="flex items-center gap-4">
                              <div>
                                 <p className="text-[9px] font-black text-gray-400 uppercase">Provider Pay</p>
                                 <p className="text-sm font-black text-gray-900">${t.providerValue?.toFixed(2) || (t.reward * 1.6).toFixed(2)}</p>
                              </div>
                              <div className="h-4 w-px bg-gray-100"></div>
                              <div>
                                 <p className="text-[9px] font-black text-gray-400 uppercase">User Cut</p>
                                 <p className="text-sm font-black text-green-600">${t.reward.toFixed(2)}</p>
                              </div>
                              {t.category === TaskCategory.VIDEO && (
                                <div className={`ml-2 flex items-center gap-1 text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${t.videoUrl === 'admob' ? 'text-blue-500 bg-blue-50' : 'text-gray-500 bg-gray-50'}`}>
                                   <i className="fa-solid fa-play"></i> {t.videoUrl === 'admob' ? 'AdMob Video' : 'YouTube Video'}
                                </div>
                              )}
                           </div>
                        </div>
                     </div>
                     <div className="flex flex-col gap-2">
                        <button onClick={() => { setEditingTask(t); setShowTaskModal(true); }} className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all"><i className="fa-solid fa-pen-to-square text-xs"></i></button>
                        <button onClick={() => handleDeleteTask(t.id)} className="w-10 h-10 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"><i className="fa-solid fa-trash-can text-xs"></i></button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-lg animate-in fade-in" onClick={() => setShowTaskModal(false)}></div>
          <div className="bg-white w-full max-w-xl rounded-[4rem] shadow-2xl relative z-10 p-12 md:p-16 animate-in zoom-in-95 slide-in-from-bottom-10 overflow-hidden">
            <h3 className="text-4xl font-black text-gray-900 mb-12 tracking-tighter">
               {editingTask.id ? 'Refine Offer' : 'Add New Inventory'}
            </h3>
            
            <form onSubmit={handleSaveTask} className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 ml-2 tracking-widest">Public Offer Name</label>
                  <input type="text" value={editingTask.title || ''} onChange={e => setEditingTask({...editingTask, title: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] p-6 text-sm font-bold focus:ring-4 focus:ring-gray-900/5 outline-none transition-all" placeholder="e.g., Premium Survey 2025" required />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                   <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 ml-2 tracking-widest">Advertiser Payout ($)</label>
                     <input type="number" step="0.01" value={editingTask.providerValue || ''} onChange={e => setEditingTask({...editingTask, providerValue: Number(e.target.value)})} className="w-full bg-blue-50 border border-blue-100 rounded-[1.5rem] p-6 text-sm font-black outline-none transition-all" required />
                   </div>
                   <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 ml-2 tracking-widest">Category</label>
                     <select value={editingTask.category || TaskCategory.SURVEY} onChange={e => setEditingTask({...editingTask, category: e.target.value as any})} className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] p-6 text-sm font-black outline-none">
                       {Object.values(TaskCategory).map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                   </div>
                </div>

                {editingTask.category === TaskCategory.VIDEO && (
                  <div className="p-8 bg-gray-50 rounded-[2.5rem] space-y-6 border border-gray-100 animate-in slide-in-from-top-4">
                     <div className="flex items-center gap-3 mb-2">
                        <i className="fa-solid fa-play text-blue-600"></i>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-900">Video Configuration</h4>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-2 tracking-widest">Video URL (Enter 'admob' for AdMob Reward Video)</label>
                        <input type="text" value={editingTask.videoUrl || ''} onChange={e => setEditingTask({...editingTask, videoUrl: e.target.value})} className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-xs font-medium focus:ring-4 focus:ring-blue-900/5 outline-none" placeholder="admob OR https://www.youtube.com/embed/..." />
                        <p className="text-[8px] font-bold text-blue-500 mt-2 italic">* Using 'admob' will trigger the configured AdMob rewarded unit.</p>
                     </div>
                     {editingTask.videoUrl !== 'admob' && (
                       <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-2 tracking-widest">Required Watch Time (Seconds)</label>
                          <input type="number" value={editingTask.requiredWatchTime || ''} onChange={e => setEditingTask({...editingTask, requiredWatchTime: Number(e.target.value)})} className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-xs font-black focus:ring-4 focus:ring-blue-900/5 outline-none" placeholder="30" />
                       </div>
                     )}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 ml-2 tracking-widest">User Reward ($)</label>
                  <input type="number" step="0.01" value={editingTask.reward || ''} onChange={e => setEditingTask({...editingTask, reward: Number(e.target.value)})} className="w-full bg-green-50 border border-green-100 rounded-[1.5rem] p-6 text-sm font-black outline-none transition-all" required />
                </div>
              </div>

              <div className="flex gap-4 pt-8">
                <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">Discard</button>
                <button type="submit" className="flex-[2] bg-gray-900 text-white py-6 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-gray-200 hover:scale-105 active:scale-95 transition-all">Publish Live Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
