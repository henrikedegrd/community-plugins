/*
 * Copyright 2021 The Backstage Authors
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

import {
  resolvePackagePath,
  DatabaseService,
} from '@backstage/backend-plugin-api';
import {
  Metric,
  MetricsType,
  PeriodRange,
  CopilotIdeCodeCompletions,
  CopilotIdeLanguages,
  CopilotMetrics,
  CopilotEditors,
  CopilotModels,
  CopilotLanguages,
  CopilotChats,
  CopilotChatEditors,
  CopilotChatModels,
  EngagementMetrics,
  SeatAnalysis,
  MetricsV2EntityType,
  MetricsV2DailyEntity,
  MetricsV2ByIdeEntity,
  MetricsV2ByFeatureEntity,
  MetricsV2ByLanguageFeatureEntity,
  MetricsV2ByLanguageModelEntity,
  MetricsV2ByModelFeatureEntity,
  MetricsV2UserDailyEntity,
  MetricsV2FetchRetryEntity,
  MetricsV2FetchStatus,
  MetricsV2ReportType,
} from '@backstage-community/plugin-copilot-common';
import { Knex } from 'knex';

export const migrationsDir = resolvePackagePath(
  '@backstage-community/plugin-copilot-backend',
  'migrations',
);

type Options = {
  database: DatabaseService;
};

export type Breakdown = {
  day: string;
  editor: string;
  language: string;
  lines_accepted: number;
  lines_suggested: number;
  suggestions_count: number;
  acceptances_count: number;
  active_users: number;
};

export type CopilotMetricsDb = Omit<
  CopilotMetrics,
  | 'date'
  | 'copilot_ide_code_completions'
  | 'copilot_ide_chat'
  | 'copilot_dotcom_chat'
  | 'copilot_dotcom_pull_requests'
> & {
  day: string;
  /**
   * The type of the metrics data.
   * Can be 'enterprise', 'organization'.
   */
  type: MetricsType;

  /**
   * The name of the team, applicable when the metric is for a specific team.
   * When null, it indicates metrics for all teams, aggregated at the 'enterprise' or 'organization' level.
   */
  team_name?: string;
};

export type CopilotIdeCodeCompletionsDb = Omit<
  CopilotIdeCodeCompletions,
  'editors' | 'languages'
> & {
  day: string;
  /**
   * The type of the metrics data.
   * Can be 'enterprise', 'organization'.
   */
  type: MetricsType;

  /**
   * The name of the team, applicable when the metric is for a specific team.
   * When null, it indicates metrics for all teams, aggregated at the 'enterprise' or 'organization' level.
   */
  team_name?: string;
};

export type CopilotIdeCodeCompletionsLanguageDb = Omit<
  CopilotIdeLanguages,
  'day' | 'name' | 'language'
> & {
  day: string;
  /**
   * The type of the metrics data.
   * Can be 'enterprise', 'organization'.
   */
  type: MetricsType;

  /**
   * The name of the team, applicable when the metric is for a specific team.
   * When null, it indicates metrics for all teams, aggregated at the 'enterprise' or 'organization' level.
   */
  team_name?: string;
  language: string;
};

export type CopilotIdeCodeCompletionsEditorsDb = Omit<
  CopilotEditors,
  'day' | 'name' | 'models'
> & {
  day: string;
  /**
   * The type of the metrics data.
   * Can be 'enterprise', 'organization'.
   */
  type: MetricsType;

  /**
   * The name of the team, applicable when the metric is for a specific team.
   * When null, it indicates metrics for all teams, aggregated at the 'enterprise' or 'organization' level.
   */
  team_name?: string;
  editor: string;
};

export type CopilotIdeChatsDb = Omit<CopilotChats, 'day' | 'editors'> & {
  day: string;
};

export type CopilotIdeChatsEditorsDb = Omit<
  CopilotChatEditors,
  'day' | 'name' | 'models' | 'editor'
> & {
  day: string;
  /**
   * The type of the metrics data.
   * Can be 'enterprise', 'organization'.
   */
  type: MetricsType;

  /**
   * The name of the team, applicable when the metric is for a specific team.
   * When null, it indicates metrics for all teams, aggregated at the 'enterprise' or 'organization' level.
   */
  team_name?: string;
  editor: string;
};

