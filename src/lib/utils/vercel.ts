import { jwtVerify, importJWK } from 'jose';

const VERCEL_JWT_KID = '775b4614-6ea5-4f37-9485-9682947a3477';

// Vercel JWT public key (from your configuration)
const VERCEL_JWK = {
  "x": "0s0qTwJELXp3cV2UTXoI6lLE7lnMW6SqCQ-svfFe2-c",
  "y": "t_S8cP7w_Ib-khMTyLJuAC975gfDwpOUbAc5uwbgx8s",
  "alg": "ES256",
  "crv": "P-256",
  "ext": true,
  "kid": VERCEL_JWT_KID,
  "kty": "EC",
  "key_ops": ["verify"]
};

/**
 * Verify a Vercel JWT token
 * This is used for protecting API routes or verifying Vercel preview deployments
 */
export async function verifyVercelJWT(token: string): Promise<boolean> {
  try {
    const publicKey = await importJWK(VERCEL_JWK, 'ES256');
    await jwtVerify(token, publicKey);
    return true;
  } catch (error) {
    console.error('Vercel JWT verification failed:', error);
    return false;
  }
}

/**
 * Middleware to check if request has valid Vercel protection
 * Use this in API routes to ensure only Vercel can access them
 */
export function getVercelProtectionBypass(request: Request): string | null {
  const url = new URL(request.url);
  return url.searchParams.get('_vercel_password_protection_bypass');
}

/**
 * Check if running in Vercel preview deployment
 */
export function isVercelPreview(): boolean {
  return process.env.VERCEL_ENV === 'preview' || 
         process.env.VERCEL_ENV === 'development';
}

/**
 * Check if running in Vercel production
 */
export function isVercelProduction(): boolean {
  return process.env.VERCEL_ENV === 'production';
}

/**
 * Get the current Vercel deployment URL
 */
export function getVercelUrl(): string {
  return process.env.VERCEL_URL || 
         process.env.NEXT_PUBLIC_VERCEL_URL || 
         'localhost:3000';
}