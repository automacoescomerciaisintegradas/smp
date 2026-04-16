// Types para APIs sociais (Instagram, WhatsApp, Facebook)

export interface InstagramMessageRequest {
  recipientId: string;
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  attachmentId?: string;
  accessToken?: string;
}

export interface InstagramMessageResponse {
  success?: boolean;
  data?: {
    message_id?: string;
    messaging_product: string;
  };
  error?: unknown;
}

export interface InstagramConversation {
  id: string;
  comments?: {
    data: Array<{
      id: string;
      from: { id: string; username: string };
      media?: { id: string };
      text?: string;
      timestamp: string;
    }>;
    paging?: {
      cursors?: { before: string; after: string };
      next?: string;
    };
  };
}

export interface InstagramConversationsResponse {
  conversations?: {
    data: InstagramConversation[];
    paging?: {
      cursors?: { before: string; after: string };
      next?: string;
    };
  };
  error?: unknown;
}

export interface WhatsAppTemplateMessage {
  recipientId: string;
  templateName: string;
  language: string;
  components?: Array<{
    type: string;
    parameters: Array<{
      type: string;
      text?: string;
      image?: { link: string };
      video?: { link: string };
      document?: { link: string; filename?: string };
    }>;
  }>;
  accessToken?: string;
}

export interface SocialMediaPlatform {
  instagram: 'instagram';
  whatsapp: 'whatsapp';
  facebook: 'facebook';
}

export type Platform = SocialMediaPlatform[keyof SocialMediaPlatform];

export interface SocialMessage {
  id?: string;
  platform: Platform;
  recipientId: string;
  senderId?: string;
  content: string;
  mediaType?: 'text' | 'image' | 'video' | 'audio' | 'document';
  mediaUrl?: string;
  timestamp?: Date;
  direction?: 'inbound' | 'outbound';
  status?: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface ApiErrorResponse {
  error: {
    message: string;
    code?: number;
    type?: string;
    fbtrace_id?: string;
  };
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  timestamp?: string;
}

export interface InstagramAccountInfo {
  id: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
  biography?: string;
  website?: string;
  token_expires_at?: number;
  token_data_access_expires_at?: number;
}

export interface MessageMetrics {
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  total: number;
}

// ========================
// WhatsApp Cloud API Types
// ========================

export interface WhatsAppTextMessage {
  to: string;
  text: string;
  preview_url?: boolean;
  accessToken?: string;
}

export type WhatsAppMediaType = 'image' | 'video' | 'audio' | 'document' | 'sticker';

export interface WhatsAppMediaMessage {
  to: string;
  mediaType: WhatsAppMediaType;
  mediaUrl?: string;
  mediaId?: string;
  caption?: string;
  filename?: string;
  accessToken?: string;
}

export interface WhatsAppPixPaymentItem {
  retailer_id?: string;
  name: string;
  amount: { value: number; offset: number };
  quantity: number;
  sale_amount?: { value: number; offset: number };
}

export interface WhatsAppPixOrder {
  to: string;
  referenceId: string;
  items: WhatsAppPixPaymentItem[];
  tax?: { value: number; offset: number; description?: string };
  shipping?: { value: number; offset: number; description?: string };
  discount?: { value: number; offset: number; description?: string };
  pixCode: string;
  pixKey: string;
  pixKeyType: 'EVP' | 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE';
  merchantName: string;
  bodyText?: string;
  accessToken?: string;
}

export interface WhatsAppInteractiveMessage {
  to: string;
  interactiveType: 'list' | 'button' | 'product' | 'product_list' | 'order_details';
  header?: { type: 'text' | 'image' | 'video' | 'document'; text?: string; link?: string };
  body: string;
  footer?: string;
  action: Record<string, unknown>;
  accessToken?: string;
}

// Webhook types

export interface WhatsAppWebhookPayload {
  object: 'whatsapp_business_account';
  entry: WhatsAppWebhookEntry[];
}

export interface WhatsAppWebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: 'whatsapp';
      metadata: { display_phone_number: string; phone_number_id: string };
      contacts?: Array<{ profile: { name: string }; wa_id: string }>;
      messages?: WhatsAppIncomingMessage[];
      statuses?: WhatsAppStatusUpdate[];
    };
    field: string;
  }>;
}

export interface WhatsAppIncomingMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'location' | 'contacts' | 'interactive' | 'button' | 'reaction' | 'order';
  text?: { body: string };
  image?: { id: string; mime_type: string; sha256: string; caption?: string };
  video?: { id: string; mime_type: string; sha256: string; caption?: string };
  audio?: { id: string; mime_type: string; sha256: string };
  document?: { id: string; mime_type: string; sha256: string; filename?: string; caption?: string };
  sticker?: { id: string; mime_type: string; sha256: string };
  location?: { latitude: number; longitude: number; name?: string; address?: string };
  referral?: {
    source_url: string;
    source_type: string;
    source_id: string;
    headline?: string;
    body?: string;
    media_type?: string;
    image_url?: string;
    video_url?: string;
    thumbnail_url?: string;
    ctwa_clid?: string;
    ref?: string;
  };
  context?: { from: string; id: string };
}

export interface WhatsAppStatusUpdate {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  errors?: Array<{ code: number; title: string; message: string; error_data?: { details: string } }>;
}

export interface WhatsAppWelcomeSequence {
  id?: string;
  name: string;
  welcomeMessage: {
    text: string;
    autofill_message?: { content: string };
    ice_breakers?: Array<{ title: string }>;
  };
}

export interface WhatsAppConversationSummary {
  id: string;
  contactPhone: string;
  contactName: string;
  lastMessageText: string;
  lastMessageAt: string;
  unreadCount: number;
  platform: 'whatsapp';
}

export interface WhatsAppApiResponse {
  messaging_product: 'whatsapp';
  contacts?: Array<{ input: string; wa_id: string }>;
  messages?: Array<{ id: string; message_status?: string }>;
}
