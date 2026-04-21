-- Seed script for Admin roles and initial admin user
-- Run this in Supabase SQL Editor

-- 1. Create admin_roles table if not exists
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  permissions TEXT[] DEFAULT '{}',
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create admin_users table if not exists
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES admin_roles(id),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Insert default admin roles
INSERT INTO admin_roles (name, display_name, description, permissions, is_system) VALUES
  ('super_admin', 'Super Administrator', 'Full access to all features', 
   ARRAY['manage_settings', 'manage_admins', 'manage_roles', 'manage_pages', 
         'manage_products', 'manage_orders', 'manage_sellers', 'view_analytics', 'manage_reviews'],
   true),
  ('admin', 'Administrator', 'Manage products, orders, and sellers',
   ARRAY['manage_products', 'manage_orders', 'manage_sellers', 'view_analytics', 'manage_reviews'],
   true),
  ('manager', 'Manager', 'View and manage products and orders',
   ARRAY['view_products', 'manage_orders', 'view_analytics'],
   true)
ON CONFLICT (name) DO NOTHING;

-- 4. Disable RLS on admin_roles (system table, managed by super admin only)
ALTER TABLE admin_roles DISABLE ROW LEVEL SECURITY;

-- 5. Enable RLS on admin_users and create policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can see their own admin record
CREATE POLICY "Users can view own admin record"
  ON admin_users FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Only active admin can query all admin_users
CREATE POLICY "Admins can view all admin users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
      AND EXISTS (
        SELECT 1 FROM admin_roles ar
        WHERE ar.id = au.role_id
        AND ar.name = 'super_admin'
      )
    )
  );

-- 6. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_name ON admin_roles(name);

-- 7. Function to check if user is admin (for RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid() AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================================================
-- TO ADD YOUR FIRST ADMIN:
-- Replace 'your-email@example.com' with your email
-- =====================================================
-- 
-- Get your user ID:
-- SELECT id FROM auth.users WHERE email = 'your-email@example.com';
--
-- Then insert:
-- INSERT INTO admin_users (user_id, role_id)
-- SELECT 
--   (SELECT id FROM auth.users WHERE email = 'your-email@example.com'),
--   (SELECT id FROM admin_roles WHERE name = 'super_admin');
-- =====================================================
