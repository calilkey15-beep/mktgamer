/*
  # Fix user creation and authentication

  1. Security Updates
    - Drop and recreate RLS policies for users table
    - Allow authenticated users to insert their own profile
    - Allow users to read their own data
    - Allow superadmin to manage all users

  2. Trigger Updates
    - Fix the handle_new_user trigger to handle conflicts
    - Ensure proper user profile creation

  3. Initial Data
    - Create initial admin user profile
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Superadmin can manage users" ON users;

-- Create new RLS policies for users table
CREATE POLICY "Allow authenticated users to insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (email = auth.email());

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (email = auth.email());

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (email = auth.email())
  WITH CHECK (email = auth.email());

CREATE POLICY "Superadmin can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = auth.email() 
      AND role = 'superadmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = auth.email() 
      AND role = 'superadmin'
    )
  );

-- Update the trigger function to handle conflicts properly
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile, ignore if already exists
  INSERT INTO users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.email = 'admin@sistema.com' THEN 'superadmin'
      ELSE 'user'
    END
  )
  ON CONFLICT (email) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert admin user profile if it doesn't exist
INSERT INTO users (email, name, role)
VALUES ('admin@sistema.com', 'Administrador', 'superadmin')
ON CONFLICT (email) DO UPDATE SET
  role = 'superadmin',
  name = 'Administrador';