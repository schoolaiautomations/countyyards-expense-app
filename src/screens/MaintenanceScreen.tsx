import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  CalendarClock, 
  Calendar, 
  MapPin, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Edit2, 
  FolderKanban,
  Check,
  RefreshCw
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { MaintenanceSchedule } from '../types';
import { MaintenanceModal } from '../components/MaintenanceModal';
import { LoadingScreen, SyncingBadge } from '../components/LoadingScreen';

interface MaintenanceScreenProps {
  onBack: () => void;
}

type FilterTab = 'upcoming' | 'today' | 'completed' | 'all';

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ onBack }) => {
  const { 
    maintenanceSchedules, 
    projects,
    loading,
    createMaintenanceSchedule, 
    updateMaintenanceSchedule, 
    deleteMaintenanceSchedule 
  } = useProjects();

  const [activeTab, setActiveTab] = useState<FilterTab>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MaintenanceSchedule | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Helper to calculate days diff
  const getDaysDiff = (dateStr: string) => {
    const target = new Date(dateStr + 'T00:00:00');
    const today = new Date(todayStr + 'T00:00:00');
    const diffTime = target.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  // Find the single next coming visit
  const nextVisit = useMemo(() => {
    const pending = maintenanceSchedules
      .filter(m => m.status !== 'Completed' && m.status !== 'Cancelled')
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));
    return pending.length > 0 ? pending[0] : null;
  }, [maintenanceSchedules]);

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return maintenanceSchedules.filter(item => {
      // Project filter
      if (selectedProjectId && item.project_id !== selectedProjectId) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          item.client_name.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          (item.location && item.location.toLowerCase().includes(q)) ||
          (item.assigned_to && item.assigned_to.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Tab filter
      const diff = getDaysDiff(item.scheduled_date);
      if (activeTab === 'upcoming') {
        return item.status !== 'Completed' && item.status !== 'Cancelled';
      } else if (activeTab === 'today') {
        return diff === 0;
      } else if (activeTab === 'completed') {
        return item.status === 'Completed';
      }
      return true; // 'all'
    });
  }, [maintenanceSchedules, selectedProjectId, searchQuery, activeTab]);

  // Handle Save
  const handleSave = async (data: Omit<MaintenanceSchedule, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingItem) {
      await updateMaintenanceSchedule(editingItem.id, data);
      setEditingItem(null);
    } else {
      await createMaintenanceSchedule(data);
    }
  };

  // Quick Toggle Complete
  const handleToggleComplete = async (item: MaintenanceSchedule) => {
    if (item.status === 'Completed') {
      await updateMaintenanceSchedule(item.id, { status: 'Scheduled' });
    } else {
      const confirmComplete = window.confirm(`Mark "${item.title}" for ${item.client_name} as Completed?`);
      if (confirmComplete) {
        await updateMaintenanceSchedule(item.id, { status: 'Completed' });

        // If recurring, prompt to schedule next occurrence
        if (item.recurrence && item.recurrence !== 'Once') {
          const nextDate = new Date(item.scheduled_date + 'T00:00:00');
          if (item.recurrence === 'Weekly') nextDate.setDate(nextDate.getDate() + 7);
          else if (item.recurrence === 'Bi-Weekly') nextDate.setDate(nextDate.getDate() + 14);
          else if (item.recurrence === 'Monthly') nextDate.setMonth(nextDate.getMonth() + 1);
          else if (item.recurrence === 'Quarterly') nextDate.setMonth(nextDate.getMonth() + 3);

          const nextDateStr = nextDate.toISOString().split('T')[0];
          const scheduleNext = window.confirm(`This is a ${item.recurrence} service. Would you like to schedule the next visit for ${nextDateStr}?`);
          if (scheduleNext) {
            await createMaintenanceSchedule({
              project_id: item.project_id,
              client_name: item.client_name,
              location: item.location,
              title: item.title,
              type: item.type,
              scheduled_date: nextDateStr,
              scheduled_time: item.scheduled_time,
              assigned_to: item.assigned_to,
              status: 'Scheduled',
              recurrence: item.recurrence,
              notes: item.notes,
              completion_notes: '',
            });
          }
        }
      }
    }
  };

  // Handle Delete
  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Delete "${title}" from schedule?`)) {
      await deleteMaintenanceSchedule(id);
    }
  };

  return (
    <div className="px-4 py-3 max-w-lg mx-auto flex flex-col justify-start animate-in fade-in pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="p-1 rounded-full text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-stone-800 tracking-tight leading-tight">
              Inspection / Maintenance
            </h2>
            <p className="text-[11px] text-stone-500 font-normal">
              Calendar & upcoming project services
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule</span>
        </button>
      </div>

      {/* Syncing indicator */}
      {loading && maintenanceSchedules.length > 0 && <SyncingBadge />}

      {/* "Coming Next" Highlight Box */}
      {nextVisit && (
        <div className="mb-3 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 rounded-xl p-3 border border-purple-200 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wide flex items-center gap-1">
              <CalendarClock className="w-3 h-3" /> Coming Next
            </span>
            {(() => {
              const diff = getDaysDiff(nextVisit.scheduled_date);
              if (diff < 0) {
                return (
                  <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <AlertTriangle className="w-2.5 h-2.5" /> Overdue by {Math.abs(diff)}d
                  </span>
                );
              } else if (diff === 0) {
                return (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full">
                    🔔 Today
                  </span>
                );
              } else if (diff === 1) {
                return (
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                    📅 Tomorrow
                  </span>
                );
              }
              return (
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  🗓️ In {diff} days
                </span>
              );
            })()}
          </div>

          <h3 className="text-sm font-bold text-stone-800 leading-tight truncate">
            {nextVisit.title}
          </h3>
          <p className="text-xs text-stone-600 truncate mt-0.5">
            Client: <span className="font-semibold">{nextVisit.client_name}</span> {nextVisit.location ? `• ${nextVisit.location}` : ''}
          </p>

          <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-2 pt-2 border-t border-purple-200/60">
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="w-3 h-3 text-purple-600" />
              {nextVisit.scheduled_date} {nextVisit.scheduled_time && `at ${nextVisit.scheduled_time}`}
            </span>
            {nextVisit.assigned_to && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-stone-400" />
                {nextVisit.assigned_to}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex bg-stone-200/70 p-0.5 rounded-xl mb-3 text-xs">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all text-center ${
            activeTab === 'upcoming'
              ? 'bg-white text-purple-700 font-bold shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Upcoming ({maintenanceSchedules.filter(m => m.status !== 'Completed').length})
        </button>
        <button
          onClick={() => setActiveTab('today')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all text-center ${
            activeTab === 'today'
              ? 'bg-white text-purple-700 font-bold shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Today ({maintenanceSchedules.filter(m => getDaysDiff(m.scheduled_date) === 0).length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all text-center ${
            activeTab === 'completed'
              ? 'bg-white text-purple-700 font-bold shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Completed ({maintenanceSchedules.filter(m => m.status === 'Completed').length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all text-center ${
            activeTab === 'all'
              ? 'bg-white text-purple-700 font-bold shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          All ({maintenanceSchedules.length})
        </button>
      </div>

      {/* Search & Project Filter Bar */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search visits..."
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-purple-500 shadow-xs"
          />
        </div>

        <div className="relative">
          <FolderKanban className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-purple-500 shadow-xs"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading state when initial cache is empty */}
      {loading && maintenanceSchedules.length === 0 ? (
        <LoadingScreen 
          message="Loading Maintenance Calendar..." 
          submessage="Retrieving scheduled visits and inspections..." 
        />
      ) : filteredSchedules.length === 0 ? (
        /* Empty State only when NOT loading */
        <div className="bg-white rounded-xl p-8 text-center border border-stone-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-800">No Visits Scheduled</h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
              {activeTab === 'upcoming' 
                ? 'No upcoming maintenance or inspections scheduled.'
                : 'No records found matching this filter.'}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule First Visit</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredSchedules.map((item) => {
            const diff = getDaysDiff(item.scheduled_date);
            const isDone = item.status === 'Completed';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl p-3 shadow-xs border transition-all flex flex-col gap-2 ${
                  isDone 
                    ? 'border-emerald-200 bg-emerald-50/20' 
                    : diff < 0 
                    ? 'border-red-200 hover:border-red-400' 
                    : diff === 0
                    ? 'border-amber-300 hover:border-amber-500 ring-1 ring-amber-200/50'
                    : 'border-stone-200/80 hover:border-purple-300'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.type === 'Maintenance' 
                          ? 'bg-purple-100 text-purple-800' 
                          : item.type === 'Inspection'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {item.type}
                      </span>

                      {item.recurrence && item.recurrence !== 'Once' && (
                        <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <RefreshCw className="w-2.5 h-2.5" /> {item.recurrence}
                        </span>
                      )}
                    </div>

                    <h3 className={`text-sm font-semibold text-stone-800 mt-1 truncate ${isDone ? 'line-through text-stone-500' : ''}`}>
                      {item.title}
                    </h3>
                  </div>

                  {/* Urgency Badge */}
                  <div className="text-right flex-shrink-0">
                    {isDone ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    ) : diff < 0 ? (
                      <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> Overdue
                      </span>
                    ) : diff === 0 ? (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full">
                        Today
                      </span>
                    ) : diff === 1 ? (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                        Tomorrow
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        In {diff}d
                      </span>
                    )}
                  </div>
                </div>

                {/* Client & Date Info */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-500">
                  <span className="font-medium text-stone-700 truncate">
                    {item.client_name}
                  </span>
                  {item.location && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-stone-400 flex-shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-stone-400 flex-shrink-0" />
                    <span>{item.scheduled_date}</span>
                    {item.scheduled_time && <span className="text-stone-400">({item.scheduled_time})</span>}
                  </span>
                  {item.assigned_to && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-stone-400 flex-shrink-0" />
                      <span>{item.assigned_to}</span>
                    </span>
                  )}
                </div>

                {/* Notes if any */}
                {item.notes && (
                  <p className="text-[11px] text-stone-600 bg-stone-50 rounded p-1.5 border border-stone-100 line-clamp-2">
                    {item.notes}
                  </p>
                )}

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-1.5 border-t border-stone-100">
                  <button
                    onClick={() => handleToggleComplete(item)}
                    className={`text-[11px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1 transition-colors ${
                      isDone
                        ? 'text-stone-500 bg-stone-100 hover:bg-stone-200'
                        : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>{isDone ? 'Mark Pending' : 'Mark Done'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsModalOpen(true);
                      }}
                      className="p-1 rounded text-stone-400 hover:text-purple-700 hover:bg-stone-100 transition-colors"
                      title="Edit Schedule"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-1 rounded text-stone-400 hover:text-red-500 hover:bg-stone-100 transition-colors"
                      title="Delete Schedule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <MaintenanceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
        initialData={editingItem}
      />
    </div>
  );
};
