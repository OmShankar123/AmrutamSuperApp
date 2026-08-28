import { z } from 'zod';

import packageJSON from './package.json';

const envSchema = z.object({
  EXPO_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']),
  EXPO_PUBLIC_NAME: z.string(),
  EXPO_PUBLIC_PACKAGE_NAME: z.string(),
  EXPO_PUBLIC_VERSION: z.string(),
  EXPO_PUBLIC_API_URL: z.string(),
  EXPO_PUBLIC_SOCKET_URL: z.string(),
});

type AppEnvironment = z.infer<typeof envSchema>['EXPO_PUBLIC_APP_ENV'];

const EXPO_PUBLIC_APP_ENV = (process.env.EXPO_PUBLIC_APP_ENV ?? 'development') as AppEnvironment;

const APP_NAMES: Record<AppEnvironment, string> = {
  development: 'Amrutam (Dev)',
  staging: 'Amrutam (Staging)',
  production: 'Amrutam',
};

const PACKAGE_NAME = 'com.amrutam.superapp';

const _env: z.infer<typeof envSchema> = {
  EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_NAME: APP_NAMES[EXPO_PUBLIC_APP_ENV],
  EXPO_PUBLIC_PACKAGE_NAME: PACKAGE_NAME,
  EXPO_PUBLIC_VERSION: packageJSON.version,
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL ?? 'https://api.amrutam.co.in/dev',
  EXPO_PUBLIC_SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL ?? 'https://socket.amrutam.co.in',
};

const STRICT_ENV_VALIDATION = process.env.STRICT_ENV_VALIDATION === '1';

function getValidatedEnv(env: z.infer<typeof envSchema>) {
  const parsed = envSchema.safeParse(env);

  if (!parsed.success) {
    const errorMessage = `[Env] Invalid environment variables:\n${JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)}`;
    if (STRICT_ENV_VALIDATION) {
      throw new Error(errorMessage);
    }
    if (__DEV__) {
      console.warn(errorMessage);
    }
  }

  return parsed.success ? parsed.data : env;
}

const Env = getValidatedEnv(_env);

export default Env;
export type AppEnv = typeof Env.EXPO_PUBLIC_APP_ENV;
