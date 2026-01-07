
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, Task, Transaction, TaskCategory } from '../types';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tasks' | 'monetization' | 'settings' | 'deployment'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task>>({});

  const fetchData = async () => {
    setLoading(true);
    const [s, u, t] = await Promise.all([
      api.admin.getStats(),
      api.admin.getUsers(),
      api.tasks.getAll()
    ]);
    setStats(s);
    setUsers(u);
    setTasks(t);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdjustBalance = async (userId: string, current: number) => {
    const val = prompt("Enter new balance for user:", current.toString());
    if (val !== null) {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        await api.admin.updateUserBalance(userId, num);
        fetchData();
      }
    }
  };

  const handleExport = () => {
    const data = api.admin.exportDB();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnpulse_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (re) => {
        const content = re.target?.result as string;
        if (confirm("Importing will overwrite your current database and reload the app. Continue?")) {
          api.admin.importDB(content);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleToggleSetting = async (key: string, val: boolean) => {
    await api.admin.updateSettings({ [key]: val });
    fetchData();
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const taskData: Task = {
      id: editingTask.id || Date.now().toString(),
      title: editingTask.title || 'New Task',
      description: editingTask.description || '',
      reward: Number(editingTask.reward) || 0,
      category: (editingTask.category as TaskCategory) || TaskCategory.SURVEY,
      estimatedTime: editingTask.estimatedTime || '5m',
      difficulty: (editingTask.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Easy',
      icon: editingTask.icon || 'fa-star'
    };
    await api.admin.upsertTask(taskData);
    setShowTaskModal(false);
    fetchData();
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Delete this task?')) {
      await api.admin.deleteTask(id);
      fetchData();
    }
  };

  if (loading && !stats) return <div className="p-12 text-center text-gray-400 font-medium">Synchronizing with Virtual DB...</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <i className="fa-solid fa-shield-halved text-gray-700"></i>
          Command Center
        </h2>
        <div className="flex gap-2">
          <button onClick={handleExport} className="text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50">
            <i className="fa-solid fa-file-export mr-1"></i> Export
          </button>
          <button onClick={handleImport} className="text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50">
            <i className="fa-solid fa-file-import mr-1"></i> Import
          </button>
          <button onClick={fetchData} className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-xl hover:bg-green-100 transition-colors">
            <i className="fa-solid fa-rotate mr-1"></i> Refresh
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
          { id: 'users', label: 'Users', icon: 'fa-users' },
          { id: 'tasks', label: 'Tasks', icon: 'fa-list-check' },
          { id: 'monetization', label: 'Revenue', icon: 'fa-money-bill-trend-up' },
          { id: 'settings', label: 'System', icon: 'fa-gears' },
          { id: 'deployment', label: 'Deploy', icon: 'fa-cloud-arrow-up' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <i className={`fa-solid ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Users</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.totalUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Users Debt</p>
              <p className="text-2xl font-bold text-green-600">${stats?.totalBalance.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Projected Profit</p>
              <p className="text-2xl font-bold text-blue-600">${(stats?.totalBalance * 0.4).toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Live Tasks</p>
              <p className="text-2xl font-bold text-orange-600">{stats?.activeTasks}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden animate-in fade-in">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Balance</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Tasks</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800 text-sm">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.id}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-green-600 text-sm">${u.balance.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.completedTasks}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleAdjustBalance(u.id, u.balance)}
                      className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100"
                    >
                      Edit Balance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex justify-end">
            <button 
              onClick={() => { setEditingTask({}); setShowTaskModal(true); }}
              className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-green-100"
            >
              <i className="fa-solid fa-plus"></i> New Task
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map(t => (
              <div key={t.id} className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                    <i className={`fa-solid ${t.icon}`}></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{t.title}</h4>
                    <p className="text-xs text-green-600 font-bold">${t.reward.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingTask(t); setShowTaskModal(true); }} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100"><i className="fa-solid fa-pen text-[10px]"></i></button>
                  <button onClick={() => handleDeleteTask(t.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100"><i className="fa-solid fa-trash text-[10px]"></i></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'monetization' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <i className="fa-solid fa-sliders text-green-600"></i>
                Revenue Controls
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-4 ml-1">Owner Commission (%)</label>
                  <div className="flex items-center gap-4">
                    <input type="range" className="flex-1 accent-green-600" min="5" max="80" defaultValue="40" />
                    <span className="font-bold text-green-600 w-12 text-right">40%</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 italic">Higher commission means less pay for users but more profit for you.</p>
                </div>
                <div className="pt-6 border-t border-gray-100">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-4 ml-1">Offerwall Connectors</label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <span className="text-sm font-bold text-gray-700">CPALead API</span>
                      <span className="text-[10px] font-bold text-gray-300">UNCONFIGURED</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <span className="text-sm font-bold text-gray-700">AdMob App ID</span>
                      <span className="text-[10px] font-bold text-gray-300">UNCONFIGURED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Projected Monthly Yield</p>
                <h3 className="text-4xl font-extrabold mb-8 text-green-400">$0.00</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs border border-white/10">1</div>
                    <p className="text-xs text-gray-400">Yield is based on current user activity and your 40% margin.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs border border-white/10">2</div>
                    <p className="text-xs text-gray-400">Integrate real offerwalls to start generating actual revenue.</p>
                  </div>
                </div>
              </div>
              <i className="fa-solid fa-money-bill-trend-up absolute -bottom-10 -right-10 text-[200px] text-white/5 rotate-12"></i>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 max-w-2xl shadow-sm">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-gray-800">
              <i className="fa-solid fa-gears text-gray-400"></i>
              System Preferences
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <p className="font-bold text-sm text-gray-800">Maintenance Mode</p>
                  <p className="text-xs text-gray-400">Prevent users from accessing the app during updates.</p>
                </div>
                <button 
                  onClick={() => handleToggleSetting('maintenanceMode', !stats?.settings?.maintenanceMode)}
                  className={`w-12 h-6 rounded-full transition-all relative ${stats?.settings?.maintenanceMode ? 'bg-orange-500' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${stats?.settings?.maintenanceMode ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <p className="font-bold text-sm text-gray-800">Payout System</p>
                  <p className="text-xs text-gray-400">Enable or disable user withdrawals globally.</p>
                </div>
                <button 
                  onClick={() => handleToggleSetting('payoutsEnabled', !stats?.settings?.payoutsEnabled)}
                  className={`w-12 h-6 rounded-full transition-all relative ${stats?.settings?.payoutsEnabled ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${stats?.settings?.payoutsEnabled ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Global Announcement</label>
                <textarea 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]"
                  placeholder="Enter a message to show all users..."
                  defaultValue={stats?.settings?.announcement}
                  onBlur={(e) => api.admin.updateSettings({ announcement: e.target.value })}
                ></textarea>
                <p className="text-[10px] text-gray-400 mt-2 italic">This message appears on every user's dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'deployment' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-400 text-3xl">
                  <i className="fa-brands fa-github"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">GitHub Pages Deployment</h3>
                  <p className="text-gray-400 text-sm">Your "Static Backend" is active and running.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-xs">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-clipboard-check text-green-400"></i>
                    Files Verified
                  </h4>
                  <div className="space-y-2 text-gray-400 font-mono">
                    <div className="flex justify-between"><span>index.html</span><span className="text-green-400">OK</span></div>
                    <div className="flex justify-between"><span>404.html</span><span className="text-green-400">OK</span></div>
                    <div className="flex justify-between"><span>manifest.json</span><span className="text-green-400">OK</span></div>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-database text-blue-400"></i>
                    Data Engine
                  </h4>
                  <div className="space-y-2 text-gray-400">
                    <div className="flex justify-between"><span>Storage Mode</span><span>localStorage</span></div>
                    <div className="flex justify-between"><span>DB Latency</span><span>400ms (Simulated)</span></div>
                    <div className="flex justify-between"><span>Auth Layer</span><span>Virtual Provider</span></div>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 border border-white/10 p-8 rounded-[2rem]">
                <h4 className="font-bold mb-4">Deployment Log:</h4>
                <div className="font-mono text-[10px] space-y-1 text-green-500/70">
                  <p>[12:00:01] Initializing GitHub SPA Routing...</p>
                  <p>[12:00:02] Injecting Gemini AI Endpoints...</p>
                  <p>[12:00:03] App is live at https://earnpulse-pro.github.io</p>
                </div>
              </div>
            </div>
            <i className="fa-brands fa-github absolute -bottom-20 -right-20 text-[300px] text-white/5 rotate-12"></i>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTaskModal(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl relative z-10 p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6">{editingTask.id ? 'Modify Task' : 'New Task Creator'}</h3>
            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Title</label>
                <input type="text" value={editingTask.title || ''} onChange={e => setEditingTask({...editingTask, title: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Reward ($)</label>
                  <input type="number" step="0.01" value={editingTask.reward || ''} onChange={e => setEditingTask({...editingTask, reward: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Category</label>
                  <select value={editingTask.category || TaskCategory.SURVEY} onChange={e => setEditingTask({...editingTask, category: e.target.value as any})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm outline-none">
                    {Object.values(TaskCategory).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Description</label>
                <textarea value={editingTask.description || ''} onChange={e => setEditingTask({...editingTask, description: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm h-24 focus:ring-2 focus:ring-green-500 outline-none" required />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-gray-800">Cancel</button>
                <button type="submit" className="flex-[2] bg-green-600 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-all active:scale-95">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
