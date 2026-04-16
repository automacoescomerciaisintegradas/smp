import { z } from 'zod';

/**
 * Environment validation schema for SAMA
 * Validates all required Meta API credentials and configuration
 */

const samaEnvSchema = z.object({
  // Meta Ads API Configuration
  META_ACCESS_TOKEN: z.string().min(1, 'META_ACCESS_TOKEN is required'),
  META_AD_ACCOUNT_ID: z.string()
    .min(1, 'META_AD_ACCOUNT_ID is required')
    .regex(/^act_\d+$/, 'META_AD_ACCOUNT_ID must start with "act_" (e.g., act_123456789)'),
  META_BUSINESS_ID: z.string().optional(),
  META_API_VERSION: z.string().default('v19.0'),

  // Meta OAuth Configuration
  META_APP_ID: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  META_OAUTH_REDIRECT_URI: z.string().url().optional(),

  // Application Configuration
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().url().optional(),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Optional: Instagram Configuration
  INSTAGRAM_ACCESS_TOKEN: z.string().optional(),
  INSTAGRAM_BUSINESS_ACCOUNT_ID: z.string().optional(),

  // Optional: WhatsApp Configuration
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),

  // Optional: Logging
  LOG_LEVEL: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR']).default('INFO'),
});

export type SamaEnvConfig = z.infer<typeof samaEnvSchema>;

/**
 * Validate SAMA environment variables
 * Throws ValidationError if any required variable is missing or invalid
 */
export function validateSamaEnv(): SamaEnvConfig {
  try {
    const envVars = {
      META_ACCESS_TOKEN: process.env.META_ACCESS_TOKEN,
      META_AD_ACCOUNT_ID: process.env.META_AD_ACCOUNT_ID,
      META_BUSINESS_ID: process.env.META_BUSINESS_ID,
      META_API_VERSION: process.env.META_API_VERSION || 'v19.0',
      META_APP_ID: process.env.META_APP_ID,
      META_APP_SECRET: process.env.META_APP_SECRET,
      META_OAUTH_REDIRECT_URI: process.env.META_OAUTH_REDIRECT_URI,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      DATABASE_URL: process.env.DATABASE_URL,
      INSTAGRAM_ACCESS_TOKEN: process.env.INSTAGRAM_ACCESS_TOKEN,
      INSTAGRAM_BUSINESS_ACCOUNT_ID: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID,
      WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
      WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
      LOG_LEVEL: process.env.LOG_LEVEL || 'INFO',
    };

    return samaEnvSchema.parse(envVars);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Missing or invalid SAMA environment variables:\n${error.issues.map(issue =>
          `- ${issue.path.join('.')}: ${issue.message}`
        ).join('\n')}`
      );
    }
    throw error;
  }
}

/**
 * Get validated Meta API configuration
 */
export function getMetaApiConfig(): {
  accessToken: string;
  adAccountId: string;
  businessId?: string;
  apiVersion: string;
  baseUrl: string;
} {
  const config = validateSamaEnv();

  return {
    accessToken: config.META_ACCESS_TOKEN,
    adAccountId: config.META_AD_ACCOUNT_ID,
    businessId: config.META_BUSINESS_ID,
    apiVersion: config.META_API_VERSION,
    baseUrl: 'https://graph.facebook.com',
  };
}
