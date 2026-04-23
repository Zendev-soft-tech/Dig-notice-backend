import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

if (!config.supabase.url || !config.supabase.serviceRoleKey) {
  throw new Error('Supabase URL and Service Role Key must be provided in environment variables');
}

export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);
