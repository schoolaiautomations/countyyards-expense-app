import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Project, 
  Expense, 
  Salary, 
  ClientPayment, 
  ProjectPhoto, 
  ProjectDocument,
  ProjectFinancialSummary,
  CompanyFinancialSummary,
  ExpenseCategory,
  EXPENSE_CATEGORIES
} from '../types';
import { dataService, initializeDataStore } from '../services/dataService';

interface ProjectContextType {
  projects: Project[];
  expenses: Expense[];
  salaries: Salary[];
  clientPayments: ClientPayment[];
  photos: ProjectPhoto[];
  documents: ProjectDocument[];
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

  // Photo Actions
  addPhoto: (photoData: Omit<ProjectPhoto, 'id' | 'created_at'>) => Promise<ProjectPhoto>;
  deletePhoto: (id: string) => Promise<void>;

  // Document Actions
  addDocument: (docData: Omit<ProjectDocument, 'id' | 'uploaded_at'>) => Promise<ProjectDocument>;
  deleteDocument: (id: string) => Promise<void>;

  // Financial Helpers
  getProjectFinancials: (projectId: string) => ProjectFinancialSummary;
  getCompanyFinancials: () => CompanyFinancialSummary;
  getExpensesByCategory: (projectId?: string) => { category: ExpenseCategory; total: number; percentage: number; count: number }[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [clientPayments, setClientPayments] = useState<ClientPayment[]>([]);
  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      initializeDataStore();
      const [p, e, s, cp, ph, d] = await Promise.all([
        dataService.getProjects(),
        dataService.getExpenses(),
        dataService.getSalaries(),
        dataService.getClientPayments(),
        dataService.getPhotos(),
        dataService.getDocuments(),
      ]);

      setProjects(p);
      setExpenses(e);
      setSalaries(s);
      setClientPayments(cp);
      setPhotos(ph);
      setDocuments(d);

      // Keep selected project updated if it exists
      if (selectedProject) {
        const found = p.find(item => item.id === selectedProject.id);
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
    setPhotos(prev => prev.filter(ph => ph.project_id !== id));
    setDocuments(prev => prev.filter(d => d.project_id !== id));
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

  // ---- Photo Actions ----
  const addPhoto = async (photoData: Omit<ProjectPhoto, 'id' | 'created_at'>) => {
    const created = await dataService.addPhoto(photoData);
    setPhotos(prev => [created, ...prev]);
    return created;
  };

  const deletePhoto = async (id: string) => {
    await dataService.deletePhoto(id);
    setPhotos(prev => prev.filter(ph => ph.id !== id));
  };

  // ---- Document Actions ----
  const addDocument = async (docData: Omit<ProjectDocument, 'id' | 'uploaded_at'>) => {
    const created = await dataService.addDocument(docData);
    setDocuments(prev => [created, ...prev]);
    return created;
  };

  const deleteDocument = async (id: string) => {
    await dataService.deleteDocument(id);
    setDocuments(prev => prev.filter(d => d.id !== id));
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

    return {
      quoted_amount,
      total_client_payments,
      total_expenses,
      total_salaries,
      total_deductions,
      profit_remained,
      pending_receivables,
      projected_profit,
    };
  }, [projects, clientPayments, expenses, salaries]);

  const getCompanyFinancials = useCallback((): CompanyFinancialSummary => {
    const total_quoted = projects.reduce((sum, p) => sum + Number(p.quoted_amount || 0), 0);
    const total_collected = clientPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const total_expenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const total_salaries = salaries.reduce((sum, s) => sum + Number(s.amount || 0), 0);

    const total_deductions = total_expenses + total_salaries;
    // Remaining amount added to Company Total balance after all deductions
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
        photos,
        documents,
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
        addPhoto,
        deletePhoto,
        addDocument,
        deleteDocument,
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
