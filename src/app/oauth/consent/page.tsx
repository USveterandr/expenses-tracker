'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/stores/authStore';
import styles from './page.module.css';

function OAuthConsentContent() {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientInfo, setClientInfo] = useState<{
    name: string;
    scopes: string[];
    redirect_uri: string;
  } | null>(null);

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

    // Fetch client information (you'll need to implement this API endpoint)
    fetchClientInfo(clientId);
  }, [clientId, redirectUri, responseType]);

  const fetchClientInfo = async (clientId: string) => {
    try {
      // This would be an API call to get OAuth app details
      // For now, we'll simulate it
      setClientInfo({
        name: 'Third-Party Application',
        scopes: scope ? scope.split(' ') : ['read'],
        redirect_uri: redirectUri || '',
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to load application information');
      setLoading(false);
    }
  };

  const handleAuthorize = async () => {
    setLoading(true);
    try {
      // Call your OAuth authorization API
      const response = await fetch('/api/oauth/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          redirect_uri: redirectUri,
          scope,
          state,
          response_type: responseType,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
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

  if (loading) {
    return (
      <div className={styles.container}>
        <Card className={styles.card}>
          <CardContent>
            <div className={styles.loading}>Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Card className={styles.card}>
          <CardHeader>
            <CardTitle>Authorization Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.error}>{error}</div>
            <Button onClick={() => window.location.href = '/'} className={styles.homeButton}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>Authorize Application</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.content}>
            <div className={styles.appInfo}>
              <h2>{clientInfo?.name}</h2>
              <p>wants to access your ExpenseFlow account</p>
            </div>

            <div className={styles.scopes}>
              <h3>This application will be able to:</h3>
              <ul>
                {clientInfo?.scopes.map((scope) => (
                  <li key={scope} className={styles.scope}>
                    {scope === 'read' && '✓ Read your expenses and reports'}
                    {scope === 'write' && '✓ Create and modify expenses'}
                    {scope === 'profile' && '✓ Access your profile information'}
                    {scope === 'email' && '✓ Access your email address'}
                    {!['read', 'write', 'profile', 'email'].includes(scope) && `✓ ${scope}`}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.userInfo}>
              <p>Signed in as: <strong>{user?.email || 'Guest'}</strong></p>
            </div>

            <div className={styles.actions}>
              <Button 
                variant="outline" 
                onClick={handleDeny}
                className={styles.denyButton}
              >
                Deny
              </Button>
              <Button 
                onClick={handleAuthorize}
                loading={loading}
                className={styles.authorizeButton}
              >
                Authorize
              </Button>
            </div>
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
          <CardContent>
            <div className={styles.loading}>Loading...</div>
          </CardContent>
        </Card>
      </div>
    }>
      <OAuthConsentContent />
    </Suspense>
  );
}
