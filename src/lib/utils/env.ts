interface GlobalThisWithProcess {
  process?: {
    env?: Record<string, string | undefined>;
  };
}

// Environment variable helper for Cloudflare Edge Runtime
export function getEnvVar(name: string): string {
  // In Cloudflare Pages/Workers, env vars are available via process.env at runtime
  const globalWithProcess = globalThis as GlobalThisWithProcess;
  const value = globalWithProcess.process?.env?.[name] || 
                (typeof process !== 'undefined' ? process.env?.[name] : undefined);
  
  if (!value) {
    console.error(`[ENV ERROR] ${name} is not defined`);
    throw new Error(`Environment variable ${name} is not defined`);
  }
  
  return value;
}

// Safe getter that returns undefined instead of throwing
export function getEnvVarSafe(name: string): string | undefined {
  try {
    return getEnvVar(name);
  } catch {
    return undefined;
  }
}