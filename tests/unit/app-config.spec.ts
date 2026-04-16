import { describe, expect, it } from 'vitest';
import { appConfig, getPageTitle } from '@/config/app-config';
import {
  getMetaAppCredentials,
  resolveAppBaseUrl,
  resolveInstagramRedirectUri,
} from '@/config/app-env.server';

describe('appConfig', () => {
  it('usa o nome do produto como fallback de título', () => {
    expect(getPageTitle()).toBe(appConfig.productName);
  });

  it('monta títulos com o nome unificado do produto', () => {
    expect(getPageTitle('Onboarding')).toBe(`Onboarding | ${appConfig.productName}`);
  });
});

describe('appEnv', () => {
  it('prioriza NEXT_PUBLIC_APP_URL para resolver a base da aplicação', () => {
    const baseUrl = resolveAppBaseUrl(
      {
        NEXT_PUBLIC_APP_URL: 'https://instabot.example.com',
        NEXTAUTH_URL: 'https://fallback.example.com',
      },
      'http://localhost:3000'
    );

    expect(baseUrl).toBe('https://instabot.example.com');
  });

  it('monta o redirect URI do Instagram a partir da base quando não existe variável explícita', () => {
    const redirectUri = resolveInstagramRedirectUri(
      {
        NEXTAUTH_URL: 'https://app.example.com',
      },
      'http://localhost:3000'
    );

    expect(redirectUri).toBe('https://app.example.com/api/ig-config/callback');
  });

  it('resolve credenciais Meta com fallback para Facebook OAuth', () => {
    const credentials = getMetaAppCredentials({
      FACEBOOK_CLIENT_ID: 'fb-client-id',
      FACEBOOK_CLIENT_SECRET: 'fb-client-secret',
    });

    expect(credentials).toEqual({
      clientId: 'fb-client-id',
      clientSecret: 'fb-client-secret',
    });
  });
});
