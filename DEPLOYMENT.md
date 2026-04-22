# Botsmart Africa - Environment Variables Setup

## Vercel Deployment

### Required Environment Variables

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables** and add:

| Variable Name | Value | Access |
|---------------|-------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | Build, Runtime |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anonymous Key | Build, Runtime |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Service Role Key | Build, Runtime (SERVER-SIDE ONLY) |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.vercel.app` | Build, Runtime |

### Optional Variables

| Variable Name | Value | Access |
|---------------|-------|--------|
| `ADMIN_CREATION_KEY` | Secret key for admin creation API | Build, Runtime |
| `ADMIN_ALLOWED_IPS` | Comma-separated IP addresses | Build, Runtime |
| `STRIPE_SECRET_KEY` | Stripe API Key | Build, Runtime |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Secret | Build, Runtime |

---

## Supabase Setup

### 1. Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings → API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 2. Required Database Tables

Make sure these tables exist in your Supabase database:

```sql
-- Admin Users Table
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  role_id UUID REFERENCES admin_roles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Admin Roles Table
CREATE TABLE admin_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default super_admin role
INSERT INTO admin_roles (name, permissions) VALUES 
('super_admin', '["all"]');
```

---

## GitHub Integration

### 1. Push to GitHub

```bash
# Initialize git if not already
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/botsmart-africa.git
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New → Project**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js framework
5. Add environment variables
6. Click **Deploy**

### 3. Automatic Deployments

Every push to `main` branch will trigger automatic deployment.

---

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] Supabase tables created
- [ ] Admin user created in database
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled (automatic with Vercel)
