
// src/lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mhkwikrckmlfdfljsbfx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oa3dpa3Jja21sZmRmbGpzYmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3NzIwMTksImV4cCI6MjA2MTM0ODAxOX0.vVRmXCpCp5BSCx7GdrOg-EeP_AkyRTaUvckFoobchpg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
