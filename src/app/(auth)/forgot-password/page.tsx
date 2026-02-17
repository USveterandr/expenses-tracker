'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/stores/authStore';
import styles from '../login/page.module.css';

export default function ForgotPasswordPage() {
  const { resetPassword, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await resetPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link. Please try again.');
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
            <CheckCircle
              size={64}
              className={styles.successIcon}
            />
            <h2 className={styles.successTitle}>Check your email</h2>
            <p className={styles.successText}>
              We&apos;ve sent a password reset link to {email}
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
          <CardTitle>Reset your password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className={styles.form}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            {error && (
              <div className={styles.error}>
                <AlertCircle size={16} style={{ marginRight: '8px', display: 'inline' }} />
                {error}
              </div>
            )}

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
              Send Reset Link
            </Button>

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
