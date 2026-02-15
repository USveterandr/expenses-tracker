import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // For browser/client-side, Next.js automatically injects NEXT_PUBLIC_ vars at build time
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.error('Missing Supabase environment variables:', { url: !!url, key: !!key });
    throw new Error('Missing Supabase environment variables in browser client. Please check your environment configuration.');
  }
  
  return createBrowserClient(url, key);
}
