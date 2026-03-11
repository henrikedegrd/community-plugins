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

import { LoggerService } from '@backstage/backend-plugin-api';
import {
  MetricsV2DayTotals,
  MetricsV2DailyEntity,
  MetricsV2ByIdeEntity,
  MetricsV2ByFeatureEntity,
  MetricsV2ByLanguageFeatureEntity,
  MetricsV2ByLanguageModelEntity,
  MetricsV2ByModelFeatureEntity,
  MetricsV2EntityType,
} from '@backstage-community/plugin-copilot-common';
import { DatabaseHandler } from '../db/DatabaseHandler';
import { GithubClientV2 } from '../client/GithubClientV2';

const CHUNK_SIZE = 30;
const MAX_RETRIES = 4;

/**
 * Helper function to batch insert in chunks.
 */
async function batchInsertInChunks<T>(
  items: T[],
  insertFn: (chunk: T[]) => Promise<void>,
  chunkSize: number = CHUNK_SIZE,
): Promise<void> {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    await insertFn(chunk);
  }
}

/**
 * Get dates for the last N days.
 */
function getLastNDays(n: number): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 0; i < n; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
}

/**
 * Transform V2 day totals into database entities for a single day.
 */
function transformDayTotalsToEntities(
  dayTotals: MetricsV2DayTotals,
  type: MetricsV2EntityType,
  entityName: string,
): {
  daily: MetricsV2DailyEntity;
  byIde: MetricsV2ByIdeEntity[];
  byFeature: MetricsV2ByFeatureEntity[];
  byLanguageFeature: MetricsV2ByLanguageFeatureEntity[];
  byLanguageModel: MetricsV2ByLanguageModelEntity[];
  byModelFeature: MetricsV2ByModelFeatureEntity[];
} {
  const day = dayTotals.day;

  // Daily aggregate metrics
  const daily: MetricsV2DailyEntity = {
    day,
    type,
    entity_name: entityName,
    daily_active_users: dayTotals.daily_active_users,
    weekly_active_users: dayTotals.weekly_active_users,
    monthly_active_users: dayTotals.monthly_active_users,
    monthly_active_chat_users: dayTotals.monthly_active_chat_users,
    monthly_active_agent_users: dayTotals.monthly_active_agent_users,
    user_initiated_interaction_count:
      dayTotals.user_initiated_interaction_count,
    code_generation_activity_count: dayTotals.code_generation_activity_count,
    code_acceptance_activity_count: dayTotals.code_acceptance_activity_count,
    loc_suggested_to_add_sum: dayTotals.loc_suggested_to_add_sum,
    loc_suggested_to_delete_sum: dayTotals.loc_suggested_to_delete_sum,
    loc_added_sum: dayTotals.loc_added_sum,
    loc_deleted_sum: dayTotals.loc_deleted_sum,
  };

  // By IDE breakdown
  const byIde: MetricsV2ByIdeEntity[] = (dayTotals.totals_by_ide || []).map(
    ide => ({
      day,
      type,
      entity_name: entityName,
      ide: ide.ide,
      user_initiated_interaction_count: ide.user_initiated_interaction_count,
      code_generation_activity_count: ide.code_generation_activity_count,
      code_acceptance_activity_count: ide.code_acceptance_activity_count,
      loc_suggested_to_add_sum: ide.loc_suggested_to_add_sum,
      loc_suggested_to_delete_sum: ide.loc_suggested_to_delete_sum,
      loc_added_sum: ide.loc_added_sum,
      loc_deleted_sum: ide.loc_deleted_sum,
    }),
  );

  // By Feature breakdown
  const byFeature: MetricsV2ByFeatureEntity[] = (
    dayTotals.totals_by_feature || []
  ).map(feature => ({
    day,
    type,
    entity_name: entityName,
    feature: feature.feature,
    user_initiated_interaction_count: feature.user_initiated_interaction_count,
    code_generation_activity_count: feature.code_generation_activity_count,
    code_acceptance_activity_count: feature.code_acceptance_activity_count,
    loc_suggested_to_add_sum: feature.loc_suggested_to_add_sum,
    loc_suggested_to_delete_sum: feature.loc_suggested_to_delete_sum,
    loc_added_sum: feature.loc_added_sum,
    loc_deleted_sum: feature.loc_deleted_sum,
  }));

  // By Language + Feature breakdown
  const byLanguageFeature: MetricsV2ByLanguageFeatureEntity[] = (
    dayTotals.totals_by_language_feature || []
  ).map(lf => ({
    day,
    type,
    entity_name: entityName,
    language: lf.language,
    feature: lf.feature,
    code_generation_activity_count: lf.code_generation_activity_count,
    code_acceptance_activity_count: lf.code_acceptance_activity_count,
    loc_suggested_to_add_sum: lf.loc_suggested_to_add_sum,
    loc_suggested_to_delete_sum: lf.loc_suggested_to_delete_sum,
    loc_added_sum: lf.loc_added_sum,
    loc_deleted_sum: lf.loc_deleted_sum,
  }));

  // By Language + Model breakdown
  const byLanguageModel: MetricsV2ByLanguageModelEntity[] = (
    dayTotals.totals_by_language_model || []
  ).map(lm => ({
    day,
    type,
    entity_name: entityName,
    language: lm.language,
    model: lm.model,
    code_generation_activity_count: lm.code_generation_activity_count,
    code_acceptance_activity_count: lm.code_acceptance_activity_count,
    loc_suggested_to_add_sum: lm.loc_suggested_to_add_sum,
    loc_suggested_to_delete_sum: lm.loc_suggested_to_delete_sum,
    loc_added_sum: lm.loc_added_sum,
    loc_deleted_sum: lm.loc_deleted_sum,
  }));

  // By Model + Feature breakdown
  const byModelFeature: MetricsV2ByModelFeatureEntity[] = (
    dayTotals.totals_by_model_feature || []
  ).map(mf => ({
    day,
    type,
    entity_name: entityName,
    model: mf.model,
    feature: mf.feature,
    user_initiated_interaction_count: mf.user_initiated_interaction_count,
    code_generation_activity_count: mf.code_generation_activity_count,
    code_acceptance_activity_count: mf.code_acceptance_activity_count,
    loc_suggested_to_add_sum: mf.loc_suggested_to_add_sum,
    loc_suggested_to_delete_sum: mf.loc_suggested_to_delete_sum,
    loc_added_sum: mf.loc_added_sum,
    loc_deleted_sum: mf.loc_deleted_sum,
  }));

  return {
    daily,
    byIde,
    byFeature,
    byLanguageFeature,
    byLanguageModel,
    byModelFeature,
  };
}

