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
  net_profit_margin: number; // margin percentage on collected amount
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

// ---- Site Assessment ----
export type AssessmentStatus = 'Pending' | 'Approved' | 'Rejected';

export interface SiteAssessment {
  id: string;
  client_name: string;
  client_phone?: string;
  location?: string;
  visit_date: string;
  interest_description?: string;
  soil_test_done: boolean;
  soil_test_notes?: string;
  water_test_done: boolean;
  water_test_notes?: string;
  sunlight_check_done: boolean;
  sunlight_check_notes?: string;
  total_sqft: number;
  notes?: string;
  status: AssessmentStatus;
  created_at: string;
  updated_at?: string;
}

export interface AssessmentMeasurement {
  id: string;
  assessment_id: string;
  zone_name: string;
  length_ft: number;
  width_ft: number;
  area_sqft: number;
  notes?: string;
  created_at?: string;
}

// ---- Inspection & Maintenance ----
export type MaintenanceType = 'Maintenance' | 'Inspection' | 'Follow-up';
export type MaintenanceStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue' | 'Cancelled';
export type MaintenanceRecurrence = 'Once' | 'Weekly' | 'Bi-Weekly' | 'Monthly' | 'Quarterly';

export interface MaintenanceSchedule {
  id: string;
  project_id?: string;
  client_name: string;
  location?: string;
  title: string;
  type: MaintenanceType;
  scheduled_date: string;
  scheduled_time?: string;
  assigned_to?: string;
  status: MaintenanceStatus;
  recurrence: MaintenanceRecurrence;
  notes?: string;
  completion_notes?: string;
  created_at: string;
  updated_at?: string;
}

// ---- Plant / Material Procurement ----
export interface ProcurementItem {
  id: string;
  plant_name: string;
  quantity: number;
  paid_amount?: number;
  is_done: boolean;
  priority_order: number;
  location_link?: string;
  nursery_name?: string;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
}

export interface ProcurementStop {
  id: string;
  stopNumber: number;
  nurseryName: string;
  locationLink: string;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number;
  items: ProcurementItem[];
  isCompleted: boolean;
}

// ---- Plant Vendor Details ----
export interface Vendor {
  id: string;
  vendor_name: string;
  plant_names: string;
  contact_number: string;
  location_link: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

// ---- Client Delivery Destination ----
export interface ClientDestination {
  name: string;
  locationLink: string;
  latitude?: number | null;
  longitude?: number | null;
  projectId?: string;
}

