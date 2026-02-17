'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/stores/authStore';
import styles from './page.module.css';

type LoginMethod = 'password' | 'magic-link' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithMagicLink, isLoading } = useAuthStore();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<ReactNode>('');
  const [successMessage, setSuccessMessage] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      await login(email, password);
      router.push('/expenses');
    } catch (err: unknown) {
      console.error('Login error:', err);
      
      if (err instanceof Error) {
        const errorMessage = err.message;
        console.log('Error message:', errorMessage);
        
        // Supabase returns "Invalid login credentials" for both wrong password AND non-existent user
        if (errorMessage.toLowerCase().includes('invalid login credentials')) {
          setError(
            <div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Account not found or password incorrect</strong>
              </div>
              <div style={{ fontSize: '0.875rem', marginBottom: '8px' }}>
                This could mean:
              </div>
              <ul style={{ fontSize: '0.875rem', margin: '0 0 12px 20px', padding: 0 }}>
                <li>You haven't created an account yet</li>
                <li>The password you entered is incorrect</li>
                <li>There might be a typo in your email</li>
              </ul>
              <div style={{ fontSize: '0.875rem' }}>
                <Link href="/signup" style={{ color: 'var(--color-primary-600)', textDecoration: 'underline', fontWeight: 600 }}>
                  Create a new account
                </Link>
                {' '}or{' '}
                <Link href="/forgot-password" style={{ color: 'var(--color-primary-600)', textDecoration: 'underline' }}>
                  reset your password
                </Link>
              </div>
            </div>
          );
        } else if (errorMessage.toLowerCase().includes('email not confirmed')) {
          setError('Please confirm your email address before logging in. Check your inbox for the confirmation link.');
        } else if (errorMessage.toLowerCase().includes('user not found') || errorMessage.toLowerCase().includes('not found')) {
          setError(
            <div>
              <div style={{ marginBottom: '12px' }}>
                <strong>No account found with this email address.</strong>
              </div>
              <div style={{ fontSize: '0.875rem' }}>
                <Link href="/signup" style={{ color: 'var(--color-primary-600)', textDecoration: 'underline', fontWeight: 600 }}>
                  Create an account
                </Link>{' '}
                to get started with ExpenseFlow.
              </div>
            </div>
          );
        } else if (errorMessage.toLowerCase().includes('too many requests')) {
          setError('Too many login attempts. Please try again later.');
        } else {
          setError(err.message || 'An error occurred during login. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      await loginWithMagicLink(email);
      setSuccessMessage(`Magic link sent! Check your email (${email}) and click the link to sign in.`);
    } catch (err: unknown) {
      console.error('Magic link error:', err);
      
      if (err instanceof Error) {
        const errorMessage = err.message.toLowerCase();
        
        if (errorMessage.includes('user not found') || errorMessage.includes('not found')) {
          setError('No account found with this email. Please sign up first.');
        } else if (errorMessage.includes('too many requests')) {
          setError('Too many requests. Please wait a minute before trying again.');
        } else {
          setError(err.message || 'Failed to send magic link. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
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
          <CardTitle>Sign in to your account</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Login Method Tabs */}
          <div className={styles.loginTabs}>
            <button
              type="button"
              className={`${styles.tab} ${loginMethod === 'password' ? styles.tabActive : ''}`}
              onClick={() => {
                setLoginMethod('password');
                setError('');
                setSuccessMessage('');
              }}
            >
              <Lock size={16} />
              Password
            </button>
            <button
              type="button"
              className={`${styles.tab} ${loginMethod === 'magic-link' ? styles.tabActive : ''}`}
              onClick={() => {
                setLoginMethod('magic-link');
                setError('');
                setSuccessMessage('');
              }}
            >
              <Sparkles size={16} />
              Magic Link
            </button>
            <button
              type="button"
              className={`${styles.tab} ${loginMethod === 'otp' ? styles.tabActive : ''}`}
              onClick={() => {
                setLoginMethod('otp');
                setError('');
                setSuccessMessage('');
              }}
            >
              <KeyRound size={16} />
              Code
            </button>
          </div>

          {error && <div className={styles.error}>{error}</div>}
          
          {successMessage && (
            <div className={styles.success}>
              <CheckCircle size={16} style={{ marginRight: '8px', display: 'inline' }} />
              {successMessage}
            </div>
          )}

          {loginMethod === 'password' ? (
            <form onSubmit={handlePasswordLogin} className={styles.form}>
              <Button
                type="button"
                variant="outline"
                className={styles.googleButton}
                onClick={() => {}}
              >
                <svg className={styles.googleIcon} viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className={styles.divider}>
                <span>or</span>
              </div>

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                icon={<Mail size={18} />}
              />

              <div className={styles.passwordContainer}>
                <Input
                  label="Password"
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

              <div className={styles.forgotPassword}>
                <Link href="/forgot-password">Forgot password?</Link>
              </div>

              <Button type="submit" loading={isLoading} className={styles.submitButton}>
                Sign In
              </Button>
            </form>
          ) : loginMethod === 'magic-link' ? (
            <form onSubmit={handleMagicLinkLogin} className={styles.form}>
              <div style={{ 
                backgroundColor: 'rgba(79, 70, 229, 0.05)', 
                border: '1px solid rgba(79, 70, 229, 0.2)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
                  <strong>No password needed!</strong> We'll send a secure login link to your email. 
                  Click the link to sign in instantly.
                </p>
              </div>

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
                <Sparkles size={18} style={{ marginRight: '8px' }} />
                Send Magic Link
              </Button>
            </form>
          ) : (
            <form className={styles.form}>
              <div style={{ 
                backgroundColor: 'rgba(79, 70, 229, 0.05)', 
                border: '1px solid rgba(79, 70, 229, 0.2)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
                  <strong>One-Time Password!</strong> We'll send a 6-digit code to your email. 
                  Enter the code to sign in without a password.
                </p>
              </div>

              <Link href="/verify-otp" style={{ textDecoration: 'none' }}>
                <Button type="button" className={styles.submitButton}>
                  <KeyRound size={18} style={{ marginRight: '8px' }} />
                  Sign In with Code
                </Button>
              </Link>
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
