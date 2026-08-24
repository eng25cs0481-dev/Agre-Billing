import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://odhvrjmateakyrgjpdyp.supabase.co';
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kaHZyam1hdGVha3lyZ2pwZHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNTg4MDIsImV4cCI6MjEwMjczNDgwMn0.F2MWCpSo9ZnNpdA_t7YdHy0oj09WtRKgv9Ysf9ogFEI';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
