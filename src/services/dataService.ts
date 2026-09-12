import { supabase } from './supabase';
import { 
  Project, 
  Expense, 
  Salary, 
  ClientPayment, 
  SiteAssessment, 
  AssessmentMeasurement, 
  MaintenanceSchedule 
} from '../types';

export const STORAGE_KEYS = {
  PROJECTS: 'cy_projects_prod',
  EXPENSES: 'cy_expenses_prod',
  SALARIES: 'cy_salaries_prod',
  CLIENT_PAYMENTS: 'cy_payments_prod',
  ASSESSMENTS: 'cy_assessments_prod',
  MEASUREMENTS: 'cy_measurements_prod',
  MAINTENANCE: 'cy_maintenance_prod',
  CLEANED_DUMMY: 'cy_cleaned_dummy_v1',
};

// Purge any old dummy/demo data from browser local storage
export const initializeDataStore = () => {
  if (typeof window === 'undefined') return;
  const cleaned = localStorage.getItem(STORAGE_KEYS.CLEANED_DUMMY);
  if (!cleaned) {
    const legacyKeys = [
      'cy_local_projects_v1',
      'cy_local_expenses_v1',
      'cy_local_salaries_v1',
      'cy_local_payments_v1',
      'cy_local_photos_v1',
      'cy_local_documents_v1',
      'cy_photos_prod',
      'cy_documents_prod',
      'cy_seeded_v1',
    ];
    legacyKeys.forEach(k => localStorage.removeItem(k));
    localStorage.setItem(STORAGE_KEYS.CLEANED_DUMMY, 'true');
  }

  // Also purge any invalid non-UUID items from previous local tests
  const existingProjects = getLocal<Project>(STORAGE_KEYS.PROJECTS);
  if (existingProjects.some(p => p.id?.startsWith('proj-'))) {
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.SALARIES);
    localStorage.removeItem(STORAGE_KEYS.CLIENT_PAYMENTS);
  }
};

