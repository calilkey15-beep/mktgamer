/*
  # Schema Multi-tenant Completo para Plataforma SaaS de Empréstimos

  1. Tabelas Principais
    - tenants (empresas que alugam a plataforma)
    - tenant_users (usuários de cada tenant)
    - tenant_clients (clientes de cada tenant)
    - tenant_loans (empréstimos)
    - tenant_payments (pagamentos)
    - tenant_contracts (contratos)
    - tenant_notifications (notificações)
    - tenant_files (arquivos/documentos)
    - admin_payments (pagamentos de assinatura)
    - system_logs (logs de auditoria)
    - system_settings (configurações globais)

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de isolamento por tenant
    - Controle de acesso por role

  3. Funcionalidades
    - Multi-tenant com isolamento completo
    - Sistema de assinaturas
    - Controle de permissões
    - Logs de auditoria
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE subscription_plan AS ENUM ('trial', 'monthly', 'annual', 'lifetime');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'suspended');
CREATE TYPE user_role AS ENUM ('super_admin', 'tenant_admin', 'tenant_manager', 'tenant_user');
CREATE TYPE loan_status AS ENUM ('active', 'paid', 'overdue', 'cancelled');
CREATE TYPE loan_type AS ENUM ('loan', 'pawn');
CREATE TYPE notification_type AS ENUM ('due_reminder', 'overdue_alert', 'payment_confirmation');
CREATE TYPE notification_channel AS ENUM ('whatsapp', 'sms', 'email', 'push');
CREATE TYPE file_type AS ENUM ('identity', 'address_proof', 'property_photo', 'contract', 'collateral_photo', 'other');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- =============================================
-- TENANTS (Empresas que alugam a plataforma)
-- =============================================
CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  domain text UNIQUE,
  
  -- Dados da empresa
  company_name text NOT NULL,
  company_cnpj text,
  company_address text,
  company_phone text,
  company_email text,
  
  -- Configurações
  settings jsonb DEFAULT '{}',
  branding jsonb DEFAULT '{}',
  
  -- Assinatura
  subscription_plan subscription_plan DEFAULT 'trial',
  subscription_status subscription_status DEFAULT 'active',
  subscription_starts_at timestamptz DEFAULT now(),
  subscription_ends_at timestamptz,
  
  -- Limites
  max_users integer DEFAULT 5,
  max_clients integer DEFAULT 1000,
  max_storage_mb integer DEFAULT 1000,
  
  -- Controle
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS para tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Políticas para tenants
CREATE POLICY "Super admins can manage all tenants"
  ON tenants FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users 
      WHERE auth_user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Tenant admins can read own tenant"
  ON tenants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users 
      WHERE auth_user_id = auth.uid() 
      AND tenant_id = tenants.id
      AND role IN ('tenant_admin', 'tenant_manager')
    )
  );

-- =============================================
-- TENANT USERS (Usuários de cada tenant)
-- =============================================
CREATE TABLE tenant_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Auth
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  
  -- Profile
  name text NOT NULL,
  avatar_url text,
  role user_role DEFAULT 'tenant_user',
  
  -- Permissões
  permissions jsonb DEFAULT '{}',
  
  -- Status
  is_active boolean DEFAULT true,
  last_login_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(tenant_id, email),
  UNIQUE(auth_user_id)
);

-- RLS para tenant_users
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;

-- Políticas para tenant_users
CREATE POLICY "Users can read own profile"
  ON tenant_users FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON tenant_users FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Tenant admins can manage tenant users"
  ON tenant_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users tu 
      WHERE tu.auth_user_id = auth.uid() 
      AND tu.tenant_id = tenant_users.tenant_id
      AND tu.role IN ('tenant_admin', 'tenant_manager')
    )
  );

CREATE POLICY "Super admins can manage all users"
  ON tenant_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users 
      WHERE auth_user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- =============================================
-- TENANT CLIENTS (Clientes de cada tenant)
-- =============================================
CREATE TABLE tenant_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Dados pessoais
  name text NOT NULL,
  cpf_cnpj text,
  rg text,
  phone text NOT NULL,
  whatsapp text,
  email text,
  
  -- Endereço
  address text NOT NULL,
  city text,
  state text,
  zip_code text,
  
  -- Informações adicionais
  observations text,
  credit_score integer,
  
  -- Controle
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS para tenant_clients
ALTER TABLE tenant_clients ENABLE ROW LEVEL SECURITY;

-- Políticas para tenant_clients
CREATE POLICY "Tenant users can manage own tenant clients"
  ON tenant_clients FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users 
      WHERE auth_user_id = auth.uid() 
      AND tenant_id = tenant_clients.tenant_id
    )
  );

-- =============================================
-- TENANT LOANS (Empréstimos)
-- =============================================
CREATE TABLE tenant_loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  client_id uuid REFERENCES tenant_clients(id) ON DELETE CASCADE,
  
  -- Dados do empréstimo
  type loan_type DEFAULT 'loan',
  amount numeric(12,2) NOT NULL,
  interest_rate numeric(5,2) NOT NULL,
  
  -- Datas
  loan_date date NOT NULL,
  due_date date NOT NULL,
  
  -- Parcelas
  installments integer DEFAULT 1,
  installment_amount numeric(12,2) NOT NULL,
  total_amount numeric(12,2) NOT NULL,
  
  -- Status
  status loan_status DEFAULT 'active',
  
  -- Taxas de atraso
  daily_interest_rate numeric(5,2) DEFAULT 0.1,
  late_fee_percentage numeric(5,2) DEFAULT 2.0,
  
  -- Contrato
  contract_generated boolean DEFAULT false,
  contract_url text,
  contract_signed_at timestamptz,
  
  -- Garantias (penhoras)
  collateral_description text,
  collateral_value numeric(12,2),
  
  -- Observações
  notes text,
  
  -- Controle
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS para tenant_loans
ALTER TABLE tenant_loans ENABLE ROW LEVEL SECURITY;

-- Políticas para tenant_loans
CREATE POLICY "Tenant users can manage own tenant loans"
  ON tenant_loans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users 
      WHERE auth_user_id = auth.uid() 
      AND tenant_id = tenant_loans.tenant_id
    )
  );

-- =============================================
-- TENANT PAYMENTS (Pagamentos)
-- =============================================
CREATE TABLE tenant_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  loan_id uuid REFERENCES tenant_loans(id) ON DELETE CASCADE,
  
  -- Dados do pagamento
  amount numeric(12,2) NOT NULL,
  payment_date timestamptz DEFAULT now(),
  installment_number integer DEFAULT 1,
  
  -- Taxas aplicadas
  late_fee numeric(12,2) DEFAULT 0,
  daily_interest numeric(12,2) DEFAULT 0,
  
  -- Método
  payment_method text,
  notes text,
  
  -- Controle
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- RLS para tenant_payments
ALTER TABLE tenant_payments ENABLE ROW LEVEL SECURITY;

-- Políticas para tenant_payments
CREATE POLICY "Tenant users can manage own tenant payments"
  ON tenant_payments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users 
      WHERE auth_user_id = auth.uid() 
      AND tenant_id = tenant_payments.tenant_id
    )
  );

-- =============================================
-- TENANT CONTRACTS (Contratos)
-- =============================================
CREATE TABLE tenant_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  loan_id uuid REFERENCES tenant_loans(id) ON DELETE CASCADE,
  
  -- Dados do contrato
  contract_number text NOT NULL,
  template_used text,
  
  -- Arquivo
  file_url text NOT NULL,
  file_size bigint,
  
  -- Assinatura digital
  signed boolean DEFAULT false,
  signed_at timestamptz,
  signature_data jsonb,
  
  -- Controle
  generated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- RLS para tenant_contracts
ALTER TABLE tenant_contracts ENABLE ROW LEVEL SECURITY;

-- Políticas para tenant_contracts
CREATE POLICY "Tenant users can manage own tenant contracts"
  ON tenant_contracts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users 
      WHERE auth_user_id = auth.uid() 
      AND tenant_id = tenant_contracts.tenant_id
    )
  );

-- =============================================
-- TENANT NOTIFICATIONS (Notificações)
-- =============================================
CREATE TABLE tenant_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  client_id uuid REFERENCES tenant_clients(id) ON DELETE CASCADE,
  loan_id uuid REFERENCES tenant_loans(id) ON DELETE CASCADE,
  
  -- Tipo e canal
  type notification_type NOT NULL,
  channel notification_channel NOT NULL,
  
  -- Conteúdo
  title text NOT NULL,
  message text NOT NULL,
  
  -- Destinatário
  recipient_phone text,
  recipient_email text,
  
  -- Status
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  failed_at timestamptz,
  error_message text,
  
  -- Provedor
  provider_id text,
  provider_response jsonb,
  
  -- Controle
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- RLS para tenant_notifications
ALTER TABLE tenant_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para tenant_notifications
CREATE POLICY "Tenant users can manage own tenant notifications"
  ON tenant_notifications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users 
      WHERE auth_user_id = auth.uid() 
      AND tenant_id = tenant_notifications.tenant_id
    )
  );

-- =============================================
-- TENANT FILES (Arquivos/Documentos)
-- =============================================
CREATE TABLE tenant_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Relacionamentos opcionais
  client_id uuid REFERENCES tenant_clients(id) ON DELETE CASCADE,
  loan_id uuid REFERENCES tenant_loans(id) ON DELETE CASCADE,
  
  -- Dados do arquivo
  type file_type NOT NULL,
  name text NOT NULL,
  original_name text NOT NULL,
  mime_type text NOT NULL,
  size bigint NOT NULL,
  
  -- Storage
  storage_path text NOT NULL,
  public_url text,
  
  -- Metadados
  metadata jsonb DEFAULT '{}',
  
  -- Controle
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- RLS para tenant_files
ALTER TABLE tenant_files ENABLE ROW LEVEL SECURITY;

-- Políticas para tenant_files
CREATE POLICY "Tenant users can manage own tenant files"
  ON tenant_files FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users 
      WHERE auth_user_id = auth.uid() 
      AND tenant_id = tenant_files.tenant_id
    )
  );

-- =============================================
-- ADMIN PAYMENTS (Pagamentos de assinatura)
-- =============================================
CREATE TABLE admin_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Dados do pagamento
  amount numeric(10,2) NOT NULL,
  plan subscription_plan NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  
  -- Status
  status payment_status DEFAULT 'pending',
  
  -- Dados do pagamento
  payment_method text,
  payment_provider text,
  provider_payment_id text,
  provider_response jsonb,
  
  -- Datas
  paid_at timestamptz,
  due_date date NOT NULL,
  
  created_at timestamptz DEFAULT now()
);

-- RLS para admin_payments
ALTER TABLE admin_payments ENABLE ROW LEVEL SECURITY;

-- Políticas para admin_payments
CREATE POLICY "Super admins can manage all payments"
  ON admin_payments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users 
      WHERE auth_user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Tenant admins can read own payments"
  ON admin_payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users 
      WHERE auth_user_id = auth.uid() 
      AND tenant_id = admin_payments.tenant_id
      AND role = 'tenant_admin'
    )
  );

-- =============================================
-- SYSTEM LOGS (Logs de auditoria)
-- =============================================
CREATE TABLE system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Ação
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  
  -- Dados
  old_data jsonb,
  new_data jsonb,
  
  -- Contexto
  ip_address inet,
  user_agent text,
  
  created_at timestamptz DEFAULT now()
);

-- RLS para system_logs
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para system_logs
CREATE POLICY "Super admins can read all logs"
  ON system_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users 
      WHERE auth_user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Tenant admins can read own tenant logs"
  ON system_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users 
      WHERE auth_user_id = auth.uid() 
      AND tenant_id = system_logs.tenant_id
      AND role IN ('tenant_admin', 'tenant_manager')
    )
  );

-- =============================================
-- SYSTEM SETTINGS (Configurações globais)
-- =============================================
CREATE TABLE system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- RLS para system_settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para system_settings
CREATE POLICY "Super admins can manage all settings"
  ON system_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users 
      WHERE auth_user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "All users can read public settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (is_public = true);

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenant_users_updated_at BEFORE UPDATE ON tenant_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenant_clients_updated_at BEFORE UPDATE ON tenant_clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenant_loans_updated_at BEFORE UPDATE ON tenant_loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_subscription_status ON tenants(subscription_status);
CREATE INDEX idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX idx_tenant_users_auth_user_id ON tenant_users(auth_user_id);
CREATE INDEX idx_tenant_users_email ON tenant_users(email);
CREATE INDEX idx_tenant_clients_tenant_id ON tenant_clients(tenant_id);
CREATE INDEX idx_tenant_clients_phone ON tenant_clients(phone);
CREATE INDEX idx_tenant_loans_tenant_id ON tenant_loans(tenant_id);
CREATE INDEX idx_tenant_loans_client_id ON tenant_loans(client_id);
CREATE INDEX idx_tenant_loans_status ON tenant_loans(status);
CREATE INDEX idx_tenant_loans_due_date ON tenant_loans(due_date);
CREATE INDEX idx_tenant_payments_tenant_id ON tenant_payments(tenant_id);
CREATE INDEX idx_tenant_payments_loan_id ON tenant_payments(loan_id);
CREATE INDEX idx_tenant_notifications_tenant_id ON tenant_notifications(tenant_id);
CREATE INDEX idx_tenant_files_tenant_id ON tenant_files(tenant_id);
CREATE INDEX idx_system_logs_tenant_id ON system_logs(tenant_id);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);

-- =============================================
-- FUNÇÃO PARA CRIAR SUPER ADMIN
-- =============================================
CREATE OR REPLACE FUNCTION create_super_admin(
  admin_email text,
  admin_password text,
  admin_name text DEFAULT 'Super Admin'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Criar usuário no auth.users (simulado - na prática seria via Supabase Auth)
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
  ) VALUES (
    gen_random_uuid(),
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    jsonb_build_object('name', admin_name, 'role', 'super_admin')
  )
  RETURNING id INTO admin_user_id;
  
  -- Criar perfil de super admin
  INSERT INTO tenant_users (
    auth_user_id,
    email,
    name,
    role,
    is_active
  ) VALUES (
    admin_user_id,
    admin_email,
    admin_name,
    'super_admin',
    true
  );
  
  RETURN admin_user_id;
END;
$$;

-- =============================================
-- DADOS INICIAIS
-- =============================================

-- Configurações do sistema
INSERT INTO system_settings (key, value, description, is_public) VALUES
('app_name', '"LoanSaaS Platform"', 'Nome da aplicação', true),
('app_version', '"1.0.0"', 'Versão da aplicação', true),
('maintenance_mode', 'false', 'Modo de manutenção', false),
('max_file_size_mb', '10', 'Tamanho máximo de arquivo em MB', false),
('supported_file_types', '["image/jpeg", "image/png", "application/pdf", "application/msword"]', 'Tipos de arquivo suportados', false),
('whatsapp_api_enabled', 'false', 'API WhatsApp habilitada', false),
('sms_api_enabled', 'false', 'API SMS habilitada', false),
('email_notifications_enabled', 'true', 'Notificações por email habilitadas', false);

-- Criar super admin padrão
-- SELECT create_super_admin('admin@loansaas.com', 'admin123', 'Super Administrador');