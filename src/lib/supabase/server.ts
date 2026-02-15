import { createServerClient } from '@supabase/ssr';
import { type CookieOptions } from '@supabase/ssr';

export async function createClient(request?: Request) {
  // For Edge Runtime, we need to handle cookies differently
  const cookieHeader = request?.headers.get('cookie') || '';
  
  // Parse cookies from header
  const parsedCookies = new Map<string, string>();
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      parsedCookies.set(name, decodeURIComponent(value));
    }
  });

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return Array.from(parsedCookies.entries()).map(([name, value]) => ({
            name,
            value,
          }));
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          // In Edge Runtime, we can't set cookies this way
          // Cookies should be set via the Response headers in API routes
        },
      },
    }
  );
}
