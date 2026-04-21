import { createClient, SupabaseClient } from '@supabase/supabase-js';

let envLoaded = false;

interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

function loadEnv(): void {
  if (envLoaded || (process.env.COZE_SUPABASE_URL && process.env.COZE_SUPABASE_ANON_KEY)) {
    return;
  }

  // Only load additional env vars on server side
  if (typeof window === 'undefined') {
    try {
      const { execSync } = require('child_process');
      const pythonCode = `
import os
import sys
try:
    from coze_workload_identity import Client
    client = Client()
    env_vars = client.get_project_env_vars()
    client.close()
    for env_var in env_vars:
        print(f"{env_var.key}={env_var.value}")
except Exception as e:
    print(f"# Error: {e}", file=sys.stderr)
`;

      const output = execSync(`python3 -c '${pythonCode.replace(/'/g, "'\"'\"'")}'`, {
        encoding: 'utf-8',
        timeout: 10000,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const lines = output.trim().split('\n');
      for (const line of lines) {
        if (line.startsWith('#')) continue;
        const eqIndex = line.indexOf('=');
        if (eqIndex > 0) {
          const key = line.substring(0, eqIndex);
          let value = line.substring(eqIndex + 1);
          if ((value.startsWith("'") && value.endsWith("'")) ||
              (value.startsWith('"') && value.endsWith('"'))) {
            value = value.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }

      envLoaded = true;
    } catch {
      // Silently fail
    }
  }
}

function getSupabaseCredentials(): SupabaseCredentials | null {
  // NEXT_PUBLIC_ variables are available on both client and server (embedded at build time)
  // COZE_ variables are loaded at runtime from the environment
  
  let url: string | undefined;
  let anonKey: string | undefined;

  // Check NEXT_PUBLIC_ first (available on both client and server at build time)
  url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // On server-side, also check COZE_ variables (loaded at runtime)
  if (typeof window === 'undefined' && !url) {
    loadEnv();
    url = process.env.COZE_SUPABASE_URL;
    anonKey = process.env.COZE_SUPABASE_ANON_KEY;
  }

  if (!url || !anonKey) {
    // Return null instead of throwing - let callers handle missing credentials
    console.warn('Supabase credentials not available');
    return null;
  }

  return { url, anonKey };
}

function getSupabaseServiceRoleKey(): string | undefined {
  loadEnv();
  return process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
}

function getSupabaseClient(token?: string): SupabaseClient | null {
  const credentials = getSupabaseCredentials();
  
  if (!credentials) {
    return null;
  }

  const { url, anonKey } = credentials;
  
  let key: string;
  if (token) {
    key = anonKey;
  } else {
    const serviceRoleKey = getSupabaseServiceRoleKey();
    key = serviceRoleKey ?? anonKey;
  }

  if (token) {
    return createClient(url, key, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
      db: {
        timeout: 60000,
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        storageKey: 'supabase-auth',
      },
    });
  }

  // Client-side client with session persistence
  return createClient(url, key, {
    db: {
      timeout: 60000,
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storageKey: 'supabase-auth',
      detectSessionInUrl: true,
    },
  });
}

// Export both functions
// - getSupabaseClient: returns null if not available (for client components)
// - getSupabase: throws if not available (for server-side API routes)
export { getSupabaseClient, getSupabaseCredentials, getSupabaseServiceRoleKey, loadEnv };
export { getSupabase };

// Helper function that throws if client is not available (for server-side API routes)
function getSupabase(): SupabaseClient {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not available. Check environment variables.');
  }
  return client;
}
