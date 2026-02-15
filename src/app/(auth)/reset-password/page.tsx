'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client-browser';
import styles from '../login/page.module.css';

const supabase = createClient();

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if we have a valid code
    if (!code) {
      setError('Invalid or expired reset link. Please request a new one.');
    }
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code) {
      setError('Invalid or expired reset link. Please request a new one.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Use verifyOtp to verify the recovery token and log the user in
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: code,
        type: 'recovery',
      });

      if (verifyError) {
        throw verifyError;
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
    } catch (err: unknown) {
      console.error('Reset password error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password. The link may have expired.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>💰</div>
          <h1 className={styles.logoText}>ExpenseFlow</h1>
        </div>

        <Card className={styles.card}>
          <CardContent className={styles.successContent}>
            <CheckCircle size={64} className={styles.successIcon} />
            <h2 className={styles.successTitle}>Password updated!</h2>
            <p className={styles.successText}>
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !code) {
    return (
      <div className={styles.container}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>💰</div>
          <h1 className={styles.logoText}>ExpenseFlow</h1>
        </div>

        <Card className={styles.card}>
          <CardContent className={styles.successContent}>
            <div className={styles.error} style={{ marginBottom: 'var(--space-4)' }}>
              {error}
            </div>
            <Link href="/forgot-password" className={styles.link}>
              Request new reset link
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
          <CardTitle>Set new password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Enter your new password below.
            </p>

            <div className={styles.passwordContainer}>
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                icon={<Lock size={18} />}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className={styles.passwordContainer}>
              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                icon={<Lock size={18} />}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button type="submit" loading={isLoading} className={styles.submitButton}>
              Reset Password
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>💰</div>
          <h1 className={styles.logoText}>ExpenseFlow</h1>
        </div>
        <Card className={styles.card}>
          <CardContent className={styles.successContent}>
            <div className={styles.successText}>Loading...</div>
          </CardContent>
        </Card>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
