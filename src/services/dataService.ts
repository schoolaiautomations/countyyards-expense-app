import { supabase } from './supabase';
import { 
  Project, 
  Expense, 
  Salary, 
  ClientPayment, 
  ProjectPhoto, 
  ProjectDocument 
} from '../types';

const STORAGE_KEYS = {
  PROJECTS: 'cy_projects_prod',
  EXPENSES: 'cy_expenses_prod',
  SALARIES: 'cy_salaries_prod',
  CLIENT_PAYMENTS: 'cy_payments_prod',
  PHOTOS: 'cy_photos_prod',
  DOCUMENTS: 'cy_documents_prod',
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
    localStorage.removeItem(STORAGE_KEYS.PHOTOS);
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
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
const getLocal = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setLocal = <T>(key: string, data: T[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
};

// ==========================================
// DATA SERVICE API
// ==========================================
export const dataService = {
  // ---- PROJECTS ----
  async getProjects(): Promise<Project[]> {
    try {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setLocal(STORAGE_KEYS.PROJECTS, data as Project[]);
        return data as Project[];
      }
      if (error) {
        console.warn('Supabase getProjects error:', error.message);
      }
    } catch (e) {
      console.warn('Supabase table not created yet or network issue', e);
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

    // Save locally
    const list = getLocal<Project>(STORAGE_KEYS.PROJECTS);
    setLocal(STORAGE_KEYS.PROJECTS, [newProject, ...list]);

    // Save to Supabase
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

    const photos = getLocal<ProjectPhoto>(STORAGE_KEYS.PHOTOS).filter(p => p.project_id !== id);
    setLocal(STORAGE_KEYS.PHOTOS, photos);

    const docs = getLocal<ProjectDocument>(STORAGE_KEYS.DOCUMENTS).filter(d => d.project_id !== id);
    setLocal(STORAGE_KEYS.DOCUMENTS, docs);

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
      const { data, error } = await query;
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
      const { data, error } = await query;
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
      const { data, error } = await query;
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

  // ---- PHOTOS (GALLERY) ----
  async getPhotos(projectId?: string): Promise<ProjectPhoto[]> {
    try {
      let query = supabase.from('project_photos').select('*').order('date', { ascending: false });
      if (projectId) query = query.eq('project_id', projectId);
      const { data, error } = await query;
      if (!error && data) {
        if (!projectId) {
          setLocal(STORAGE_KEYS.PHOTOS, data as ProjectPhoto[]);
        }
        return data as ProjectPhoto[];
      }
      if (error) {
        console.warn('Supabase getPhotos error:', error.message);
      }
    } catch {
      // Fallback
    }
    const all = getLocal<ProjectPhoto>(STORAGE_KEYS.PHOTOS);
    return projectId ? all.filter(p => p.project_id === projectId) : all;
  },

  async addPhoto(photo: Omit<ProjectPhoto, 'id' | 'created_at'>): Promise<ProjectPhoto> {
    const newPhoto: ProjectPhoto = {
      ...photo,
      id: generateUUID(),
      description: photo.description || '',
      created_at: new Date().toISOString(),
    };

    const list = getLocal<ProjectPhoto>(STORAGE_KEYS.PHOTOS);
    setLocal(STORAGE_KEYS.PHOTOS, [newPhoto, ...list]);

    try {
      const { data, error } = await supabase.from('project_photos').insert([newPhoto]).select().single();
      if (!error && data) {
        const updatedList = [data as ProjectPhoto, ...list.filter(p => p.id !== data.id)];
        setLocal(STORAGE_KEYS.PHOTOS, updatedList);
        return data as ProjectPhoto;
      }
      if (error) {
        console.error('Supabase photo insert failed:', error.message);
      }
    } catch (e) {
      console.warn('Supabase photo sync skipped', e);
    }

    return newPhoto;
  },

  async deletePhoto(id: string): Promise<void> {
    const list = getLocal<ProjectPhoto>(STORAGE_KEYS.PHOTOS).filter(p => p.id !== id);
    setLocal(STORAGE_KEYS.PHOTOS, list);

    try {
      const { error } = await supabase.from('project_photos').delete().eq('id', id);
      if (error) {
        console.error('Supabase photo delete failed:', error.message);
      }
    } catch (e) {
      console.warn('Supabase delete photo skipped', e);
    }
  },

  // ---- DOCUMENTS ----
  async getDocuments(projectId?: string): Promise<ProjectDocument[]> {
    try {
      let query = supabase.from('project_documents').select('*').order('uploaded_at', { ascending: false });
      if (projectId) query = query.eq('project_id', projectId);
      const { data, error } = await query;
      if (!error && data) {
        if (!projectId) {
          setLocal(STORAGE_KEYS.DOCUMENTS, data as ProjectDocument[]);
        }
        return data as ProjectDocument[];
      }
      if (error) {
        console.warn('Supabase getDocuments error:', error.message);
      }
    } catch {
      // Fallback
    }
    const all = getLocal<ProjectDocument>(STORAGE_KEYS.DOCUMENTS);
    return projectId ? all.filter(d => d.project_id === projectId) : all;
  },

  async addDocument(doc: Omit<ProjectDocument, 'id' | 'uploaded_at'>): Promise<ProjectDocument> {
    const newDoc: ProjectDocument = {
      ...doc,
      id: generateUUID(),
      file_size: Number(doc.file_size) || 0,
      file_type: doc.file_type || 'document',
      uploaded_at: new Date().toISOString(),
    };

    const list = getLocal<ProjectDocument>(STORAGE_KEYS.DOCUMENTS);
    setLocal(STORAGE_KEYS.DOCUMENTS, [newDoc, ...list]);

    try {
      const { data, error } = await supabase.from('project_documents').insert([newDoc]).select().single();
      if (!error && data) {
        const updatedList = [data as ProjectDocument, ...list.filter(d => d.id !== data.id)];
        setLocal(STORAGE_KEYS.DOCUMENTS, updatedList);
        return data as ProjectDocument;
      }
      if (error) {
        console.error('Supabase document insert failed:', error.message);
      }
    } catch (e) {
      console.warn('Supabase doc sync skipped', e);
    }

    return newDoc;
  },

  async deleteDocument(id: string): Promise<void> {
    const list = getLocal<ProjectDocument>(STORAGE_KEYS.DOCUMENTS).filter(d => d.id !== id);
    setLocal(STORAGE_KEYS.DOCUMENTS, list);

    try {
      const { error } = await supabase.from('project_documents').delete().eq('id', id);
      if (error) {
        console.error('Supabase document delete failed:', error.message);
      }
    } catch (e) {
      console.warn('Supabase delete document skipped', e);
    }
  },
};
