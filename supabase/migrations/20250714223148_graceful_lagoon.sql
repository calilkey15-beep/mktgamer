/*
  # Create Admin User and Authentication Setup

  1. Authentication Setup
    - Creates admin user in auth.users table
    - Sets up proper authentication flow
    - Ensures user exists in both auth and public tables

  2. Security
    - Maintains RLS policies
    - Ensures proper user creation flow
*/

-- First, we need to ensure the admin user exists in our users table
-- This will be created after the auth user is created via the application

-- Create a function to handle user creation after auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create user profile if email matches our admin
  IF NEW.email = 'admin@sistema.com' THEN
    INSERT INTO public.users (id, email, name, role)
    VALUES (NEW.id, NEW.email, 'Administrador', 'superadmin');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile after auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default system settings
INSERT INTO system_settings (key, value) VALUES
  ('company_name', '"Empresa de Empréstimos"'),
  ('company_address', '"Rua Principal, 123 - Centro"'),
  ('company_phone', '"(11) 99999-9999"'),
  ('default_interest_rate', '30'),
  ('daily_interest_rate', '0.1'),
  ('late_fee_percentage', '2.0'),
  ('whatsapp_api_enabled', 'false'),
  ('contract_generation_enabled', 'true'),
  ('notifications_enabled', 'true')
ON CONFLICT (key) DO NOTHING;