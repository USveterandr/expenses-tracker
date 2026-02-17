/**
 * OAuth utility functions
 */

/**
 * Generate a cryptographically secure authorization code
 */
export function generateAuthCode(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a cryptographically secure token
 * @param length - Length of the token in bytes (default: 32)
 */
export function generateToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a token using SHA-256
 * This is used to store token hashes in the database while returning
 * the plain token to the user only once.
 */
export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a client ID
 */
export function generateClientId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a client secret
 */
export function generateClientSecret(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate a PKCE code verifier against a code challenge
 */
export async function validatePKCE(
  codeVerifier: string,
  codeChallenge: string,
  codeChallengeMethod: string = 'S256'
): Promise<boolean> {
  if (codeChallengeMethod === 'plain') {
    return codeVerifier === codeChallenge;
  }

  // S256 method
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const computedChallenge = btoa(String.fromCharCode(...hashArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return computedChallenge === codeChallenge;
}

/**
 * Parse scope string into array
 */
export function parseScopes(scope: string | undefined): string[] {
  if (!scope) return ['read'];
  return scope.split(' ').filter(s => s.trim());
}

/**
 * Format scopes array into string
 */
export function formatScopes(scopes: string[]): string {
  return scopes.join(' ');
}

/**
 * Generate OAuth error response
 */
export function createOAuthError(
  error: string,
  errorDescription?: string,
  state?: string
): Record<string, string> {
  const response: Record<string, string> = { error };
  if (errorDescription) response.error_description = errorDescription;
  if (state) response.state = state;
  return response;
}
