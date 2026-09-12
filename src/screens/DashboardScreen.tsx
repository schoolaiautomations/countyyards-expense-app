import React from 'react';
import { 
  FolderKanban, 
  Wallet, 
  ClipboardCheck,
  CalendarClock
} from 'lucide-react';

interface DashboardScreenProps {
  onSelectModule: (module: 'projects' | 'finance' | 'assessment' | 'maintenance') => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onSelectModule }) => {
  return (
    <div className="px-4 py-3 max-w-lg mx-auto flex flex-col justify-start animate-in fade-in pb-20">
      {/* Title */}
      <div className="mb-3">
        <h2 className="text-base font-bold text-stone-800 tracking-tight">
          Trackers & Modules
        </h2>
        <p className="text-[11px] text-stone-500 font-normal">
          Select a card to view details
        </p>
      </div>

      {/* 2x2 Square Grid Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* CARD 1: Client Site Assessment */}
        <div
          onClick={() => onSelectModule('assessment')}
          className="bg-white rounded-xl p-3.5 shadow-xs hover:shadow-soft border border-stone-200/80 hover:border-amber-600 active:scale-[0.98] cursor-pointer transition-all flex flex-col items-center justify-center text-center aspect-square"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs mb-2.5">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-semibold text-amber-700 uppercase tracking-wide block leading-tight mb-0.5">
            Card 1
          </span>
          <h3 className="text-[13px] font-bold text-stone-800 leading-tight">
            Client Site Assessment
          </h3>
          <p className="text-[10px] text-stone-500 font-normal mt-0.5 leading-snug">
            Soil/water tests, sunlight & total sq.ft
          </p>
        </div>

        {/* CARD 2: Project Tracker */}
        <div
          onClick={() => onSelectModule('projects')}
          className="bg-white rounded-xl p-3.5 shadow-xs hover:shadow-soft border border-stone-200/80 hover:border-yard-green active:scale-[0.98] cursor-pointer transition-all flex flex-col items-center justify-center text-center aspect-square"
        >
          <div className="w-12 h-12 rounded-xl bg-yard-green text-white flex items-center justify-center flex-shrink-0 shadow-xs mb-2.5">
            <FolderKanban className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-semibold text-yard-green uppercase tracking-wide block leading-tight mb-0.5">
            Card 2
          </span>
          <h3 className="text-[13px] font-bold text-stone-800 leading-tight">
            Project Tracker
          </h3>
          <p className="text-[10px] text-stone-500 font-normal mt-0.5 leading-snug">
            Quotes, expenses, salaries & balance
          </p>
        </div>

        {/* CARD 3: Finance Tracker */}
        <div
          onClick={() => onSelectModule('finance')}
          className="bg-white rounded-xl p-3.5 shadow-xs hover:shadow-soft border border-stone-200/80 hover:border-emerald-600 active:scale-[0.98] cursor-pointer transition-all flex flex-col items-center justify-center text-center aspect-square"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 shadow-xs mb-2.5">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-semibold text-emerald-700 uppercase tracking-wide block leading-tight mb-0.5">
            Card 3
          </span>
          <h3 className="text-[13px] font-bold text-stone-800 leading-tight">
            Finance Tracker
          </h3>
          <p className="text-[10px] text-stone-500 font-normal mt-0.5 leading-snug">
            Company balance after all deductions
          </p>
        </div>

        {/* CARD 4: Inspection / Maintenance */}
        <div
          onClick={() => onSelectModule('maintenance')}
          className="bg-white rounded-xl p-3.5 shadow-xs hover:shadow-soft border border-stone-200/80 hover:border-purple-600 active:scale-[0.98] cursor-pointer transition-all flex flex-col items-center justify-center text-center aspect-square"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs mb-2.5">
            <CalendarClock className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-semibold text-purple-700 uppercase tracking-wide block leading-tight mb-0.5">
            Card 4
          </span>
          <h3 className="text-[13px] font-bold text-stone-800 leading-tight">
            Inspection / Maintenance
          </h3>
          <p className="text-[10px] text-stone-500 font-normal mt-0.5 leading-snug">
            Calendar & schedule for upcoming visits
          </p>
        </div>
      </div>
    </div>
  );
};
