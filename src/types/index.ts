// =============================================
// TIPOS PARA PLATAFORMA SAAS MULTI-TENANT
// =============================================

export type SubscriptionPlan = 'trial' | 'monthly' | 'annual' | 'lifetime';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'suspended';
export type UserRole = 'super_admin' | 'tenant_admin' | 'tenant_manager' | 'tenant_user';
export type LoanStatus = 'active' | 'paid' | 'overdue' | 'cancelled';
export type LoanType = 'loan' | 'pawn';
export type NotificationType = 'due_reminder' | 'overdue_alert' | 'payment_confirmation';
export type NotificationChannel = 'whatsapp' | 'sms' | 'email' | 'push';
export type FileType = 'identity' | 'address_proof' | 'property_photo' | 'contract' | 'collateral_photo' | 'other';

// =============================================
// TENANT (Empresa que aluga a plataforma)
// =============================================
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  
  // Dados da empresa
  company_name: string;
  company_cnpj?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  
  // Configurações
  settings: Record<string, any>;
  branding: Record<string, any>;
  
  // Assinatura
  subscription_plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  subscription_starts_at: string;
  subscription_ends_at?: string;
  
  // Limites
  max_users: number;
  max_clients: number;
  max_storage_mb: number;
  
  // Controle
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================
// USUÁRIO DO TENANT
// =============================================
export interface TenantUser {
  id: string;
  tenant_id: string;
  tenant?: Tenant;
  
  // Auth
  auth_user_id: string;
  email: string;
  
  // Profile
  name: string;
  avatar_url?: string;
  role: UserRole;
  
  // Permissões
  permissions: Record<string, any>;
  
  // Status
  is_active: boolean;
  last_login_at?: string;
  
  created_at: string;
  updated_at: string;
}

// =============================================
// CLIENTE DO TENANT
// =============================================
export interface TenantClient {
  id: string;
  tenant_id: string;
  
  // Dados pessoais
  name: string;
  cpf_cnpj?: string;
  rg?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  
  // Endereço
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  
  // Informações adicionais
  observations?: string;
  credit_score?: number;
  
  // Relacionamentos
  loans?: TenantLoan[];
  files?: TenantFile[];
  
  // Controle
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// =============================================
// EMPRÉSTIMO
// =============================================
export interface TenantLoan {
  id: string;
  tenant_id: string;
  client_id: string;
  client?: TenantClient;
  
  // Dados do empréstimo
  type: LoanType;
  amount: number;
  interest_rate: number;
  
  // Datas
  loan_date: string;
  due_date: string;
  
  // Parcelas
  installments: number;
  installment_amount: number;
  total_amount: number;
  
  // Status
  status: LoanStatus;
  
  // Taxas de atraso
  daily_interest_rate: number;
  late_fee_percentage: number;
  
  // Contrato
  contract_generated: boolean;
  contract_url?: string;
  contract_signed_at?: string;
  
  // Garantias (penhoras)
  collateral_description?: string;
  collateral_value?: number;
  
  // Observações
  notes?: string;
  
  // Relacionamentos
  payments?: TenantPayment[];
  contracts?: TenantContract[];
  notifications?: TenantNotification[];
  files?: TenantFile[];
  
  // Controle
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// =============================================
// PAGAMENTO
// =============================================
export interface TenantPayment {
  id: string;
  tenant_id: string;
  loan_id: string;
  loan?: TenantLoan;
  
  // Dados do pagamento
  amount: number;
  payment_date: string;
  installment_number: number;
  
  // Taxas aplicadas
  late_fee: number;
  daily_interest: number;
  
  // Método
  payment_method?: string;
  notes?: string;
  
  // Controle
  created_by?: string;
  created_at: string;
}

// =============================================
// CONTRATO
// =============================================
export interface TenantContract {
  id: string;
  tenant_id: string;
  loan_id: string;
  loan?: TenantLoan;
  
  // Dados do contrato
  contract_number: string;
  template_used?: string;
  
  // Arquivo
  file_url: string;
  file_size?: number;
  
  // Assinatura digital
  signed: boolean;
  signed_at?: string;
  signature_data?: Record<string, any>;
  
  // Controle
  generated_by?: string;
  created_at: string;
}

// =============================================
// NOTIFICAÇÃO
// =============================================
export interface TenantNotification {
  id: string;
  tenant_id: string;
  client_id: string;
  loan_id: string;
  client?: TenantClient;
  loan?: TenantLoan;
  
  // Tipo e canal
  type: NotificationType;
  channel: NotificationChannel;
  
  // Conteúdo
  title: string;
  message: string;
  
  // Destinatário
  recipient_phone?: string;
  recipient_email?: string;
  
  // Status
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  failed_at?: string;
  error_message?: string;
  
  // Provedor
  provider_id?: string;
  provider_response?: Record<string, any>;
  
  // Controle
  created_by?: string;
  created_at: string;
}

// =============================================
// ARQUIVO
// =============================================
export interface TenantFile {
  id: string;
  tenant_id: string;
  
  // Relacionamentos opcionais
  client_id?: string;
  loan_id?: string;
  
  // Dados do arquivo
  type: FileType;
  name: string;
  original_name: string;
  mime_type: string;
  size: number;
  
  // Storage
  storage_path: string;
  public_url?: string;
  
  // Metadados
  metadata: Record<string, any>;
  