export type CopilotIdeChatsEditorModelDb = Omit<
  CopilotChatModels,
  'name' | 'day' | 'model' | 'editor'
> & {
  day: string;
  /**
   * The type of the metrics data.
   * Can be 'enterprise', 'organization'.
   */
  type: MetricsType;

  /**
   * The name of the team, applicable when the metric is for a specific team.
   * When null, it indicates metrics for all teams, aggregated at the 'enterprise' or 'organization' level.
   */
  team_name?: string;
  editor: string;
  model: string;
};

export type CopilotIdeCodeCompletionsEditorModelsDb = Omit<
  CopilotModels,
  'day' | 'editor' | 'model' | 'name' | 'languages'
> & {
  day: string;
  /**
   * The type of the metrics data.
   * Can be 'enterprise', 'organization'.
   */
  type: MetricsType;

  /**
   * The name of the team, applicable when the metric is for a specific team.
   * When null, it indicates metrics for all teams, aggregated at the 'enterprise' or 'organization' level.
   */
  team_name?: string;
  editor: string;
  model: string;
};

export type CopilotIdeCodeCompletionsEditorModelLanguagesDb = Omit<
  CopilotLanguages,
  'day' | 'editor' | 'model' | 'name' | 'language'
> & {
  day: string;
  /**
   * The type of the metrics data.
   * Can be 'enterprise', 'organization'.
   */
  type: MetricsType;

  /**
   * The name of the team, applicable when the metric is for a specific team.
   * When null, it indicates metrics for all teams, aggregated at the 'enterprise' or 'organization' level.
   */
  team_name?: string;
  editor: string;
  model: string;
  language: string;
};

export type MetricDbRow = Omit<Metric, 'breakdown'> & {
  breakdown: string;
};

export class DatabaseHandler {
  static async create(options: Options): Promise<DatabaseHandler> {
    const { database } = options;
    const client = await database.getClient();

    if (!database.migrations?.skip) {
      await client.migrate.latest({
        directory: migrationsDir,
      });
    }

    return new DatabaseHandler(client);
  }

  private constructor(private readonly db: Knex) {}

  async getPeriodRange(type: MetricsType): Promise<PeriodRange | undefined> {
    const query = this.db<MetricDbRow>('metrics').where('type', type);

    const minDate = await query.orderBy('day', 'asc').first('day');
    const maxDate = await query.orderBy('day', 'desc').first('day');

    if (!minDate?.day || !maxDate?.day) return undefined;

    return { minDate: minDate.day, maxDate: maxDate.day };
  }

  async getPeriodRangeV2(type: MetricsType): Promise<PeriodRange | undefined> {
    const query = this.db('copilot_metrics').where('type', type);

    const minDate = await query.orderBy('day', 'asc').first('day');
    const maxDate = await query.orderBy('day', 'desc').first('day');

    if (!minDate?.day || !maxDate?.day) return undefined;

    return { minDate: minDate.day, maxDate: maxDate.day };
  }

  async getTeams(
    type: MetricsType,
    startDate: string,
    endDate: string,
  ): Promise<Array<string | undefined>> {
    const result = await this.db<MetricDbRow>('copilot_metrics')
      .where('type', type)
      .whereBetween('day', [startDate, endDate])
      .whereNot('team_name', '')
      .distinct('team_name')
      .orderBy('team_name', 'asc')
      .select('team_name');

    return result.map(x => x.team_name);
  }

  async batchInsert(metrics: MetricDbRow[]): Promise<void> {
    await this.db<MetricDbRow[]>('metrics')
      .insert(metrics)
      .onConflict(['day', 'type', 'team_name'])
      .ignore();
  }

  async batchInsertMetrics(metrics: CopilotMetricsDb[]): Promise<void> {
    await this.db<CopilotMetricsDb[]>('copilot_metrics')
      .insert(metrics)
      .onConflict(['day', 'type', 'team_name'])
      .ignore();
  }

  async batchInsertIdeCompletions(
    metrics: CopilotIdeCodeCompletionsDb[],
  ): Promise<void> {
    await this.db<CopilotIdeCodeCompletionsDb[]>('ide_completions')
      .insert(metrics)
      .onConflict(['day', 'type', 'team_name'])
      .ignore();
  }

