import type { MetaApiConfig, MetaApiResponse } from '../../types/sama';
import { ExternalApiError, RateLimitError } from '../../errors';
import { createLogger } from '../../lib/logger';

/**
 * Base Meta Ads API Client
 * Handles authentication, rate limiting, and retry logic
 */

const logger = createLogger('MetaApiClient');

export class MetaApiClient {
  private config: MetaApiConfig;
  private retryCount: number;
  private maxRetries: number;

  constructor(config: MetaApiConfig, maxRetries = 3) {
    this.config = config;
    this.retryCount = 0;
    this.maxRetries = maxRetries;
  }

  /**
   * Make GET request to Meta API
   */
  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<MetaApiResponse<T>> {
    const url = this.buildUrl(endpoint, params);
    return this.makeRequest<T>('GET', url);
  }

  /**
   * Make POST request to Meta API
   */
  async post<T>(endpoint: string, body?: Record<string, unknown>): Promise<MetaApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    return this.makeRequest<T>('POST', url, body);
  }

  /**
   * Make DELETE request to Meta API
   */
  async delete<T>(endpoint: string): Promise<MetaApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    return this.makeRequest<T>('DELETE', url);
  }

  /**
   * Upload file to Meta API
   */
  async uploadFile(endpoint: string, formData: FormData): Promise<MetaApiResponse<any>> {
    const url = this.buildUrl(endpoint);
    return this.makeRequest('POST', url, formData, true);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MetaApiConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Build full URL for Meta API endpoint
   */
  private buildUrl(endpoint: string, params?: Record<string, unknown>): string {
    const baseUrl = `${this.config.baseUrl}/${this.config.apiVersion}`;
    const url = `${baseUrl}/${endpoint.replace(/^\//, '')}`;

    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      return `${url}?${searchParams.toString()}`;
    }

    return url;
  }

  /**
   * Make HTTP request with retry and error handling
   */
  private async makeRequest<T>(
    method: string,
    url: string,
    body?: Record<string, unknown> | FormData,
    isFileUpload = false
  ): Promise<MetaApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${this.config.accessToken}`,
      };

      if (!isFileUpload && body && !(body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      const fetchOptions: RequestInit = {
        method,
        headers,
      };

      if (body) {
        if (body instanceof FormData) {
          fetchOptions.body = body;
        } else {
          fetchOptions.body = JSON.stringify(body);
        }
      }

      logger.debug(`${method} ${url}`, { adAccountId: this.config.adAccountId });

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw this.createErrorFromResponse(errorData, response.status, url);
      }

      const data = await response.json();

      logger.info(`${method} ${url} - Success`, {
        statusCode: response.status,
      });

      this.retryCount = 0; // Reset retry counter on success

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      logger.error(`${method} ${url} - Failed`, error, {
        retryCount: this.retryCount,
      });

      if (error instanceof RateLimitError || error instanceof ExternalApiError) {
        throw error;
      }

      throw new ExternalApiError(
        `Meta API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        url,
        error
      );
    }
  }

  /**
   * Create appropriate error from API response
   */
  private createErrorFromResponse(
    errorData: any,
    statusCode: number,
    url: string
  ): Error {
    const message = errorData?.error?.message || 'Meta API error';
    const errorCode = errorData?.error?.code || statusCode;

    // Rate limit errors
    if (errorCode === 4 || errorCode === 17 || errorCode === 32 || errorCode === 341) {
      const retryAfter = this.extractRetryAfter(errorData);
      return new RateLimitError(message, retryAfter);
    }

    // OAuth errors
    if (errorCode === 190 || errorCode === 463) {
      return new ExternalApiError('Token expired or invalid', url);
    }

    return new ExternalApiError(message, url, errorData);
  }

  /**
   * Extract retry-after time from rate limit error
   */
  private extractRetryAfter(errorData: any): number | undefined {
    if (errorData?.error?.error_subcode === 1870042) {
      return 60 * 60 * 1000; // 1 hour
    }
    return undefined;
  }
}

export function createMetaApiClient(config: MetaApiConfig): MetaApiClient {
  return new MetaApiClient(config);
}
