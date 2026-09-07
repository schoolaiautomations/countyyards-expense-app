import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(userId, password);
      if (!res.success) {
        setError(res.error || 'Authentication failed');
      }
      setIsLoading(false);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yard-dark via-yard-green to-stone-950 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Company Logo from /public/cy_logo.jpg */}
        <div className="flex justify-center mb-3">
          <div className="w-24 h-24 rounded-3xl p-1 bg-white/20 backdrop-blur-md shadow-2xl border border-white/30 flex items-center justify-center overflow-hidden">
            <img
              src="/cy_logo.jpg"
              alt="Country Yards Logo"
              className="w-full h-full object-cover rounded-[20px]"
              onError={(e) => {
                // Fallback if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Country Yards
        </h1>
        <p className="text-xs text-emerald-200/90 font-semibold tracking-wider uppercase mt-1">
          Landscaping Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-8 shadow-2xl rounded-3xl border border-white/20">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-stone-900">Sign in to Account</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Enter your credentials to continue
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                User ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter your User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yard-green/50 text-sm font-semibold text-stone-800 bg-stone-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Enter your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yard-green/50 text-sm font-semibold text-stone-800 bg-stone-50/50"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="w-4 h-4 rounded text-yard-green focus:ring-yard-green/50 border-stone-300 accent-yard-green cursor-pointer"
                />
                <span className="text-xs text-stone-600 font-medium">Keep me signed in</span>
              </label>
              <span className="text-[11px] text-stone-400 font-medium">Safe on this device</span>
            </div>

            <button
              type="submit"
              disabled={isLoading || !userId || !password}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-yard-green hover:bg-yard-dark text-white font-bold text-sm shadow-md active:scale-98 transition-all disabled:opacity-50 mt-3"
            >
              <span>{isLoading ? 'Signing In...' : 'Login'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-emerald-100/60 font-medium">
          Country Yards • Authorized Access Only
        </p>
      </div>
    </div>
  );
};
