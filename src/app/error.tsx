'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import styles from './error.module.css';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Route error:', error);
  }, [error]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <AlertTriangle size={48} className={styles.icon} />
        </div>
        <h1 className={styles.title}>Something went wrong</h1>
        <p className={styles.description}>
          We encountered an error while loading this page.
        </p>
        {error.digest && (
          <p className={styles.errorId}>Error ID: {error.digest}</p>
        )}
        <div className={styles.actions}>
          <Button onClick={reset} icon={<RefreshCw size={18} />}>
            Try Again
          </Button>
          <Link href="/" className={styles.homeLink}>
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
