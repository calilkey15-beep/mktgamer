import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL e Anon Key são obrigatórios');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface User {
  id: string;
  auth_user_id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'premium';
  plan_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  cpf?: string;
  phone: string;
  whatsapp?: string;
  address: string;
  photos: string[];
  documents: string[];
  created_at: string;
  updated_at: string;
}

export interface Loan {
  id: string;
  client_id: string;
  user_id: string;
  amount: number;
  interest_rate: number;
  total_amount: number;
  due_date: string;
  status: 'active' | 'paid' | 'overdue';
  notes?: string;
  contract_url?: string;
  created_at: string;
  updated_at: string;
  client?: Client;
  total_paid?: number;
  remaining?: number;
  days_overdue?: number;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  plan: 'pro' | 'premium';
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  payment_method?: string;
  payment_id?: string;
  created_at: string;
  updated_at: string;
}

// Plan limits
export const PLAN_LIMITS = {
  free: {
    clients: 2,
    loans: 3,
    features: {
      export: false,
      whatsapp: false,
      contracts: false,
      multiuser: false,
    }
  },
  pro: {
    clients: 50,
    loans: 100,
    features: {
      export: true,
      whatsapp: 'manual',
      contracts: false,
      multiuser: false,
    }
  },
  premium: {
    clients: Infinity,
    loans: Infinity,
    features: {
      export: true,
      whatsapp: 'auto',
      contracts: true,
      multiuser: true,
    }
  }
};

// Auth functions
export const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });
  
  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();
    
  if (error) throw error;
  return data;
};

// Client functions
export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
};

export const createClient = async (clientData: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Client> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');
  
  // Check plan limits
  const clients = await getClients();
  const limit = PLAN_LIMITS[user.plan].clients;
  
  if (clients.length >= limit) {
    throw new Error(`Limite de ${limit} clientes atingido para o plano ${user.plan.toUpperCase()}`);
  }
  
  const { data, error } = await supabase
    .from('clients')
    .insert({
      ...clientData,
      user_id: user.id
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const updateClient = async (id: string, updates: Partial<Client>): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
};

// Loan functions
export const getLoans = async (): Promise<Loan[]> => {
  const { data, error } = await supabase
    .from('loans')
    .select(`
      *,
      client:clients(*)
    `)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  // Calculate additional fields
  const loansWithCalculations = await Promise.all((data || []).map(async (loan) => {
    const { data: payments } = await supabase
      .from('loan_payments')
      .select('amount')
      .eq('loan_id', loan.id);
      
    const totalPaid = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const remaining = Number(loan.total_amount) - totalPaid;
    
    // Calculate days overdue
    const today = new Date();
    const dueDate = new Date(loan.due_date);
    const daysOverdue = loan.status === 'overdue' ? 
      Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    return {
      ...loan,
      total_paid: totalPaid,
      remaining,
      days_overdue: daysOverdue
    };
  }));
  
  return loansWithCalculations;
};

export const createLoan = async (loanData: {
  client_id: string;
  amount: number;
  interest_rate: number;
  due_date: string;
  notes?: string;
}): Promise<Loan> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');
  
  // Check plan limits
  const loans = await getLoans();
  const limit = PLAN_LIMITS[user.plan].loans;
  
  if (loans.length >= limit) {
    throw new Error(`Limite de ${limit} empréstimos atingido para o plano ${user.plan.toUpperCase()}`);
  }
  
  const totalAmount = loanData.amount * (1 + loanData.interest_rate / 100);
  
  const { data, error } = await supabase
    .from('loans')
    .insert({
      ...loanData,
      user_id: user.id,
      total_amount: totalAmount,
      status: 'active'
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const updateLoanStatus = async (id: string, status: 'active' | 'paid' | 'overdue'): Promise<void> => {
  const { error } = await supabase
    .from('loans')
    .update({ status })
    .eq('id', id);
    
  if (error) throw error;
};

export const addLoanPayment = async (loanId: string, amount: number, notes?: string): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');
  
  const { error } = await supabase
    .from('loan_payments')
    .insert({
      loan_id: loanId,
      user_id: user.id,
      amount,
      notes
    });
    
  if (error) throw error;
  
  // Check if loan is fully paid
  const { data: loan } = await supabase
    .from('loans')
    .select('total_amount')
    .eq('id', loanId)
    .single();
    
  if (loan) {
    const { data: payments } = await supabase
      .from('loan_payments')
      .select('amount')
      .eq('loan_id', loanId);
      
    const totalPaid = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    
    if (totalPaid >= Number(loan.total_amount)) {
      await updateLoanStatus(loanId, 'paid');
    }
  }
};

// Payment functions
export const createSubscriptionPayment = async (plan: 'pro' | 'premium', paymentMethod: string): Promise<Payment> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');
  
  const amounts = { pro: 25.00, premium: 50.00 };
  
  const { data, error } = await supabase
    .from('payments')
    .insert({
      user_id: user.id,
      amount: amounts[plan],
      plan,
      payment_method: paymentMethod,
      status: 'pending'
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const updateUserPlan = async (plan: 'free' | 'pro' | 'premium'): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');
  
  const planExpiresAt = plan === 'free' ? null : 
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  
  const { error } = await supabase
    .from('users')
    .update({ 
      plan,
      plan_expires_at: planExpiresAt
    })
    .eq('id', user.id);
    
  if (error) throw error;
};

// File upload functions
export const uploadFile = async (file: File, bucket: string, path: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);
    
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
    
  return publicUrl;
};

// Dashboard stats
export const getDashboardStats = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');
  
  const [clients, loans] = await Promise.all([
    getClients(),
    getLoans()
  ]);
  
  const totalLoaned = loans.reduce((sum, loan) => sum + Number(loan.amount), 0);
  const totalReceived = loans.reduce((sum, loan) => sum + (loan.total_paid || 0), 0);
  const totalPending = loans.reduce((sum, loan) => sum + (loan.remaining || 0), 0);
  
  const activeLoans = loans.filter(l => l.status === 'active').length;
  const paidLoans = loans.filter(l => l.status === 'paid').length;
  const overdueLoans = loans.filter(l => l.status === 'overdue').length;
  
  return {
    totalClients: clients.length,
    totalLoans: loans.length,
    activeLoans,
    paidLoans,
    overdueLoans,
    totalLoaned,
    totalReceived,
    totalPending,
    netProfit: totalReceived - totalLoaned
  };
};