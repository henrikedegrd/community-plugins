/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CopilotClientV2 } from './CopilotClientV2';
import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';

describe('CopilotClientV2', () => {
  let client: CopilotClientV2;
  let mockDiscoveryApi: jest.Mocked<DiscoveryApi>;
  let mockFetchApi: jest.Mocked<FetchApi>;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockDiscoveryApi = {
      getBaseUrl: jest
        .fn()
        .mockResolvedValue('http://localhost:7007/api/copilot'),
    };

    mockFetch = jest.fn();
    mockFetchApi = { fetch: mockFetch };

    client = new CopilotClientV2({
      discoveryApi: mockDiscoveryApi,
      fetchApi: mockFetchApi,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrganizations', () => {
    it('should fetch organizations', async () => {
      const mockOrgs = ['org1', 'org2'];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockOrgs),
      });

      const result = await client.getOrganizations();

      expect(result).toEqual(mockOrgs);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/copilot/v2/organizations',
      );
    });

    it('should throw on error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(client.getOrganizations()).rejects.toThrow();
    });
  });

  describe('getPeriodRange', () => {
    it('should fetch period range for organization', async () => {
      const mockRange = { min_date: '2024-01-01', max_date: '2024-12-31' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRange),
      });

      const result = await client.getPeriodRange('organization');

      expect(result).toEqual(mockRange);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/copilot/v2/period-range?type=organization',
      );
    });

    it('should include entity name when provided', async () => {
      const mockRange = { min_date: '2024-01-01', max_date: '2024-12-31' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRange),
      });

      await client.getPeriodRange('organization', 'my-org');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/copilot/v2/period-range?type=organization&entityName=my-org',
      );
    });
  });

  describe('getLegacyStatus', () => {
    it('should fetch legacy status', async () => {
      const mockStatus = {
        has_v1_data: true,
        has_v2_data: true,
        v1_data_range: { min_date: '2023-01-01', max_date: '2024-03-31' },
        v2_data_range: { min_date: '2024-01-01', max_date: '2024-12-31' },
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStatus),
      });

      const result = await client.getLegacyStatus();

      expect(result).toEqual(mockStatus);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/copilot/v2/legacy-status',
      );
    });
  });

  describe('getEntities', () => {
    it('should fetch all entities', async () => {
      const mockEntities = [
        { entity_name: 'org1', type: 'organization' },
        { entity_name: 'enterprise1', type: 'enterprise' },
      ];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockEntities),
      });

      const result = await client.getEntities();

      expect(result).toEqual(mockEntities);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/copilot/v2/entities',
      );
    });
  });

  describe('getMetricsDaily', () => {
    it('should fetch daily metrics with all parameters', async () => {
      const mockMetrics = [
        {
          day: '2024-06-01',
          total_active_users: 100,
          total_chat_users: 50,
          total_agent_users: 10,
        },
      ];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockMetrics),
      });

      const result = await client.getMetricsDaily({
        type: 'organization',
        entityName: 'my-org',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-30'),
      });

      expect(result).toEqual(mockMetrics);
      // Check the URL contains the expected parameters
      expect(mockFetch).toHaveBeenCalled();
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('v2/metrics/daily');
      expect(calledUrl).toContain('startDate=2024-06-01');
      expect(calledUrl).toContain('endDate=2024-06-30');
      expect(calledUrl).toContain('type=organization');
      expect(calledUrl).toContain('entityName=my-org');
    });

    it('should fetch daily metrics without optional parameters', async () => {
      const mockMetrics = [{ day: '2024-06-01', total_active_users: 100 }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockMetrics),
      });

      await client.getMetricsDaily({
        type: 'enterprise',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-30'),
      });

      expect(mockFetch).toHaveBeenCalled();
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('v2/metrics/daily');
      expect(calledUrl).toContain('type=enterprise');
    });
  });

  describe('getMetricsByIde', () => {
    it('should fetch IDE metrics', async () => {
      const mockMetrics = [
        {
          day: '2024-06-01',
          ide: 'vscode',
          code_generation_activity_count: 100,
        },
      ];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockMetrics),
      });

      const result = await client.getMetricsByIde({
        type: 'organization',
        entityName: 'my-org',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-30'),
      });

      expect(result).toEqual(mockMetrics);
      expect(mockFetch).toHaveBeenCalled();
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('v2/metrics/by-ide');
    });
  });

  describe('getMetricsByFeature', () => {
    it('should fetch feature metrics', async () => {
      const mockMetrics = [
        {
          day: '2024-06-01',
          feature: 'code_completion',
          code_generation_activity_count: 200,
        },
      ];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockMetrics),
      });

      const result = await client.getMetricsByFeature({
        type: 'organization',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-30'),
      });

      expect(result).toEqual(mockMetrics);
      expect(mockFetch).toHaveBeenCalled();
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('v2/metrics/by-feature');
    });
  });

  describe('getMetricsByLanguage', () => {
    it('should fetch language metrics', async () => {
      const mockMetrics = [
        {
          day: '2024-06-01',
          language: 'typescript',
          code_generation_activity_count: 150,
        },
      ];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockMetrics),
      });

      const result = await client.getMetricsByLanguage({
        type: 'organization',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-30'),
      });

      expect(result).toEqual(mockMetrics);
      expect(mockFetch).toHaveBeenCalled();
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('v2/metrics/by-language');
    });
  });

  describe('getMetricsByModel', () => {
    it('should fetch model metrics', async () => {
      const mockMetrics = [
        {
          day: '2024-06-01',
          model: 'gpt-4',
          code_generation_activity_count: 300,
        },
      ];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockMetrics),
      });

      const result = await client.getMetricsByModel({
        type: 'organization',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-30'),
      });

      expect(result).toEqual(mockMetrics);
      expect(mockFetch).toHaveBeenCalled();
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('v2/metrics/by-model');
    });
  });

  describe('getMetricsByModelFeature', () => {
    it('should fetch model-feature metrics', async () => {
      const mockMetrics = [
        {
          day: '2024-06-01',
          model: 'gpt-4',
          feature: 'code_completion',
          code_generation_activity_count: 100,
        },
      ];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockMetrics),
      });

      const result = await client.getMetricsByModelFeature({
        type: 'organization',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-30'),
      });

      expect(result).toEqual(mockMetrics);
      expect(mockFetch).toHaveBeenCalled();
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('v2/metrics/by-model-feature');
    });
  });

  describe('getAdoptionTrends', () => {
    it('should fetch adoption trends', async () => {
      const mockTrends = [
        { day: '2024-06-01', total_active_users: 100, total_chat_users: 50 },
      ];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTrends),
      });

      const result = await client.getAdoptionTrends({
        type: 'organization',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-30'),
      });

      expect(result).toEqual(mockTrends);
      expect(mockFetch).toHaveBeenCalled();
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('v2/metrics/adoption');
    });
  });
});
