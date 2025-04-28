
// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = "https://mhkwikrckmlfdfljsbfx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oa3dpa3Jja21sZmRmbGpzYmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3NzIwMTksImV4cCI6MjA2MTM0ODAxOX0.vVRmXCpCp5BSCx7GdrOg-EeP_AkyRTaUvckFoobchpg";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