  async batchInsertIdeCompletionsLanguages(
    metrics: CopilotIdeCodeCompletionsLanguageDb[],
  ): Promise<void> {
    await this.db<CopilotIdeCodeCompletionsLanguageDb[]>(
      'ide_completions_language_users',
    )
      .insert(metrics)
      .onConflict(['day', 'type', 'team_name', 'language'])
      .ignore();
  }

  async batchInsertIdeCompletionsEditors(
    metrics: CopilotIdeCodeCompletionsEditorsDb[],
  ): Promise<void> {
    await this.db<CopilotIdeCodeCompletionsEditorsDb[]>(
      'ide_completions_language_editors',
    )
      .insert(metrics)
      .onConflict(['day', 'type', 'team_name', 'editor'])
      .ignore();
  }

  async batchInsertIdeCompletionsEditorModels(
    metrics: CopilotIdeCodeCompletionsEditorModelsDb[],
  ): Promise<void> {
    await this.db<CopilotIdeCodeCompletionsEditorModelsDb[]>(
      'ide_completions_language_editors_model',
    )
      .insert(metrics)
      .onConflict(['day', 'type', 'team_name', 'editor', 'model'])
      .ignore();
  }

  async batchInsertIdeCompletionsEditorModelLanguages(
    metrics: CopilotIdeCodeCompletionsEditorModelLanguagesDb[],
  ): Promise<void> {
    await this.db<CopilotIdeCodeCompletionsEditorModelLanguagesDb[]>(
      'ide_completions_language_editors_model_language',
    )
      .insert(metrics)
      .onConflict(['day', 'type', 'team_name', 'editor', 'model', 'language'])
      .ignore();
  }

  async batchInsertIdeChats(metrics: CopilotIdeChatsDb[]): Promise<void> {
    await this.db<CopilotIdeChatsDb[]>('ide_chats')
      .insert(metrics)
      .onConflict(['day', 'type', 'team_name'])
      .ignore();
  }

  async batchInsertIdeChatEditors(
    metrics: CopilotIdeChatsEditorsDb[],
  ): Promise<void> {
    await this.db<CopilotIdeChatsEditorsDb[]>('ide_chat_editors')
      .insert(metrics)
      .onConflict(['day', 'type', 'team_name', 'editor'])
      .ignore();
  }

  async batchInsertIdeChatEditorModels(
    metrics: CopilotIdeChatsEditorModelDb[],
  ): Promise<void> {
    await this.db<CopilotIdeChatsEditorModelDb[]>('ide_chat_editors_model')
      .insert(metrics)
      .onConflict(['day', 'type', 'team_name', 'editor', 'model'])
      .ignore();
  }

  async insertSeatAnalysys(metric: SeatAnalysis): Promise<void> {
    await this.db<SeatAnalysis>('seats')
      .insert(metric)
      .onConflict(['day', 'type', 'team_name'])
      .ignore();
  }

  async getMostRecentDayFromMetrics(
    type: MetricsType,
    teamName?: string,
  ): Promise<string | undefined> {
    try {
      const query = await this.db<MetricDbRow>('metrics')
        .where('type', type)
        .where('team_name', teamName ?? '')
        .orderBy('day', 'desc')
        .first('day');
      return query ? query.day : undefined;
    } catch (e) {
      return undefined;
    }
  }

  async getMostRecentDayFromMetricsV2(
    type: MetricsType,
    teamName?: string,
  ): Promise<string | undefined> {
    try {
      const query = this.db('copilot_metrics')
        .where('type', type)
        .where('team_name', teamName ?? '')
        .orderBy('day', 'desc')
        .first('day');
      const res = await query;
      return res ? res.day : undefined;
    } catch (e) {
      return undefined;
    }
  }

  async getEarliestDayFromMetricsV2(
    type: MetricsType,
    teamName?: string,
  ): Promise<string | undefined> {
    try {
      const query = this.db('copilot_metrics')
        .where('type', type)
        .where('team_name', teamName ?? '')
        .orderBy('day', 'asc')
        .first('day');
      const res = await query;
      return res ? res.day : undefined;
    } catch (e) {
      return undefined;
    }
  }

