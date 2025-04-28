
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
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Log when the client is initialized
console.log("Supabase client initialized with URL:", SUPABASE_URL);

// Monitor authentication state changes for debugging
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Supabase auth event:", event, session ? "Session exists" : "No session");
  
  if (event === 'SIGNED_IN') {
    console.log("User signed in:", session?.user?.id);
  } else if (event === 'SIGNED_OUT') {
    console.log("User signed out");
  } else if (event === 'TOKEN_REFRESHED') {
    console.log("Auth token refreshed");
  } else if (event === 'USER_UPDATED') {
    console.log("User data updated");
  }
});

// Add general error handler for fetch operations
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  try {
    if (typeof input === 'string' && input.includes(SUPABASE_URL)) {
      console.log(`Supabase API request: ${input.split(SUPABASE_URL)[1].split('?')[0]}`);
    }
    
    const response = await originalFetch(input, init);
    
    if (typeof input === 'string' && input.includes(SUPABASE_URL) && !response.ok) {
      console.error(`Supabase API error: ${response.status} ${response.statusText} for ${input.split(SUPABASE_URL)[1].split('?')[0]}`);
    }
    
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Export both named and default exports for flexibility
export default supabase;
