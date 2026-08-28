import { config as dotenvConfig } from 'dotenv';
import path from 'path';

const requestedAppEnv = process.env.APP_ENV ?? process.env.EXPO_PUBLIC_APP_ENV;
const APP_ENV = requestedAppEnv ?? 'development';
const hasExplicitAppEnv = Boolean(requestedAppEnv);

if (!process.env.EXPO_PUBLIC_APP_ENV) {
  process.env.EXPO_PUBLIC_APP_ENV = APP_ENV;
}

const ENV_FILES = hasExplicitAppEnv
  ? [`.env.${APP_ENV}.local`, `.env.${APP_ENV}`, '.env.local', '.env']
  : [`.env.${APP_ENV}.local`, '.env.local', `.env.${APP_ENV}`, '.env'];

for (const file of ENV_FILES) {
  dotenvConfig({
    path: path.resolve(__dirname, file),
    override: false,
  });
}
