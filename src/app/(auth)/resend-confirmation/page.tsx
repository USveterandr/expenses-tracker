'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/stores/authStore';
import styles from '../login/page.module.css';

export default function ResendConfirmationPage() {
  const { resendConfirmationEmail, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await resendConfirmationEmail(email);
      setSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to resend email';
      setError(message);
    }
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>💰</div>
          <h1 className={styles.logoText}>ExpenseFlow</h1>
        </div>

        <Card className={styles.card}>
          <CardContent className={styles.successContent}>
            <CheckCircle size={64} className={styles.successIcon} />
            <h2 className={styles.successTitle}>Confirmation email sent!</h2>
            <p className={styles.successText}>
              We&apos;ve sent a new confirmation link to {email}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
              Please check your inbox and spam folder. The email should arrive within a few minutes.
            </p>
            <Link href="/login" className={styles.link}>
              Back to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>💰</div>
        <h1 className={styles.logoText}>ExpenseFlow</h1>
      </div>

      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>Resend Confirmation Email</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div style={{ 
              backgroundColor: 'rgba(79, 70, 229, 0.05)', 
              border: '1px solid rgba(79, 70, 229, 0.2)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
                Enter your email address and we&apos;ll send you a new confirmation link.
              </p>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              icon={<Mail size={18} />}
            />

            <Button type="submit" loading={isLoading} className={styles.submitButton}>
              <RefreshCw size={18} style={{ marginRight: '8px' }} />
              Resend Confirmation Email
            </Button>

            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '12px' }}>
                Didn&apos;t receive the email?
              </h4>
              <ul style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, paddingLeft: '20px' }}>
                <li style={{ marginBottom: '8px' }}>Check your spam/junk folder</li>
                <li style={{ marginBottom: '8px' }}>Add noreply@expenseflow.com to your contacts</li>
                <li style={{ marginBottom: '8px' }}>Wait a few minutes and try again</li>
                <li>Make sure you entered the correct email address</li>
              </ul>
            </div>

            <Link href="/login" className={styles.backLink}>
              <ArrowLeft size={16} />
              Back to sign in
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
