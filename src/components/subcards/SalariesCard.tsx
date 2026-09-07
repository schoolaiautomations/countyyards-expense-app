import React, { useState } from 'react';
import { Salary } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Plus, Trash2, UserCheck, X } from 'lucide-react';

interface SalariesCardProps {
  projectId: string;
  salaries: Salary[];
  onAddSalary: (salary: Omit<Salary, 'id' | 'created_at'>) => Promise<void>;
  onDeleteSalary: (id: string) => Promise<void>;
}

export const SalariesCard: React.FC<SalariesCardProps> = ({
  projectId,
  salaries,
  onAddSalary,
  onDeleteSalary,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSalaries = salaries.reduce((sum, s) => sum + Number(s.amount || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || !amount || Number(amount) <= 0) return;

    setIsSubmitting(true);
    try {
      await onAddSalary({
        project_id: projectId,
        person_name: personName.trim(),
        amount: Number(amount),
        date: date || new Date().toISOString().split('T')[0],
        notes: notes.trim() || undefined,
      });
      setPersonName('');
      setAmount('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-3 shadow-xs border border-stone-200/80 mb-3 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2.5">
        <div className="flex items-center space-x-1.5">
          <h3 className="text-xs font-semibold text-stone-800">
            Salaries
          </h3>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 font-medium">
            {salaries.length}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-stone-400 mr-1">Total:</span>
          <span className="text-xs font-bold text-indigo-900">
            {formatCurrency(totalSalaries)}
          </span>
        </div>
      </div>

      {/* Add Salary Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full py-1.5 px-3 mb-2.5 rounded-lg border border-dashed border-indigo-300 bg-indigo-50/30 hover:bg-indigo-50 text-indigo-800 font-medium text-xs flex items-center justify-center space-x-1 active:scale-[0.99] transition-all"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Salary</span>
      </button>

      {/* Salaries List */}
      {salaries.length === 0 ? (
        <div className="text-center py-4 bg-stone-50 rounded-lg text-xs text-stone-400">
          No salary records yet
        </div>
      ) : (
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-0.5">
          {salaries.map(salary => (
            <div
              key={salary.id}
              className="p-2.5 rounded-lg bg-stone-50 hover:bg-stone-100/60 border border-stone-200/60 flex flex-col gap-1 transition-all"
            >
              {/* Row 1: Name + Date on Left, Amount on Right */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 flex-shrink-0">
                    <UserCheck className="w-2.5 h-2.5" />
                  </div>
                  <h4 className="text-xs font-semibold text-stone-800 truncate">
                    {salary.person_name}
                  </h4>
                  <span className="text-[10px] text-stone-400 flex-shrink-0">
                    • {formatDate(salary.date)}
                  </span>
                </div>

                <span className="text-xs font-bold text-indigo-900 flex-shrink-0 ml-2">
                  {formatCurrency(salary.amount)}
                </span>
              </div>

              {/* Row 2: Note on Left, Delete on Right */}
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <p className="text-stone-500 truncate flex-1 pr-2 font-normal">
                  {salary.notes || <span className="text-stone-300 italic">No notes</span>}
                </p>

                <button
                  onClick={() => onDeleteSalary(salary.id)}
                  title="Delete"
                  className="p-1 text-stone-400 hover:text-rose-600 rounded flex-shrink-0 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Salary Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl p-4 shadow-xl border border-stone-100 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-3">
              <h3 className="text-sm font-semibold text-stone-900">
                Record Salary Payout
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Person Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-stone-300 text-xs font-semibold text-stone-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Salary (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    step="1"
                    className="w-full px-2.5 py-2 rounded-lg border border-stone-300 text-sm font-semibold text-stone-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-stone-300 text-xs font-medium text-stone-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Role / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Supervisor / 10 days work"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-stone-300 text-xs text-stone-800"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !amount || !personName}
                  className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Salary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
