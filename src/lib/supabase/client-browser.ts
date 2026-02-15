import { createBrowserClient } from '@supabase/ssr';
import { getEnvVarSafe } from '@/lib/utils/env';

export function createClient() {
  const url = getEnvVarSafe('NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnvVarSafe('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables in browser client');
  }
  
  return createBrowserClient(url, key);
}
