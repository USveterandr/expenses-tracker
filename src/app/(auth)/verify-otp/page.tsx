'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/stores/authStore';
import styles from '../login/page.module.css';

export default function VerifyOtpPage() {
  const router = useRouter();
  const { loginWithMagicLink, verifyOtp, isLoading } = useAuthStore();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      await loginWithMagicLink(email);
      setSuccessMessage(`Verification code sent to ${email}`);
      setStep('code');
    } catch (err: unknown) {
      console.error('Send OTP error:', err);
      
      if (err instanceof Error) {
        const errorMessage = err.message.toLowerCase();
        
        if (errorMessage.includes('user not found') || errorMessage.includes('not found')) {
          setError('No account found with this email. Please sign up first.');
        } else if (errorMessage.includes('too many requests')) {
          setError('Too many requests. Please wait a minute before trying again.');
        } else {
          setError(err.message || 'Failed to send code. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      await verifyOtp(email, otpCode);
      router.push('/expenses');
    } catch (err: unknown) {
      console.error('Verify OTP error:', err);
      
      if (err instanceof Error) {
        const errorMessage = err.message.toLowerCase();
        
        if (errorMessage.includes('token') || errorMessage.includes('invalid') || errorMessage.includes('expired')) {
          setError('Invalid or expired code. Please request a new one.');
        } else {
          setError(err.message || 'Failed to verify code. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccessMessage('');

    try {
      await loginWithMagicLink(email);
      setSuccessMessage('New verification code sent!');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to resend code. Please try again.');
      } else {
        setError('Failed to resend code. Please try again.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>💰</div>
        <h1 className={styles.logoText}>ExpenseFlow</h1>
      </div>

      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>
            {step === 'email' ? 'Sign in with Code' : 'Enter Verification Code'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <form onSubmit={handleSendCode} className={styles.form}>
              <div style={{ 
                backgroundColor: 'rgba(79, 70, 229, 0.05)', 
                border: '1px solid rgba(79, 70, 229, 0.2)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
                  We&apos;ll send a 6-digit verification code to your email. Enter the code to sign in.
                </p>
              </div>

              {error && <div className={styles.error}>{error}</div>}
              {successMessage && (
                <div className={styles.success}>
                  <CheckCircle size={16} style={{ marginRight: '8px', display: 'inline' }} />
                  {successMessage}
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
                Send Verification Code
              </Button>

              <Link href="/login" className={styles.backLink}>
                <ArrowLeft size={16} />
                Back to sign in
              </Link>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className={styles.form}>
              <div style={{ 
                backgroundColor: 'rgba(79, 70, 229, 0.05)', 
                border: '1px solid rgba(79, 70, 229, 0.2)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
                  Enter the 6-digit code sent to <strong>{email}</strong>
                </p>
              </div>

              {error && <div className={styles.error}>{error}</div>}
              {successMessage && (
                <div className={styles.success}>
                  <CheckCircle size={16} style={{ marginRight: '8px', display: 'inline' }} />
                  {successMessage}
                </div>
              )}

              <Input
                label="Verification Code"
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                required
                maxLength={6}
                icon={<Lock size={18} />}
              />

              <Button type="submit" loading={isLoading} className={styles.submitButton}>
                Verify & Sign In
              </Button>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={handleResendCode}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary-600)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Resend Code
                </button>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Change Email
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <p className={styles.footer}>
        Don&apos;t have an account?{' '}
        <Link href="/signup" className={styles.link}>
          Sign up
        </Link>
      </p>
    </div>
  );
}
