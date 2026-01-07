
import React, { useState } from 'react';

interface AuthPagesProps {
  onLogin: (email: string, name: string) => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth logic
    onLogin(email, isLogin ? 'Alex Johnson' : name);
  };

  const handleSocialLogin = (provider: string) => {
    // Simulate social auth
    onLogin(`${provider.toLowerCase()}@example.com`, `Social User (${provider})`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-2xl mb-4 text-3xl">
              <i className="fa-solid fa-bolt"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">EarnPulse</h1>
            <p className="text-gray-500 mt-2">
              {isLogin ? 'Welcome back! Start earning.' : 'Create an account to begin.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <button
              onClick={() => handleSocialLogin('Google')}
              className="flex items-center justify-center py-3 px-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all group"
              title="Sign in with Google"
            >
              <i className="fa-brands fa-google text-red-500 text-lg group-hover:scale-110 transition-transform"></i>
            </button>
            <button
              onClick={() => handleSocialLogin('Apple')}
              className="flex items-center justify-center py-3 px-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all group"
              title="Sign in with Apple"
            >
              <i className="fa-brands fa-apple text-gray-900 text-xl group-hover:scale-110 transition-transform"></i>
            </button>
            <button
              onClick={() => handleSocialLogin('Facebook')}
              className="flex items-center justify-center py-3 px-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all group"
              title="Sign in with Facebook"
            >
              <i className="fa-brands fa-facebook text-blue-600 text-lg group-hover:scale-110 transition-transform"></i>
            </button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-400 font-bold tracking-wider">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Full Name</label>
                <div className="relative">
                  <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Email Address</label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Password</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-xs font-bold text-green-600 hover:text-green-700">Forgot Password?</button>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-all transform active:scale-95 mt-4"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold text-green-600 hover:text-green-700"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
