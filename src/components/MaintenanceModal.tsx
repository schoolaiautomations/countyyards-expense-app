import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, MapPin, Wrench, RefreshCw, FolderKanban } from 'lucide-react';
import { MaintenanceSchedule, MaintenanceType, MaintenanceStatus, MaintenanceRecurrence } from '../types';
import { useProjects } from '../context/ProjectContext';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<MaintenanceSchedule, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initialData?: MaintenanceSchedule | null;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { projects } = useProjects();

  const [projectId, setProjectId] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [location, setLocation] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MaintenanceType>('Maintenance');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('10:00 AM');
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState<MaintenanceStatus>('Scheduled');
  const [recurrence, setRecurrence] = useState<MaintenanceRecurrence>('Once');
  const [notes, setNotes] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setProjectId(initialData.project_id || '');
      setClientName(initialData.client_name || '');
      setLocation(initialData.location || '');
      setTitle(initialData.title || '');
      setType(initialData.type || 'Maintenance');
      setScheduledDate(initialData.scheduled_date || new Date().toISOString().split('T')[0]);
      setScheduledTime(initialData.scheduled_time || '10:00 AM');
      setAssignedTo(initialData.assigned_to || '');
      setStatus(initialData.status || 'Scheduled');
      setRecurrence(initialData.recurrence || 'Once');
      setNotes(initialData.notes || '');
      setCompletionNotes(initialData.completion_notes || '');
    } else {
      setProjectId('');
      setClientName('');
      setLocation('');
      setTitle('');
      setType('Maintenance');
      setScheduledDate(new Date().toISOString().split('T')[0]);
      setScheduledTime('10:00 AM');
      setAssignedTo('');
      setStatus('Scheduled');
      setRecurrence('Once');
      setNotes('');
      setCompletionNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // When project is selected, autofill client & location
  const handleSelectProject = (pId: string) => {
    setProjectId(pId);
    if (pId) {
      const selected = projects.find(p => p.id === pId);
      if (selected) {
        setClientName(selected.client_name || selected.name);
        setLocation(selected.location || '');
        if (!title) {
          setTitle(`${selected.name} - Routine Maintenance`);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSave({
        project_id: projectId || undefined,
        client_name: clientName.trim(),
        location: location.trim(),
        title: title.trim(),
        type,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime.trim(),
        assigned_to: assignedTo.trim(),
        status,
        recurrence,
        notes: notes.trim(),
        completion_notes: completionNotes.trim(),
      });
      onClose();
    } catch (err) {
      console.error('Error saving maintenance schedule:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = "w-full text-xs border border-stone-300 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500";
  const labelCls = "text-[11px] font-medium text-stone-600 mb-0.5 block";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
          <div className="flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-stone-800">
              {initialData ? 'Edit Schedule / Visit' : 'Schedule New Visit'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-stone-100">
            <X className="w-4 h-4 text-stone-500" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {/* Link Project */}
          <div>
            <label className={labelCls}>Link to Project (Optional)</label>
            <div className="relative">
              <FolderKanban className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <select
                value={projectId}
                onChange={(e) => handleSelectProject(e.target.value)}
                className={`${inputCls} pl-8`}
              >
                <option value="">-- Standalone Client / None --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.client_name || 'Client'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Client Name & Location */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Client Name *</label>
              <input
                className={inputCls}
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client name"
                required
              />
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <div className="relative">
                <MapPin className="w-3 h-3 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  className={`${inputCls} pl-7`}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Address / area"
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className={labelCls}>Visit Title / Task *</label>
            <input
              className={inputCls}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lawn Mowing & Pest Treatment, Drip System Inspection"
              required
            />
          </div>

          {/* Type & Status */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Visit Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MaintenanceType)}
                className={inputCls}
              >
                <option value="Maintenance">🛠️ Maintenance</option>
                <option value="Inspection">🔍 Inspection</option>
                <option value="Follow-up">📞 Follow-up</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
                className={inputCls}
              >
                <option value="Scheduled">⏳ Scheduled</option>
                <option value="In Progress">🔄 In Progress</option>
                <option value="Completed">✅ Completed</option>
                <option value="Overdue">⚠️ Overdue</option>
                <option value="Cancelled">❌ Cancelled</option>
              </select>
            </div>
          </div>

          {/* Scheduled Date & Time */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Scheduled Date *</label>
              <div className="relative">
                <Calendar className="w-3 h-3 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  className={`${inputCls} pl-7`}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Preferred Time</label>
              <div className="relative">
                <Clock className="w-3 h-3 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  className={`${inputCls} pl-7`}
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  placeholder="e.g. 10:00 AM"
                />
              </div>
            </div>
          </div>

          {/* Recurrence & Assigned To */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Repeat / Frequency</label>
              <div className="relative">
                <RefreshCw className="w-3 h-3 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as MaintenanceRecurrence)}
                  className={`${inputCls} pl-7`}
                >
                  <option value="Once">One-time visit</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Bi-Weekly">Every 2 Weeks</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Assigned Technician / Supervisor</label>
              <div className="relative">
                <User className="w-3 h-3 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  className={`${inputCls} pl-7`}
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="e.g. Ramesh / Supervisor"
                />
              </div>
            </div>
          </div>

          {/* Instructions / Notes */}
          <div>
            <label className={labelCls}>Work Instructions / Notes</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Test drip nozzles, apply neem oil spray on rose bushes..."
            />
          </div>

          {/* Completion Notes (if editing or completed) */}
          {(status === 'Completed' || initialData) && (
            <div>
              <label className={labelCls}>Completion Notes / Observations</label>
              <textarea
                className={`${inputCls} resize-none bg-emerald-50/50 border-emerald-300`}
                rows={2}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="What was done during this visit?"
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-xs font-medium text-stone-600 py-2 rounded-lg border border-stone-300 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !clientName.trim()}
              className="flex-1 text-xs font-semibold text-white py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Schedule' : 'Schedule Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
