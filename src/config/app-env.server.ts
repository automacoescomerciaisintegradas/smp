import { z } from 'zod';

type EnvSource = Readonly<Record<string, string | undefined>>;

const appEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  META_API_VERSION: z.string().default('v25.0'),
  META_APP_ID: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),
  INSTAGRAM_REDIRECT_URI: z.string().url().optional(),
  INSTAGRAM_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_API_VERSION: z.string().default('v25.0'),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: z.string().optional(),
  WHATSAPP_BASE_URL: z.string().url().optional(),
  EVOLUTION_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_EVOLUTION_BASE_URL: z.string().url().optional(),
  EVOLUTION_API_KEY: z.string().optional(),
  BRAIN_BASE_DIR: z.string().optional(),
});

export type AppEnv = z.infer<typeof appEnvSchema>;

export function readAppEnv(env: EnvSource = process.env): AppEnv {
  return appEnvSchema.parse(env);
}

export function resolveAppBaseUrl(
  env: EnvSource = process.env,
  fallbackOrigin?: string
) {
  const parsedEnv = readAppEnv(env);
  return parsedEnv.NEXT_PUBLIC_APP_URL || parsedEnv.NEXTAUTH_URL || fallbackOrigin || 'http://localhost:3000';
}

export function resolveInstagramRedirectUri(
  env: EnvSource = process.env,
  fallbackOrigin?: string
) {
  const parsedEnv = readAppEnv(env);
  if (parsedEnv.INSTAGRAM_REDIRECT_URI) {
    return parsedEnv.INSTAGRAM_REDIRECT_URI;
  }

  return new URL('/api/ig-config/callback', resolveAppBaseUrl(env, fallbackOrigin)).toString();
}

export function getMetaAppCredentials(env: EnvSource = process.env) {
  const parsedEnv = readAppEnv(env);

  return {
    clientId: parsedEnv.META_APP_ID || parsedEnv.FACEBOOK_CLIENT_ID,
    clientSecret: parsedEnv.META_APP_SECRET || parsedEnv.FACEBOOK_CLIENT_SECRET,
  };
}
