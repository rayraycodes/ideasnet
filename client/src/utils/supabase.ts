import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://mwtjcijnzszcwjgpnpee.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13dGpjaWpuenN6Y3dqZ3BucGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNjE5MDQsImV4cCI6MjA3OTgzNzkwNH0.nZkvhBIkq9XxCFpyqKdFQYGEiuBMMrWti0BrtwP7sX4';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Note: To generate TypeScript types from your Supabase schema, run:
// npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/utils/database.types.ts

