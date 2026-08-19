import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://odhvrjmateakyrgjpdyp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kaHZyam1hdGVha3lyZ2pwZHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNTg4MDIsImV4cCI6MjEwMjczNDgwMn0.F2MWCpSo9ZnNpdA_t7YdHy0oj09WtRKgv9Ysf9ogFEI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
