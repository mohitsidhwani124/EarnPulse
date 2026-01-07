
import React from 'react';
import { ViewState, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewState;
  onViewChange: (view: ViewState) => void;
  balance: number;
  onLogout: () => void;
  userRole?: 'user' | 'admin';
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, balance, onLogout, userRole }) => {
  const navItems = [
    { id: 'dashboard', icon: 'fa-house', label: 'Dashboard' },
    { id: 'earn', icon: 'fa-hand-holding-dollar', label: 'Earn' },
    { id: 'payouts', icon: 'fa-wallet', label: 'Payouts' },
    { id: 'profile', icon: 'fa-user', label: 'Profile' },
  ];

  if (userRole === 'admin') {
    navItems.push({ id: 'admin', icon: 'fa-shield-halved', label: 'Admin Panel' });
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-green-600 flex items-center gap-2">
            <i className="fa-solid fa-bolt"></i> EarnPulse
          </h1>
          {userRole === 'admin' && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Admin Access</span>}
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewState)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeView === item.id 
                  ? 'bg-green-50 text-green-600 font-semibold' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <i className={`fa-solid ${item.icon}`}></i>
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="p-4 space-y-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium"
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            Logout
          </button>
          
          <div className="bg-green-600 rounded-2xl p-4 text-white">
            <p className="text-xs opacity-80 uppercase font-bold tracking-wider mb-1">Your Balance</p>
            <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 overflow-y-auto pb-24 md:pb-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex justify-between items-center md:hidden">
          <h1 className="text-xl font-bold text-green-600">EarnPulse</h1>
          <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
            <span className="text-green-700 font-bold text-sm">${balance.toFixed(2)}</span>
          </div>
        </header>
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-2 md:hidden z-40">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as ViewState)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
              activeView === item.id ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            <i className={`fa-solid ${item.icon} text-lg`}></i>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
