import { createClient } from '@supabase/supabase-js';

// Anon key is safe in the client; Row Level Security protects user data.
// Provide these via .env.local (see .env.example). Never expose the service_role key.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  // Surface a clear message in dev instead of a cryptic crash.
  console.warn(
    '[supabase] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
    'Copy .env.example to .env.local and fill in your project values.'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true }
    })
  : null;

export const APP_ENV = import.meta.env.VITE_APP_ENV || 'prod';
export const isUAT = APP_ENV === 'uat';
