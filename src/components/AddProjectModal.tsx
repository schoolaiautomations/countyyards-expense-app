import React, { useState } from 'react';
import { Project } from '../types';
import { Plus, X, FolderPlus, MapPin, Phone, User, IndianRupee } from 'lucide-react';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<Project>;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [location, setLocation] = useState('');
  const [quotedAmount, setQuotedAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !quotedAmount || Number(quotedAmount) < 0) return;

    setIsSubmitting(true);
    try {
      await onCreateProject({
        name: name.trim(),
        client_name: clientName.trim() || undefined,
        client_phone: clientPhone.trim() || undefined,
        location: location.trim() || undefined,
        quoted_amount: Number(quotedAmount),
        status: 'Active',
        notes: notes.trim() || undefined,
      });

      // Reset
      setName('');
      setClientName('');
      setClientPhone('');
      setLocation('');
      setQuotedAmount('');
      setNotes('');
      onClose();
    } catch (err) {
      console.error(err);
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
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">
                Create New Landscaping Project
              </h3>
              <p className="text-[11px] text-stone-400">
                Country Yards Projects Tracker
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100"
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
              placeholder="e.g. Palm Grove Luxury Villa"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yard-green/50 text-sm font-semibold text-stone-800"
              required
            />
          </div>

          {/* Quoted Amount */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-yard-green" />
              Quoted Amount to Client (₹) *
            </label>
            <input
              type="number"
              placeholder="e.g. 750000"
              value={quotedAmount}
              onChange={(e) => setQuotedAmount(e.target.value)}
              min="0"
              step="1"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yard-green/50 text-base font-extrabold text-stone-900"
              required
            />
            <p className="text-[11px] text-stone-500 mt-1">
              The total contract or estimated quote agreed with the client.
            </p>
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
                placeholder="e.g. Mr. Rajesh Singhal"
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
                placeholder="e.g. +91 98765 00000"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yard-green/50 text-sm font-medium text-stone-800"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-stone-400" />
              Site Location
            </label>
            <input
              type="text"
              placeholder="e.g. Whitefield, Bengaluru"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yard-green/50 text-sm font-medium text-stone-800"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Project Scope & Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Natural lawn, rock garden, automatic sprinklers, 40 Areca palms..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yard-green/50 text-sm text-stone-800 placeholder-stone-400 resize-none"
            />
          </div>

          <div className="flex space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 font-semibold text-sm hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !quotedAmount}
              className="flex-1 py-2.5 px-4 rounded-xl bg-yard-green hover:bg-yard-dark text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating...' : 'Create Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
