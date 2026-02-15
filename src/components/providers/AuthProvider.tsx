'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { createClient } from '@/lib/supabase/client-browser';

const supabase = createClient();

/**
 * AuthProvider initializes and persists authentication state across the app.
 * It checks for existing sessions on mount and subscribes to auth state changes.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { fetchUser, logout } = useAuthStore();

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        if (session) {
          // Fetch user data if session exists
          await fetchUser();
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      }
    };

    checkSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
          await fetchUser();
        } else if (event === 'SIGNED_OUT') {
          logout();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          await fetchUser();
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUser, logout]);

  return <>{children}</>;
}
