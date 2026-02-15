// Environment variable helper that works in both Node.js and Cloudflare Edge Runtime
export function getEnvVar(name: string): string {
  // Try process.env first (works in Node.js build time)
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name] as string;
  }
  
  // For Cloudflare Workers/Edge Runtime, variables are injected as globals
  // @ts-ignore - Cloudflare specific
  if (typeof globalThis !== 'undefined' && globalThis[name]) {
    // @ts-ignore
    return globalThis[name] as string;
  }
  
  // Try import.meta.env (Vite/Next.js specific)
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]) {
    // @ts-ignore
    return import.meta.env[name] as string;
  }
  
  throw new Error(`Environment variable ${name} is not defined`);
}

// Safe getter that returns undefined instead of throwing
export function getEnvVarSafe(name: string): string | undefined {
  try {
    return getEnvVar(name);
  } catch {
    return undefined;
  }
}