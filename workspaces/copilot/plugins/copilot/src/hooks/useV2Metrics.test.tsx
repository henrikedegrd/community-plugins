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

import { type ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import { copilotV2ApiRef } from '../api';
import {
  useV2Organizations,
  useV2PeriodRange,
  useV2LegacyStatus,
  useV2Entities,
  useV2MetricsDaily,
  useV2MetricsByFeature,
  useV2MetricsByIde,
} from './useV2Metrics';
import {
  MetricsV2EntityInfo,
  MetricsV2PeriodRange,
  MetricsV2LegacyStatus,
  MetricsV2DailyEntity,
  MetricsV2ByFeatureEntity,
  MetricsV2ByIdeEntity,
} from '@backstage-community/plugin-copilot-common';

// Mock API implementation
const mockApi = {
  getOrganizations: jest.fn(),
  getPeriodRange: jest.fn(),
  getLegacyStatus: jest.fn(),
  getEntities: jest.fn(),
  getMetricsDaily: jest.fn(),
  getMetricsByFeature: jest.fn(),
  getMetricsByIde: jest.fn(),
  getMetricsByLanguage: jest.fn(),
  getMetricsByModel: jest.fn(),
  getMetricsByModelFeature: jest.fn(),
  getAdoptionTrends: jest.fn(),
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestApiProvider apis={[[copilotV2ApiRef, mockApi]]}>
    {children}
  </TestApiProvider>
);

describe('useV2Organizations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch organizations successfully', async () => {
    const mockOrgs = ['org1', 'org2'];
    mockApi.getOrganizations.mockResolvedValue(mockOrgs);

    const { result } = renderHook(() => useV2Organizations(), { wrapper });

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.items).toBeUndefined();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items).toEqual(mockOrgs);
    expect(result.current.error).toBeUndefined();
  });

  it('should handle errors', async () => {
    const error = new Error('Failed to fetch');
    mockApi.getOrganizations.mockRejectedValue(error);

    const { result } = renderHook(() => useV2Organizations(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(error);
    expect(result.current.items).toBeUndefined();
  });
});

describe('useV2PeriodRange', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch period range successfully', async () => {
    const mockRange: MetricsV2PeriodRange = {
      min_date: '2024-01-01',
      max_date: '2024-12-31',
    };
    mockApi.getPeriodRange.mockResolvedValue(mockRange);

    const { result } = renderHook(() => useV2PeriodRange('organization'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.item).toEqual(mockRange);
    expect(mockApi.getPeriodRange).toHaveBeenCalledWith(
      'organization',
      undefined,
    );
  });
});

describe('useV2LegacyStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch legacy status successfully', async () => {
    const mockStatus: MetricsV2LegacyStatus = {
      has_v1_data: true,
      has_v2_data: true,
      v1_data_range: { min_date: '2023-01-01', max_date: '2024-03-31' },
      v2_data_range: { min_date: '2024-01-01', max_date: '2024-12-31' },
    };
    mockApi.getLegacyStatus.mockResolvedValue(mockStatus);

    const { result } = renderHook(() => useV2LegacyStatus(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.item).toEqual(mockStatus);
  });
});

describe('useV2Entities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch entities successfully', async () => {
    const mockEntities: MetricsV2EntityInfo[] = [
      { entity_name: 'org1', type: 'organization' },
      { entity_name: 'enterprise1', type: 'enterprise' },
    ];
    mockApi.getEntities.mockResolvedValue(mockEntities);

    const { result } = renderHook(() => useV2Entities(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items).toEqual(mockEntities);
  });
});

describe('useV2MetricsDaily', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch daily metrics successfully', async () => {
    const mockMetrics: MetricsV2DailyEntity[] = [
      {
        day: new Date('2024-06-01'),
        entity_type: 'organization',
        entity_name: 'org1',
        total_active_users: 100,
        total_chat_users: 50,
        total_agent_users: 10,
        code_generation_activity_count: 500,
        code_acceptance_activity_count: 300,
        user_initiated_interaction_count: 150,
        model_initiated_interaction_count: 20,
        loc_added_sum: 1000,
        loc_deleted_sum: 200,
      },
    ];
    mockApi.getMetricsDaily.mockResolvedValue(mockMetrics);

    const startDate = new Date('2024-06-01');
    const endDate = new Date('2024-06-30');

    const { result } = renderHook(
      () => useV2MetricsDaily(startDate, endDate, 'organization', 'org1'),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items).toEqual(mockMetrics);
    expect(mockApi.getMetricsDaily).toHaveBeenCalledWith({
      startDate,
      endDate,
      type: 'organization',
      entityName: 'org1',
    });
  });
});

describe('useV2MetricsByFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch feature metrics successfully', async () => {
    const mockMetrics: MetricsV2ByFeatureEntity[] = [
      {
        day: new Date('2024-06-01'),
        entity_type: 'organization',
        entity_name: 'org1',
        feature: 'code_completion',
        code_generation_activity_count: 300,
        code_acceptance_activity_count: 200,
        user_initiated_interaction_count: 0,
        model_initiated_interaction_count: 0,
        loc_added_sum: 500,
        loc_deleted_sum: 100,
      },
    ];
    mockApi.getMetricsByFeature.mockResolvedValue(mockMetrics);

    const startDate = new Date('2024-06-01');
    const endDate = new Date('2024-06-30');

    const { result } = renderHook(
      () => useV2MetricsByFeature(startDate, endDate, 'organization'),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items).toEqual(mockMetrics);
  });
});

describe('useV2MetricsByIde', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch IDE metrics successfully', async () => {
    const mockMetrics: MetricsV2ByIdeEntity[] = [
      {
        day: new Date('2024-06-01'),
        entity_type: 'organization',
        entity_name: 'org1',
        ide: 'vscode',
        code_generation_activity_count: 400,
        code_acceptance_activity_count: 250,
        user_initiated_interaction_count: 80,
        model_initiated_interaction_count: 5,
        loc_added_sum: 800,
        loc_deleted_sum: 150,
      },
    ];
    mockApi.getMetricsByIde.mockResolvedValue(mockMetrics);

    const startDate = new Date('2024-06-01');
    const endDate = new Date('2024-06-30');

    const { result } = renderHook(
      () => useV2MetricsByIde(startDate, endDate, 'organization'),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items).toEqual(mockMetrics);
  });
});
