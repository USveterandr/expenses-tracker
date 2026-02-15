import { createBrowserClient } from '@supabase/ssr';
import { getEnvVar } from '@/lib/utils/env';

export function createClient() {
  const url = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  return createBrowserClient(url, key);
}
