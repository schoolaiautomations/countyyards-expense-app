export type ExpenseCategory = 
  | 'Soil' 
  | 'Plants' 
  | 'Pots' 
  | 'Fertilizer' 
  | 'Transport' 
  | 'Fuel' 
  | 'Food' 
  | 'Stay' 
  | 'Miscellaneous' 
  | 'Workers Cost' 
  | 'Design';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Soil',
  'Plants',
  'Pots',
  'Fertilizer',
  'Transport',
  'Fuel',
  'Food',
  'Stay',
  'Miscellaneous',
  'Workers Cost',
  'Design'
];

export type GalleryStage = 'Before Work' | 'Work in Progress' | 'After Completion';

export const GALLERY_STAGES: GalleryStage[] = [
  'Before Work',
  'Work in Progress',
  'After Completion'
];

export type ProjectStatus = 'Active' | 'Completed' | 'On Hold';

export interface Project {
  id: string;
  name: string;
  client_name?: string;
  client_phone?: string;
  location?: string;
  quoted_amount: number;
  status: ProjectStatus;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Expense {
  id: string;
  project_id: string;
  type: ExpenseCategory;
  amount: number;
  description?: string; // Optional detailed description
  date: string;
  created_at?: string;
}

export interface Salary {
  id: string;
  project_id: string;
  person_name: string;
  amount: number;
  date: string;
  notes?: string;
  created_at?: string;
}

export interface ClientPayment {
  id: string;
  project_id: string;
  amount: number;
  date: string;
  payment_method?: string; // UPI, Cash, Bank Transfer, Cheque, etc.
  notes?: string;
  created_at?: string;
}

export interface ProjectPhoto {
  id: string;
  project_id: string;
  stage: GalleryStage;
  image_url: string;
  description?: string;
  date: string;
  created_at?: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size?: number; // In KB
  uploaded_at: string;
}

export interface ProjectFinancialSummary {
  quoted_amount: number;
  total_client_payments: number;
  total_expenses: number;
  total_salaries: number;
  total_deductions: number; // total_expenses + total_salaries
  profit_remained: number; // total_client_payments - total_deductions
  pending_receivables: number; // quoted_amount - total_client_payments
  projected_profit: number; // quoted_amount - total_deductions
}

export interface CompanyFinancialSummary {
  company_total_balance: number; // Total client payments - All deductions across all projects
  total_quoted: number;
  total_collected: number;
  total_expenses: number;
  total_salaries: number;
  total_deductions: number;
  total_pending_receivables: number;
  net_profit_margin: number;
  active_projects_count: number;
  completed_projects_count: number;
}