  async getMetrics(
    startDate: string,
    endDate: string,
    type: MetricsType,
    teamName?: string,
  ): Promise<MetricDbRow[]> {
    return await this.db<MetricDbRow>('metrics')
      .where('type', type)
      .where('team_name', teamName ?? '')
      .whereBetween('day', [startDate, endDate]);
  }

  async getSeatMetrics(
    startDate: string,
    endDate: string,
    type: MetricsType,
    teamName?: string,
  ): Promise<SeatAnalysis[]> {
    return await this.db<SeatAnalysis>('seats')
      .where('type', type)
      .where('team_name', teamName ?? '')
      .whereBetween('day', [startDate, endDate])
      .orderBy('day', 'asc');
  }

  async getEngagementMetrics(
    startDate: string,
    endDate: string,
    type: MetricsType,
    teamName?: string,
  ): Promise<EngagementMetrics[]> {
    const query = this.db('copilot_metrics as cm')
      .select(
        'cm.day',
        'cm.type',
        'cm.team_name',
        this.db.raw(
          'CAST(MIN(cm.total_active_users) AS INTEGER) as total_active_users',
        ),
        this.db.raw(
          'CAST(MIN(cm.total_engaged_users) AS INTEGER) as total_engaged_users',
        ),
        this.db.raw(
          'CAST(MIN(ide_completions.total_engaged_users) AS INTEGER) as ide_completions_engaged_users',
        ),
        this.db.raw(
          'CAST(MIN(ide_chats.total_engaged_users) AS INTEGER) as ide_chats_engaged_users',
        ),
        this.db.raw(
          'CAST(MIN(dotcom_chats.total_engaged_users) AS INTEGER) as dotcom_chats_engaged_users',
        ),
        this.db.raw(
          'CAST(MIN(dotcom_prs.total_engaged_users) AS INTEGER) as dotcom_prs_engaged_users',
        ),
      )
      .leftJoin('ide_completions', join => {
        join
          .on('ide_completions.day', '=', 'cm.day')
          .andOn('ide_completions.type', '=', 'cm.type')
          .andOn(
            'ide_completions.team_name',
            '=',
            this.db.raw('?', [teamName ?? '']),
          );
      })
      .leftJoin('ide_chats', join => {
        join
          .on('ide_chats.day', '=', 'cm.day')
          .andOn('ide_chats.type', '=', 'cm.type')
          .andOn(
            'ide_chats.team_name',
            '=',
            this.db.raw('?', [teamName ?? '']),
          );
      })
      .leftJoin('dotcom_chats', join => {
        join
          .on('dotcom_chats.day', '=', 'cm.day')
          .andOn('dotcom_chats.type', '=', 'cm.type')
          .andOn(
            'dotcom_chats.team_name',
            '=',
            this.db.raw('?', [teamName ?? '']),
          );
      })
      .leftJoin('dotcom_prs', join => {
        join
          .on('dotcom_prs.day', '=', 'cm.day')
          .andOn('dotcom_prs.type', '=', 'cm.type')
          .andOn(
            'dotcom_prs.team_name',
            '=',
            this.db.raw('?', [teamName ?? '']),
          );
      })
      .where('cm.type', type)
      .where('cm.team_name', teamName ?? '')
      .whereBetween('cm.day', [startDate, endDate])
      .groupBy('cm.day', 'cm.type', 'cm.team_name')
      .orderBy('cm.day', 'asc');

    return await query;
  }

