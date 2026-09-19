import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// URL-ന്റെ അറ്റത്തുള്ള സ്ലാഷുകൾ, സ്പേസുകൾ ഒഴിവാക്കുന്നു
const supabaseUrl = rawUrl.trim().replace(/\/+$/, '');
const supabaseAnonKey = rawKey.trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
