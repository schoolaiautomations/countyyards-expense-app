import React from 'react';
import { createPortal } from 'react-dom';
import { ClientPayment } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Printer, X, CheckCircle2 } from 'lucide-react';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: ClientPayment | null;
  projectName: string;
  clientName?: string;
  clientPhone?: string;
  location?: string;
  quotedAmount: number;
  totalCollected: number;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
  projectName,
  clientName,
  clientPhone,
  location,
  quotedAmount,
  totalCollected,
}) => {
  if (!isOpen || !payment) return null;

  const balanceDue = Math.max(0, quotedAmount - totalCollected);
  const receiptNo = `CY-${payment.id.slice(-6).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto print-receipt-portal animate-in fade-in">
      {/* Outer Modal Container */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto print-receipt-card">
        {/* Screen Header (Hidden on Print) */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-yard-green text-white print:hidden">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <h3 className="text-xs font-bold tracking-tight">Payment Receipt</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PRINTABLE RECEIPT CONTENT - Guaranteed 1 single page receipt */}
        <div id="printable-receipt" className="p-5 bg-white text-stone-900 print:p-0">
          {/* Receipt Top Header */}
          <div className="flex items-center justify-between border-b-2 border-yard-green/30 pb-3 mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-11 h-11 rounded-xl bg-white p-0.5 border border-stone-200 shadow-xs overflow-hidden flex items-center justify-center">
                <img
                  src="/cy_logo.jpg"
                  alt="Country Yards Logo"
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h1 className="text-base font-black text-yard-green tracking-tight leading-tight uppercase">
                  Country Yards
                </h1>
                <p className="text-[10px] text-stone-500 font-semibold tracking-wide uppercase">
                  Landscaping & Garden Design
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-yard-mint text-yard-green border border-yard-accent/30 mb-0.5">
                Official Receipt
              </span>
              <div className="text-[11px] font-bold text-stone-900">
                Receipt #{receiptNo}
              </div>
              <div className="text-[10px] text-stone-500">
                Date: {formatDate(payment.date)}
              </div>
            </div>
          </div>

          {/* Project & Client Details */}
          <div className="grid grid-cols-2 gap-2.5 bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 mb-3 text-[11px]">
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400 block mb-0.5">
                Received From
              </span>
              <div className="font-bold text-stone-900 text-xs">
                {clientName || 'Valued Client'}
              </div>
              {clientPhone && <div className="text-stone-500 text-[10px] mt-0.5">{clientPhone}</div>}
              {location && <div className="text-stone-500 text-[10px] mt-0.5">{location}</div>}
            </div>

            <div className="border-l border-stone-200/80 pl-2.5">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400 block mb-0.5">
                Project Name
              </span>
              <div className="font-bold text-stone-900 text-xs">
                {projectName}
              </div>
              <div className="text-[10px] text-stone-500 mt-0.5">
                Mode: <strong className="text-stone-700">{payment.payment_method || 'UPI / Transfer'}</strong>
              </div>
            </div>
          </div>

          {/* Payment Particulars Box */}
          <div className="border border-stone-200 rounded-xl overflow-hidden mb-3">
            <div className="bg-stone-100 px-3 py-1.5 text-[10px] font-bold text-stone-600 uppercase tracking-wider flex justify-between">
              <span>Particulars</span>
              <span>Amount Received</span>
            </div>
            <div className="p-3 flex justify-between items-center bg-emerald-50/30">
              <div>
                <p className="text-xs font-bold text-stone-900">
                  Client Milestone Payment
                </p>
                {payment.notes && (
                  <p className="text-[10px] text-stone-500 mt-0.5 italic">
                    Note: {payment.notes}
                  </p>
                )}
              </div>
              <div className="text-base sm:text-lg font-black text-emerald-800">
                {formatCurrency(payment.amount)}
              </div>
            </div>
          </div>

          {/* Financial Balance Summary */}
          <div className="grid grid-cols-3 gap-1.5 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 mb-3 text-center text-[11px]">
            <div>
              <span className="text-[9px] text-stone-400 uppercase font-bold block">Quoted</span>
              <span className="font-bold text-stone-800">{formatCurrency(quotedAmount)}</span>
            </div>
            <div>
              <span className="text-[9px] text-stone-400 uppercase font-bold block">Total Paid</span>
              <span className="font-bold text-emerald-700">{formatCurrency(totalCollected)}</span>
            </div>
            <div>
              <span className="text-[9px] text-stone-400 uppercase font-bold block">Balance Due</span>
              <span className="font-bold text-amber-700">{formatCurrency(balanceDue)}</span>
            </div>
          </div>

          {/* Footer & Signature Stamp */}
          <div className="pt-2 border-t border-dashed border-stone-300 flex items-end justify-between">
            <div>
              <p className="text-[9px] text-stone-400 italic">
                Thank you for choosing Country Yards!
              </p>
              <p className="text-[9px] text-stone-400 mt-0.5">
                This is a computer generated receipt.
              </p>
            </div>

            <div className="text-right">
              <div className="inline-block border-2 border-dashed border-yard-green/40 rounded-lg px-3 py-1 text-center bg-yard-mint/20">
                <span className="text-[8px] font-black uppercase tracking-wider text-yard-green block">
                  Country Yards
                </span>
                <span className="text-[9px] font-bold text-stone-700 block mt-0.5">
                  Authorized Signatory
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons (Hidden on Print) */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex space-x-2.5 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-lg border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-100 transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2 px-3 rounded-lg bg-yard-green hover:bg-yard-dark text-white font-bold text-xs shadow-xs flex items-center justify-center space-x-1.5 active:scale-98 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