  async getMetricsV2(
    startDate: string,
    endDate: string,
    type: MetricsType,
    teamName?: string,
  ): Promise<MetricDbRow[]> {
    const query = this.db('copilot_metrics as cm')
      .select(
        'cm.day',
        'cm.type',
        'cm.team_name',
        this.db.raw(
          'CAST(MIN(cm.total_active_users) AS INTEGER) as total_active_users',
        ),
        this.db.raw(
          'CAST(MIN(ide_chats.total_engaged_users) AS INTEGER) as total_active_chat_users',
        ),
        this.db.raw(
          'CAST(SUM(icelm.total_code_suggestions) AS INTEGER) as total_suggestions_count',
        ),
        this.db.raw(
          'CAST(SUM(icelm.total_code_acceptances) AS INTEGER) as total_acceptances_count',
        ),
        this.db.raw(
          'CAST(SUM(icelm.total_code_lines_suggested) AS INTEGER) as total_lines_suggested',
        ),
        this.db.raw(
          'CAST(SUM(icelm.total_code_lines_accepted) AS INTEGER) as total_lines_accepted',
        ),
        this.db.raw(
          'CAST(SUM(icem.total_chats) AS INTEGER) as total_chat_turns',
        ),
        this.db.raw(
          'CAST(SUM(icem.total_chat_copy_events) AS INTEGER) as total_chat_acceptances',
        ),
        this.db.raw("'' as breakdown"),
      )
      .join('ide_completions', join => {
        join
          .on('ide_completions.day', '=', 'cm.day')
          .andOn('ide_completions.type', '=', 'cm.type')
          .andOn(
            'ide_completions.team_name',
            '=',
            this.db.raw('?', [teamName ?? '']),
          );
      })
      .join('ide_chats', join => {
        join
          .on('ide_chats.day', '=', 'cm.day')
          .andOn('ide_chats.type', '=', 'cm.type')
          .andOn(
            'ide_chats.team_name',
            '=',
            this.db.raw('?', [teamName ?? '']),
          );
      })
      .join(
        this.db.raw(
          `(SELECT day, type, team_name,
        SUM(total_code_suggestions) as total_code_suggestions, 
        SUM(total_code_acceptances) as total_code_acceptances, 
        SUM(total_code_lines_suggested) as total_code_lines_suggested, 
        SUM(total_code_lines_accepted) as total_code_lines_accepted 
        FROM ide_completions_language_editors_model_language GROUP BY day, type, team_name) 
        as icelm`,
        ),
        join => {
          join
            .on('icelm.day', '=', 'cm.day')
            .andOn('icelm.type', '=', 'cm.type')
            .andOn('icelm.team_name', '=', this.db.raw('?', [teamName ?? '']));
        },
      )
      .join(
        this.db.raw(
          `(SELECT day, type, team_name, SUM(total_chats) as total_chats, 
      SUM(total_chat_copy_events) as total_chat_copy_events 
      FROM ide_chat_editors_model GROUP BY day, type, team_name) as icem`,
        ),
        join => {
          join
            .on('icem.day', '=', 'cm.day')
            .andOn('icem.type', '=', 'cm.type')
            .andOn('icem.team_name', '=', this.db.raw('?', [teamName ?? '']));
        },
      )
      .where('cm.type', type)
      .where('cm.team_name', teamName ?? '')
      .whereBetween('cm.day', [startDate, endDate])
      .groupBy('cm.day', 'cm.type', 'cm.team_name')
      .orderBy('cm.day', 'asc');

    return await query;
  }

  async getBreakdown(
    startDate: string,
    endDate: string,
    type: MetricsType,
    teamName?: string,
  ): Promise<Breakdown[]> {
    const query = this.db<Breakdown>('copilot_metrics as cm')
      .select(
        'cm.day',
        'icleml.editor as editor',
        'icleml.language as language',
        this.db.raw(
          'CAST(SUM(icleml.total_engaged_users) AS INTEGER) as active_users',
        ),
        this.db.raw(
          'CAST(SUM(icleml.total_code_lines_suggested) AS INTEGER) as lines_suggested',
        ),
        this.db.raw(
          'CAST(SUM(icleml.total_code_lines_accepted) AS INTEGER) as lines_accepted',
        ),
        this.db.raw(
          'CAST(SUM(icleml.total_code_suggestions) AS INTEGER) as suggestions_count',
        ),
        this.db.raw(
          'CAST(SUM(icleml.total_code_acceptances) AS INTEGER) as acceptances_count',
        ),
      )
      .join(
        'ide_completions_language_editors_model_language as icleml',
        join => {
          join
            .on('icleml.day', '=', 'cm.day')
            .andOn('icleml.type', '=', 'cm.type')
            .andOn('icleml.team_name', '=', this.db.raw('?', [teamName ?? '']));
        },
      )
      .whereBetween('cm.day', [startDate, endDate])
      .where('icleml.model', 'default')
      .where('cm.type', type)
      .where('cm.team_name', teamName ?? '')
      .groupBy('cm.day', 'icleml.editor', 'icleml.language')
      .orderBy('cm.day', 'asc');

    return await query;
  }

  // ============================================================================
  // V2 Metrics Methods (New GitHub Copilot API - post April 2026)
  // ============================================================================

