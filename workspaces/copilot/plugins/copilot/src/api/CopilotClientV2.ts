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

import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import { CopilotV2Api, MetricsV2QueryParams } from './CopilotApiV2';
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
import { DateTime } from 'luxon';

/**
 * Client implementation for the Copilot V2 API.
 *
 * @public
 */
export class CopilotClientV2 implements CopilotV2Api {
  constructor(
    private readonly options: {
      discoveryApi: DiscoveryApi;
      fetchApi: FetchApi;
    },
  ) {}

  async getOrganizations(): Promise<string[]> {
    return this.get<string[]>('v2/organizations');
  }

  async getPeriodRange(
    type?: MetricsV2EntityType,
    entityName?: string,
  ): Promise<MetricsV2PeriodRange> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (entityName) params.append('entityName', entityName);

    const query = params.toString();
    return this.get<MetricsV2PeriodRange>(
      `v2/period-range${query ? `?${query}` : ''}`,
    );
  }

  async getLegacyStatus(): Promise<MetricsV2LegacyStatus> {
    return this.get<MetricsV2LegacyStatus>('v2/legacy-status');
  }

  async getEntities(
    type?: MetricsV2EntityType,
  ): Promise<MetricsV2EntityInfo[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);

    const query = params.toString();
    return this.get<MetricsV2EntityInfo[]>(
      `v2/entities${query ? `?${query}` : ''}`,
    );
  }

  async getMetricsDaily(
    params: MetricsV2QueryParams,
  ): Promise<MetricsV2DailyEntity[]> {
    return this.get<MetricsV2DailyEntity[]>(
      `v2/metrics/daily?${this.buildQueryString(params)}`,
    );
  }

  async getMetricsByIde(
    params: MetricsV2QueryParams,
  ): Promise<MetricsV2ByIdeEntity[]> {
    return this.get<MetricsV2ByIdeEntity[]>(
      `v2/metrics/by-ide?${this.buildQueryString(params)}`,
    );
  }

  async getMetricsByFeature(
    params: MetricsV2QueryParams,
  ): Promise<MetricsV2ByFeatureEntity[]> {
    return this.get<MetricsV2ByFeatureEntity[]>(
      `v2/metrics/by-feature?${this.buildQueryString(params)}`,
    );
  }

  async getMetricsByLanguage(
    params: MetricsV2QueryParams,
  ): Promise<MetricsV2ByLanguageFeatureEntity[]> {
    return this.get<MetricsV2ByLanguageFeatureEntity[]>(
      `v2/metrics/by-language?${this.buildQueryString(params)}`,
    );
  }

  async getMetricsByModel(
    params: MetricsV2QueryParams,
  ): Promise<MetricsV2ByLanguageModelEntity[]> {
    return this.get<MetricsV2ByLanguageModelEntity[]>(
      `v2/metrics/by-model?${this.buildQueryString(params)}`,
    );
  }

  async getMetricsByModelFeature(
    params: MetricsV2QueryParams,
  ): Promise<MetricsV2ByModelFeatureEntity[]> {
    return this.get<MetricsV2ByModelFeatureEntity[]>(
      `v2/metrics/by-model-feature?${this.buildQueryString(params)}`,
    );
  }

  async getAdoptionTrends(
    params: MetricsV2QueryParams,
  ): Promise<MetricsV2AdoptionTrend[]> {
    return this.get<MetricsV2AdoptionTrend[]>(
      `v2/metrics/adoption?${this.buildQueryString(params)}`,
    );
  }

  private buildQueryString(params: MetricsV2QueryParams): string {
    const queryParams = new URLSearchParams();
    queryParams.append(
      'startDate',
      DateTime.fromJSDate(params.startDate).toFormat('yyyy-MM-dd'),
    );
    queryParams.append(
      'endDate',
      DateTime.fromJSDate(params.endDate).toFormat('yyyy-MM-dd'),
    );
    if (params.type) {
      queryParams.append('type', params.type);
    }
    if (params.entityName) {
      queryParams.append('entityName', params.entityName);
    }
    return queryParams.toString();
  }

  private async get<T>(path: string): Promise<T> {
    const baseUrl = await this.options.discoveryApi.getBaseUrl('copilot');
    const response = await this.options.fetchApi.fetch(`${baseUrl}/${path}`);

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return response.json() as Promise<T>;
  }
}
