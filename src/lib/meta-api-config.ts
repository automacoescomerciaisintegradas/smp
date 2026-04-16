import { readAppEnv } from '@/config/app-env.server';

const appEnv = readAppEnv();

export const META_API_VERSION = appEnv.META_API_VERSION;
export const WHATSAPP_API_VERSION = appEnv.WHATSAPP_API_VERSION;
export const GRAPH_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`;
export const WHATSAPP_PHONE_NUMBER_ID = appEnv.WHATSAPP_PHONE_NUMBER_ID;
export const WHATSAPP_BUSINESS_ACCOUNT_ID = appEnv.WHATSAPP_BUSINESS_ACCOUNT_ID;
export const WHATSAPP_ACCESS_TOKEN = appEnv.WHATSAPP_ACCESS_TOKEN;
export const WHATSAPP_WEBHOOK_VERIFY_TOKEN = appEnv.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
