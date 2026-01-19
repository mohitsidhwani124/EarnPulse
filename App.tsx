
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Earn from './components/Earn';
import Payouts from './components/Payouts';
import Assistant from './components/Assistant';
import AdminPanel from './components/AdminPanel';
import LandingPage from './components/LandingPage';
import { AuthPages } from './components/AuthPages';
import { api } from './services/api';
import { User, ViewState, Task, TaskCategory } from './types';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [view, setView] = useState<ViewState>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  // AdMob Rewarded Logic
  const [isShowingAd, setIsShowingAd] = useState(false);
  const [adTimer, setAdTimer] = useState(15);
  const [adReady, setAdReady] = useState(false);
  const [adRewardContext, setAdRewardContext] = useState<{taskId?: string, reward: number} | null>(null);
  const adTimerRef = useRef<number | null>(null);

  // Video Task Logic
  const [videoTimer, setVideoTimer] = useState(0);
  const timerRef = useRef<number | null>(null);

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

  useEffect(() => {
    if (activeTask) {
      // Specialized handling for AdMob Video Tasks
      if (activeTask.category === TaskCategory.VIDEO && activeTask.videoUrl === 'admob') {
        const reward = activeTask.reward;
        const taskId = activeTask.id;
        setActiveTask(null); // Close modal
        startAdMobSimulation(reward, taskId);
        return;
      }

      if (activeTask.category === TaskCategory.VIDEO && activeTask.requiredWatchTime) {
        setVideoTimer(activeTask.requiredWatchTime);
        timerRef.current = window.setInterval(() => {
          setVideoTimer(prev => {
            if (prev <= 1) {
              if (timerRef.current) clearInterval(timerRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeTask]);

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
      if (activeTask.category === TaskCategory.VIDEO && videoTimer > 0) return;
      setIsActionLoading(true);
      try {
        const result = await api.tasks.complete(activeTask.id);
        setUser(result.user);
        setActiveTask(null);
        setView('dashboard');
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  const startAdMobSimulation = (reward: number = 0.05, taskId?: string) => {
    setAdRewardContext({ taskId, reward });
    setIsShowingAd(true);
    setAdTimer(15);
    setAdReady(false);
    
    // Simulate loading
    setTimeout(() => {
      setAdReady(true);
      adTimerRef.current = window.setInterval(() => {
        setAdTimer(p => {
          if (p <= 1) {
            if (adTimerRef.current) clearInterval(adTimerRef.current);
            return 0;
          }
          return p - 1;
        });
      }, 1000);
    }, 1500);
  };

  const completeAdMobSimulation = async () => {
    if (adTimer > 0) return;
    setIsActionLoading(true);
    try {
      const rewardAmount = adRewardContext?.reward || 0.05;
      const taskId = adRewardContext?.taskId;
      
      let result;
      if (taskId) {
        // If it was a specific task from inventory
        result = await api.tasks.complete(taskId);
      } else {
        // If it was the generic bonus ad
        result = await api.tasks.completeAd(rewardAmount);
      }
      
      setUser(result.user);
      setIsShowingAd(false);
      setAdRewardContext(null);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-xl shadow-green-100"></div>
          <p className="text-gray-500 font-medium tracking-tight">Syncing Master Node...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    if (showAuth) {
      return (
        <>
          <AuthPages onLogin={handleLogin} />
          <button onClick={() => setShowAuth(false)} className="fixed top-8 left-8 text-gray-400 hover:text-gray-600 font-bold flex items-center gap-2 z-50 transition-colors">
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
        return <Dashboard user={user} onNavigateToEarn={() => setView('earn')} onWatchAd={() => startAdMobSimulation()} />;
      case 'earn':
        return <Earn onCompleteTask={setActiveTask} />;
      case 'payouts':
        return <Payouts balance={user.balance} />;
      case 'admin':
        return <AdminPanel />;
      case 'profile':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-sm text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center text-7xl text-gray-300 overflow-hidden border-8 border-white shadow-2xl">
                   <i className="fa-solid fa-user"></i>
                </div>
                <div className="flex-1">
                   <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">{user.name}</h2>
                   <p className="text-gray-400 text-sm font-mono mb-6">{user.id}</p>
                   <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <span className="bg-yellow-50 text-yellow-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-yellow-100">PRO Verified</span>
                      {user.role === 'admin' && <span className="bg-gray-900 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Master Admin</span>}
                   </div>
                </div>
                <button onClick={handleLogout} className="px-10 py-5 bg-red-50 text-red-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-100 active:scale-95 transition-all">Sign Out</button>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard user={user} onNavigateToEarn={() => setView('earn')} onWatchAd={() => startAdMobSimulation()} />;
    }
  };

  return (
    <Layout activeView={view} onViewChange={setView} balance={user?.balance || 0} onLogout={handleLogout} userRole={user?.role}>
      {renderView()}
      <Assistant />

      {/* AdMob Rewarded Ad Simulation */}
      {isShowingAd && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black">
           <div className="absolute top-8 right-8 z-30">
              <button 
                onClick={completeAdMobSimulation} 
                disabled={adTimer > 0}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg transition-all ${
                  adTimer > 0 ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-white text-black hover:scale-110 active:scale-90'
                }`}
              >
                {adTimer > 0 ? adTimer : <i className="fa-solid fa-xmark"></i>}
              </button>
           </div>
           
           {!adReady ? (
             <div className="text-center text-white">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Requesting AdMob Unit...</p>
             </div>
           ) : (
             <div className="w-full h-full relative group">
                <video 
                  autoPlay 
                  className="w-full h-full object-contain"
                  src="https://www.w3schools.com/html/mov_bbb.mp4" 
                ></video>
                <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between pointer-events-none">
                   <div className="bg-black/50 backdrop-blur-md p-6 rounded-3xl border border-white/10 max-w-sm">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"><i className="fa-brands fa-google"></i></div>
                         <h4 className="text-white font-black text-lg uppercase tracking-tighter">Google AdMob</h4>
                      </div>
                      <p className="text-white/60 text-xs leading-relaxed">Watch the full video to earn your reward bonus. Do not close the window.</p>
                   </div>
                   <div className="text-white/40 text-[10px] font-black uppercase tracking-widest">Sponsored Content</div>
                </div>
             </div>
           )}
        </div>
      )}

      {activeTask && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setActiveTask(null)}></div>
          <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-12">
              <div className="flex items-center gap-6 mb-12">
                <div className="bg-green-100 text-green-600 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner">
                  <i className={`fa-solid ${activeTask.icon}`}></i>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gray-900 tracking-tight">{activeTask.title}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="bg-green-50 text-green-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Reward: ${activeTask.reward.toFixed(2)}</span>
                    <span className="text-gray-400 text-xs font-black uppercase tracking-widest">{activeTask.estimatedTime}</span>
                  </div>
                </div>
              </div>

              {activeTask.category === TaskCategory.VIDEO && activeTask.videoUrl && activeTask.videoUrl !== 'admob' ? (
                <div className="space-y-8 mb-12">
                  <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <iframe src={`${activeTask.videoUrl}?autoplay=1`} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen></iframe>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                       <span className="text-gray-400">Security Verification</span>
                       <span className={videoTimer > 0 ? 'text-orange-500' : 'text-green-500'}>
                         {videoTimer > 0 ? `${videoTimer}s Remaining` : 'Confirmed'}
                       </span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${Math.max(0, 100 - (videoTimer / (activeTask.requiredWatchTime || 1) * 100))}%` }}></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-[2.5rem] p-10 mb-12 border border-gray-100">
                  <p className="text-gray-600 leading-relaxed font-medium">{activeTask.description}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={() => setActiveTask(null)} className="flex-1 py-5 rounded-2xl font-black text-[10px] uppercase text-gray-400 hover:text-gray-600 transition-all">Cancel</button>
                <button 
                  onClick={finalizeTask} 
                  disabled={isActionLoading || (activeTask.category === TaskCategory.VIDEO && videoTimer > 0)}
                  className={`flex-[2] text-white py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
                    (activeTask.category === TaskCategory.VIDEO && videoTimer > 0) ? 'bg-gray-200 shadow-none cursor-not-allowed text-gray-400' : 'bg-gray-900 shadow-gray-200 hover:bg-black'
                  }`}
                >
                  {videoTimer > 0 ? `Verify in ${videoTimer}s` : 'Collect Reward'}
                  {videoTimer === 0 && <i className="fa-solid fa-circle-check"></i>}
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
