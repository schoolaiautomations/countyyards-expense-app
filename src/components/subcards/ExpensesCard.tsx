import React, { useState } from 'react';
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { 
  Plus, 
  Trash2, 
  Tag, 
  Sparkles, 
  Truck, 
  Fuel, 
  Utensils, 
  Hotel, 
  HardHat, 
  Palette, 
  Layers, 
  Package, 
  X
} from 'lucide-react';

interface ExpensesCardProps {
  projectId: string;
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id' | 'created_at'>) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
}

const getCategoryIcon = (category: ExpenseCategory) => {
  switch (category) {
    case 'Soil': return <Layers className="w-3 h-3 text-amber-800" />;
    case 'Plants': return <Sparkles className="w-3 h-3 text-emerald-700" />;
    case 'Pots': return <Package className="w-3 h-3 text-orange-700" />;
    case 'Fertilizer': return <Sparkles className="w-3 h-3 text-teal-700" />;
    case 'Transport': return <Truck className="w-3 h-3 text-blue-700" />;
    case 'Fuel': return <Fuel className="w-3 h-3 text-red-600" />;
    case 'Food': return <Utensils className="w-3 h-3 text-rose-600" />;
    case 'Stay': return <Hotel className="w-3 h-3 text-indigo-700" />;
    case 'Workers Cost': return <HardHat className="w-3 h-3 text-yellow-700" />;
    case 'Design': return <Palette className="w-3 h-3 text-purple-700" />;
    case 'Miscellaneous':
    default: return <Tag className="w-3 h-3 text-stone-600" />;
  }
};

const getCategoryBadgeClass = (category: ExpenseCategory) => {
  switch (category) {
    case 'Soil': return 'bg-amber-50 text-amber-800 border-amber-200/60';
    case 'Plants': return 'bg-emerald-50 text-emerald-800 border-emerald-200/60';
    case 'Pots': return 'bg-orange-50 text-orange-800 border-orange-200/60';
    case 'Fertilizer': return 'bg-teal-50 text-teal-800 border-teal-200/60';
    case 'Transport': return 'bg-blue-50 text-blue-800 border-blue-200/60';
    case 'Fuel': return 'bg-rose-50 text-rose-800 border-rose-200/60';
    case 'Food': return 'bg-pink-50 text-pink-800 border-pink-200/60';
    case 'Stay': return 'bg-indigo-50 text-indigo-800 border-indigo-200/60';
    case 'Workers Cost': return 'bg-yellow-50 text-yellow-800 border-yellow-200/60';
    case 'Design': return 'bg-purple-50 text-purple-800 border-purple-200/60';
    case 'Miscellaneous':
    default: return 'bg-stone-50 text-stone-700 border-stone-200';
  }
};

export const ExpensesCard: React.FC<ExpensesCardProps> = ({
  projectId,
  expenses,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [category, setCategory] = useState<ExpenseCategory>('Soil');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const filteredExpenses = selectedFilter === 'All'
    ? expenses
    : expenses.filter(e => e.type === selectedFilter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setIsSubmitting(true);
    try {
      await onAddExpense({
        project_id: projectId,
        type: category,
        amount: Number(amount),
        description: description.trim() || undefined,
        date: date || new Date().toISOString().split('T')[0],
      });
      setAmount('');
      setDescription('');
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
            Expenses
          </h3>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-600 font-medium">
            {expenses.length}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-stone-400 mr-1">Total:</span>
          <span className="text-xs font-bold text-amber-900">
            {formatCurrency(totalExpenseAmount)}
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex overflow-x-auto space-x-1 pb-1.5 mb-2.5 scrollbar-none text-[11px]">
        <button
          onClick={() => setSelectedFilter('All')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-all ${
            selectedFilter === 'All'
              ? 'bg-yard-green text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          All ({expenses.length})
        </button>
        {EXPENSE_CATEGORIES.map(cat => {
          const count = expenses.filter(e => e.type === cat).length;
          if (count === 0 && selectedFilter !== cat) return null;
          return (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-2 py-1 rounded-md whitespace-nowrap font-medium transition-all flex items-center space-x-1 ${
                selectedFilter === cat
                  ? 'bg-yard-green text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span>{cat}</span>
              {count > 0 && <span className="text-[9px]">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Add Expense Button - Short string */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full py-1.5 px-3 mb-2.5 rounded-lg border border-dashed border-stone-300 hover:border-yard-green bg-stone-50 hover:bg-yard-mint/20 text-stone-700 font-medium text-xs flex items-center justify-center space-x-1 active:scale-[0.99] transition-all"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Expense</span>
      </button>

      {/* Expense List - 2 Non-Overlapping Rows */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-4 bg-stone-50 rounded-lg text-xs text-stone-400">
          No expenses recorded
        </div>
      ) : (
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-0.5">
          {filteredExpenses.map(expense => (
            <div
              key={expense.id}
              className="p-2.5 rounded-lg bg-stone-50 hover:bg-stone-100/60 border border-stone-200/60 flex flex-col gap-1 transition-all"
            >
              {/* Row 1: Category + Date on Left, Amount on Right */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <span className={`inline-flex items-center space-x-1 text-[10px] font-semibold px-1.5 py-0.2 rounded border ${getCategoryBadgeClass(expense.type)}`}>
                    {getCategoryIcon(expense.type)}
                    <span>{expense.type}</span>
                  </span>
                  <span className="text-[10px] text-stone-400 flex-shrink-0">
                    • {formatDate(expense.date)}
                  </span>
                </div>

                <span className="text-xs font-bold text-stone-900 flex-shrink-0 ml-2">
                  {formatCurrency(expense.amount)}
                </span>
              </div>

              {/* Row 2: Description on Left, Delete on Right */}
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <p className="text-stone-500 truncate flex-1 pr-2 font-normal">
                  {expense.description || <span className="text-stone-300 italic">No description</span>}
                </p>

                <button
                  onClick={() => onDeleteExpense(expense.id)}
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

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl p-4 shadow-xl border border-stone-100 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-3">
              <h3 className="text-sm font-semibold text-stone-900">
                Add Expense
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Type *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-2.5 py-2 rounded-lg border border-stone-300 bg-stone-50 text-xs font-medium text-stone-800"
                    required
                  >
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Amount (₹) *
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
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-stone-300 text-xs font-medium text-stone-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Details (e.g. 50 Red Palms, truck delivery...)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  disabled={isSubmitting || !amount}
                  className="flex-1 py-2 rounded-lg bg-yard-green text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