// Standard RFC 4122 v4 UUID Generator (compatible with PostgreSQL UUID column)
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Helper for local storage
export const getLocal = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const setLocal = <T>(key: string, data: T[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
};

// Network timeout helper to prevent hanging on slow mobile connections
const withTimeout = async (promise: any, ms = 5000): Promise<any> => {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Network request timeout')), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
};

// ==========================================
// DATA SERVICE API
// ==========================================
export const dataService = {
  // ---- PROJECTS ----
  async getProjects(): Promise<Project[]> {
    try {
      const response = await withTimeout(
        supabase.from('projects').select('*').order('created_at', { ascending: false }) as any,
        5000
      );
      const { data, error } = response || {};
      if (!error && data) {
        setLocal(STORAGE_KEYS.PROJECTS, data as Project[]);
        return data as Project[];
      }
      if (error) {
        console.warn('Supabase getProjects error:', error.message);
      }
    } catch (e) {
      console.warn('Supabase getProjects fallback to local storage:', e);
    }
    return getLocal<Project>(STORAGE_KEYS.PROJECTS);
  },

  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const newProject: Project = {
      ...project,
      id: generateUUID(),
      client_name: project.client_name || '',
      client_phone: project.client_phone || '',
      location: project.location || '',
      quoted_amount: Number(project.quoted_amount) || 0,
      status: project.status || 'Active',
      notes: project.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save locally first
    const list = getLocal<Project>(STORAGE_KEYS.PROJECTS);
    setLocal(STORAGE_KEYS.PROJECTS, [newProject, ...list]);

    // Save to Supabase in background
    try {
      const { data, error } = await supabase.from('projects').insert([newProject]).select().single();
      if (!error && data) {
        const updatedList = [data as Project, ...list.filter(p => p.id !== data.id)];
        setLocal(STORAGE_KEYS.PROJECTS, updatedList);
        return data as Project;
      }
      if (error) {
        console.error('Supabase project insert failed:', error.message);
      }
    } catch (e) {
      console.error('Supabase sync exception:', e);
    }

    return newProject;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    const list = getLocal<Project>(STORAGE_KEYS.PROJECTS);
    const updated = list.map(p => p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p);
    setLocal(STORAGE_KEYS.PROJECTS, updated);

    try {
      const { error } = await supabase.from('projects').update(updates).eq('id', id);
      if (error) {
        console.error('Supabase project update failed:', error.message);
      }
    } catch (e) {
      console.warn('Supabase update skipped', e);
    }
  },

  async deleteProject(id: string): Promise<void> {
    const projects = getLocal<Project>(STORAGE_KEYS.PROJECTS).filter(p => p.id !== id);
    setLocal(STORAGE_KEYS.PROJECTS, projects);

    const expenses = getLocal<Expense>(STORAGE_KEYS.EXPENSES).filter(e => e.project_id !== id);
    setLocal(STORAGE_KEYS.EXPENSES, expenses);

    const salaries = getLocal<Salary>(STORAGE_KEYS.SALARIES).filter(s => s.project_id !== id);
    setLocal(STORAGE_KEYS.SALARIES, salaries);

    const payments = getLocal<ClientPayment>(STORAGE_KEYS.CLIENT_PAYMENTS).filter(p => p.project_id !== id);
    setLocal(STORAGE_KEYS.CLIENT_PAYMENTS, payments);

    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) {
        console.error('Supabase project delete failed:', error.message);
      }
    } catch (e) {
      console.warn('Supabase delete skipped', e);
    }
  },

  // ---- EXPENSES ----
  async getExpenses(projectId?: string): Promise<Expense[]> {
    try {
      let query = supabase.from('expenses').select('*').order('date', { ascending: false });
      if (projectId) query = query.eq('project_id', projectId);
      const response = await withTimeout(query as any, 5000);
      const { data, error } = response || {};
      if (!error && data) {
        if (!projectId) {
          setLocal(STORAGE_KEYS.EXPENSES, data as Expense[]);
        }
        return data as Expense[];
      }
      if (error) {
        console.warn('Supabase getExpenses error:', error.message);
      }
    } catch {
      // Fallback
    }
    const all = getLocal<Expense>(STORAGE_KEYS.EXPENSES);
    return projectId ? all.filter(e => e.project_id === projectId) : all;
  },

  async addExpense(expense: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> {
    const newExpense: Expense = {
      ...expense,
      id: generateUUID(),
      amount: Number(expense.amount) || 0,
      description: expense.description || '',
      created_at: new Date().toISOString(),
    };

    const list = getLocal<Expense>(STORAGE_KEYS.EXPENSES);
    setLocal(STORAGE_KEYS.EXPENSES, [newExpense, ...list]);

    try {
      const { data, error } = await supabase.from('expenses').insert([newExpense]).select().single();
      if (!error && data) {
        const updatedList = [data as Expense, ...list.filter(e => e.id !== data.id)];
        setLocal(STORAGE_KEYS.EXPENSES, updatedList);
        return data as Expense;
      }
      if (error) {
        console.error('Supabase expense insert failed:', error.message);
      }
    } catch (e) {
      console.warn('Supabase expense sync skipped', e);
    }

    return newExpense;
  },

  async deleteExpense(id: string): Promise<void> {
    const list = getLocal<Expense>(STORAGE_KEYS.EXPENSES).filter(e => e.id !== id);
    setLocal(STORAGE_KEYS.EXPENSES, list);

    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) {
        console.error('Supabase expense delete failed:', error.message);
      }
    } catch (e) {
      console.warn('Supabase delete expense skipped', e);
    }
  },

  // ---- SALARIES ----
  async getSalaries(projectId?: string): Promise<Salary[]> {
    try {
      let query = supabase.from('salaries').select('*').order('date', { ascending: false });
      if (projectId) query = query.eq('project_id', projectId);
      const response = await withTimeout(query as any, 5000);
      const { data, error } = response || {};
      if (!error && data) {
        if (!projectId) {
          setLocal(STORAGE_KEYS.SALARIES, data as Salary[]);
        }
        return data as Salary[];
      }
      if (error) {
        console.warn('Supabase getSalaries error:', error.message);
      }
    } catch {
      // Fallback
    }
    const all = getLocal<Salary>(STORAGE_KEYS.SALARIES);
    return projectId ? all.filter(s => s.project_id === projectId) : all;
  },

  async addSalary(salary: Omit<Salary, 'id' | 'created_at'>): Promise<Salary> {
    const newSalary: Salary = {
      ...salary,
      id: generateUUID(),
      amount: Number(salary.amount) || 0,
      notes: salary.notes || '',
      created_at: new Date().toISOString(),
    };

    const list = getLocal<Salary>(STORAGE_KEYS.SALARIES);
    setLocal(STORAGE_KEYS.SALARIES, [newSalary, ...list]);

    try {
      const { data, error } = await supabase.from('salaries').insert([newSalary]).select().single();
      if (!error && data) {
        const updatedList = [data as Salary, ...list.filter(s => s.id !== data.id)];
        setLocal(STORAGE_KEYS.SALARIES, updatedList);
        return data as Salary;
      }
      if (error) {
        console.error('Supabase salary insert failed:', error.message);
      }
    } catch (e) {
      console.warn('Supabase salary sync skipped', e);
    }

    return newSalary;
  },

  async deleteSalary(id: string): Promise<void> {
    const list = getLocal<Salary>(STORAGE_KEYS.SALARIES).filter(s => s.id !== id);
    setLocal(STORAGE_KEYS.SALARIES, list);

    try {
      const { error } = await supabase.from('salaries').delete().eq('id', id);
      if (error) {
        console.error('Supabase salary delete failed:', error.message);
      }
    } catch (e) {
      console.warn('Supabase delete salary skipped', e);
    }
  },

  // ---- CLIENT PAYMENTS ----
  async getClientPayments(projectId?: string): Promise<ClientPayment[]> {
    try {
      let query = supabase.from('client_payments').select('*').order('date', { ascending: false });
      if (projectId) query = query.eq('project_id', projectId);
      const response = await withTimeout(query as any, 5000);
      const { data, error } = response || {};
      if (!error && data) {
        if (!projectId) {
          setLocal(STORAGE_KEYS.CLIENT_PAYMENTS, data as ClientPayment[]);
        }
        return data as ClientPayment[];
      }
      if (error) {
        console.warn('Supabase getClientPayments error:', error.message);
      }
    } catch {
      // Fallback
    }
    const all = getLocal<ClientPayment>(STORAGE_KEYS.CLIENT_PAYMENTS);
    return projectId ? all.filter(p => p.project_id === projectId) : all;
  },

  async addClientPayment(payment: Omit<ClientPayment, 'id' | 'created_at'>): Promise<ClientPayment> {
    const newPayment: ClientPayment = {
      ...payment,
      id: generateUUID(),
      amount: Number(payment.amount) || 0,
      payment_method: payment.payment_method || 'UPI',
      notes: payment.notes || '',
      created_at: new Date().toISOString(),
    };

    const list = getLocal<ClientPayment>(STORAGE_KEYS.CLIENT_PAYMENTS);
    setLocal(STORAGE_KEYS.CLIENT_PAYMENTS, [newPayment, ...list]);

    try {
      const { data, error } = await supabase.from('client_payments').insert([newPayment]).select().single();
      if (!error && data) {
        const updatedList = [data as ClientPayment, ...list.filter(p => p.id !== data.id)];
        setLocal(STORAGE_KEYS.CLIENT_PAYMENTS, updatedList);
        return data as ClientPayment;
      }
      if (error) {
        console.error('Supabase payment insert failed:', error.message);
      }
    } catch (e) {
      console.warn('Supabase payment sync skipped', e);
    }

    return newPayment;
  },

  async deleteClientPayment(id: string): Promise<void> {
    const list = getLocal<ClientPayment>(STORAGE_KEYS.CLIENT_PAYMENTS).filter(p => p.id !== id);
    setLocal(STORAGE_KEYS.CLIENT_PAYMENTS, list);

    try {
      const { error } = await supabase.from('client_payments').delete().eq('id', id);
      if (error) {
        console.error('Supabase payment delete failed:', error.message);
      }
    } catch (e) {
      console.warn('Supabase delete payment skipped', e);
    }
  },

  // ---- SITE ASSESSMENTS ----
  async getAssessments(): Promise<SiteAssessment[]> {
    try {
      const response = await withTimeout(
        supabase.from('site_assessments').select('*').order('created_at', { ascending: false }) as any,
        5000
      );
      const { data, error } = response || {};
      if (!error && data) {
        setLocal(STORAGE_KEYS.ASSESSMENTS, data as SiteAssessment[]);
        return data as SiteAssessment[];
      }
      if (error) console.warn('Supabase getAssessments error:', error.message);
    } catch {
      // Fallback
    }
    return getLocal<SiteAssessment>(STORAGE_KEYS.ASSESSMENTS);
  },

  async createAssessment(assessment: Omit<SiteAssessment, 'id' | 'created_at' | 'updated_at'>): Promise<SiteAssessment> {
    const newItem: SiteAssessment = {
      ...assessment,
      id: generateUUID(),
      client_name: assessment.client_name || '',
      client_phone: assessment.client_phone || '',
      location: assessment.location || '',
      interest_description: assessment.interest_description || '',
      total_sqft: Number(assessment.total_sqft) || 0,
      status: assessment.status || 'Pending',
      notes: assessment.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const list = getLocal<SiteAssessment>(STORAGE_KEYS.ASSESSMENTS);
    setLocal(STORAGE_KEYS.ASSESSMENTS, [newItem, ...list]);

    try {
      const { data, error } = await supabase.from('site_assessments').insert([newItem]).select().single();
      if (!error && data) {
        const updatedList = [data as SiteAssessment, ...list.filter(a => a.id !== data.id)];
        setLocal(STORAGE_KEYS.ASSESSMENTS, updatedList);
        return data as SiteAssessment;
      }
      if (error) console.error('Supabase assessment insert failed:', error.message);
    } catch (e) {
      console.error('Supabase assessment sync exception:', e);
    }

    return newItem;
  },

  async updateAssessment(id: string, updates: Partial<SiteAssessment>): Promise<void> {
    const list = getLocal<SiteAssessment>(STORAGE_KEYS.ASSESSMENTS);
    const updated = list.map(a => a.id === id ? { ...a, ...updates, updated_at: new Date().toISOString() } : a);
    setLocal(STORAGE_KEYS.ASSESSMENTS, updated);

    try {
      const { error } = await supabase.from('site_assessments').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) console.error('Supabase assessment update failed:', error.message);
    } catch (e) {
      console.warn('Supabase assessment update skipped', e);
    }
  },

  async deleteAssessment(id: string): Promise<void> {
    const assessments = getLocal<SiteAssessment>(STORAGE_KEYS.ASSESSMENTS).filter(a => a.id !== id);
    setLocal(STORAGE_KEYS.ASSESSMENTS, assessments);

    // Cascade delete measurements locally
    const measurements = getLocal<AssessmentMeasurement>(STORAGE_KEYS.MEASUREMENTS).filter(m => m.assessment_id !== id);
    setLocal(STORAGE_KEYS.MEASUREMENTS, measurements);

    try {
      const { error } = await supabase.from('site_assessments').delete().eq('id', id);
      if (error) console.error('Supabase assessment delete failed:', error.message);
    } catch (e) {
      console.warn('Supabase assessment delete skipped', e);
    }
  },

  // ---- ASSESSMENT MEASUREMENTS ----
  async getMeasurements(assessmentId?: string): Promise<AssessmentMeasurement[]> {
    try {
      let query = supabase.from('assessment_measurements').select('*').order('created_at', { ascending: true });
      if (assessmentId) query = query.eq('assessment_id', assessmentId);
      const response = await withTimeout(query as any, 5000);
      const { data, error } = response || {};
      if (!error && data) {
        if (!assessmentId) {
          setLocal(STORAGE_KEYS.MEASUREMENTS, data as AssessmentMeasurement[]);
        }
        return data as AssessmentMeasurement[];
      }
      if (error) console.warn('Supabase getMeasurements error:', error.message);
    } catch {
      // Fallback
    }
    const all = getLocal<AssessmentMeasurement>(STORAGE_KEYS.MEASUREMENTS);
    return assessmentId ? all.filter(m => m.assessment_id === assessmentId) : all;
  },

  async addMeasurement(measurement: Omit<AssessmentMeasurement, 'id' | 'created_at'>): Promise<AssessmentMeasurement> {
    const area = Number(measurement.length_ft || 0) * Number(measurement.width_ft || 0);
    const newItem: AssessmentMeasurement = {
      ...measurement,
      id: generateUUID(),
      length_ft: Number(measurement.length_ft) || 0,
      width_ft: Number(measurement.width_ft) || 0,
      area_sqft: area,
      notes: measurement.notes || '',
      created_at: new Date().toISOString(),
    };

    const list = getLocal<AssessmentMeasurement>(STORAGE_KEYS.MEASUREMENTS);
    setLocal(STORAGE_KEYS.MEASUREMENTS, [...list, newItem]);

    try {
      const { data, error } = await supabase.from('assessment_measurements').insert([newItem]).select().single();
      if (!error && data) {
        const updatedList = [...list.filter(m => m.id !== data.id), data as AssessmentMeasurement];
        setLocal(STORAGE_KEYS.MEASUREMENTS, updatedList);
        return data as AssessmentMeasurement;
      }
      if (error) console.error('Supabase measurement insert failed:', error.message);
    } catch (e) {
      console.warn('Supabase measurement sync skipped', e);
    }

    return newItem;
  },

  async deleteMeasurement(id: string): Promise<void> {
    const list = getLocal<AssessmentMeasurement>(STORAGE_KEYS.MEASUREMENTS).filter(m => m.id !== id);
    setLocal(STORAGE_KEYS.MEASUREMENTS, list);

    try {
      const { error } = await supabase.from('assessment_measurements').delete().eq('id', id);
      if (error) console.error('Supabase measurement delete failed:', error.message);
    } catch (e) {
      console.warn('Supabase measurement delete skipped', e);
    }
  },

  async updateMeasurement(id: string, updates: Partial<AssessmentMeasurement>): Promise<void> {
    const list = getLocal<AssessmentMeasurement>(STORAGE_KEYS.MEASUREMENTS);
    const existing = list.find(m => m.id === id);
    const length_ft = updates.length_ft !== undefined ? Number(updates.length_ft) : (existing?.length_ft || 0);
    const width_ft = updates.width_ft !== undefined ? Number(updates.width_ft) : (existing?.width_ft || 0);
    const area_sqft = updates.area_sqft !== undefined ? Number(updates.area_sqft) : (length_ft * width_ft);

    const updatedItem = {
      ...updates,
      length_ft,
      width_ft,
      area_sqft,
    };

    const updated = list.map(m => m.id === id ? { ...m, ...updatedItem } : m);
    setLocal(STORAGE_KEYS.MEASUREMENTS, updated);

    try {
      const { error } = await supabase.from('assessment_measurements').update(updatedItem).eq('id', id);
      if (error) console.error('Supabase updateMeasurement failed:', error.message);
    } catch (e) {
      console.warn('Supabase update measurement skipped', e);
    }
  },

  async recalcAssessmentTotal(assessmentId: string): Promise<number> {
    const measurements = await this.getMeasurements(assessmentId);
    const total = measurements.reduce((sum, m) => sum + Number(m.area_sqft || 0), 0);
    await this.updateAssessment(assessmentId, { total_sqft: total });
    return total;
  },

  // ---- INSPECTION & MAINTENANCE ----
  async getMaintenanceSchedules(projectId?: string): Promise<MaintenanceSchedule[]> {
    try {
      let query = supabase.from('maintenance_schedules').select('*').order('scheduled_date', { ascending: true });
      if (projectId) query = query.eq('project_id', projectId);
      const response = await withTimeout(query as any, 5000);
      const { data, error } = response || {};
      if (!error && data) {
        if (!projectId) {
          setLocal(STORAGE_KEYS.MAINTENANCE, data as MaintenanceSchedule[]);
        }
        return data as MaintenanceSchedule[];
      }
      if (error) console.warn('Supabase getMaintenanceSchedules error:', error.message);
    } catch {
      // Fallback
    }
    const all = getLocal<MaintenanceSchedule>(STORAGE_KEYS.MAINTENANCE);
    return projectId ? all.filter(m => m.project_id === projectId) : all;
  },

  async createMaintenanceSchedule(schedule: Omit<MaintenanceSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<MaintenanceSchedule> {
    const newItem: MaintenanceSchedule = {
      ...schedule,
      id: generateUUID(),
      client_name: schedule.client_name || '',
      location: schedule.location || '',
      title: schedule.title || 'General Maintenance',
      type: schedule.type || 'Maintenance',
      scheduled_date: schedule.scheduled_date || new Date().toISOString().split('T')[0],
      scheduled_time: schedule.scheduled_time || '',
      assigned_to: schedule.assigned_to || '',
      status: schedule.status || 'Scheduled',
      recurrence: schedule.recurrence || 'Once',
      notes: schedule.notes || '',
      completion_notes: schedule.completion_notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const list = getLocal<MaintenanceSchedule>(STORAGE_KEYS.MAINTENANCE);
    setLocal(STORAGE_KEYS.MAINTENANCE, [newItem, ...list]);

    try {
      const { data, error } = await supabase.from('maintenance_schedules').insert([newItem]).select().single();
      if (!error && data) {
        const updatedList = [data as MaintenanceSchedule, ...list.filter(m => m.id !== data.id)];
        setLocal(STORAGE_KEYS.MAINTENANCE, updatedList);
        return data as MaintenanceSchedule;
      }
      if (error) console.error('Supabase maintenance insert failed:', error.message);
    } catch (e) {
      console.error('Supabase maintenance sync exception:', e);
    }

    return newItem;
  },

  async updateMaintenanceSchedule(id: string, updates: Partial<MaintenanceSchedule>): Promise<void> {
    const list = getLocal<MaintenanceSchedule>(STORAGE_KEYS.MAINTENANCE);
    const updated = list.map(m => m.id === id ? { ...m, ...updates, updated_at: new Date().toISOString() } : m);
    setLocal(STORAGE_KEYS.MAINTENANCE, updated);

    try {
      const { error } = await supabase.from('maintenance_schedules').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) console.error('Supabase maintenance update failed:', error.message);
    } catch (e) {
      console.warn('Supabase maintenance update skipped', e);
    }
  },

  async deleteMaintenanceSchedule(id: string): Promise<void> {
    const list = getLocal<MaintenanceSchedule>(STORAGE_KEYS.MAINTENANCE).filter(m => m.id !== id);
    setLocal(STORAGE_KEYS.MAINTENANCE, list);

    try {
      const { error } = await supabase.from('maintenance_schedules').delete().eq('id', id);
      if (error) console.error('Supabase maintenance delete failed:', error.message);
    } catch (e) {
      console.warn('Supabase maintenance delete skipped', e);
    }
  },
};