  /**
   * Get the period range for V2 metrics (new API).
   */
  async getMetricsV2NewPeriodRange(
    type: MetricsV2EntityType,
    entityName: string,
  ): Promise<PeriodRange | undefined> {
    const query = this.db<MetricsV2DailyEntity>('metrics_v2_daily')
      .where('type', type)
      .where('entity_name', entityName);

    const minDate = await query.clone().orderBy('day', 'asc').first('day');
    const maxDate = await query.clone().orderBy('day', 'desc').first('day');

    if (!minDate?.day || !maxDate?.day) return undefined;

    return { minDate: minDate.day, maxDate: maxDate.day };
  }

  /**
   * Get the most recent day from V2 daily metrics.
   */
  async getMostRecentDayFromMetricsV2New(
    type: MetricsV2EntityType,
    entityName: string,
  ): Promise<string | undefined> {
    try {
      const result = await this.db<MetricsV2DailyEntity>('metrics_v2_daily')
        .where('type', type)
        .where('entity_name', entityName)
        .orderBy('day', 'desc')
        .first('day');
      return result?.day;
    } catch {
      return undefined;
    }
  }

  /**
   * Get all existing days from V2 daily metrics (for gap detection).
   */
  async getExistingDaysFromMetricsV2New(
    type: MetricsV2EntityType,
    entityName: string,
    startDate: string,
    endDate: string,
  ): Promise<string[]> {
    const results = await this.db<MetricsV2DailyEntity>('metrics_v2_daily')
      .where('type', type)
      .where('entity_name', entityName)
      .whereBetween('day', [startDate, endDate])
      .select('day');

    return results.map(r => r.day);
  }

  /**
   * Batch insert V2 daily metrics.
   */
  async batchInsertMetricsV2Daily(
    metrics: MetricsV2DailyEntity[],
  ): Promise<void> {
    if (metrics.length === 0) return;

    await this.db<MetricsV2DailyEntity>('metrics_v2_daily')
      .insert(metrics)
      .onConflict(['day', 'type', 'entity_name'])
      .ignore();
  }

  /**
   * Batch insert V2 metrics by IDE.
   */
  async batchInsertMetricsV2ByIde(
    metrics: MetricsV2ByIdeEntity[],
  ): Promise<void> {
    if (metrics.length === 0) return;

    await this.db<MetricsV2ByIdeEntity>('metrics_v2_by_ide')
      .insert(metrics)
      .onConflict(['day', 'type', 'entity_name', 'ide'])
      .ignore();
  }

  /**
   * Batch insert V2 metrics by feature.
   */
  async batchInsertMetricsV2ByFeature(
    metrics: MetricsV2ByFeatureEntity[],
  ): Promise<void> {
    if (metrics.length === 0) return;

    await this.db<MetricsV2ByFeatureEntity>('metrics_v2_by_feature')
      .insert(metrics)
      .onConflict(['day', 'type', 'entity_name', 'feature'])
      .ignore();
  }

  /**
   * Batch insert V2 metrics by language and feature.
   */
  async batchInsertMetricsV2ByLanguageFeature(
    metrics: MetricsV2ByLanguageFeatureEntity[],
  ): Promise<void> {
    if (metrics.length === 0) return;

    await this.db<MetricsV2ByLanguageFeatureEntity>(
      'metrics_v2_by_language_feature',
    )
      .insert(metrics)
      .onConflict(['day', 'type', 'entity_name', 'language', 'feature'])
      .ignore();
  }

  /**
   * Batch insert V2 metrics by language and model.
   */
  async batchInsertMetricsV2ByLanguageModel(
    metrics: MetricsV2ByLanguageModelEntity[],
  ): Promise<void> {
    if (metrics.length === 0) return;

    await this.db<MetricsV2ByLanguageModelEntity>(
      'metrics_v2_by_language_model',
    )
      .insert(metrics)
      .onConflict(['day', 'type', 'entity_name', 'language', 'model'])
      .ignore();
  }

  /**
   * Batch insert V2 metrics by model and feature.
   */
  async batchInsertMetricsV2ByModelFeature(
    metrics: MetricsV2ByModelFeatureEntity[],
  ): Promise<void> {
    if (metrics.length === 0) return;

    await this.db<MetricsV2ByModelFeatureEntity>('metrics_v2_by_model_feature')
      .insert(metrics)
      .onConflict(['day', 'type', 'entity_name', 'model', 'feature'])
      .ignore();
  }

