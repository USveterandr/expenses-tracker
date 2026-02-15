import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { getEnvVarSafe } from '@/lib/utils/env';

export async function updateSession(request: NextRequest) {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const url = getEnvVarSafe('NEXT_PUBLIC_SUPABASE_URL');
    const key = getEnvVarSafe('NEXT_PUBLIC_SUPABASE_ANON_KEY');

    if (!url || !key) {
      console.error('[Middleware] Missing Supabase environment variables');
      // Allow the request to continue without auth - the page will handle the error
      return response;
    }

    const supabase = createServerClient(
      url,
      key,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // This will refresh the session if expired
    let user = null;
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    } catch (error) {
      console.error('Error getting user from auth:', error);
      // Continue without user - they'll be redirected if needed
    }

    // Protect dashboard routes
    if (request.nextUrl.pathname.startsWith('/expenses') || 
        request.nextUrl.pathname.startsWith('/reports') ||
        request.nextUrl.pathname.startsWith('/workspace') ||
        request.nextUrl.pathname.startsWith('/analytics') ||
        request.nextUrl.pathname.startsWith('/bills') ||
        request.nextUrl.pathname.startsWith('/invoices') ||
        request.nextUrl.pathname.startsWith('/inbox') ||
        request.nextUrl.pathname.startsWith('/chat') ||
        request.nextUrl.pathname.startsWith('/scan') ||
        request.nextUrl.pathname.startsWith('/settings')) {
      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    // Redirect logged-in users from auth pages
    if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && user) {
      return NextResponse.redirect(new URL('/expenses', request.url));
    }

    return response;
  } catch (error) {
    console.error('[Middleware Error]', error);
    // Return a basic response if middleware fails completely
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
}