  // Controle
  uploaded_by?: string;
  created_at: string;
}

// =============================================
// PAGAMENTO DE ASSINATURA
// =============================================
export interface AdminPayment {
  id: string;
  tenant_id: string;
  tenant?: Tenant;
  
  // Dados do pagamento
  amount: number;
  plan: SubscriptionPlan;
  period_start: string;
  period_end: string;
  
  // Status
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  
  // Dados do pagamento
  payment_method?: string;
  payment_provider?: string;
  provider_payment_id?: string;
  provider_response?: Record<string, any>;
  
  // Datas
  paid_at?: string;
  due_date: string;
  
  created_at: string;
}

// =============================================
// LOG DE AUDITORIA
// =============================================
export interface SystemLog {
  id: string;
  tenant_id: string;
  user_id?: string;
  user?: TenantUser;
  
  // Ação
  action: string;
  resource_type: string;
  resource_id?: string;
  
  // Dados
  old_data?: Record<string, any>;
  new_data?: Record<string, any>;
  
  // Contexto
  ip_address?: string;
  user_agent?: string;
  
  created_at: string;
}

// =============================================
// CONFIGURAÇÃO DO SISTEMA
// =============================================
export interface SystemSettings {
  id: string;
  key: string;
  value: any;
  description?: string;
  is_public: boolean;
  updated_at: string;
}

// =============================================
// ESTATÍSTICAS DO DASHBOARD
// =============================================
export interface TenantDashboardStats {
  // Empréstimos
  total_loans: number;
  active_loans: number;
  overdue_loans: number;
  paid_loans: number;
  
  // Valores
  total_loaned: number;
  total_received: number;
  total_pending: number;
  net_profit: number;
  
  // Clientes
  total_clients: number;
  active_clients: number;
  
  // Vencimentos
  due_today: number;
  due_this_week: number;
  due_this_month: number;
  
  // Notificações
  notifications_sent_today: number;
  notifications_sent_this_month: number;
}

export interface AdminDashboardStats {
  // Tenants
  total_tenants: number;
  active_tenants: number;
  trial_tenants: number;
  
  // Receita
  monthly_revenue: number;
  annual_revenue: number;
  pending_payments: number;
  
  // Crescimento
  new_tenants_this_month: number;
  churn_rate: number;
  
  // Sistema
  total_users: number;
  total_loans: number;
  total_storage_used_gb: number;
}

// =============================================
// CONTEXTOS E HOOKS
// =============================================
export interface AuthContextType {
  user: TenantUser | null;
  tenant: Tenant | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchTenant: (tenantId: string) => Promise<boolean>;
}

export interface TenantContextType {
  tenant: Tenant | null;
  users: TenantUser[];
  settings: Record<string, any>;
  updateSettings: (settings: Record<string, any>) => Promise<void>;
  inviteUser: (email: string, role: UserRole) => Promise<void>;
}

// =============================================
// FORMULÁRIOS
// =============================================
export interface CreateTenantForm {
  name: string;
  slug: string;
  company_name: string;
  company_cnpj?: string;
  company_email: string;
  company_phone?: string;
  subscription_plan: SubscriptionPlan;
  admin_name: string;
  admin_email: string;
}

export interface CreateClientForm {
  name: string;
  cpf_cnpj?: string;
  rg?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  observations?: string;
}

export interface CreateLoanForm {
  client_id: string;
  type: LoanType;
  amount: number;
  interest_rate: number;
  loan_date: string;
  due_date: string;
  installments: number;
  collateral_description?: string;
  collateral_value?: number;
  notes?: string;
}

export interface CreatePaymentForm {
  loan_id: string;
  amount: number;
  payment_date: string;
  installment_number: number;
  payment_method?: string;
  notes?: string;
}

// =============================================
// FILTROS E PAGINAÇÃO
// =============================================
export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

export interface ClientFilters {
  search?: string;
  is_active?: boolean;
  has_active_loans?: boolean;
  created_after?: string;
  created_before?: string;
}

export interface LoanFilters {
  search?: string;
  status?: LoanStatus;
  type?: LoanType;
  client_id?: string;
  due_after?: string;
  due_before?: string;
  amount_min?: number;
  amount_max?: number;
}

export interface NotificationFilters {
  type?: NotificationType;
  channel?: NotificationChannel;
  sent?: boolean;
  failed?: boolean;
  date_after?: string;
  date_before?: string;
}

// =============================================
// RELATÓRIOS
// =============================================
export interface ReportParams {
  start_date: string;
  end_date: string;
  client_id?: string;
  loan_status?: LoanStatus;
  include_payments?: boolean;
  include_notifications?: boolean;
}

export interface LoanReport {
  loan: TenantLoan;
  client: TenantClient;
  payments: TenantPayment[];
  total_paid: number;
  remaining_amount: number;
  days_overdue: number;
  overdue_fees: number;
}

export interface ClientReport {
  client: TenantClient;
  loans: TenantLoan[];
  total_loaned: number;
  total_paid: number;
  active_loans: number;
  overdue_loans: number;
}

export interface FinancialReport {
  period: {
    start: string;
    end: string;
  };
  summary: {
    total_loaned: number;
    total_received: number;
    net_profit: number;
    profit_margin: number;
  };
  by_month: Array<{
    month: string;
    loaned: number;
    received: number;
    profit: number;
  }>;
  by_client: ClientReport[];
  overdue_analysis: {
    total_overdue: number;
    overdue_amount: number;
    average_days_overdue: number;
  };
}