  /**
   * Batch insert V2 user daily metrics.
   */
  async batchInsertMetricsV2UserDaily(
    metrics: MetricsV2UserDailyEntity[],
  ): Promise<void> {
    if (metrics.length === 0) return;

    await this.db<MetricsV2UserDailyEntity>('metrics_v2_user_daily')
      .insert(metrics)
      .onConflict(['day', 'type', 'entity_name', 'user_hash'])
      .ignore();
  }

  /**
   * Get V2 daily metrics for a date range.
   */
  async getMetricsV2NewDaily(
    type: MetricsV2EntityType,
    entityName: string,
    startDate: string,
    endDate: string,
  ): Promise<MetricsV2DailyEntity[]> {
    return await this.db<MetricsV2DailyEntity>('metrics_v2_daily')
      .where('type', type)
      .where('entity_name', entityName)
      .whereBetween('day', [startDate, endDate])
      .orderBy('day', 'asc');
  }

  /**
   * Get V2 metrics by IDE for a date range.
   */
  async getMetricsV2NewByIde(
    type: MetricsV2EntityType,
    entityName: string,
    startDate: string,
    endDate: string,
  ): Promise<MetricsV2ByIdeEntity[]> {
    return await this.db<MetricsV2ByIdeEntity>('metrics_v2_by_ide')
      .where('type', type)
      .where('entity_name', entityName)
      .whereBetween('day', [startDate, endDate])
      .orderBy('day', 'asc');
  }

  /**
   * Get V2 metrics by feature for a date range.
   */
  async getMetricsV2NewByFeature(
    type: MetricsV2EntityType,
    entityName: string,
    startDate: string,
    endDate: string,
    feature?: string,
  ): Promise<MetricsV2ByFeatureEntity[]> {
    let query = this.db<MetricsV2ByFeatureEntity>('metrics_v2_by_feature')
      .where('type', type)
      .where('entity_name', entityName)
      .whereBetween('day', [startDate, endDate]);

    if (feature) {
      query = query.where('feature', feature);
    }

    return await query.orderBy('day', 'asc');
  }

  /**
   * Get V2 metrics by language and feature for a date range.
   */
  async getMetricsV2NewByLanguageFeature(
    type: MetricsV2EntityType,
    entityName: string,
    startDate: string,
    endDate: string,
    language?: string,
    feature?: string,
  ): Promise<MetricsV2ByLanguageFeatureEntity[]> {
    let query = this.db<MetricsV2ByLanguageFeatureEntity>(
      'metrics_v2_by_language_feature',
    )
      .where('type', type)
      .where('entity_name', entityName)
      .whereBetween('day', [startDate, endDate]);

    if (language) {
      query = query.where('language', language);
    }
    if (feature) {
      query = query.where('feature', feature);
    }

    return await query.orderBy('day', 'asc');
  }

  /**
   * Get V2 metrics by language and model for a date range.
   */
  async getMetricsV2NewByLanguageModel(
    type: MetricsV2EntityType,
    entityName: string,
    startDate: string,
    endDate: string,
    language?: string,
    model?: string,
  ): Promise<MetricsV2ByLanguageModelEntity[]> {
    let query = this.db<MetricsV2ByLanguageModelEntity>(
      'metrics_v2_by_language_model',
    )
      .where('type', type)
      .where('entity_name', entityName)
      .whereBetween('day', [startDate, endDate]);

    if (language) {
      query = query.where('language', language);
    }
    if (model) {
      query = query.where('model', model);
    }

    return await query.orderBy('day', 'asc');
  }

  /**
   * Get V2 metrics by model and feature for a date range.
   */
  async getMetricsV2NewByModelFeature(
    type: MetricsV2EntityType,
    entityName: string,
    startDate: string,
    endDate: string,
    model?: string,
    feature?: string,
  ): Promise<MetricsV2ByModelFeatureEntity[]> {
    let query = this.db<MetricsV2ByModelFeatureEntity>(
      'metrics_v2_by_model_feature',
    )
      .where('type', type)
      .where('entity_name', entityName)
      .whereBetween('day', [startDate, endDate]);

    if (model) {
      query = query.where('model', model);
    }
    if (feature) {
      query = query.where('feature', feature);
    }

    return await query.orderBy('day', 'asc');
  }

