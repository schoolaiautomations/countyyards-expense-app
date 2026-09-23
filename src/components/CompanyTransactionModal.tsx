import React, { useState, useEffect } from 'react';
import { 
  CompanyTransaction, 
  CompanyTransactionType, 
  COMPANY_EXPENSE_CATEGORIES, 
  COMPANY_INCOME_CATEGORIES 
} from '../types';
import { 
  X, 
  IndianRupee, 
  Calendar, 
  CreditCard, 
  FileText, 
  MinusCircle, 
  PlusCircle, 
  Wrench, 
  TrendingUp,
  Tag
} from 'lucide-react';

interface CompanyTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<CompanyTransaction, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initialData?: CompanyTransaction | null;
  initialType?: CompanyTransactionType;
}

export const CompanyTransactionModal: React.FC<CompanyTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  initialType = 'Expense',
}) => {
  const [type, setType] = useState<CompanyTransactionType>(initialType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setTitle(initialData.title);
      setAmount(initialData.amount ? initialData.amount.toString() : '');
      setCategory(initialData.category);
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setPaymentMethod(initialData.payment_method || 'Cash');
      setNotes(initialData.notes || '');
    } else {
      setType(initialType);
      setTitle('');
      setAmount('');
      setCategory(initialType === 'Expense' ? COMPANY_EXPENSE_CATEGORIES[0] : COMPANY_INCOME_CATEGORIES[0]);
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('Cash');
      setNotes('');
    }
  }, [initialData, initialType, isOpen]);

  // When type toggles, reset category to first default of that type if not matching
  const handleTypeChange = (newType: CompanyTransactionType) => {
    setType(newType);
    if (newType === 'Expense') {
      setCategory(COMPANY_EXPENSE_CATEGORIES[0]);
    } else {
      setCategory(COMPANY_INCOME_CATEGORIES[0]);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;

    setIsSubmitting(true);
    try {
      await onSave({
        type,
        title: title.trim(),
        category: category || (type === 'Expense' ? 'Miscellaneous / Other Cost' : 'Other Inflow'),
        amount: Number(amount),
        date,
        payment_method: paymentMethod,
        notes: notes.trim(),
      });
      onClose();
    } catch (err) {
      console.error('Error saving company transaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isExpense = type === 'Expense';
  const categories = isExpense ? COMPANY_EXPENSE_CATEGORIES : COMPANY_INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-stone-100 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isExpense ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {isExpense ? <Wrench className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">
                {initialData ? 'Edit Transaction' : isExpense ? 'Record Maintenance Cost' : 'Add Outside Money'}
              </h3>
              <p className="text-[11px] text-stone-500 font-normal">
                {isExpense 
                  ? 'Deducts from company balance (non-project)' 
                  : 'Adds directly to company balance (outside inflow)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle: Deduct vs Add */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
              Transaction Action
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl">
              <button
                type="button"
                onClick={() => handleTypeChange('Expense')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                  isExpense
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <MinusCircle className="w-4 h-4" />
                <span>Deduct (Cost)</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('Income')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                  !isExpense
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add (Outside Funds)</span>
              </button>
            </div>
          </div>

          {/* Amount (₹) */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
              Amount (₹) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IndianRupee className={`w-4 h-4 ${isExpense ? 'text-rose-500' : 'text-emerald-600'}`} />
              </div>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`w-full pl-9 pr-3 py-2.5 text-base font-extrabold rounded-xl border border-stone-200 focus:outline-none transition-all ${
                  isExpense 
                    ? 'text-rose-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500' 
                    : 'text-emerald-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                }`}
              />
            </div>
          </div>

          {/* Title / Description */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
              {isExpense ? 'Expense Name / Purpose *' : 'Inflow Source / Description *'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isExpense ? "e.g. Bike Servicing & Engine Oil" : "e.g. Outside Investment from Partner"}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-stone-200 text-stone-800 focus:outline-none focus:border-yard-green focus:ring-1 focus:ring-yard-green"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1 mb-1">
              <Tag className="w-3 h-3 text-stone-400" />
              <span>Category</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-none focus:border-yard-green"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Payment Method Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3 text-stone-400" />
                <span>Date</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-stone-200 text-stone-800 focus:outline-none focus:border-yard-green"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1 mb-1">
                <CreditCard className="w-3 h-3 text-stone-400" />
                <span>Payment Mode</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-none focus:border-yard-green"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="Bank Transfer">Bank Transfer / NEFT</option>
                <option value="Cheque">Cheque</option>
                <option value="Card">Card</option>
              </select>
            </div>
          </div>

          {/* Notes / Remarks */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1 mb-1">
              <FileText className="w-3 h-3 text-stone-400" />
              <span>Notes / Details (Optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Mechanic contact, bill number, repayment terms, etc."
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 text-stone-800 focus:outline-none focus:border-yard-green resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !amount || Number(amount) <= 0}
              className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold disabled:opacity-40 transition-all shadow-xs ${
                isExpense
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isSubmitting 
                ? 'Saving...' 
                : isExpense 
                ? `Deduct Cost (-₹${Number(amount || 0).toLocaleString('en-IN')})` 
                : `Add to Balance (+₹${Number(amount || 0).toLocaleString('en-IN')})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
