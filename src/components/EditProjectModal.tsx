import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '../types';
import { Edit2, X, MapPin, Phone, User, IndianRupee, Save } from 'lucide-react';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  initialFocusField?: 'quoted_amount' | 'name';
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
  initialFocusField = 'name',
}) => {
  const [name, setName] = useState(project.name);
  const [clientName, setClientName] = useState(project.client_name || '');
  const [clientPhone, setClientPhone] = useState(project.client_phone || '');
  const [location, setLocation] = useState(project.location || '');
  const [quotedAmount, setQuotedAmount] = useState(project.quoted_amount.toString());
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [notes, setNotes] = useState(project.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(project.name);
    setClientName(project.client_name || '');
    setClientPhone(project.client_phone || '');
    setLocation(project.location || '');
    setQuotedAmount(project.quoted_amount.toString());
    setStatus(project.status);
    setNotes(project.notes || '');
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !quotedAmount || Number(quotedAmount) < 0) return;

    setIsSubmitting(true);
    try {
      await onUpdateProject(project.id, {
        name: name.trim(),
        client_name: clientName.trim() || undefined,
        client_phone: clientPhone.trim() || undefined,
        location: location.trim() || undefined,
        quoted_amount: Number(quotedAmount),
        status,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Error updating project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-stone-100 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-yard-green/10 text-yard-green flex items-center justify-center">
              <Edit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">
                Edit Project & Quote Details
              </h3>
              <p className="text-[11px] text-stone-400">
                Update client info, site location, or quoted amount
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Project Name *
            </label>
            <input
              type="text"
              autoFocus={initialFocusField === 'name'}
              placeholder="e.g. Palm Grove Luxury Villa"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yard-green/50 text-sm font-semibold text-stone-800"
              required
            />
          </div>

          {/* Quoted Amount */}
          <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200/80">
            <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1 flex items-center gap-1">
              <IndianRupee className="w-4 h-4 text-yard-green" />
              Quoted Amount to Client (₹) *
            </label>
            <input
              type="number"
              autoFocus={initialFocusField === 'quoted_amount'}
              placeholder="e.g. 158940"
              value={quotedAmount}
              onChange={(e) => setQuotedAmount(e.target.value)}
              min="0"
              step="1"
              className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-yard-green/60 text-lg font-black text-emerald-900 shadow-xs"
              required
            />
            <p className="text-[11px] text-emerald-700 mt-1.5">
              Total project budget/quote agreed with client. Changing this will recalculate pending dues and profit margins.
            </p>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Project Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-yard-green/50"
            >
              <option value="Active">🟢 Active</option>
              <option value="Completed">✅ Completed</option>
              <option value="On Hold">⏸️ On Hold</option>
            </select>
          </div>

          {/* Client Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User className="w-3 h-3 text-stone-400" />
                Client Name
              </label>
              <input
                type="text"
                placeholder="e.g. Prasanna"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yard-green/50 text-sm font-medium text-stone-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Phone className="w-3 h-3 text-stone-400" />
                Client Phone
              </label>
              <input
                type="tel"
                placeholder="e.g. +91 93922 05050"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yard-green/50 text-sm font-medium text-stone-800"
              />
            </div>
          </div>

          {/* Site Location */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-stone-400" />
              Site Location
            </label>
            <input
              type="text"
              placeholder="e.g. BHANUGUDI, Kakinada district"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yard-green/50 text-sm font-medium text-stone-800"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Project Notes & Scope
            </label>
            <textarea
              rows={2}
              placeholder="Scope of work, special requests..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yard-green/50 text-sm text-stone-800 placeholder-stone-400 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 font-semibold text-sm hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !quotedAmount}
              className="flex-1 py-2.5 px-4 rounded-xl bg-yard-green hover:bg-yard-dark text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5 active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
