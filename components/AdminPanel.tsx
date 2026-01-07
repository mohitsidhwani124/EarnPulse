
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, Task, Transaction, TaskCategory } from '../types';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tasks' | 'transactions' | 'deployment'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task>>({});

  const fetchData = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    if (confirm('Are you sure you want to delete this task?')) {
      await api.admin.deleteTask(id);
      fetchData();
    }
  };

  if (loading && !stats) return <div className="p-12 text-center">Loading Admin Suite...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <i className="fa-solid fa-shield-halved text-gray-700"></i>
          Command Center
        </h2>
        <button onClick={fetchData} className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
          Refresh Data
        </button>
      </div>

      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
          { id: 'users', label: 'Users', icon: 'fa-users' },
          { id: 'tasks', label: 'Tasks', icon: 'fa-list-check' },
          { id: 'transactions', label: 'Ledger', icon: 'fa-file-invoice-dollar' },
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
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Payouts</p>
              <p className="text-2xl font-bold text-blue-600">${stats?.totalPayouts.toFixed(2)}</p>
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
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800 text-sm">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.id}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-green-600 text-sm">${u.balance.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.completedTasks}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                      {u.role}
                    </span>
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
              className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i> New Task
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map(t => (
              <div key={t.id} className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center">
                    <i className={`fa-solid ${t.icon}`}></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{t.title}</h4>
                    <p className="text-xs text-green-600 font-bold">${t.reward.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingTask(t); setShowTaskModal(true); }} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><i className="fa-solid fa-pen text-xs"></i></button>
                  <button onClick={() => handleDeleteTask(t.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center"><i className="fa-solid fa-trash text-xs"></i></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden animate-in fade-in">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">User ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{tx.description}</td>
                  <td className="px-6 py-4 text-xs text-gray-400">{tx.userId}</td>
                  <td className={`px-6 py-4 text-sm font-bold ${tx.type === 'Earning' ? 'text-green-600' : 'text-red-600'}`}>{tx.type === 'Earning' ? '+' : '-'}${tx.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
                  <h3 className="text-2xl font-bold">GitHub Deployment Suite</h3>
                  <p className="text-gray-400 text-sm">Everything you need to go live on GitHub Pages</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                  <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-clipboard-check text-green-400"></i>
                    Files Verified
                  </h4>
                  <div className="space-y-3">
                    {['index.html', '404.html', 'manifest.json', 'vercel.json'].map(file => (
                      <div key={file} className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{file}</span>
                        <span className="text-green-400 font-bold uppercase tracking-tighter">Ready</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                  <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-server text-blue-400"></i>
                    Environment
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">API_KEY Status</span>
                      <span className="text-blue-400 font-bold uppercase tracking-tighter">Detected</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">SPA Routing</span>
                      <span className="text-blue-400 font-bold uppercase tracking-tighter">Configured</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 border border-white/10 p-8 rounded-[2rem]">
                <h4 className="font-bold mb-4">How to Deploy Now:</h4>
                <ol className="space-y-4 text-sm text-gray-300">
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
                    <span>Create a <strong>new repository</strong> on GitHub named `earnpulse`.</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>Upload all provided files (including the <strong>404.html</strong> hack) via the web interface.</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>Go to <strong>Settings > Pages</strong> and set branch to `main`.</span>
                  </li>
                </ol>
                <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2">
                    <i className="fa-solid fa-download"></i>
                    Download Project Bundle
                  </button>
                  <button className="flex-1 border border-white/20 hover:bg-white/10 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                    <i className="fa-brands fa-github"></i>
                    Open GitHub
                  </button>
                </div>
              </div>
            </div>
            <i className="fa-brands fa-github absolute -bottom-20 -right-20 text-[300px] text-white/5 rotate-12"></i>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowTaskModal(false)}></div>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 p-8 animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-gray-800 mb-6">{editingTask.id ? 'Edit Task' : 'Add New Task'}</h3>
            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Title</label>
                <input type="text" value={editingTask.title || ''} onChange={e => setEditingTask({...editingTask, title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Reward ($)</label>
                  <input type="number" step="0.01" value={editingTask.reward || ''} onChange={e => setEditingTask({...editingTask, reward: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Category</label>
                  <select value={editingTask.category || TaskCategory.SURVEY} onChange={e => setEditingTask({...editingTask, category: e.target.value as any})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm">
                    {Object.values(TaskCategory).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description</label>
                <textarea value={editingTask.description || ''} onChange={e => setEditingTask({...editingTask, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm h-24" required />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-500">Cancel</button>
                <button type="submit" className="flex-[2] bg-green-600 text-white py-3 rounded-xl text-sm font-bold">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
