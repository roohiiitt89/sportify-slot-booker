
// Re-exporting the official Supabase client to maintain compatibility with any imports that may be using this path
import { supabase } from "@/integrations/supabase/client";

export { supabase };
export default supabase;
