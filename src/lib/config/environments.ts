export type Environment = 'development' | 'staging' | 'production';

export function getEnvironment(): Environment {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') return 'production';
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') return 'staging';
  return 'development';
}

export function getEnvironmentConfig() {
  const env = getEnvironment();
  return {
    environment: env,
    isProduction: env === 'production',
    isStaging: env === 'staging',
    isDevelopment: env === 'development',
    showDevTools: env !== 'production',
    logLevel: env === 'production' ? 'error' : 'debug',
  };
}
