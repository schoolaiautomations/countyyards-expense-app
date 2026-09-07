import React from 'react';
import { 
  FolderKanban, 
  Wallet, 
  Images, 
  ChevronRight 
} from 'lucide-react';

interface DashboardScreenProps {
  onSelectModule: (module: 'projects' | 'finance' | 'gallery') => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onSelectModule }) => {
  return (
    <div className="px-4 py-3 max-w-lg mx-auto flex flex-col justify-start animate-in fade-in">
      {/* Title */}
      <div className="mb-3">
        <h2 className="text-base font-bold text-stone-800 tracking-tight">
          Trackers & Modules
        </h2>
        <p className="text-[11px] text-stone-500 font-normal">
          Select a card to view details
        </p>
      </div>

      {/* The 3 Clean Lightweight Cards */}
      <div className="space-y-2.5">
        {/* CARD 1: Projects Tracker */}
        <div
          onClick={() => onSelectModule('projects')}
          className="bg-white rounded-xl p-3 shadow-xs hover:shadow-soft border border-stone-200/80 hover:border-yard-green active:scale-[0.99] cursor-pointer transition-all flex items-center justify-between gap-3"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-yard-green text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-yard-green uppercase tracking-wide block leading-tight">
                Card 1
              </span>
              <h3 className="text-sm font-semibold text-stone-800 truncate">
                Project Tracker
              </h3>
              <p className="text-[11px] text-stone-500 truncate font-normal">
                Quotes, expenses, salaries & balance
              </p>
            </div>
          </div>

          <div className="w-7 h-7 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 flex-shrink-0">
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* CARD 2: Finance Tracker */}
        <div
          onClick={() => onSelectModule('finance')}
          className="bg-white rounded-xl p-3 shadow-xs hover:shadow-soft border border-stone-200/80 hover:border-emerald-600 active:scale-[0.99] cursor-pointer transition-all flex items-center justify-between gap-3"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide block leading-tight">
                Card 2
              </span>
              <h3 className="text-sm font-semibold text-stone-800 truncate">
                Finance Tracker
              </h3>
              <p className="text-[11px] text-stone-500 truncate font-normal">
                Company balance after all deductions
              </p>
            </div>
          </div>

          <div className="w-7 h-7 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 flex-shrink-0">
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* CARD 3: Project Gallery */}
        <div
          onClick={() => onSelectModule('gallery')}
          className="bg-white rounded-xl p-3 shadow-xs hover:shadow-soft border border-stone-200/80 hover:border-teal-600 active:scale-[0.99] cursor-pointer transition-all flex items-center justify-between gap-3"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-teal-700 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Images className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-wide block leading-tight">
                Card 3
              </span>
              <h3 className="text-sm font-semibold text-stone-800 truncate">
                Project Gallery
              </h3>
              <p className="text-[11px] text-stone-500 truncate font-normal">
                Site photos (before/after) & documents
              </p>
            </div>
          </div>

          <div className="w-7 h-7 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 flex-shrink-0">
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