/**
 * Task for fetching V2 organization metrics.
 */
export class OrganizationV2Task {
  constructor(
    private readonly db: DatabaseHandler,
    private readonly api: GithubClientV2,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Run the V2 metrics fetch task for all configured organizations.
   */
  async run(): Promise<void> {
    const organizations = this.api.getOrganizations();

    for (const org of organizations) {
      try {
        await this.fetchOrganizationMetrics(org);
      } catch (error: any) {
        this.logger.error(
          `Failed to fetch V2 metrics for org ${org}: ${error.message}`,
        );
        // Continue with other organizations
      }
    }

    // Process pending retries
    await this.processPendingRetries();
  }

  /**
   * Fetch and store metrics for a single organization.
   */
  private async fetchOrganizationMetrics(organization: string): Promise<void> {
    const type: MetricsV2EntityType = 'organization';

    this.logger.info(`Fetching V2 metrics for organization: ${organization}`);

    // Fetch 28-day rolling report
    const result = await this.api.fetchOrganization28DayReport(organization);

    if (!result.success || !result.dayTotals) {
      // Record failure for retry
      const retryRecord = await this.db.getOrCreateFetchRetry(
        type,
        organization,
        new Date().toISOString().split('T')[0],
        'organization',
      );
      await this.db.updateFetchRetry(retryRecord.id!, 'pending', result.error);
      return;
    }

    // Get existing days to avoid duplicate processing
    const existingDays = await this.db.getExistingDaysFromMetricsV2New(
      type,
      organization,
      getLastNDays(28)[27], // 28 days ago
      getLastNDays(1)[0], // today
    );
    const existingDaySet = new Set(existingDays);

    // Filter to only new days
    const newDayTotals = result.dayTotals.filter(
      dt => !existingDaySet.has(dt.day),
    );

    if (newDayTotals.length === 0) {
      this.logger.info(`No new V2 metrics for organization ${organization}`);
      return;
    }

    this.logger.info(
      `Processing ${newDayTotals.length} new days of V2 metrics for ${organization}`,
    );

    // Transform and store metrics
    await this.storeMetrics(newDayTotals, type, organization);

    // Check for gaps and backfill if needed
    await this.detectAndBackfillGaps(organization);
  }

  /**
   * Store transformed metrics in the database.
   */
  private async storeMetrics(
    dayTotals: MetricsV2DayTotals[],
    type: MetricsV2EntityType,
    entityName: string,
  ): Promise<void> {
    const allDaily: MetricsV2DailyEntity[] = [];
    const allByIde: MetricsV2ByIdeEntity[] = [];
    const allByFeature: MetricsV2ByFeatureEntity[] = [];
    const allByLanguageFeature: MetricsV2ByLanguageFeatureEntity[] = [];
    const allByLanguageModel: MetricsV2ByLanguageModelEntity[] = [];
    const allByModelFeature: MetricsV2ByModelFeatureEntity[] = [];

    for (const dt of dayTotals) {
      const entities = transformDayTotalsToEntities(dt, type, entityName);
      allDaily.push(entities.daily);
      allByIde.push(...entities.byIde);
      allByFeature.push(...entities.byFeature);
      allByLanguageFeature.push(...entities.byLanguageFeature);
      allByLanguageModel.push(...entities.byLanguageModel);
      allByModelFeature.push(...entities.byModelFeature);
    }

    // Batch insert all entities
    await batchInsertInChunks(
      allDaily,
      chunk => this.db.batchInsertMetricsV2Daily(chunk),
      CHUNK_SIZE,
    );
    await batchInsertInChunks(
      allByIde,
      chunk => this.db.batchInsertMetricsV2ByIde(chunk),
      CHUNK_SIZE,
    );
    await batchInsertInChunks(
      allByFeature,
      chunk => this.db.batchInsertMetricsV2ByFeature(chunk),
      CHUNK_SIZE,
    );
    await batchInsertInChunks(
      allByLanguageFeature,
      chunk => this.db.batchInsertMetricsV2ByLanguageFeature(chunk),
      CHUNK_SIZE,
    );
    await batchInsertInChunks(
      allByLanguageModel,
      chunk => this.db.batchInsertMetricsV2ByLanguageModel(chunk),
      CHUNK_SIZE,
    );
    await batchInsertInChunks(
      allByModelFeature,
      chunk => this.db.batchInsertMetricsV2ByModelFeature(chunk),
      CHUNK_SIZE,
    );

    this.logger.info(
      `Stored ${allDaily.length} daily metrics for ${entityName}`,
    );
  }

  /**
   * Detect gaps in the data and backfill using 1-day reports.
   */
  private async detectAndBackfillGaps(organization: string): Promise<void> {
    const type: MetricsV2EntityType = 'organization';
    const last28Days = getLastNDays(28);

    const existingDays = await this.db.getExistingDaysFromMetricsV2New(
      type,
      organization,
      last28Days[last28Days.length - 1],
      last28Days[0],
    );
    const existingDaySet = new Set(existingDays);

    // Find missing days
    const missingDays = last28Days.filter(day => !existingDaySet.has(day));

    if (missingDays.length === 0) {
      return;
    }

    this.logger.info(
      `Backfilling ${missingDays.length} missing days for ${organization}`,
    );

    for (const day of missingDays) {
      try {
        const result = await this.api.fetchOrganization1DayReport(
          organization,
          day,
        );

        if (result.success && result.dayTotals) {
          await this.storeMetrics(result.dayTotals, type, organization);
        } else {
          // Record for retry
          const retryRecord = await this.db.getOrCreateFetchRetry(
            type,
            organization,
            day,
            'organization',
          );
          await this.db.updateFetchRetry(
            retryRecord.id!,
            'pending',
            result.error,
          );
        }
      } catch (error: any) {
        this.logger.warn(
          `Failed to backfill day ${day} for ${organization}: ${error.message}`,
        );
      }
    }
  }

  /**
   * Process pending retry records.
   */
  private async processPendingRetries(): Promise<void> {
    const organizations = this.api.getOrganizations();

    for (const org of organizations) {
      const pendingRetries = await this.db.getPendingFetchRetries(
        'organization',
        org,
        MAX_RETRIES,
      );

      for (const retry of pendingRetries) {
        if (retry.retry_count >= MAX_RETRIES) {
          await this.db.markFetchRetryFailed(
            retry.id!,
            `Max retries (${MAX_RETRIES}) exceeded`,
          );
          continue;
        }

        try {
          const result = await this.api.fetchOrganization1DayReport(
            org,
            retry.day,
          );

          if (result.success && result.dayTotals) {
            await this.storeMetrics(result.dayTotals, 'organization', org);
            await this.db.markFetchRetrySuccess(retry.id!);
          } else {
            await this.db.updateFetchRetry(retry.id!, 'pending', result.error);
          }
        } catch (error: any) {
          await this.db.updateFetchRetry(retry.id!, 'pending', error.message);
        }
      }
    }
  }
}

/**
 * Task for fetching V2 enterprise metrics.
 */
export class EnterpriseV2Task {
  constructor(
    private readonly db: DatabaseHandler,
    private readonly api: GithubClientV2,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Run the V2 metrics fetch task for the configured enterprise.
   */
  async run(): Promise<void> {
    if (!this.api.hasEnterprise()) {
      return;
    }

    const enterprise = this.api.getEnterprise()!;
    const type: MetricsV2EntityType = 'enterprise';

    this.logger.info(`Fetching V2 metrics for enterprise: ${enterprise}`);

    try {
      // Fetch 28-day rolling report
      const result = await this.api.fetchEnterprise28DayReport();

      if (!result.success || !result.dayTotals) {
        const retryRecord = await this.db.getOrCreateFetchRetry(
          type,
          enterprise,
          new Date().toISOString().split('T')[0],
          'organization',
        );
        await this.db.updateFetchRetry(
          retryRecord.id!,
          'pending',
          result.error,
        );
        return;
      }

      // Get existing days
      const existingDays = await this.db.getExistingDaysFromMetricsV2New(
        type,
        enterprise,
        getLastNDays(28)[27],
        getLastNDays(1)[0],
      );
      const existingDaySet = new Set(existingDays);

      // Filter to only new days
      const newDayTotals = result.dayTotals.filter(
        dt => !existingDaySet.has(dt.day),
      );

      if (newDayTotals.length === 0) {
        this.logger.info(`No new V2 metrics for enterprise ${enterprise}`);
        return;
      }

      this.logger.info(
        `Processing ${newDayTotals.length} new days of V2 metrics for enterprise ${enterprise}`,
      );

      // Store metrics
      await this.storeMetrics(newDayTotals, type, enterprise);
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch V2 metrics for enterprise ${enterprise}: ${error.message}`,
      );
    }
  }

  /**
   * Store transformed metrics in the database.
   */
  private async storeMetrics(
    dayTotals: MetricsV2DayTotals[],
    type: MetricsV2EntityType,
    entityName: string,
  ): Promise<void> {
    const allDaily: MetricsV2DailyEntity[] = [];
    const allByIde: MetricsV2ByIdeEntity[] = [];
    const allByFeature: MetricsV2ByFeatureEntity[] = [];
    const allByLanguageFeature: MetricsV2ByLanguageFeatureEntity[] = [];
    const allByLanguageModel: MetricsV2ByLanguageModelEntity[] = [];
    const allByModelFeature: MetricsV2ByModelFeatureEntity[] = [];

    for (const dt of dayTotals) {
      const entities = transformDayTotalsToEntities(dt, type, entityName);
      allDaily.push(entities.daily);
      allByIde.push(...entities.byIde);
      allByFeature.push(...entities.byFeature);
      allByLanguageFeature.push(...entities.byLanguageFeature);
      allByLanguageModel.push(...entities.byLanguageModel);
      allByModelFeature.push(...entities.byModelFeature);
    }

    // Batch insert all entities
    await batchInsertInChunks(
      allDaily,
      chunk => this.db.batchInsertMetricsV2Daily(chunk),
      CHUNK_SIZE,
    );
    await batchInsertInChunks(
      allByIde,
      chunk => this.db.batchInsertMetricsV2ByIde(chunk),
      CHUNK_SIZE,
    );
    await batchInsertInChunks(
      allByFeature,
      chunk => this.db.batchInsertMetricsV2ByFeature(chunk),
      CHUNK_SIZE,
    );
    await batchInsertInChunks(
      allByLanguageFeature,
      chunk => this.db.batchInsertMetricsV2ByLanguageFeature(chunk),
      CHUNK_SIZE,
    );
    await batchInsertInChunks(
      allByLanguageModel,
      chunk => this.db.batchInsertMetricsV2ByLanguageModel(chunk),
      CHUNK_SIZE,
    );
    await batchInsertInChunks(
      allByModelFeature,
      chunk => this.db.batchInsertMetricsV2ByModelFeature(chunk),
      CHUNK_SIZE,
    );

    this.logger.info(
      `Stored ${allDaily.length} daily metrics for enterprise ${entityName}`,
    );
  }
}
