import React from 'react';
import { ProjectFinancialSummary } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Percent,
  Edit2
} from 'lucide-react';

interface FinancialSummaryCardProps {
  financials: ProjectFinancialSummary;
  onEditQuotedAmount?: () => void;
}

export const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({ financials, onEditQuotedAmount }) => {
  const {
    quoted_amount,
    total_client_payments,
    total_expenses,
    total_salaries,
    total_deductions,
    profit_remained,
    pending_receivables,
    net_profit_margin,
  } = financials;

  const isProfitable = profit_remained >= 0;
  const collectionPercentage = quoted_amount > 0 
    ? Math.min(100, Math.round((total_client_payments / quoted_amount) * 100))
    : 0;

  return (
    <div className="bg-white rounded-xl p-4 shadow-xs border border-stone-200/80 mb-3.5 transition-all">
      <div className="flex items-center justify-between pb-2.5 border-b border-stone-100 mb-3">
        <div>
          <h2 className="text-[10px] uppercase font-semibold tracking-wider text-yard-green">
            Subcard 1
          </h2>
          <h3 className="text-sm font-semibold text-stone-800">
            Financial Overview & Balance
          </h3>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center space-x-1 ${
          isProfitable ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
        }`}>
          {isProfitable ? <TrendingUp className="w-3 h-3 mr-1 text-emerald-600" /> : <TrendingDown className="w-3 h-3 mr-1 text-rose-600" />}
          {isProfitable ? 'Positive Balance' : 'Negative Balance'}
        </span>
      </div>

      {/* Hero Balance Badge */}
      <div className={`p-3 rounded-xl mb-3 border ${
        isProfitable 
          ? 'bg-emerald-50/50 border-emerald-200/80' 
          : 'bg-rose-50/50 border-rose-200/80'
      }`}>
        <div className="flex justify-between items-baseline mb-0.5">
          <span className="text-[11px] font-medium text-stone-600">
            Balance Amount (After All Deductions)
          </span>
          <span className="text-[10px] text-stone-400">
            Received - Deductions
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-xl font-bold tracking-tight ${
            isProfitable ? 'text-emerald-700' : 'text-rose-600'
          }`}>
            {formatCurrency(profit_remained)}
          </span>
          {isProfitable ? (
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Net Profit Margin Badge */}
      <div className={`flex items-center justify-between p-2.5 rounded-xl mb-3 border ${
        net_profit_margin >= 0
          ? 'bg-emerald-50/40 border-emerald-200/60'
          : 'bg-rose-50/40 border-rose-200/60'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            net_profit_margin >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}>
            <Percent className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-stone-500 block leading-tight">
              Net Profit Margin
            </span>
            <span className="text-[10px] text-stone-400">
              (Profit ÷ Revenue) × 100
            </span>
          </div>
        </div>
        <span className={`text-lg font-black tracking-tight ${
          net_profit_margin >= 0 ? 'text-emerald-700' : 'text-rose-600'
        }`}>
          {net_profit_margin}%
        </span>
      </div>

      {/* Financial Matrix Grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        {/* Quoted Amount */}
        <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-100 relative group">
          <div className="flex items-center justify-between text-stone-500 text-[11px] font-medium mb-0.5">
            <div className="flex items-center">
              <CreditCard className="w-3 h-3 mr-1 text-yard-green" />
              <span>Quoted to Client</span>
            </div>
            {onEditQuotedAmount && (
              <button
                type="button"
                onClick={onEditQuotedAmount}
                title="Edit Quoted Amount"
                className="p-1 -mr-1 -mt-0.5 rounded-md text-stone-400 hover:text-yard-green hover:bg-yard-green/10 transition-colors flex items-center gap-0.5 text-[10px] font-semibold active:scale-95"
              >
                <Edit2 className="w-2.5 h-2.5" />
                <span>Edit</span>
              </button>
            )}
          </div>
          <div className="text-sm font-semibold text-stone-800">
            {formatCurrency(quoted_amount)}
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            Pending: {formatCurrency(pending_receivables)}
          </div>
        </div>

        {/* Client Payments Collected */}
        <div className="bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100">
          <div className="flex items-center text-emerald-800 text-[11px] font-medium mb-0.5">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-700" />
            <span>Client Received</span>
          </div>
          <div className="text-sm font-semibold text-emerald-800">
            {formatCurrency(total_client_payments)}
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">
            {collectionPercentage}% Collected
          </div>
        </div>

        {/* Project Expenses */}
        <div className="bg-amber-50/40 p-2.5 rounded-xl border border-amber-100">
          <div className="flex items-center text-amber-800 text-[11px] font-medium mb-0.5">
            <TrendingDown className="w-3 h-3 mr-1 text-amber-700" />
            <span>Total Expenses</span>
          </div>
          <div className="text-sm font-semibold text-amber-900">
            {formatCurrency(total_expenses)}
          </div>
          <div className="text-[10px] text-amber-600 mt-0.5">
            Materials & logistics
          </div>
        </div>

        {/* Salaries Paid */}
        <div className="bg-indigo-50/40 p-2.5 rounded-xl border border-indigo-100">
          <div className="flex items-center text-indigo-800 text-[11px] font-medium mb-0.5">
            <Users className="w-3 h-3 mr-1 text-indigo-700" />
            <span>Salaries Paid</span>
          </div>
          <div className="text-sm font-semibold text-indigo-900">
            {formatCurrency(total_salaries)}
          </div>
          <div className="text-[10px] text-indigo-600 mt-0.5">
            Worker & staff payouts
          </div>
        </div>
      </div>

      {/* Progress Bar for Quote Collection */}
      <div className="pt-1">
        <div className="flex justify-between text-[11px] font-medium text-stone-500 mb-1">
          <span>Client Payment Progress</span>
          <span className="text-yard-green font-semibold">{collectionPercentage}%</span>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200/60">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${collectionPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-stone-400 mt-1">
          <span>Total Deductions: <strong className="text-stone-600 font-medium">{formatCurrency(total_deductions)}</strong></span>
          <span>Projected: <strong className="text-stone-600 font-medium">{formatCurrency(financials.projected_profit)}</strong></span>
        </div>
      </div>
    </div>
  );
};
