/*
  # Sistema de Gestão de Empréstimos - Schema Inicial

  1. Tabelas Principais
    - `users` - Usuários do sistema (admin, superadmin)
    - `clients` - Clientes que fazem empréstimos
    - `loans` - Empréstimos e penhoras
    - `payments` - Pagamentos dos empréstimos
    - `client_documents` - Documentos dos clientes
    - `loan_documents` - Documentos dos empréstimos
    - `notifications` - Notificações do sistema
    - `system_settings` - Configurações do sistema

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas baseadas em autenticação
    - Apenas usuários autenticados podem acessar
*/

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários do sistema
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'manager', 'user')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cpf text,
  rg text,
  phone text NOT NULL,
  whatsapp text,
  address text NOT NULL,
  observations text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de empréstimos
CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'loan' CHECK (type IN ('loan', 'pawn')),
  amount decimal(10,2) NOT NULL,
  interest_rate decimal(5,2) NOT NULL,
  loan_date date NOT NULL,
  due_date date NOT NULL,
  installments integer NOT NULL DEFAULT 1,
  installment_amount decimal(10,2) NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paid', 'overdue')),
  daily_interest_rate decimal(5,2) DEFAULT 0.1,
  late_fee_percentage decimal(5,2) DEFAULT 2.0,
  contract_generated boolean DEFAULT false,
  contract_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid REFERENCES loans(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  payment_date timestamptz NOT NULL DEFAULT now(),
  installment_number integer NOT NULL DEFAULT 1,
  late_fee decimal(10,2) DEFAULT 0,
  daily_interest decimal(10,2) DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Tabela de documentos dos clientes
CREATE TABLE IF NOT EXISTS client_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('identity', 'address_proof', 'property_photo', 'contract', 'other')),
  name text NOT NULL,
  url text NOT NULL,
  size bigint NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);

-- Tabela de documentos dos empréstimos
CREATE TABLE IF NOT EXISTS loan_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid REFERENCES loans(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('contract', 'collateral_photo', 'other')),
  name text NOT NULL,
  url text NOT NULL,
  size bigint NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  loan_id uuid REFERENCES loans(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('due_reminder', 'overdue_alert', 'payment_confirmation')),
  message text NOT NULL,
  sent_via text CHECK (sent_via IN ('whatsapp', 'email', 'sms')),
  sent_at timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Inserir usuário superadmin padrão
INSERT INTO users (email, name, role) VALUES 
('admin@sistema.com', 'Super Administrador', 'superadmin')
ON CONFLICT (email) DO NOTHING;

-- Inserir configurações padrão
INSERT INTO system_settings (key, value) VALUES 
('company_info', '{"name": "Sistema de Empréstimos", "cnpj": "", "address": ""}'),
('default_rates', '{"interest_rate": 30, "daily_interest_rate": 0.1, "late_fee_percentage": 2}'),
('notifications', '{"whatsapp_enabled": true, "email_enabled": true, "reminder_days": 3}'),
('contract_settings', '{"auto_generation": true, "terms": "Termos padrão do contrato"}')
ON CONFLICT (key) DO NOTHING;

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can read own data" ON users FOR SELECT TO authenticated USING (auth.email() = email);
CREATE POLICY "Superadmin can manage users" ON users FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE email = auth.email() AND role = 'superadmin')
);

CREATE POLICY "Authenticated users can manage clients" ON clients FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage loans" ON loans FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage payments" ON payments FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage client documents" ON client_documents FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage loan documents" ON loan_documents FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage notifications" ON notifications FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can read settings" ON system_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Superadmin can manage settings" ON system_settings FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE email = auth.email() AND role = 'superadmin')
);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();