'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';

/**
 * OnboardingGuard checks if the user has completed onboarding
 * and redirects them to the profile setup page if not.
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Don't check while loading
    if (isLoading) return;

    // If user is not authenticated, let the auth flow handle it
    if (!isAuthenticated || !user) return;

    // Check if user needs to complete profile
    const needsProfileCompletion = !user.onboardingCompleted || !user.displayName;

    // List of paths that don't require completed profile
    const allowedPaths = [
      '/settings/profile',
      '/login',
      '/signup',
      '/forgot-password',
      '/reset-password',
    ];

    // If user needs to complete profile and isn't on an allowed path, redirect them
    if (needsProfileCompletion && !allowedPaths.some(path => pathname.startsWith(path))) {
      console.log('User needs to complete profile, redirecting...');
      router.push('/settings/profile');
    }
  }, [user, isAuthenticated, isLoading, pathname, router]);

  return <>{children}</>;
}
