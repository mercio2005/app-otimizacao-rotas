'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, Navigation, Sparkles } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const handleLogin = () => {
    if (keepLoggedIn) {
      localStorage.setItem('keepLoggedIn', 'true');
    }
    router.push('/routes');
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        {/* Logo/Header */}
        <div className="text-center mb-8 animate-slideInLeft">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <Navigation className="w-20 h-20 text-emerald-400 drop-shadow-2xl" />
              <Sparkles className="w-6 h-6 text-cyan-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-3 animate-gradient">
            Menu Principal
          </h1>
          <p className="text-slate-400 text-lg">
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-effect rounded-3xl shadow-2xl p-8 border border-slate-700/50 backdrop-blur-xl animate-scaleIn">
          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-lg font-bold rounded-2xl hover:from-emerald-600 hover:to-cyan-700 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/50 flex items-center justify-center gap-3 mb-4 hover:scale-105 transform btn-primary"
          >
            <LogIn className="w-6 h-6" />
            Login
          </button>

          {/* Keep Logged In Checkbox */}
          <div className="flex items-center gap-3 mb-6 group">
            <input
              type="checkbox"
              id="keepLoggedIn"
              checked={keepLoggedIn}
              onChange={(e) => setKeepLoggedIn(e.target.checked)}
              className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer transition-all duration-300"
            />
            <label htmlFor="keepLoggedIn" className="text-slate-300 cursor-pointer select-none group-hover:text-emerald-400 transition-colors duration-300">
              Keep me logged in
            </label>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 glass-effect text-slate-400 rounded-full">ou</span>
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            onClick={handleSignUp}
            className="w-full px-6 py-4 bg-slate-700/50 backdrop-blur-sm text-white text-lg font-bold rounded-2xl hover:bg-slate-600/50 transition-all duration-300 shadow-lg flex items-center justify-center gap-3 border border-slate-600/50 hover:border-emerald-500/50 hover:scale-105 transform"
          >
            <UserPlus className="w-6 h-6" />
            Sign Up
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 animate-fadeIn">
          <p className="text-slate-500 text-sm">
            Otimize suas entregas e coletas de forma inteligente
          </p>
        </div>
      </div>
    </div>
  );
}
