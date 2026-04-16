import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InsightService } from '../../src/services/meta/insight.service';
import type { InsightMetrics, PerformanceClassification } from '../../src/types/sama';

describe('InsightService', () => {
  let insightService: InsightService;
  let mockInsightRepository: any;
  let mockMetaClient: any;

  beforeEach(() => {
    mockInsightRepository = {
      getCampaignInsights: vi.fn(),
      getTopPerformers: vi.fn(),
      cacheInsights: vi.fn(),
      deleteOldInsights: vi.fn(),
    };

    mockMetaClient = {
      get: vi.fn(),
      post: vi.fn(),
    };

    insightService = new InsightService(mockInsightRepository, mockMetaClient);
  });

  describe('classifyPerformance', () => {
    it('should classify as WIN when ROAS >= 3 and CTR > 0.02', () => {
      const metrics: InsightMetrics = {
        roas: 4.5,
        ctr: 0.03,
        cpa: 20,
        cpc: 0.5,
        cpm: 10,
        impressions: 10000,
        reach: 8000,
        clicks: 300,
        spend: 150,
        conversions: 50,
        frequency: 1.25,
      };

      const result = insightService.classifyPerformance(metrics);

      expect(result).toBe('WIN');
    });

    it('should classify as LOSS when ROAS < 1', () => {
      const metrics: InsightMetrics = {
        roas: 0.5,
        ctr: 0.01,
        cpa: 150,
        cpc: 1.5,
        cpm: 15,
        impressions: 5000,
        reach: 4000,
        clicks: 50,
        spend: 500,
        conversions: 2,
        frequency: 1.25,
      };

      const result = insightService.classifyPerformance(metrics);

      expect(result).toBe('LOSS');
    });

    it('should classify as LOSS when CPA > 100', () => {
      const metrics: InsightMetrics = {
        roas: 2.0,
        ctr: 0.02,
        cpa: 120,
        cpc: 1.0,
        cpm: 12,
        impressions: 8000,
        reach: 6000,
        clicks: 100,
        spend: 600,
        conversions: 5,
        frequency: 1.33,
      };

      const result = insightService.classifyPerformance(metrics);

      expect(result).toBe('LOSS');
    });

    it('should classify as NEUTRAL when metrics are between thresholds', () => {
      const metrics: InsightMetrics = {
        roas: 2.0,
        ctr: 0.015,
        cpa: 50,
        cpc: 0.8,
        cpm: 11,
        impressions: 7000,
        reach: 5500,
        clicks: 150,
        spend: 300,
        conversions: 20,
        frequency: 1.27,
      };

      const result = insightService.classifyPerformance(metrics);

      expect(result).toBe('NEUTRAL');
    });
  });

  describe('calculateScore', () => {
    it('should calculate high score for excellent metrics', () => {
      const metrics: InsightMetrics = {
        roas: 5.0,
        ctr: 0.05,
        cpa: 10,
        cpc: 0.3,
        cpm: 8,
        impressions: 20000,
        reach: 15000,
        clicks: 1000,
        spend: 300,
        conversions: 100,
        frequency: 1.33,
      };

      const score = insightService.calculateScore(metrics);

      expect(score).toBeGreaterThan(70);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should calculate low score for poor metrics', () => {
      const metrics: InsightMetrics = {
        roas: 0.5,
        ctr: 0.005,
        cpa: 200,
        cpc: 2.0,
        cpm: 20,
        impressions: 1000,
        reach: 800,
        clicks: 10,
        spend: 1000,
        conversions: 1,
        frequency: 1.25,
      };

      const score = insightService.calculateScore(metrics);

      expect(score).toBeLessThan(30);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should return score between 0 and 100', () => {
      const metrics: InsightMetrics = {
        roas: 2.0,
        ctr: 0.02,
        cpa: 50,
        cpc: 0.8,
        cpm: 10,
        impressions: 5000,
        reach: 4000,
        clicks: 100,
        spend: 200,
        conversions: 10,
        frequency: 1.25,
      };

      const score = insightService.calculateScore(metrics);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});
