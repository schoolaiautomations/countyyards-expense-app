import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { LogOut, RefreshCw } from 'lucide-react';

export const Header: React.FC = () => {
  const { logout, user } = useAuth();
  const { refreshData, loading } = useProjects();

  return (
    <header className="sticky top-0 z-30 bg-yard-green text-white shadow-md border-b border-yard-dark/40 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-2.5">
        <div className="w-10 h-10 rounded-xl bg-white/20 p-0.5 shadow-inner border border-white/20 overflow-hidden flex items-center justify-center">
          <img
            src="/cy_logo.jpg"
            alt="CY"
            className="w-full h-full object-cover rounded-[10px]"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight leading-none text-white">
            Country Yards
          </h1>
          <p className="text-[9px] text-emerald-200/90 font-medium tracking-wider uppercase mt-0.5">
            Landscaping & Finance
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1.5">
        <button
          onClick={() => refreshData()}
          disabled={loading}
          title="Refresh Data"
          className="p-2 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>

        <button
          onClick={logout}
          title={`Logout (${user?.username})`}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-100 border border-red-400/20 text-xs font-semibold active:scale-95 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
