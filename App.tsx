
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Earn from './components/Earn';
import Payouts from './components/Payouts';
import Assistant from './components/Assistant';
import AdminPanel from './components/AdminPanel';
import LandingPage from './components/LandingPage';
import { AuthPages } from './components/AuthPages';
import { api } from './services/api';
import { User, ViewState, Task } from './types';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [view, setView] = useState<ViewState>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    const init = async () => {
      const sessionUser = await api.auth.checkSession();
      if (sessionUser) {
        setUser(sessionUser);
        setIsLoggedIn(true);
      }
      setIsInitialLoading(false);
    };
    init();
  }, []);

  const handleLogin = async (email: string, name: string) => {
    setIsActionLoading(true);
    try {
      const loggedUser = await api.auth.login(email);
      setUser(loggedUser);
      setIsLoggedIn(true);
      setShowAuth(false);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsActionLoading(true);
    await api.auth.logout();
    setIsLoggedIn(false);
    setUser(null);
    setView('dashboard');
    setIsActionLoading(false);
  };

  const finalizeTask = async () => {
    if (activeTask && user) {
      setIsActionLoading(true);
      try {
        const result = await api.tasks.complete(activeTask.id);
        setUser(result.user);
        setActiveTask(null);
        setView('dashboard');
        // Smooth alert or notification would be better, but keeping standard for now
      } catch (e) {
        alert("Failed to process task. Please try again.");
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-xl shadow-green-100"></div>
          <p className="text-gray-500 font-medium tracking-tight">Syncing Secure Sessions...</p>
        </div>
      </div>
    );
  }

  // If not logged in and not specifically looking at Auth pages, show Landing Page
  if (!isLoggedIn) {
    if (showAuth) {
      return (
        <>
          <AuthPages onLogin={handleLogin} />
          <button 
            onClick={() => setShowAuth(false)}
            className="fixed top-8 left-8 text-gray-400 hover:text-gray-600 font-bold flex items-center gap-2 z-50 transition-colors"
          >
            <i className="fa-solid fa-arrow-left"></i> Back to Home
          </button>
        </>
      );
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  const renderView = () => {
    if (!user) return null;
    switch (view) {
      case 'dashboard':
        return <Dashboard user={user} onNavigateToEarn={() => setView('earn')} />;
      case 'earn':
        return <Earn onCompleteTask={setActiveTask} />;
      case 'payouts':
        return <Payouts balance={user.balance} />;
      case 'admin':
        return <AdminPanel />;
      case 'profile':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                <div className="relative group">
                  <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center text-5xl text-gray-400 overflow-hidden border-4 border-white shadow-xl">
                    <i className="fa-solid fa-user group-hover:scale-110 transition-transform"></i>
                  </div>
                  <button className="absolute bottom-1 right-1 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <i className="fa-solid fa-camera text-[10px]"></i>
                  </button>
                </div>
                <div className="text-center md:text-left flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{user.name}</h2>
                  <p className="text-gray-400 text-sm mt-1">{user.id}</p>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mt-4">
                    <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Pro Member</span>
                    {user.role === 'admin' && <span className="bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Administrator</span>}
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full md:w-auto px-8 bg-red-50 text-red-500 py-4 rounded-2xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  Sign Out
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border border-gray-50 rounded-3xl bg-gray-50/50">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-4">Security Status</p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white rounded-2xl">
                      <div className="flex items-center gap-3">
                        <i className="fa-solid fa-envelope text-blue-500"></i>
                        <span className="text-sm font-semibold text-gray-700">Email Verified</span>
                      </div>
                      <i className="fa-solid fa-circle-check text-green-500"></i>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-2xl">
                      <div className="flex items-center gap-3">
                        <i className="fa-solid fa-phone text-orange-500"></i>
                        <span className="text-sm font-semibold text-gray-700">Phone Verified</span>
                      </div>
                      <i className="fa-solid fa-circle-check text-green-500"></i>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border border-gray-50 rounded-3xl bg-gray-50/50 flex flex-col justify-center text-center">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-2">Member Since</p>
                  <p className="text-xl font-bold text-gray-800">January 2025</p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button className="text-sm font-bold text-green-600 hover:underline">Update Preferences</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard user={user} onNavigateToEarn={() => setView('earn')} />;
    }
  };

  return (
    <Layout 
      activeView={view} 
      onViewChange={setView} 
      balance={user?.balance || 0} 
      onLogout={handleLogout}
      userRole={user?.role}
    >
      {renderView()}
      <Assistant />

      {isActionLoading && (
        <div className="fixed inset-0 z-[100] bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
           <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {activeTask && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setActiveTask(null)}></div>
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-green-100 text-green-600 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                  <i className={`fa-solid ${activeTask.icon}`}></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{activeTask.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Reward: ${activeTask.reward.toFixed(2)}</span>
                    <span className="text-gray-400 text-xs">•</span>
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter">{activeTask.estimatedTime}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-3xl p-8 mb-8 border border-gray-100">
                <p className="text-gray-600 leading-relaxed mb-6">{activeTask.description}</p>
                <div className="py-10 border-t border-dashed border-gray-200 text-center">
                   <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm mb-2">
                     <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                     <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Secure Session</span>
                   </div>
                   <p className="text-[10px] text-gray-400 font-medium">Verified by EarnPulse Guard Protocol</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveTask(null)} 
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={finalizeTask} 
                  disabled={isActionLoading}
                  className="flex-[2] bg-green-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-green-100 hover:bg-green-700 hover:shadow-green-200 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
                >
                  Confirm Completion
                  <i className="fa-solid fa-circle-check"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
