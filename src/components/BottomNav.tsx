import React from 'react';
import { Home, FolderKanban, Wallet } from 'lucide-react';

export type AppModule = 'home' | 'projects' | 'finance' | 'assessment' | 'maintenance' | 'procurement' | 'vendors';

interface BottomNavProps {
  activeModule: AppModule;
  onSelectModule: (module: AppModule) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeModule, onSelectModule }) => {
  const isHomeActive = activeModule === 'home' || activeModule === 'assessment' || activeModule === 'maintenance' || activeModule === 'procurement' || activeModule === 'vendors';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-lg px-4 py-2 flex items-center justify-around max-w-lg mx-auto sm:max-w-xl">
      <button
        onClick={() => onSelectModule('home')}
        className={`flex-1 py-1 flex flex-col items-center justify-center rounded-xl transition-all ${
          isHomeActive
            ? 'text-yard-green font-bold scale-100'
            : 'text-stone-400 hover:text-stone-700 font-medium'
        }`}
      >
        <div className={`p-1.5 rounded-xl ${
          isHomeActive
            ? 'bg-yard-mint text-yard-green' 
            : ''
        }`}>
          <Home className="w-5 h-5" />
        </div>
        <span className="text-[11px] mt-0.5">Home</span>
      </button>

      <button
        onClick={() => onSelectModule('projects')}
        className={`flex-1 py-1 flex flex-col items-center justify-center rounded-xl transition-all ${
          activeModule === 'projects'
            ? 'text-yard-green font-bold scale-100'
            : 'text-stone-400 hover:text-stone-700 font-medium'
        }`}
      >
        <div className={`p-1.5 rounded-xl ${activeModule === 'projects' ? 'bg-yard-mint text-yard-green' : ''}`}>
          <FolderKanban className="w-5 h-5" />
        </div>
        <span className="text-[11px] mt-0.5">Projects</span>
      </button>

      <button
        onClick={() => onSelectModule('finance')}
        className={`flex-1 py-1 flex flex-col items-center justify-center rounded-xl transition-all ${
          activeModule === 'finance'
            ? 'text-yard-green font-bold scale-100'
            : 'text-stone-400 hover:text-stone-700 font-medium'
        }`}
      >
        <div className={`p-1.5 rounded-xl ${activeModule === 'finance' ? 'bg-yard-mint text-yard-green' : ''}`}>
          <Wallet className="w-5 h-5" />
        </div>
        <span className="text-[11px] mt-0.5">Finance</span>
      </button>
    </nav>
  );
};
