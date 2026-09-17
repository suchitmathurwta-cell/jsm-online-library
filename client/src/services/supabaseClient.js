import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rbrmozqevyzacbvhmnum.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_XTCMWED5sNv3YNSkFPoFeQ_cHV_s70u';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
