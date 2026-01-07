
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { User, Task, Transaction, TaskCategory } from '../types';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tasks' | 'logs' | 'settings' | 'deployment'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, u, t, l] = await Promise.all([
        api.admin.getStats(),
        api.admin.getUsers(),
        api.tasks.getAll(),
        api.admin.getTransactions()
      ]);
      setStats(s);
      setUsers(u);
      setTasks(t);
      setLogs(l);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleAdjustBalance = async (userId: string, current: number) => {
    const val = prompt(`Adjust balance for ${userId}:`, current.toString());
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
        if (confirm("CRITICAL: This will replace ALL data. Continue?")) {
          api.admin.importDB(content);
        }
      };
      reader.readAsText(file);
    };
    input.click();
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

  if (loading && !stats) return (
    <div className="p-20 text-center">
      <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Accessing Secure Records...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Admin Intelligence Suite</h2>
          </div>
          <p className="text-gray-400 text-sm">Managing {stats?.totalUsers} users and {stats?.activeTasks} active tasks.</p>
        </div>
        
        <div className="flex gap-2 relative z-10">
          <button onClick={handleExport} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
            <i className="fa-solid fa-file-export"></i> Backup
          </button>
          <button onClick={handleImport} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
            <i className="fa-solid fa-file-import"></i> Restore
          </button>
          <button onClick={fetchData} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-green-900/40">
            <i className="fa-solid fa-rotate"></i> Sync
          </button>
        </div>
        <i className="fa-solid fa-terminal absolute -bottom-10 -right-10 text-[200px] text-white/5 pointer-events-none"></i>
      </div>

      {/* Internal Navigation */}
      <div className="flex gap-1 bg-white p-1 rounded-2xl border border-gray-200 overflow-x-auto no-scrollbar shadow-sm">
        {[
          { id: 'overview', label: 'Overview', icon: 'fa-chart-line' },
          { id: 'users', label: 'Users', icon: 'fa-users' },
          { id: 'tasks', label: 'Tasks', icon: 'fa-list-check' },
          { id: 'logs', label: 'Ledger', icon: 'fa-database' },
          { id: 'settings', label: 'Config', icon: 'fa-sliders' },
          { id: 'deployment', label: 'Dev', icon: 'fa-code' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-gray-900 text-white shadow-lg' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            <i className={`fa-solid ${tab.icon} text-xs`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Users</p>
                <p className="text-3xl font-black text-gray-900">{stats?.totalUsers}</p>
                <div className="mt-2 text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full inline-block">Live Data</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Global Debt</p>
                <p className="text-3xl font-black text-red-600">${stats?.totalBalance.toFixed(2)}</p>
                <div className="mt-2 text-[10px] text-gray-400 font-medium">Owed to users</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Payouts</p>
                <p className="text-3xl font-black text-gray-900">${stats?.totalPayouts.toFixed(2)}</p>
                <div className="mt-2 text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full inline-block">Processed</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Task Density</p>
                <p className="text-3xl font-black text-gray-900">{stats?.activeTasks}</p>
                <div className="mt-2 text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-full inline-block">Available</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-chart-area text-blue-500"></i>
                  Platform Activity (Simulated)
                </h3>
                <div className="h-48 flex items-end gap-2 border-b border-gray-100 pb-2">
                  {[40, 70, 45, 90, 65, 80, 55, 95, 30, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-blue-500/10 hover:bg-blue-500 transition-all rounded-t-lg group relative" style={{ height: `${h}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {h} Users
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>Last 10 Hours</span>
                  <span>Now</span>
                </div>
              </div>

              <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-6">System Health</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Virtual DB Engine</span>
                    <span className="text-green-600 font-bold">OPTIMAL</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Gemini AI Bridge</span>
                    <span className="text-green-600 font-bold">CONNECTED</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Session Guard</span>
                    <span className="text-blue-600 font-bold">ACTIVE</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-[10px] text-gray-400 leading-relaxed italic">
                      "Backend" is currently running on localized browser storage. For production, sync to an external JSON store.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input 
                  type="text" 
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase">{filteredUsers.length} Users Found</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User Profile</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Wallet</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Activity</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                            {u.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{u.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-black text-green-600 text-sm">${u.balance.toFixed(2)}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Total: ${u.totalEarned.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-700">{u.completedTasks} Tasks</p>
                        <p className="text-[10px] text-orange-600 font-bold uppercase">{u.streak} Day Streak</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleAdjustBalance(u.id, u.balance)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Override Balance"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Task Management</h3>
              <button 
                onClick={() => { setEditingTask({}); setShowTaskModal(true); }}
                className="bg-gray-900 text-white px-5 py-2.5 rounded-2xl text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-plus"></i> Create Task
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map(t => (
                <div key={t.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center">
                        <i className={`fa-solid ${t.icon}`}></i>
                      </div>
                      <span className="text-green-600 font-black text-lg">${t.reward.toFixed(2)}</span>
                    </div>
                    <h4 className="font-bold text-gray-800 text-sm mb-1">{t.title}</h4>
                    <p className="text-[10px] text-gray-400 mb-4 line-clamp-2">{t.description}</p>
                    <div className="flex gap-2">
                      <span className="text-[8px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase">{t.category}</span>
                      <span className="text-[8px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase">{t.difficulty}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6 pt-4 border-t border-gray-50">
                    <button onClick={() => { setEditingTask(t); setShowTaskModal(true); }} className="flex-1 text-[10px] font-bold text-blue-600 bg-blue-50 py-2 rounded-lg hover:bg-blue-100 transition-colors">Edit</button>
                    <button onClick={() => handleDeleteTask(t.id)} className="flex-1 text-[10px] font-bold text-red-600 bg-red-50 py-2 rounded-lg hover:bg-red-100 transition-colors">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <i className="fa-solid fa-list-ul text-green-500"></i>
                Platform-Wide Transaction Ledger
              </h3>
              <span className="text-[10px] font-mono opacity-60">ADMIN_OVERRIDE_ACTIVE</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timestamp</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Entity</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-[10px] text-gray-500 font-mono">{log.date}</td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-full">{log.userId}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">{log.description}</td>
                      <td className={`px-6 py-4 text-right text-xs font-black ${log.type === 'Earning' ? 'text-green-600' : 'text-red-600'}`}>
                        {log.type === 'Earning' ? '+' : '-'}${log.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-20 text-center text-gray-400 font-medium text-sm">No activity records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-8 flex items-center gap-2">
                <i className="fa-solid fa-lock text-gray-400"></i>
                Access Controls
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-sm">Maintenance Mode</p>
                    <p className="text-[10px] text-gray-400">Lock users out of the application.</p>
                  </div>
                  <button 
                    onClick={() => api.admin.updateSettings({ maintenanceMode: !stats?.settings?.maintenanceMode }).then(fetchData)}
                    className={`w-12 h-6 rounded-full transition-all relative ${stats?.settings?.maintenanceMode ? 'bg-orange-500' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${stats?.settings?.maintenanceMode ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-sm">Payout System</p>
                    <p className="text-[10px] text-gray-400">Toggle withdrawal functionality globally.</p>
                  </div>
                  <button 
                    onClick={() => api.admin.updateSettings({ payoutsEnabled: !stats?.settings?.payoutsEnabled }).then(fetchData)}
                    className={`w-12 h-6 rounded-full transition-all relative ${stats?.settings?.payoutsEnabled ? 'bg-green-500' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${stats?.settings?.payoutsEnabled ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-8 flex items-center gap-2">
                <i className="fa-solid fa-bullhorn text-gray-400"></i>
                Global Broadcast
              </h3>
              <div className="space-y-4">
                <textarea 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 min-h-[120px]"
                  placeholder="Broadcast message to all users..."
                  defaultValue={stats?.settings?.announcement}
                  onBlur={(e) => api.admin.updateSettings({ announcement: e.target.value }).then(fetchData)}
                ></textarea>
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <i className="fa-solid fa-info-circle"></i>
                  <span>Message updates automatically on blur.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'deployment' && (
          <div className="bg-gray-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10 max-w-2xl">
                <h3 className="text-3xl font-black mb-4 tracking-tighter">Developer Ops</h3>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Platform is currenty served via <strong>GitHub Pages</strong>. Administrative actions are persisted in the browser's <code>localStorage</code>. For multi-admin support, implement an external database bridge.
                </p>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 font-mono text-[10px] text-green-400/80 mb-8">
                  <p className="">> NODE_ENV: production</p>
                  <p className="">> STORAGE_ENGINE: local_indexed_db</p>
                  <p className="">> AI_MODEL: gemini-3-flash-preview</p>
                  <p className="">> STATUS: ONLINE</p>
                </div>
                <button className="bg-green-600 hover:bg-green-500 px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-green-900/40">
                  Initialize Cloud Sync
                </button>
             </div>
             <i className="fa-solid fa-code absolute -bottom-20 -right-20 text-[300px] text-white/5 rotate-12"></i>
          </div>
        )}
      </div>

      {/* Task Modal - Refined for Admin */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={() => setShowTaskModal(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 p-10 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-gray-900 mb-8">{editingTask.id ? 'Modify Entity' : 'New Task Definition'}</h3>
            <form onSubmit={handleSaveTask} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1">Unique Title</label>
                  <input type="text" value={editingTask.title || ''} onChange={e => setEditingTask({...editingTask, title: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 outline-none" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1">Reward (USD)</label>
                  <input type="number" step="0.01" value={editingTask.reward || ''} onChange={e => setEditingTask({...editingTask, reward: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 outline-none" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1">Category</label>
                  <select value={editingTask.category || TaskCategory.SURVEY} onChange={e => setEditingTask({...editingTask, category: e.target.value as any})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm outline-none">
                    {Object.values(TaskCategory).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1">Detailed Description</label>
                <textarea value={editingTask.description || ''} onChange={e => setEditingTask({...editingTask, description: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm h-24 focus:ring-2 focus:ring-gray-900 outline-none" required />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 py-4 text-sm font-bold text-gray-500 hover:text-gray-900">Discard</button>
                <button type="submit" className="flex-[2] bg-gray-900 text-white py-4 rounded-2xl text-sm font-black shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-95">Commit Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
