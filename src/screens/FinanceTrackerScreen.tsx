import React from 'react';
import { useProjects } from '../context/ProjectContext';
import { formatCurrency } from '../utils/formatters';
import { 
  ArrowLeft,
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CreditCard, 
  PieChart, 
  Building2, 
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { LoadingScreen, SyncingBadge } from '../components/LoadingScreen';

interface FinanceTrackerScreenProps {
  onBack?: () => void;
}

export const FinanceTrackerScreen: React.FC<FinanceTrackerScreenProps> = ({ onBack }) => {
  const { 
    projects, 
    loading,
    getCompanyFinancials, 
    getProjectFinancials, 
    getExpensesByCategory,
    setSelectedProject 
  } = useProjects();

  const companyStats = getCompanyFinancials();
  const categoryBreakdown = getExpensesByCategory();
  const isCompanyProfitable = companyStats.company_total_balance >= 0;

  return (
    <div className="pb-24 pt-3 px-4 max-w-lg mx-auto sm:max-w-xl animate-in fade-in">
      {/* Top Back Navigation Bar */}
      {onBack && (
        <div className="flex items-center justify-between py-1 mb-2">
          <button
            onClick={onBack}
            className="flex items-center space-x-1 text-xs font-bold text-yard-green hover:text-yard-dark bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-xl transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400">
            Card 3 • Finances
          </span>
        </div>
      )}

      {/* Title */}
      <div className="mb-3">
        <h2 className="text-base font-bold text-stone-800 tracking-tight flex items-center gap-1.5">
          <Wallet className="w-4 h-4 text-yard-green" />
          Finance Tracker
        </h2>
        <p className="text-[11px] text-stone-500 font-normal">
          Company balance after all project deductions & collections
        </p>
      </div>

      {/* Syncing indicator */}
      {loading && projects.length > 0 && <SyncingBadge />}

      {/* Loading state when initial cache is empty */}
      {loading && projects.length === 0 ? (
        <LoadingScreen 
          message="Loading Company Finances..." 
          submessage="Retrieving expenses, salaries and payment balances..." 
        />
      ) : (
        <>
          {/* Hero Card: Company Total Balance */}
          <div className={`p-4 rounded-2xl mb-4 shadow-xs border relative overflow-hidden ${
            isCompanyProfitable
              ? 'bg-gradient-to-br from-yard-green via-emerald-800 to-teal-950 text-white border-emerald-700/50'
              : 'bg-gradient-to-br from-stone-900 via-rose-950 to-stone-900 text-white border-rose-800/50'
          }`}>
            <div className="flex justify-between items-start mb-1.5">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5 text-yard-accent" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-200">
                    Country Yards
                  </span>
                  <h3 className="text-[11px] text-stone-300 font-normal">
                    Company Total Balance
                  </h3>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center space-x-1 ${
                isCompanyProfitable ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' : 'bg-rose-400/20 text-rose-300 border border-rose-400/30'
              }`}>
                {isCompanyProfitable ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                <span>{isCompanyProfitable ? 'Positive Balance' : 'Negative Balance'}</span>
              </span>
            </div>

            {/* Big Balance Number */}
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                {formatCurrency(companyStats.company_total_balance)}
              </div>
              <p className="text-[10px] text-emerald-200/80 mt-0.5 font-normal">
                Remaining balance after all expenses & salaries are deducted.
              </p>
            </div>

            {/* Quick Footer Pills */}
            <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-white/15 text-xs">
              <div>
                <span className="text-stone-300 text-[10px] uppercase font-medium block">Total Received</span>
                <span className="font-semibold text-white text-xs">
                  +{formatCurrency(companyStats.total_collected)}
                </span>
              </div>
              <div>
                <span className="text-stone-300 text-[10px] uppercase font-medium block">Total Deductions</span>
                <span className="font-semibold text-rose-300 text-xs">
                  -{formatCurrency(companyStats.total_deductions)}
                </span>
              </div>
            </div>
          </div>

          {/* Key Financial Matrix */}
          <div className="bg-white rounded-2xl p-4 shadow-soft border border-stone-200/80 mb-5">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-stone-400 mb-3">
              Financial Portfolio Metrics
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Total Quoted */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                <div className="flex items-center text-stone-500 text-xs font-semibold mb-1">
                  <CreditCard className="w-3.5 h-3.5 mr-1 text-yard-green" />
                  <span>Total Quoted</span>
                </div>
                <div className="text-base font-extrabold text-stone-900">
                  {formatCurrency(companyStats.total_quoted)}
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">Across all projects</div>
              </div>

              {/* Pending Receivables */}
              <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                <div className="flex items-center text-amber-800 text-xs font-semibold mb-1">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-1 text-amber-700" />
                  <span>Pending Due</span>
                </div>
                <div className="text-base font-extrabold text-amber-900">
                  {formatCurrency(companyStats.total_pending_receivables)}
                </div>
                <div className="text-[10px] text-amber-700 mt-0.5">To collect from clients</div>
              </div>

              {/* Total Expenses */}
              <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-100">
                <div className="flex items-center text-rose-800 text-xs font-semibold mb-1">
                  <TrendingDown className="w-3.5 h-3.5 mr-1 text-rose-700" />
                  <span>Total Expenses</span>
                </div>
                <div className="text-base font-extrabold text-rose-900">
                  {formatCurrency(companyStats.total_expenses)}
                </div>
                <div className="text-[10px] text-rose-700 mt-0.5">Materials & Operations</div>
              </div>

              {/* Total Salaries */}
              <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
                <div className="flex items-center text-indigo-800 text-xs font-semibold mb-1">
                  <Users className="w-3.5 h-3.5 mr-1 text-indigo-700" />
                  <span>Total Salaries</span>
                </div>
                <div className="text-base font-extrabold text-indigo-900">
                  {formatCurrency(companyStats.total_salaries)}
                </div>
                <div className="text-[10px] text-indigo-700 mt-0.5">Worker & staff wages</div>
              </div>

              {/* Profit Margin */}
              <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 col-span-2 sm:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-emerald-800 text-xs font-semibold flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                    Net Company Balance Margin
                  </span>
                  <span className="text-sm font-black text-emerald-800">
                    {companyStats.net_profit_margin}%
                  </span>
                </div>
                <div className="w-full bg-emerald-200/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.max(0, Math.min(100, companyStats.net_profit_margin))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Expense Category Breakdown */}
          <div className="bg-white rounded-2xl p-4 shadow-soft border border-stone-200/80 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-stone-400 flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-yard-green" />
                Expenses By Category
              </h3>
              <span className="text-xs font-bold text-stone-600">
                {formatCurrency(companyStats.total_expenses)}
              </span>
            </div>

            <div className="space-y-2.5">
              {categoryBreakdown.map(item => {
                if (item.total === 0) return null;
                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-stone-700">{item.category}</span>
                      <div className="space-x-2">
                        <span className="text-stone-400 text-[11px]">({item.count} items • {item.percentage}%)</span>
                        <span className="text-stone-900 font-extrabold">{formatCurrency(item.total)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-yard-green to-emerald-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, item.percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {categoryBreakdown.every(c => c.total === 0) && (
                <p className="text-xs text-stone-400 text-center py-4">No expenses recorded yet.</p>
              )}
            </div>
          </div>

          {/* Project-by-Project P&L Contribution */}
          <div className="bg-white rounded-2xl p-4 shadow-soft border border-stone-200/80 mb-5">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-stone-400 mb-3">
              Project-Wise Balance Contribution
            </h3>

            <div className="space-y-2.5">
              {projects.map(project => {
                const fin = getProjectFinancials(project.id);
                const isProfit = fin.profit_remained >= 0;

                return (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="p-3 rounded-xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200/70 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <h4 className="text-xs font-bold text-stone-900 truncate">
                        {project.name}
                      </h4>
                      <div className="flex items-center space-x-2 text-[10px] text-stone-500 mt-0.5">
                        <span>Recv: {formatCurrency(fin.total_client_payments)}</span>
                        <span>•</span>
                        <span>Cost: {formatCurrency(fin.total_deductions)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <div className="text-right">
                        <span className={`text-xs font-extrabold block ${
                          isProfit ? 'text-emerald-700' : 'text-rose-600'
                        }`}>
                          {isProfit ? '+' : ''}{formatCurrency(fin.profit_remained)}
                        </span>
                        <span className="text-[10px] text-stone-400">contribution</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </div>
                  </div>
                );
              })}

              {projects.length === 0 && (
                <p className="text-xs text-stone-400 text-center py-4">No projects created yet.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
