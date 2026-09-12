import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Project, 
  Expense, 
  Salary, 
  ClientPayment, 
  SiteAssessment, 
  AssessmentMeasurement, 
  MaintenanceSchedule, 
  ProcurementItem,
  Vendor,
  ProjectFinancialSummary, 
  CompanyFinancialSummary, 
  ExpenseCategory, 
  EXPENSE_CATEGORIES 
} from '../types';
import { 
  dataService, 
  initializeDataStore, 
  getLocal, 
  STORAGE_KEYS 
} from '../services/dataService';

interface ProjectContextType {
  projects: Project[];
  expenses: Expense[];
  salaries: Salary[];
  clientPayments: ClientPayment[];
  assessments: SiteAssessment[];
  assessmentMeasurements: AssessmentMeasurement[];
  maintenanceSchedules: MaintenanceSchedule[];
  procurementItems: ProcurementItem[];
  vendors: Vendor[];
  selectedProject: Project | null;
  loading: boolean;
  
  // Navigation / Selection
  setSelectedProject: (project: Project | null) => void;
  refreshData: () => Promise<void>;

  // Project Actions
  createProject: (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Expense Actions
  addExpense: (expenseData: Omit<Expense, 'id' | 'created_at'>) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;

  // Salary Actions
  addSalary: (salaryData: Omit<Salary, 'id' | 'created_at'>) => Promise<Salary>;
  deleteSalary: (id: string) => Promise<void>;

  // Payment Actions
  addClientPayment: (paymentData: Omit<ClientPayment, 'id' | 'created_at'>) => Promise<ClientPayment>;
  deleteClientPayment: (id: string) => Promise<void>;

  // Assessment Actions
  createAssessment: (data: Omit<SiteAssessment, 'id' | 'created_at' | 'updated_at'>) => Promise<SiteAssessment>;
  updateAssessment: (id: string, updates: Partial<SiteAssessment>) => Promise<void>;
  deleteAssessment: (id: string) => Promise<void>;
  addMeasurement: (data: Omit<AssessmentMeasurement, 'id' | 'created_at'>) => Promise<AssessmentMeasurement>;
  updateMeasurement: (id: string, updates: Partial<AssessmentMeasurement>, assessmentId: string) => Promise<void>;
  deleteMeasurement: (id: string, assessmentId: string) => Promise<void>;

  // Maintenance Actions
  createMaintenanceSchedule: (data: Omit<MaintenanceSchedule, 'id' | 'created_at' | 'updated_at'>) => Promise<MaintenanceSchedule>;
  updateMaintenanceSchedule: (id: string, updates: Partial<MaintenanceSchedule>) => Promise<void>;
  deleteMaintenanceSchedule: (id: string) => Promise<void>;

  // Procurement Actions
  createProcurementItem: (data: Omit<ProcurementItem, 'id' | 'created_at'>) => Promise<ProcurementItem>;
  updateProcurementItem: (id: string, updates: Partial<ProcurementItem>) => Promise<void>;
  deleteProcurementItem: (id: string) => Promise<void>;
  clearAllProcurementItems: () => Promise<void>;
  toggleProcurementStatus: (id: string) => Promise<void>;
  reorderProcurementItems: (orderedIds: string[]) => Promise<void>;

  // Vendor Actions
  createVendor: (data: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>) => Promise<Vendor>;
  updateVendor: (id: string, updates: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;

  // Financial Helpers
  getProjectFinancials: (projectId: string) => ProjectFinancialSummary;
  getCompanyFinancials: () => CompanyFinancialSummary;
  getExpensesByCategory: (projectId?: string) => { category: ExpenseCategory; total: number; percentage: number; count: number }[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronously initialize from localStorage cache for INSTANT 0ms rendering
  const [projects, setProjects] = useState<Project[]>(() => {
    initializeDataStore();
    return getLocal<Project>(STORAGE_KEYS.PROJECTS);
  });
  const [expenses, setExpenses] = useState<Expense[]>(() => getLocal<Expense>(STORAGE_KEYS.EXPENSES));
  const [salaries, setSalaries] = useState<Salary[]>(() => getLocal<Salary>(STORAGE_KEYS.SALARIES));
  const [clientPayments, setClientPayments] = useState<ClientPayment[]>(() => getLocal<ClientPayment>(STORAGE_KEYS.CLIENT_PAYMENTS));
  const [assessments, setAssessments] = useState<SiteAssessment[]>(() => getLocal<SiteAssessment>(STORAGE_KEYS.ASSESSMENTS));
  const [assessmentMeasurements, setAssessmentMeasurements] = useState<AssessmentMeasurement[]>(() => getLocal<AssessmentMeasurement>(STORAGE_KEYS.MEASUREMENTS));
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>(() => getLocal<MaintenanceSchedule>(STORAGE_KEYS.MAINTENANCE));
  const [procurementItems, setProcurementItems] = useState<ProcurementItem[]>(() => getLocal<ProcurementItem>(STORAGE_KEYS.PROCUREMENT));
  const [vendors, setVendors] = useState<Vendor[]>(() => getLocal<Vendor>(STORAGE_KEYS.VENDORS));
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // If local cache already exists, initial loading is false; otherwise true until first fetch finishes
  const [loading, setLoading] = useState<boolean>(() => {
    const cachedProjects = getLocal<Project>(STORAGE_KEYS.PROJECTS);
    return cachedProjects.length === 0;
  });

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      initializeDataStore();
      // Use Promise.allSettled so one slow or failing table doesn't block or wipe out others
      const results = await Promise.allSettled([
        dataService.getProjects(),
        dataService.getExpenses(),
        dataService.getSalaries(),
        dataService.getClientPayments(),
        dataService.getAssessments(),
        dataService.getMeasurements(),
        dataService.getMaintenanceSchedules(),
        dataService.getProcurementItems(),
        dataService.getVendors(),
      ]);

      const [pRes, eRes, sRes, cpRes, saRes, smRes, msRes, procRes, vRes] = results;

      if (pRes.status === 'fulfilled') setProjects(pRes.value);
      if (eRes.status === 'fulfilled') setExpenses(eRes.value);
      if (sRes.status === 'fulfilled') setSalaries(sRes.value);
      if (cpRes.status === 'fulfilled') setClientPayments(cpRes.value);
      if (saRes.status === 'fulfilled') setAssessments(saRes.value);
      if (smRes.status === 'fulfilled') setAssessmentMeasurements(smRes.value);
      if (msRes.status === 'fulfilled') setMaintenanceSchedules(msRes.value);
      if (procRes.status === 'fulfilled') setProcurementItems(procRes.value);
      if (vRes.status === 'fulfilled') setVendors(vRes.value);

      // Keep selected project updated if it exists
      if (selectedProject && pRes.status === 'fulfilled') {
        const found = pRes.value.find(item => item.id === selectedProject.id);
        if (found) setSelectedProject(found);
      }
    } catch (err) {
      console.error('Error refreshing project data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedProject]);

  useEffect(() => {
    refreshData();
  }, []);

  // ---- Project Actions ----
  const createProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    const created = await dataService.createProject(projectData);
    setProjects(prev => [created, ...prev]);
    return created;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    await dataService.updateProject(id, updates);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    if (selectedProject?.id === id) {
      setSelectedProject(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteProject = async (id: string) => {
    await dataService.deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    setExpenses(prev => prev.filter(e => e.project_id !== id));
    setSalaries(prev => prev.filter(s => s.project_id !== id));
    setClientPayments(prev => prev.filter(cp => cp.project_id !== id));
    if (selectedProject?.id === id) {
      setSelectedProject(null);
    }
  };

  // ---- Expense Actions ----
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'created_at'>) => {
    const created = await dataService.addExpense(expenseData);
    setExpenses(prev => [created, ...prev]);
    return created;
  };

  const deleteExpense = async (id: string) => {
    await dataService.deleteExpense(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // ---- Salary Actions ----
  const addSalary = async (salaryData: Omit<Salary, 'id' | 'created_at'>) => {
    const created = await dataService.addSalary(salaryData);
    setSalaries(prev => [created, ...prev]);
    return created;
  };

  const deleteSalary = async (id: string) => {
    await dataService.deleteSalary(id);
    setSalaries(prev => prev.filter(s => s.id !== id));
  };

  // ---- Payment Actions ----
  const addClientPayment = async (paymentData: Omit<ClientPayment, 'id' | 'created_at'>) => {
    const created = await dataService.addClientPayment(paymentData);
    setClientPayments(prev => [created, ...prev]);
    return created;
  };

  const deleteClientPayment = async (id: string) => {
    await dataService.deleteClientPayment(id);
    setClientPayments(prev => prev.filter(cp => cp.id !== id));
  };

  // ---- Assessment Actions ----
  const createAssessment = async (data: Omit<SiteAssessment, 'id' | 'created_at' | 'updated_at'>) => {
    const created = await dataService.createAssessment(data);
    setAssessments(prev => [created, ...prev]);
    return created;
  };

  const updateAssessment = async (id: string, updates: Partial<SiteAssessment>) => {
    await dataService.updateAssessment(id, updates);
    setAssessments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAssessment = async (id: string) => {
    await dataService.deleteAssessment(id);
    setAssessments(prev => prev.filter(a => a.id !== id));
    setAssessmentMeasurements(prev => prev.filter(m => m.assessment_id !== id));
  };

  const addMeasurement = async (data: Omit<AssessmentMeasurement, 'id' | 'created_at'>) => {
    const created = await dataService.addMeasurement(data);
    setAssessmentMeasurements(prev => [...prev, created]);
    const newTotal = await dataService.recalcAssessmentTotal(data.assessment_id);
    setAssessments(prev => prev.map(a => a.id === data.assessment_id ? { ...a, total_sqft: newTotal } : a));
    return created;
  };

  const updateMeasurement = async (id: string, updates: Partial<AssessmentMeasurement>, assessmentId: string) => {
    await dataService.updateMeasurement(id, updates);
    setAssessmentMeasurements(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    const newTotal = await dataService.recalcAssessmentTotal(assessmentId);
    setAssessments(prev => prev.map(a => a.id === assessmentId ? { ...a, total_sqft: newTotal } : a));
  };

  const deleteMeasurement = async (id: string, assessmentId: string) => {
    await dataService.deleteMeasurement(id);
    setAssessmentMeasurements(prev => prev.filter(m => m.id !== id));
    const newTotal = await dataService.recalcAssessmentTotal(assessmentId);
    setAssessments(prev => prev.map(a => a.id === assessmentId ? { ...a, total_sqft: newTotal } : a));
  };

  // ---- Maintenance Actions ----
  const createMaintenanceSchedule = async (data: Omit<MaintenanceSchedule, 'id' | 'created_at' | 'updated_at'>) => {
    const created = await dataService.createMaintenanceSchedule(data);
    setMaintenanceSchedules(prev => [...prev, created].sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date)));
    return created;
  };

  const updateMaintenanceSchedule = async (id: string, updates: Partial<MaintenanceSchedule>) => {
    await dataService.updateMaintenanceSchedule(id, updates);
    setMaintenanceSchedules(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m).sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date)));
  };

  const deleteMaintenanceSchedule = async (id: string) => {
    await dataService.deleteMaintenanceSchedule(id);
    setMaintenanceSchedules(prev => prev.filter(m => m.id !== id));
  };

  // ---- Procurement Actions ----
  const createProcurementItem = async (data: Omit<ProcurementItem, 'id' | 'created_at'>) => {
    const created = await dataService.createProcurementItem(data);
    setProcurementItems(prev => [created, ...prev]);
    return created;
  };

  const updateProcurementItem = async (id: string, updates: Partial<ProcurementItem>) => {
    await dataService.updateProcurementItem(id, updates);
    setProcurementItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteProcurementItem = async (id: string) => {
    await dataService.deleteProcurementItem(id);
    setProcurementItems(prev => prev.filter(item => item.id !== id));
  };

  const clearAllProcurementItems = async () => {
    await dataService.clearAllProcurementItems();
    setProcurementItems([]);
  };

  const toggleProcurementStatus = async (id: string) => {
    const item = procurementItems.find(i => i.id === id);
    if (!item) return;
    const nextDone = !item.is_done;
    const updates: Partial<ProcurementItem> = { is_done: nextDone };
    if (!nextDone) {
      const maxPending = procurementItems
        .filter(i => !i.is_done && i.id !== id)
        .reduce((max, i) => Math.max(max, i.priority_order || 0), 0);
      updates.priority_order = maxPending + 1;
    }
    await updateProcurementItem(id, updates);
  };

  const reorderProcurementItems = async (orderedIds: string[]) => {
    // 1. Immediately update React state with new priority_order for instant UI response
    setProcurementItems(prev => {
      const updated = prev.map(item => {
        const idx = orderedIds.indexOf(item.id);
        if (idx !== -1) {
          return { ...item, priority_order: idx + 1 };
        }
        return item;
      });

      return updated.sort((a, b) => {
        const idxA = orderedIds.indexOf(a.id);
        const idxB = orderedIds.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        const orderA = a.priority_order ?? 9999;
        const orderB = b.priority_order ?? 9999;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    });

    // 2. Persist order to localStorage and Supabase
    await dataService.reorderProcurementItems(orderedIds);
  };

  // ---- Vendor Actions ----
  const createVendor = async (data: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>) => {
    const created = await dataService.createVendor(data);
    setVendors(prev => [created, ...prev]);
    return created;
  };

  const updateVendor = async (id: string, updates: Partial<Vendor>) => {
    await dataService.updateVendor(id, updates);
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...updates, updated_at: new Date().toISOString() } : v));
  };

  const deleteVendor = async (id: string) => {
    await dataService.deleteVendor(id);
    setVendors(prev => prev.filter(v => v.id !== id));
  };

  // ---- Financial Computations ----
  const getProjectFinancials = useCallback((projectId: string): ProjectFinancialSummary => {
    const project = projects.find(p => p.id === projectId);
    const quoted_amount = project?.quoted_amount || 0;

    const projectPayments = clientPayments.filter(p => p.project_id === projectId);
    const total_client_payments = projectPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const projectExpenses = expenses.filter(e => e.project_id === projectId);
    const total_expenses = projectExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const projectSalaries = salaries.filter(s => s.project_id === projectId);
    const total_salaries = projectSalaries.reduce((sum, s) => sum + Number(s.amount || 0), 0);

    const total_deductions = total_expenses + total_salaries;
    const profit_remained = total_client_payments - total_deductions;
    const pending_receivables = Math.max(0, quoted_amount - total_client_payments);
    const projected_profit = quoted_amount - total_deductions;
    const net_profit_margin = total_client_payments > 0 
      ? Math.round((profit_remained / total_client_payments) * 100) 
      : 0;

    return {
      quoted_amount,
      total_client_payments,
      total_expenses,
      total_salaries,
      total_deductions,
      profit_remained,
      pending_receivables,
      projected_profit,
      net_profit_margin,
    };
  }, [projects, clientPayments, expenses, salaries]);

  const getCompanyFinancials = useCallback((): CompanyFinancialSummary => {
    const total_quoted = projects.reduce((sum, p) => sum + Number(p.quoted_amount || 0), 0);
    const total_collected = clientPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const total_expenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const total_salaries = salaries.reduce((sum, s) => sum + Number(s.amount || 0), 0);

    const total_deductions = total_expenses + total_salaries;
    const company_total_balance = total_collected - total_deductions;
    const total_pending_receivables = Math.max(0, total_quoted - total_collected);
    
    const net_profit_margin = total_collected > 0 
      ? Math.round((company_total_balance / total_collected) * 100) 
      : 0;

    const active_projects_count = projects.filter(p => p.status === 'Active').length;
    const completed_projects_count = projects.filter(p => p.status === 'Completed').length;

    return {
      company_total_balance,
      total_quoted,
      total_collected,
      total_expenses,
      total_salaries,
      total_deductions,
      total_pending_receivables,
      net_profit_margin,
      active_projects_count,
      completed_projects_count,
    };
  }, [projects, clientPayments, expenses, salaries]);

  const getExpensesByCategory = useCallback((projectId?: string) => {
    const relevantExpenses = projectId 
      ? expenses.filter(e => e.project_id === projectId)
      : expenses;

    const totalAllExpenses = relevantExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    return EXPENSE_CATEGORIES.map(category => {
      const items = relevantExpenses.filter(e => e.type === category);
      const total = items.reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const percentage = totalAllExpenses > 0 ? Math.round((total / totalAllExpenses) * 100) : 0;
      return {
        category,
        total,
        percentage,
        count: items.length,
      };
    }).sort((a, b) => b.total - a.total);
  }, [expenses]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        expenses,
        salaries,
        clientPayments,
        assessments,
        assessmentMeasurements,
        maintenanceSchedules,
        procurementItems,
        vendors,
        selectedProject,
        loading,
        setSelectedProject,
        refreshData,
        createProject,
        updateProject,
        deleteProject,
        addExpense,
        deleteExpense,
        addSalary,
        deleteSalary,
        addClientPayment,
        deleteClientPayment,
        createAssessment,
        updateAssessment,
        deleteAssessment,
        addMeasurement,
        updateMeasurement,
        deleteMeasurement,
        createMaintenanceSchedule,
        updateMaintenanceSchedule,
        deleteMaintenanceSchedule,
        createProcurementItem,
        updateProcurementItem,
        deleteProcurementItem,
        clearAllProcurementItems,
        toggleProcurementStatus,
        reorderProcurementItems,
        createVendor,
        updateVendor,
        deleteVendor,
        getProjectFinancials,
        getCompanyFinancials,
        getExpensesByCategory,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
