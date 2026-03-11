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

import { createApiRef } from '@backstage/core-plugin-api';
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

/**
 * API reference for the Copilot V2 API.
 *
 * @public
 */
export const copilotV2ApiRef = createApiRef<CopilotV2Api>({
  id: 'plugin.copilot.v2.service',
});

/**
 * Query parameters for V2 metrics.
 */
export interface MetricsV2QueryParams {
  startDate: Date;
  endDate: Date;
  type?: MetricsV2EntityType;
  entityName?: string;
}

/**
 * V2 API interface for the new GitHub Copilot metrics.
 *
 * @public
 */
export interface CopilotV2Api {
  /**
   * Get the list of available organizations.
   */
  getOrganizations(): Promise<string[]>;

  /**
   * Get the period range for V2 metrics.
   */
  getPeriodRange(
    type?: MetricsV2EntityType,
    entityName?: string,
  ): Promise<MetricsV2PeriodRange>;

  /**
   * Get legacy API status information.
   */
  getLegacyStatus(): Promise<MetricsV2LegacyStatus>;

  /**
   * Get list of entities (organizations/enterprises) with their date ranges.
   */
  getEntities(type?: MetricsV2EntityType): Promise<MetricsV2EntityInfo[]>;

  /**
   * Get daily aggregate metrics.
   */
  getMetricsDaily(
    params: MetricsV2QueryParams,
  ): Promise<MetricsV2DailyEntity[]>;

  /**
   * Get metrics broken down by IDE.
   */
  getMetricsByIde(
    params: MetricsV2QueryParams,
  ): Promise<MetricsV2ByIdeEntity[]>;

  /**
   * Get metrics broken down by feature.
   */
  getMetricsByFeature(
    params: MetricsV2QueryParams,
  ): Promise<MetricsV2ByFeatureEntity[]>;

  /**
   * Get metrics broken down by language (aggregated from language-feature).
   */
  getMetricsByLanguage(
    params: MetricsV2QueryParams,
  ): Promise<MetricsV2ByLanguageFeatureEntity[]>;

  /**
   * Get metrics broken down by model (aggregated from language-model).
   */
  getMetricsByModel(
    params: MetricsV2QueryParams,
  ): Promise<MetricsV2ByLanguageModelEntity[]>;

  /**
   * Get metrics broken down by model and feature.
   */
  getMetricsByModelFeature(
    params: MetricsV2QueryParams,
  ): Promise<MetricsV2ByModelFeatureEntity[]>;

  /**
   * Get adoption trends (active users over time).
   */
  getAdoptionTrends(
    params: MetricsV2QueryParams,
  ): Promise<MetricsV2AdoptionTrend[]>;
}
