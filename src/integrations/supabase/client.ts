
// This file is the single source of truth for the Supabase client
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mhkwikrckmlfdfljsbfx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oa3dpa3Jja21sZmRmbGpzYmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3NzIwMTksImV4cCI6MjA2MTM0ODAxOX0.vVRmXCpCp5BSCx7GdrOg-EeP_AkyRTaUvckFoobchpg";

// Create a single instance of the Supabase client to be exported and reused across the app
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof localStorage !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Log when the client is initialized
console.log("Supabase client initialized with URL:", SUPABASE_URL);

// Monitor authentication state changes for debugging
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Supabase auth event:", event, session ? "Session exists" : "No session");
});

// Export both named and default exports for flexibility
export default supabase;
