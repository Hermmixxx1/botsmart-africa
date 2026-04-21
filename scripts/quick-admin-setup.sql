-- Run this in Supabase SQL Editor to add yourself as admin
-- Replace 'your-email@here.com' with YOUR actual email

-- Step 1: Create the tables if they don't exist
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  is_system BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  role_id UUID REFERENCES admin_roles(id),
  is_active BOOLEAN DEFAULT true
);

-- Step 2: Insert super_admin role
INSERT INTO admin_roles (name, display_name, permissions, is_system) 
VALUES ('super_admin', 'Super Administrator', 
  ARRAY['manage_settings', 'manage_admins', 'manage_roles', 'manage_pages', 
        'manage_products', 'manage_orders', 'manage_sellers', 'view_analytics'], 
  true)
ON CONFLICT (name) DO NOTHING;

-- Step 3: Add YOUR email as admin
-- Find your user_id first, then insert
INSERT INTO admin_users (user_id, role_id, is_active)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE'),
  (SELECT id FROM admin_roles WHERE name = 'super_admin'),
  true
WHERE EXISTS (SELECT 1 FROM auth.users WHERE email = 'YOUR_EMAIL_HERE')
ON CONFLICT (user_id) DO NOTHING;
