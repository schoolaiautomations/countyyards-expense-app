import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { ProjectStatus } from '../types';
import { formatDate } from '../utils/formatters';
import { 
  ArrowLeft, 
  Trash2, 
  MapPin, 
  Phone, 
  User,
  Edit2
} from 'lucide-react';

import { FinancialSummaryCard } from '../components/subcards/FinancialSummaryCard';
import { ExpensesCard } from '../components/subcards/ExpensesCard';
import { SalariesCard } from '../components/subcards/SalariesCard';
import { ClientPaymentsCard } from '../components/subcards/ClientPaymentsCard';
import { EditProjectModal } from '../components/EditProjectModal';

export const ProjectDetailScreen: React.FC = () => {
  const {
    selectedProject,
    setSelectedProject,
    updateProject,
    deleteProject,
    expenses,
    salaries,
    clientPayments,
    addExpense,
    deleteExpense,
    addSalary,
    deleteSalary,
    addClientPayment,
    deleteClientPayment,
    getProjectFinancials,
  } = useProjects();

  const [activeSubcardTab, setActiveSubcardTab] = useState<string>('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFocusField, setEditFocusField] = useState<'quoted_amount' | 'name'>('name');

  if (!selectedProject) {
    return null;
  }

  const financials = getProjectFinancials(selectedProject.id);

  // Subcard items for this project
  const projectExpenses = expenses.filter(e => e.project_id === selectedProject.id);
  const projectSalaries = salaries.filter(s => s.project_id === selectedProject.id);
  const projectPayments = clientPayments.filter(p => p.project_id === selectedProject.id);

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    await updateProject(selectedProject.id, { status: newStatus });
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${selectedProject.name}" and all its records?`)) {
      await deleteProject(selectedProject.id);
      setSelectedProject(null);
    }
  };

  return (
    <div className="pb-24 pt-2 px-4 max-w-lg mx-auto sm:max-w-xl animate-in fade-in">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between py-1 mb-2">
        <button
          onClick={() => setSelectedProject(null)}
          className="flex items-center space-x-1 text-xs font-semibold text-yard-green hover:text-yard-dark bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-lg transition-all active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Projects</span>
        </button>

        <div className="flex items-center space-x-1.5">
          {/* Status Dropdown */}
          <select
            value={selectedProject.status}
            onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
            className="text-[11px] font-semibold px-2 py-1 rounded-lg border border-stone-200 bg-white text-stone-700 shadow-xs focus:ring-1 focus:ring-yard-green"
          >
            <option value="Active">🟢 Active</option>
            <option value="Completed">✅ Completed</option>
            <option value="On Hold">⏸️ On Hold</option>
          </select>

          {/* Delete Project */}
          <button
            onClick={handleDelete}
            title="Delete Project"
            className="p-1 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Project Banner Card */}
      <div className="bg-white rounded-xl p-3 shadow-xs border border-stone-200/80 mb-2.5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <h1 className="text-base font-bold text-stone-900 leading-tight truncate">
              {selectedProject.name}
            </h1>
            <p className="text-[10px] text-stone-400 mt-0.5">
              Created {formatDate(selectedProject.created_at)}
            </p>
          </div>

          <button
            onClick={() => {
              setEditFocusField('name');
              setIsEditModalOpen(true);
            }}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-yard-green/10 hover:bg-yard-green/20 text-yard-green text-xs font-bold transition-all active:scale-95 flex-shrink-0"
            title="Edit Project Details"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {/* Client & Site Quick Info */}
        {(selectedProject.client_name || selectedProject.client_phone || selectedProject.location) && (
          <div className="mt-2 pt-2 border-t border-stone-100 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-stone-500">
            {selectedProject.client_name && (
              <span className="flex items-center font-medium">
                <User className="w-3 h-3 mr-1 text-yard-green" />
                {selectedProject.client_name}
              </span>
            )}
            {selectedProject.client_phone && (
              <a
                href={`tel:${selectedProject.client_phone}`}
                className="flex items-center font-medium text-yard-green hover:underline"
              >
                <Phone className="w-3 h-3 mr-1" />
                {selectedProject.client_phone}
              </a>
            )}
            {selectedProject.location && (
              <span className="flex items-center font-medium text-stone-400">
                <MapPin className="w-3 h-3 mr-1" />
                {selectedProject.location}
              </span>
            )}
          </div>
        )}

        {selectedProject.notes && (
          <p className="mt-1.5 text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-lg border border-stone-100 font-normal">
            "{selectedProject.notes}"
          </p>
        )}
      </div>

      {/* Subcard Selector Tabs (Short Labels) */}
      <div className="flex space-x-1 overflow-x-auto pb-1.5 mb-2.5 scrollbar-none text-[11px]">
        {[
          { id: 'all', label: 'All' },
          { id: 'summary', label: 'Overview' },
          { id: 'expenses', label: `Expenses (${projectExpenses.length})` },
          { id: 'salaries', label: `Salaries (${projectSalaries.length})` },
          { id: 'payments', label: `Payments (${projectPayments.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubcardTab(tab.id)}
            className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-all ${
              activeSubcardTab === tab.id
                ? 'bg-yard-green text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB-CARDS RENDERING */}
      {(activeSubcardTab === 'all' || activeSubcardTab === 'summary') && (
        <FinancialSummaryCard 
          financials={financials} 
          onEditQuotedAmount={() => {
            setEditFocusField('quoted_amount');
            setIsEditModalOpen(true);
          }}
        />
      )}

      {(activeSubcardTab === 'all' || activeSubcardTab === 'expenses') && (
        <ExpensesCard
          projectId={selectedProject.id}
          expenses={projectExpenses}
          onAddExpense={async (exp) => { await addExpense(exp); }}
          onDeleteExpense={deleteExpense}
        />
      )}

      {(activeSubcardTab === 'all' || activeSubcardTab === 'salaries') && (
        <SalariesCard
          projectId={selectedProject.id}
          salaries={projectSalaries}
          onAddSalary={async (sal) => { await addSalary(sal); }}
          onDeleteSalary={deleteSalary}
        />
      )}

      {(activeSubcardTab === 'all' || activeSubcardTab === 'payments') && (
        <ClientPaymentsCard
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          clientName={selectedProject.client_name}
          clientPhone={selectedProject.client_phone}
          location={selectedProject.location}
          quotedAmount={selectedProject.quoted_amount}
          payments={projectPayments}
          onAddPayment={async (pay) => { return await addClientPayment(pay); }}
          onDeletePayment={deleteClientPayment}
        />
      )}

      {/* Edit Project Details & Quoted Amount Modal */}
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={selectedProject}
        onUpdateProject={async (id, updates) => {
          await updateProject(id, updates);
        }}
        initialFocusField={editFocusField}
      />
    </div>
  );
};
