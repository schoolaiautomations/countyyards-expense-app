import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { ProjectStatus } from '../types';
import { formatCurrency } from '../utils/formatters';
import { 
  ArrowLeft,
  Plus, 
  Search, 
  FolderKanban, 
  MapPin, 
  User, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight, 
  CheckCircle, 
  Clock
} from 'lucide-react';
import { AddProjectModal } from '../components/AddProjectModal';
import { LoadingScreen, SyncingBadge } from '../components/LoadingScreen';

interface ProjectsTrackerScreenProps {
  onBack?: () => void;
}

export const ProjectsTrackerScreen: React.FC<ProjectsTrackerScreenProps> = ({ onBack }) => {
  const { 
    projects, 
    loading,
    setSelectedProject, 
    createProject, 
    getProjectFinancials,
  } = useProjects();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ProjectStatus>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.client_name && p.client_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="pb-24 pt-3 px-4 max-w-lg mx-auto sm:max-w-xl animate-in fade-in">
      {/* Top Back Navigation Bar */}
      {onBack && (
        <div className="flex items-center justify-between py-1 mb-2">
          <button
            onClick={onBack}
            className="flex items-center space-x-1 text-xs font-bold text-yard-green hover:text-yard-dark bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-xl transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400">
            Card 2 • Projects
          </span>
        </div>
      )}

      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-3 mt-1">
        <div>
          <h2 className="text-base font-bold text-stone-800 tracking-tight flex items-center gap-1.5">
            <FolderKanban className="w-4 h-4 text-yard-green" />
            Projects Tracker
          </h2>
          <p className="text-[11px] text-stone-500 font-normal">
            Select a project to view subcards & finances
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-yard-green hover:bg-yard-dark text-white text-xs font-semibold shadow-xs active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Syncing indicator if refreshing data with existing items */}
      {loading && projects.length > 0 && <SyncingBadge />}

      {/* Search Bar */}
      <div className="relative mb-3">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search by project name, client, or site location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-yard-green/50 text-xs font-medium text-stone-800 shadow-xs"
        />
      </div>

      {/* Status Filter Pills */}
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
        {(['All', 'Active', 'Completed', 'On Hold'] as const).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === status
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
            }`}
          >
            {status} {status === 'All' ? `(${projects.length})` : `(${projects.filter(p => p.status === status).length})`}
          </button>
        ))}
      </div>

      {/* If currently loading from fresh start without cached data */}
      {loading && projects.length === 0 ? (
        <LoadingScreen 
          message="Loading Projects..." 
          submessage="Connecting to cloud and retrieving your projects..." 
        />
      ) : filteredProjects.length === 0 ? (
        /* Empty state only when NOT loading */
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-stone-300 p-6">
          <FolderKanban className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-stone-700">No projects found</h3>
          <p className="text-xs text-stone-400 mt-1 mb-4">
            {searchQuery ? 'Try adjusting your search query.' : 'Create your first landscaping project to start tracking expenses, salaries, and balance.'}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-yard-green text-white text-xs font-bold shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredProjects.map(project => {
            const financials = getProjectFinancials(project.id);
            const isProfit = financials.profit_remained >= 0;

            return (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="group bg-white rounded-2xl p-4 shadow-soft border border-stone-200 hover:border-yard-green/60 active:scale-[0.99] cursor-pointer transition-all hover:shadow-card relative overflow-hidden"
              >
                {/* Left accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  project.status === 'Completed' ? 'bg-emerald-500' : 'bg-yard-green'
                }`} />

                {/* Card Header: Title & Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-2 pl-1">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-stone-900 group-hover:text-yard-green transition-colors truncate">
                      {project.name}
                    </h3>
                    <div className="flex items-center space-x-3 text-[11px] text-stone-500 mt-0.5">
                      {project.client_name && (
                        <span className="flex items-center truncate">
                          <User className="w-3 h-3 mr-1 text-stone-400 flex-shrink-0" />
                          <span className="truncate">{project.client_name}</span>
                        </span>
                      )}
                      {project.location && (
                        <span className="flex items-center truncate">
                          <MapPin className="w-3 h-3 mr-1 text-stone-400 flex-shrink-0" />
                          <span className="truncate">{project.location}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center space-x-1 flex-shrink-0 ${
                    project.status === 'Completed' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : project.status === 'Active' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-stone-100 text-stone-700'
                  }`}>
                    {project.status === 'Completed' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    <span>{project.status}</span>
                  </span>
                </div>

                {/* Sub-metrics Row */}
                <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-center pl-1">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Quote</span>
                    <span className="text-xs font-bold text-stone-800">
                      {formatCurrency(financials.quoted_amount)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Received</span>
                    <span className="text-xs font-bold text-emerald-700">
                      {formatCurrency(financials.total_client_payments)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Deductions</span>
                    <span className="text-xs font-bold text-amber-800">
                      {formatCurrency(financials.total_deductions)}
                    </span>
                  </div>
                </div>

                {/* Card Footer: Remaining Balance & Open Arrow */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-100 pl-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] font-semibold text-stone-500">
                      Balance Amount:
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                      isProfit 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {isProfit ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                      <span>{formatCurrency(financials.profit_remained)}</span>
                    </span>
                  </div>

                  <div className="flex items-center text-xs font-bold text-yard-green group-hover:translate-x-0.5 transition-transform">
                    <span>View Subcards</span>
                    <ChevronRight className="w-4 h-4 ml-0.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreateProject={createProject}
      />
    </div>
  );
};
