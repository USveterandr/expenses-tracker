'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Shield, Globe, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/stores/authStore';
import styles from './page.module.css';

interface OAuthClient {
  id: string;
  name: string;
  description: string | null;
  client_id: string;
  redirect_uris: string[];
  scopes: string[];
  logo_url: string | null;
  website_url: string | null;
  is_verified: boolean;
}

function OAuthConsentContent() {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientInfo, setClientInfo] = useState<OAuthClient | null>(null);

  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const scope = searchParams.get('scope');
  const state = searchParams.get('state');
  const responseType = searchParams.get('response_type');

  useEffect(() => {
    // Validate OAuth parameters
    if (!clientId || !redirectUri || !responseType) {
      setError('Invalid OAuth request: Missing required parameters');
      setLoading(false);
      return;
    }

    if (responseType !== 'code') {
      setError('Invalid response_type. Only "code" is supported.');
      setLoading(false);
      return;
    }

    // Fetch client information from API
    fetchClientInfo(clientId);
  }, [clientId, redirectUri, responseType]);

  const fetchClientInfo = async (clientId: string) => {
    try {
      const response = await fetch(`/api/oauth/clients?client_id=${encodeURIComponent(clientId)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load client information');
      }

      setClientInfo(data.client);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch client info:', err);
      setError(err instanceof Error ? err.message : 'Failed to load application information');
      setLoading(false);
    }
  };

  const handleAuthorize = async () => {
    setLoading(true);
    try {
      // Call OAuth authorization API
      const response = await fetch('/api/oauth/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          redirect_uri: redirectUri,
          scope: scope || clientInfo?.scopes?.join(' '),
          state,
          response_type: responseType,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error_description || data.error);
      }

      // Redirect back to the client application
      const redirectUrl = new URL(redirectUri || '');
      redirectUrl.searchParams.set('code', data.code);
      if (state) {
        redirectUrl.searchParams.set('state', state);
      }

      window.location.href = redirectUrl.toString();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authorization failed');
      setLoading(false);
    }
  };

  const handleDeny = () => {
    // Redirect back with error
    const redirectUrl = new URL(redirectUri || '');
    redirectUrl.searchParams.set('error', 'access_denied');
    redirectUrl.searchParams.set('error_description', 'User denied the request');
    if (state) {
      redirectUrl.searchParams.set('state', state);
    }
    window.location.href = redirectUrl.toString();
  };

  const getScopeDescription = (scope: string): string => {
    const descriptions: Record<string, string> = {
      'read': 'Read your expenses and reports',
      'write': 'Create and modify expenses',
      'profile': 'Access your profile information',
      'email': 'Access your email address',
      'workspace': 'Access your workspace information',
      'admin': 'Full administrative access to your account',
    };
    return descriptions[scope] || `Access: ${scope}`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Card className={styles.card}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className={styles.spinner} />
            <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
              Loading application information...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    // Check if this is a missing parameters error - show helpful info instead
    const isMissingParams = error.includes('Missing required parameters');
    
    return (
      <div className={styles.container}>
        <Card className={styles.card}>
          <CardHeader className={styles.centeredHeader}>
            <div className={styles.appLogo}>
              <Shield size={32} className={styles.logoIcon} />
            </div>
            <CardTitle className={styles.titleLarge}>
              {isMissingParams ? 'OAuth Authorization Server' : 'Authorization Error'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isMissingParams ? (
              <div className={styles.content}>
                <div className={styles.appInfoBox}>
                  <h3 className={styles.appName}>What is this page?</h3>
                  <p className={styles.appDescription}>
                    This is the OAuth 2.0 consent screen for ExpenseFlow. Third-party applications 
                    use this page to request permission to access user data.
                  </p>
                </div>
                
                <div className={styles.scopes}>
                  <h4 className={styles.scopesTitle}>How it works:</h4>
                  <ol className={styles.infoList}>
                    <li className={styles.infoItem}>
                      <strong>Register your app</strong> - Developers register their application 
                      to get a client_id and client_secret
                    </li>
                    <li className={styles.infoItem}>
                      <strong>Redirect users here</strong> - Send users to this page with their 
                      client_id and requested permissions
                    </li>
                    <li className={styles.infoItem}>
                      <strong>User approves</strong> - Users review and authorize the requested access
                    </li>
                    <li className={styles.infoItem}>
                      <strong>Get access token</strong> - Exchange the authorization code for an 
                      access token to call the API
                    </li>
                  </ol>
                </div>

                <div className={styles.appInfoBox} style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)' }}>
                  <h4 className={styles.scopesTitle}>Example Authorization URL:</h4>
                  <code className={styles.codeBlock}>
                    https://expensetracker-seven-coral.vercel.app/oauth/consent
                    ?client_id=YOUR_CLIENT_ID
                    &redirect_uri=YOUR_CALLBACK_URL
                    &response_type=code
                    &scope=read
                  </code>
                </div>

                <div className={styles.actions}>
                  <Button 
                    onClick={() => window.location.href = '/login'} 
                    className={`${styles.authorizeButton} ${styles.fullWidth}`}
                  >
                    Go to Login
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/signup'}
                    className={`${styles.denyButton} ${styles.fullWidth}`}
                  >
                    Create Account
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.error}>{error}</div>
                <Button 
                  onClick={() => window.location.href = '/login'} 
                  className={styles.homeButton}
                >
                  Go to Login
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const requestedScopes = scope ? scope.split(' ') : (clientInfo?.scopes || ['read']);

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardHeader className={styles.centeredHeader}>
          <div className={styles.appLogo}>
            {clientInfo?.logo_url ? (
              <img 
                src={clientInfo.logo_url} 
                alt={clientInfo.name}
                className={styles.logoImage}
              />
            ) : (
              <Shield size={32} className={styles.logoIcon} />
            )}
          </div>
          <CardTitle className={styles.titleLarge}>
            Authorize {clientInfo?.name}
          </CardTitle>
          <p className={styles.subtitle}>
            This application is requesting access to your ExpenseFlow account
          </p>
        </CardHeader>
        <CardContent>
          <div className={styles.content}>
            {/* App Info */}
            <div className={styles.appInfoBox}>
              <div className={styles.appHeader}>
                <h3 className={styles.appName}>{clientInfo?.name}</h3>
                {clientInfo?.is_verified && (
                  <span className={styles.verifiedBadge}>
                    Verified
                  </span>
                )}
              </div>
              {clientInfo?.description && (
                <p className={styles.appDescription}>
                  {clientInfo.description}
                </p>
              )}
              {clientInfo?.website_url && (
                <a 
                  href={clientInfo.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.websiteLink}
                >
                  <Globe size={14} />
                  Website
                  <ExternalLink size={12} />
                </a>
              )}
            </div>

            {/* Permissions */}
            <div className={styles.scopes}>
              <h4 className={styles.scopesTitle}>
                This app will be able to:
              </h4>
              <ul className={styles.scopesList}>
                {requestedScopes.map((scope) => (
                  <li 
                    key={scope} 
                    className={styles.scopeItem}
                  >
                    <span className={styles.checkmark}>✓</span>
                    <span className={styles.scopeText}>
                      {getScopeDescription(scope)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* User Info */}
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {user?.email?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <p className={styles.userLabel}>Signed in as</p>
                <p className={styles.userEmail}>
                  {user?.email || 'Guest'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <Button 
                onClick={handleAuthorize}
                loading={loading}
                className={`${styles.authorizeButton} ${styles.fullWidth}`}
              >
                Authorize Application
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDeny}
                className={`${styles.denyButton} ${styles.fullWidth}`}
              >
                Deny Access
              </Button>
            </div>

            <p className={styles.footerNote}>
              You can revoke this access at any time in your account settings
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OAuthConsentPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <Card className={styles.card}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className={styles.spinner} />
            <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
              Loading...
            </p>
          </div>
        </Card>
      </div>
    }>
      <OAuthConsentContent />
    </Suspense>
  );
}
