'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Building2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/stores/authStore';
import styles from '../login/page.module.css';

export default function SignupPage() {
  const router = useRouter();
  const { signup, resendConfirmationEmail, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfirmationScreen, setShowConfirmationScreen] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    try {
      const result = await signup(formData);
      
      // Check if email confirmation is required
      if (result?.requiresEmailConfirmation) {
        setShowConfirmationScreen(true);
        setSuccessMessage(`Account created! Please check your email (${formData.email}) to confirm your account.`);
      } else {
        // User is already logged in, redirect to inbox
        router.push('/inbox');
      }
    } catch (err: unknown) {
      console.error('Signup error:', err);
      
      // Handle specific error messages
      let errorMessage: string;
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'error_description' in err) {
        errorMessage = String((err as { error_description: string }).error_description);
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = String((err as { message: string }).message);
      } else {
        errorMessage = 'Failed to create account. Please try again.';
      }
      
      if (errorMessage.includes('rate limit')) {
        errorMessage = 'Too many signup attempts. Please wait a few minutes and try again.';
      } else if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (errorMessage.includes('weak password')) {
        errorMessage = 'Password is too weak. Please use at least 8 characters with numbers and symbols.';
      } else if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('send')) {
        errorMessage = 'Unable to send confirmation email. Please try again or contact support if the problem persists.';
      }
      
      setError(errorMessage);
    }
  };

  const handleResendEmail = async () => {
    if (!formData.email) return;
    
    setResendLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      await resendConfirmationEmail(formData.email);
      setSuccessMessage('Confirmation email sent! Please check your inbox.');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend email. Please try again.';
      setError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  // Show confirmation screen after successful signup
  if (showConfirmationScreen) {
    return (
      <div className={styles.container}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>💰</div>
          <h1 className={styles.logoText}>ExpenseFlow</h1>
        </div>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle className={styles.centeredTitle}>
              <CheckCircle size={48} className={styles.successIcon} />
              <div>Check Your Email</div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.confirmationContent}>
              <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
                We&apos;ve sent a confirmation email to:
              </p>
              <p style={{ 
                fontWeight: 600, 
                marginBottom: 'var(--space-6)',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-bg-secondary)',
                borderRadius: 'var(--radius-md)'
              }}>
                {formData.email}
              </p>
              <p style={{ marginBottom: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
                Click the link in the email to activate your account. 
                Once confirmed, you can sign in to ExpenseFlow.
              </p>
              
              <div style={{ 
                backgroundColor: 'rgba(245, 158, 11, 0.1)', 
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: 'var(--space-4)'
              }}>
                <p style={{ margin: '0 0 12px 0', color: 'var(--text-primary)', fontWeight: 600 }}>
                  Didn't receive the email?
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <li style={{ marginBottom: '8px' }}>Check your spam/junk folder</li>
                  <li style={{ marginBottom: '8px' }}>Wait 2-3 minutes for delivery</li>
                  <li>Make sure you entered the correct email address</li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', flexDirection: 'column' }}>
                <Button 
                  onClick={handleResendEmail} 
                  loading={resendLoading}
                  variant="outline"
                >
                  Resend Confirmation Email
                </Button>
                
                <Link href="/login" className={styles.fullWidthLink}>
                  <Button variant="ghost" className={styles.fullWidthButton}>
                    Go to Sign In
                  </Button>
                </Link>
              </div>

              {successMessage && (
                <div style={{ 
                  marginTop: 'var(--space-4)', 
                  padding: 'var(--space-3)',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  color: 'var(--color-success)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  {successMessage}
                </div>
              )}

              {error && (
                <div style={{ 
                  marginTop: 'var(--space-4)', 
                  padding: 'var(--space-3)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--color-error)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  {error}
                </div>
              )}
            </div>
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
          <CardTitle>Create your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error} style={{ 
                padding: 'var(--space-3)',
                marginBottom: 'var(--space-4)'
              }}>
                {error}
              </div>
            )}

            {successMessage && (
              <div style={{ 
                padding: 'var(--space-3)',
                marginBottom: 'var(--space-4)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                color: 'var(--color-success)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem'
              }}>
                {successMessage}
              </div>
            )}

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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
                required
                icon={<User size={18} />}
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                required
              />
            </div>

            <Input
              label="Work Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@company.com"
              required
              icon={<Mail size={18} />}
            />

            <div className={styles.passwordContainer}>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

            <Input
              label="Company Name (optional)"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="Acme Inc."
              icon={<Building2 size={18} />}
            />

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>
                I agree to the{' '}
                <Link href="#" className={styles.link}>Terms of Service</Link>
                {' '}and{' '}
                <Link href="#" className={styles.link}>Privacy Policy</Link>
              </span>
            </label>

            <Button type="submit" loading={isLoading} className={styles.submitButton}>
              Create Account
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className={styles.footer}>
        Already have an account?{' '}
        <Link href="/login" className={styles.link}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
