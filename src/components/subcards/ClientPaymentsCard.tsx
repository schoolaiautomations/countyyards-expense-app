import React, { useState } from 'react';
import { ClientPayment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Plus, Trash2, ArrowDownLeft, Printer, X } from 'lucide-react';
import { PaymentReceiptModal } from '../PaymentReceiptModal';

interface ClientPaymentsCardProps {
  projectId: string;
  projectName?: string;
  clientName?: string;
  clientPhone?: string;
  location?: string;
  quotedAmount: number;
  payments: ClientPayment[];
  onAddPayment: (payment: Omit<ClientPayment, 'id' | 'created_at'>) => Promise<ClientPayment>;
  onDeletePayment: (id: string) => Promise<void>;
}

const PAYMENT_METHODS = ['UPI', 'Bank', 'Cash', 'Cheque', 'RTGS'];

export const ClientPaymentsCard: React.FC<ClientPaymentsCardProps> = ({
  projectId,
  projectName = 'Project',
  clientName,
  clientPhone,
  location,
  quotedAmount,
  payments,
  onAddPayment,
  onDeletePayment,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Printable receipt state
  const [receiptPayment, setReceiptPayment] = useState<ClientPayment | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const pendingAmount = Math.max(0, quotedAmount - totalCollected);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !amount || Number(amount) <= 0) return;

    setIsSubmitting(true);
    try {
      const created = await onAddPayment({
        project_id: projectId,
        amount: Number(amount),
        date: date || new Date().toISOString().split('T')[0],
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
      });

      setAmount('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsModalOpen(false);

      if (created) {
        setReceiptPayment(created);
        setIsReceiptOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReceipt = (payment: ClientPayment) => {
    setReceiptPayment(payment);
    setIsReceiptOpen(true);
  };

  return (
    <div className="bg-white rounded-xl p-3 shadow-xs border border-stone-200/80 mb-3 transition-all">
      {/* Header with Short Strings */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2.5">
        <div className="flex items-center space-x-1.5">
          <h3 className="text-xs font-semibold text-stone-800">
            Payments
          </h3>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-medium">
            {payments.length}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-stone-400 mr-1">Total:</span>
          <span className="text-xs font-bold text-emerald-700">
            {formatCurrency(totalCollected)}
          </span>
        </div>
      </div>

      {/* Snapshot summary: Quote & Due */}
      <div className="flex justify-between items-center bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-100 mb-2.5 text-[11px]">
        <span className="text-stone-500">
          Quote: <strong className="text-stone-700 font-semibold">{formatCurrency(quotedAmount)}</strong>
        </span>
        <span className="text-stone-500">
          Due: <strong className="text-amber-700 font-semibold">{formatCurrency(pendingAmount)}</strong>
        </span>
      </div>

      {/* Add Payment Button - Short string */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full py-1.5 px-3 mb-2.5 rounded-lg border border-dashed border-emerald-400 bg-emerald-50/30 hover:bg-emerald-50 text-emerald-800 font-medium text-xs flex items-center justify-center space-x-1 active:scale-[0.99] transition-all"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Payment</span>
      </button>

      {/* Payments List - 2 Clean Non-Overlapping Rows */}
      {payments.length === 0 ? (
        <div className="text-center py-4 bg-stone-50 rounded-lg text-xs text-stone-400">
          No payments yet
        </div>
      ) : (
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-0.5">
          {payments.map(payment => (
            <div
              key={payment.id}
              className="p-2.5 rounded-lg bg-emerald-50/20 hover:bg-emerald-50/40 border border-emerald-100/70 flex flex-col gap-1 transition-all"
            >
              {/* Row 1: Mode + Date on Left, Amount on Right */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 flex-shrink-0">
                    <ArrowDownLeft className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-800 truncate">
                    {payment.payment_method || 'Payment'}
                  </span>
                  <span className="text-[10px] text-stone-400 flex-shrink-0">
                    • {formatDate(payment.date)}
                  </span>
                </div>

                <span className="text-xs font-bold text-emerald-700 flex-shrink-0 ml-2">
                  +{formatCurrency(payment.amount)}
                </span>
              </div>

              {/* Row 2: Note on Left, Receipt & Delete Actions on Right */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-emerald-100/40">
                <p className="text-stone-500 truncate flex-1 pr-2 font-normal">
                  {payment.notes || <span className="text-stone-300 italic">No notes</span>}
                </p>

                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  <button
                    onClick={() => openReceipt(payment)}
                    title="Print Receipt"
                    className="p-1 text-yard-green hover:bg-emerald-100/60 rounded flex items-center space-x-0.5 text-[10px] font-medium transition-colors"
                  >
                    <Printer className="w-3 h-3" />
                    <span>Receipt</span>
                  </button>

                  <button
                    onClick={() => onDeletePayment(payment.id)}
                    title="Delete"
                    className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl p-4 shadow-xl border border-stone-100 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-3">
              <h3 className="text-sm font-semibold text-stone-900">
                Record Payment
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
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="1"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-yard-green text-sm font-semibold text-stone-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-stone-300 bg-stone-50 text-xs font-medium text-stone-800"
                  >
                    {PAYMENT_METHODS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
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
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Milestone 1 / Advance"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs text-stone-800"
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
                  {isSubmitting ? 'Saving...' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <PaymentReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        payment={receiptPayment}
        projectName={projectName}
        clientName={clientName}
        clientPhone={clientPhone}
        location={location}
        quotedAmount={quotedAmount}
        totalCollected={totalCollected}
      />
    </div>
  );
};