  /**
   * Get V2 user daily metrics for a date range.
   */
  async getMetricsV2NewUserDaily(
    type: MetricsV2EntityType,
    entityName: string,
    startDate: string,
    endDate: string,
  ): Promise<MetricsV2UserDailyEntity[]> {
    return await this.db<MetricsV2UserDailyEntity>('metrics_v2_user_daily')
      .where('type', type)
      .where('entity_name', entityName)
      .whereBetween('day', [startDate, endDate])
      .orderBy('day', 'asc');
  }

  // ============================================================================
  // V2 Retry Tracking Methods
  // ============================================================================

  /**
   * Get or create a fetch retry record.
   */
  async getOrCreateFetchRetry(
    type: MetricsV2EntityType,
    entityName: string,
    day: string,
    reportType: MetricsV2ReportType,
  ): Promise<MetricsV2FetchRetryEntity> {
    // Try to find existing record
    const existing = await this.db<MetricsV2FetchRetryEntity>(
      'metrics_v2_fetch_retries',
    )
      .where({ type, entity_name: entityName, day, report_type: reportType })
      .first();

    if (existing) {
      return existing;
    }

    // Create new record
    const newRecord: MetricsV2FetchRetryEntity = {
      type,
      entity_name: entityName,
      day,
      report_type: reportType,
      retry_count: 0,
      status: 'pending',
    };

    await this.db<MetricsV2FetchRetryEntity>('metrics_v2_fetch_retries')
      .insert(newRecord)
      .onConflict(['type', 'entity_name', 'day', 'report_type'])
      .ignore();

    // Return the record (may have been created by concurrent process)
    const result = await this.db<MetricsV2FetchRetryEntity>(
      'metrics_v2_fetch_retries',
    )
      .where({ type, entity_name: entityName, day, report_type: reportType })
      .first();

    return result!;
  }

  /**
   * Update a fetch retry record after an attempt.
   */
  async updateFetchRetry(
    id: number,
    status: MetricsV2FetchStatus,
    error?: string,
  ): Promise<void> {
    await this.db<MetricsV2FetchRetryEntity>('metrics_v2_fetch_retries')
      .where({ id })
      .update({
        status,
        last_error: error,
        last_attempt_at: this.db.fn.now() as unknown as string,
        retry_count: this.db.raw('retry_count + 1'),
      });
  }

  /**
   * Get pending retries for a given entity.
   */
  async getPendingFetchRetries(
    type: MetricsV2EntityType,
    entityName: string,
    maxRetries: number = 4,
  ): Promise<MetricsV2FetchRetryEntity[]> {
    return await this.db<MetricsV2FetchRetryEntity>('metrics_v2_fetch_retries')
      .where('type', type)
      .where('entity_name', entityName)
      .where('status', 'pending')
      .where('retry_count', '<', maxRetries)
      .orderBy('day', 'asc');
  }

  /**
   * Mark a fetch retry as permanently failed.
   */
  async markFetchRetryFailed(id: number, error: string): Promise<void> {
    await this.db<MetricsV2FetchRetryEntity>('metrics_v2_fetch_retries')
      .where({ id })
      .update({
        status: 'failed',
        last_error: error,
        last_attempt_at: this.db.fn.now() as unknown as string,
      });
  }

  /**
   * Mark a fetch retry as successful.
   */
  async markFetchRetrySuccess(id: number): Promise<void> {
    await this.db<MetricsV2FetchRetryEntity>('metrics_v2_fetch_retries')
      .where({ id })
      .update({
        status: 'success',
        last_attempt_at: this.db.fn.now() as unknown as string,
      });
  }

  /**
   * Get all entities that have V2 metrics data.
   */
  async getMetricsV2Entities(): Promise<
    Array<{ type: MetricsV2EntityType; entity_name: string }>
  > {
    const results = await this.db<MetricsV2DailyEntity>('metrics_v2_daily')
      .distinct('type', 'entity_name')
      .orderBy('entity_name', 'asc');

    return results.map(r => ({
      type: r.type,
      entity_name: r.entity_name,
    }));
  }
}
