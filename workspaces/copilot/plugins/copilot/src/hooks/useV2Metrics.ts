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

import useAsync from 'react-use/lib/useAsync';
import { useApi } from '@backstage/core-plugin-api';
import {
  MetricsV2DailyEntity,
  MetricsV2ByIdeEntity,
  MetricsV2ByFeatureEntity,
  MetricsV2ByLanguageFeatureEntity,
  MetricsV2ByLanguageModelEntity,
  MetricsV2ByModelFeatureEntity,
  MetricsV2EntityType,
  MetricsV2PeriodRange,
  MetricsV2EntityInfo,
  MetricsV2AdoptionTrend,
  MetricsV2LegacyStatus,
} from '@backstage-community/plugin-copilot-common';
import { copilotV2ApiRef } from '../api';

/**
 * Hook to fetch V2 organizations list.
 */
export function useV2Organizations(): {
  items?: string[];
  loading: boolean;
  error?: Error;
} {
  const api = useApi(copilotV2ApiRef);

  const { value, loading, error } = useAsync(
    () => api.getOrganizations(),
    [api],
  );

  return { items: value, loading, error };
}

/**
 * Hook to fetch V2 period range.
 */
export function useV2PeriodRange(
  type?: MetricsV2EntityType,
  entityName?: string,
): {
  item?: MetricsV2PeriodRange;
  loading: boolean;
  error?: Error;
} {
  const api = useApi(copilotV2ApiRef);

  const { value, loading, error } = useAsync(
    () => api.getPeriodRange(type, entityName),
    [api, type, entityName],
  );

  return { item: value, loading, error };
}

/**
 * Hook to fetch legacy status.
 */
export function useV2LegacyStatus(): {
  item?: MetricsV2LegacyStatus;
  loading: boolean;
  error?: Error;
} {
  const api = useApi(copilotV2ApiRef);

  const { value, loading, error } = useAsync(
    () => api.getLegacyStatus(),
    [api],
  );

  return { item: value, loading, error };
}

/**
 * Hook to fetch V2 entities.
 */
export function useV2Entities(type?: MetricsV2EntityType): {
  items?: MetricsV2EntityInfo[];
  loading: boolean;
  error?: Error;
} {
  const api = useApi(copilotV2ApiRef);

  const { value, loading, error } = useAsync(
    () => api.getEntities(type),
    [api, type],
  );

  return { items: value, loading, error };
}

/**
 * Hook to fetch V2 daily metrics.
 */
export function useV2MetricsDaily(
  startDate: Date,
  endDate: Date,
  type?: MetricsV2EntityType,
  entityName?: string,
): {
  items?: MetricsV2DailyEntity[];
  loading: boolean;
  error?: Error;
} {
  const api = useApi(copilotV2ApiRef);

  const { value, loading, error } = useAsync(
    () => api.getMetricsDaily({ startDate, endDate, type, entityName }),
    [api, startDate, endDate, type, entityName],
  );

  return { items: value, loading, error };
}

/**
 * Hook to fetch V2 metrics by IDE.
 */
export function useV2MetricsByIde(
  startDate: Date,
  endDate: Date,
  type?: MetricsV2EntityType,
  entityName?: string,
): {
  items?: MetricsV2ByIdeEntity[];
  loading: boolean;
  error?: Error;
} {
  const api = useApi(copilotV2ApiRef);

  const { value, loading, error } = useAsync(
    () => api.getMetricsByIde({ startDate, endDate, type, entityName }),
    [api, startDate, endDate, type, entityName],
  );

  return { items: value, loading, error };
}

/**
 * Hook to fetch V2 metrics by feature.
 */
export function useV2MetricsByFeature(
  startDate: Date,
  endDate: Date,
  type?: MetricsV2EntityType,
  entityName?: string,
): {
  items?: MetricsV2ByFeatureEntity[];
  loading: boolean;
  error?: Error;
} {
  const api = useApi(copilotV2ApiRef);

  const { value, loading, error } = useAsync(
    () => api.getMetricsByFeature({ startDate, endDate, type, entityName }),
    [api, startDate, endDate, type, entityName],
  );

  return { items: value, loading, error };
}

/**
 * Hook to fetch V2 metrics by language.
 */
export function useV2MetricsByLanguage(
  startDate: Date,
  endDate: Date,
  type?: MetricsV2EntityType,
  entityName?: string,
): {
  items?: MetricsV2ByLanguageFeatureEntity[];
  loading: boolean;
  error?: Error;
} {
  const api = useApi(copilotV2ApiRef);

  const { value, loading, error } = useAsync(
    () => api.getMetricsByLanguage({ startDate, endDate, type, entityName }),
    [api, startDate, endDate, type, entityName],
  );

  return { items: value, loading, error };
}

/**
 * Hook to fetch V2 metrics by model.
 */
export function useV2MetricsByModel(
  startDate: Date,
  endDate: Date,
  type?: MetricsV2EntityType,
  entityName?: string,
): {
  items?: MetricsV2ByLanguageModelEntity[];
  loading: boolean;
  error?: Error;
} {
  const api = useApi(copilotV2ApiRef);

  const { value, loading, error } = useAsync(
    () => api.getMetricsByModel({ startDate, endDate, type, entityName }),
    [api, startDate, endDate, type, entityName],
  );

  return { items: value, loading, error };
}

/**
 * Hook to fetch V2 metrics by model and feature.
 */
export function useV2MetricsByModelFeature(
  startDate: Date,
  endDate: Date,
  type?: MetricsV2EntityType,
  entityName?: string,
): {
  items?: MetricsV2ByModelFeatureEntity[];
  loading: boolean;
  error?: Error;
} {
  const api = useApi(copilotV2ApiRef);

  const { value, loading, error } = useAsync(
    () =>
      api.getMetricsByModelFeature({ startDate, endDate, type, entityName }),
    [api, startDate, endDate, type, entityName],
  );

  return { items: value, loading, error };
}

/**
 * Hook to fetch V2 adoption trends.
 */
export function useV2AdoptionTrends(
  startDate: Date,
  endDate: Date,
  type?: MetricsV2EntityType,
  entityName?: string,
): {
  items?: MetricsV2AdoptionTrend[];
  loading: boolean;
  error?: Error;
} {
  const api = useApi(copilotV2ApiRef);

  const { value, loading, error } = useAsync(
    () => api.getAdoptionTrends({ startDate, endDate, type, entityName }),
    [api, startDate, endDate, type, entityName],
  );

  return { items: value, loading, error };
}
