'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client-browser';
import styles from '../../login/page.module.css';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createClient();
        
        // Check if we have a session (magic link was clicked)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (session) {
          // User is authenticated, redirect to expenses
          router.push('/expenses');
          router.refresh();
        } else {
          // Check for error in URL
          const url = new URL(window.location.href);
          const errorDescription = url.searchParams.get('error_description');
          
          if (errorDescription) {
            setError(errorDescription);
          } else {
            setError('Authentication failed. Please try again.');
          }
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [router]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>💰</div>
          <h1 className={styles.logoText}>ExpenseFlow</h1>
        </div>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div className={styles.spinner} style={{ margin: '0 auto 20px', width: '40px', height: '40px', borderWidth: '3px' }} />
          <p>Completing sign in...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>💰</div>
          <h1 className={styles.logoText}>ExpenseFlow</h1>
        </div>
        <div className={styles.card} style={{ padding: '40px', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--color-error)', marginBottom: '16px' }}>Sign In Failed</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error}</p>
          <a 
            href="/login" 
            style={{ 
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: 'var(--color-primary-600)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '500'
            }}
          >
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return null;
}
