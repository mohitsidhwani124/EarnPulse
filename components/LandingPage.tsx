
import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-white selection:bg-green-100 selection:text-green-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-200">
              <i className="fa-solid fa-bolt"></i>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">EarnPulse</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-500 hover:text-green-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-500 hover:text-green-600 transition-colors">How it Works</a>
            <button 
              onClick={onGetStarted}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all active:scale-95"
            >
              Sign In
            </button>
          </div>
          <button onClick={onGetStarted} className="md:hidden text-green-600 font-bold text-sm">Sign In</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold text-green-700 uppercase tracking-widest">Join 50,000+ Active Earners</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Turn Your Free Time <br className="hidden md:block" />
            <span className="text-green-600">Into Real Rewards</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-500 mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 leading-relaxed">
            The world's most intuitive earning platform. Complete micro-tasks, share feedback, and get paid instantly via PayPal or Gift Cards. Powered by AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-green-600 text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-xl shadow-green-100 hover:bg-green-700 hover:shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              Start Earning Now
              <i className="fa-solid fa-arrow-right"></i>
            </button>
            <button className="w-full sm:w-auto px-10 py-5 rounded-2xl text-lg font-bold text-gray-600 hover:bg-gray-50 transition-all">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-gray-100 bg-gray-50/30">
        <div className="max-w-7xl mx-auto px-6 overflow-hidden">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Trusted by global partners</p>
          <div className="flex flex-wrap justify-center gap-12 grayscale opacity-40">
            <div className="flex items-center gap-2 text-2xl font-bold"><i className="fa-brands fa-google"></i> Google</div>
            <div className="flex items-center gap-2 text-2xl font-bold"><i className="fa-brands fa-amazon"></i> Amazon</div>
            <div className="flex items-center gap-2 text-2xl font-bold"><i className="fa-brands fa-paypal"></i> PayPal</div>
            <div className="flex items-center gap-2 text-2xl font-bold"><i className="fa-brands fa-apple"></i> Apple</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why choose EarnPulse?</h2>
            <div className="w-16 h-1 bg-green-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Instant Payouts', icon: 'fa-bolt', desc: 'No more waiting weeks for your money. Get paid in under 24 hours.' },
              { title: 'AI Assistant', icon: 'fa-brain', desc: 'Gemini AI analyzes your profile to suggest the highest-paying tasks.' },
              { title: 'Zero Fees', icon: 'fa-check-circle', desc: 'Transparent earning with no hidden costs or withdrawal hurdles.' },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:shadow-xl transition-all group">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                  <i className={`fa-solid ${feature.icon}`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-20 px-6 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm">
                <i className="fa-solid fa-bolt"></i>
              </div>
              <span className="text-xl font-bold">EarnPulse</span>
            </div>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              Empowering individuals worldwide to achieve financial freedom through simple, meaningful digital work.
            </p>
          </div>
          <div className="flex gap-8 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
          <div className="flex gap-4">
            <button className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-white hover:text-black transition-all">
              <i className="fa-brands fa-twitter"></i>
            </button>
            <button className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-white hover:text-black transition-all">
              <i className="fa-brands fa-github"></i>
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-gray-800 text-center text-xs text-gray-500">
          &copy; 2025 EarnPulse Pro. All rights reserved. Built with Gemini 2.0.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
