import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading data...', 
  submessage = 'Connecting to Country Yards cloud...' 
}) => {
  return (
    <div className="py-16 px-4 flex flex-col items-center justify-center text-center animate-in fade-in">
      <div className="w-12 h-12 rounded-2xl bg-yard-green/10 flex items-center justify-center text-yard-green mb-3 border border-yard-green/20">
        <Loader2 className="w-6 h-6 animate-spin text-yard-green" />
      </div>
      <h3 className="text-sm font-bold text-stone-800 tracking-tight">
        {message}
      </h3>
      <p className="text-xs text-stone-400 mt-1 max-w-xs">
        {submessage}
      </p>

      {/* Skeleton pulsing placeholders */}
      <div className="w-full max-w-md mt-6 space-y-3 opacity-60">
        <div className="h-20 bg-stone-200/70 rounded-xl animate-pulse" />
        <div className="h-20 bg-stone-200/70 rounded-xl animate-pulse delay-75" />
      </div>
    </div>
  );
};

export const SyncingBadge: React.FC = () => {
  return (
    <div className="flex items-center justify-center gap-1.5 py-1 px-2.5 bg-yard-mint/50 border border-yard-accent/40 rounded-full text-[10px] font-semibold text-yard-green mx-auto mb-2 w-fit animate-pulse">
      <Loader2 className="w-3 h-3 animate-spin" />
      <span>Syncing cloud data...</span>
    </div>
  );
};
