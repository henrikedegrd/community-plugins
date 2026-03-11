/*
 * Copyright 2024 The Backstage Authors
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
import express from 'express';
import Router from 'express-promise-router';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import {
  DatabaseService,
  LoggerService,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
  SchedulerService,
  SchedulerServiceTaskScheduleDefinition,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { NotFoundError } from '@backstage/errors';
import {
  Metric,
  PeriodRange,
  MetricsV2EntityType,
} from '@backstage-community/plugin-copilot-common';
import { DatabaseHandler } from '../db/DatabaseHandler';
import TaskManagement from '../task/TaskManagement';
import { GithubClient } from '../client/GithubClient';
import { GithubClientV2 } from '../client/GithubClientV2';
import { OrganizationV2Task, EnterpriseV2Task } from '../task/MetricsV2Task';
import {
  getCopilotV2Config,
  shouldFetchLegacyMetrics,
} from '../utils/GithubUtils';
import { validateQuery } from './validation/validateQuery';
import {
  MetricsQuery,
  metricsQuerySchema,
  PeriodRangeQuery,
  periodRangeQuerySchema,
  TeamQuery,
  teamQuerySchema,
  MetricsV2Query,
  MetricsV2ByFeatureQuery,
  MetricsV2ByLanguageQuery,
  MetricsV2ByModelQuery,
  MetricsV2ByModelFeatureQuery,
  MetricsV2PeriodRangeQuery,
  metricsV2QuerySchema,
  metricsV2ByFeatureQuerySchema,
  metricsV2ByLanguageQuerySchema,
  metricsV2ByModelQuerySchema,
  metricsV2ByModelFeatureQuerySchema,
  metricsV2PeriodRangeQuerySchema,
} from './validation/schema';
import { DateTime } from 'luxon';

/**
 * Options for configuring the Copilot plugin.
 *
 * @public
 */
export interface PluginOptions {
  /**
   * Schedule configuration for the plugin.
   */
  schedule?: SchedulerServiceTaskScheduleDefinition;
}

/**
 * Options for configuring the router used by the Copilot plugin.
 *
 * @public
 */
export interface RouterOptions {
  /**
   * Logger service for the router.
   */
  logger: LoggerService;

  /**
   * Database service for the router.
   */
  database: DatabaseService;

  /**
   * Scheduler service for the router.
   */
  scheduler: SchedulerService;

  /**
   * Configuration for the router.
   */
  config: Config;
}

const defaultSchedule: SchedulerServiceTaskScheduleDefinition = {
  frequency: { cron: '0 2 * * *' },
  timeout: { minutes: 15 },
  initialDelay: { minutes: 1 },
  scope: 'local',
};

/**
 * Creates an Express router configured based on the provided router options and plugin options.
 *
 * This function initializes the router with the appropriate middleware and routes based on the
 * configuration and options provided. It also schedules tasks if scheduling options are provided.
 *
 * @param routerOptions - Options for configuring the router, including services and configuration.
 * @returns A promise that resolves to an Express router instance.
 *
 * @public
 */
export async function createRouterFromConfig(routerOptions: RouterOptions) {
  const { config } = routerOptions;
  const pluginOptions: PluginOptions = {
    schedule: defaultSchedule,
  };
  if (config && config.has('copilot.schedule')) {
    pluginOptions.schedule =
      readSchedulerServiceTaskScheduleDefinitionFromConfig(
        config.getConfig('copilot.schedule'),
      );
  }
  return createRouter(routerOptions, pluginOptions);
}

/** @private */
async function createRouter(
  routerOptions: RouterOptions,
  pluginOptions: PluginOptions,
): Promise<express.Router> {
  const { logger, database, scheduler, config } = routerOptions;
  const { schedule } = pluginOptions;

  const db = await DatabaseHandler.create({ database });
  const api = await GithubClient.fromConfig(config, logger);

  await scheduler.scheduleTask({
    id: 'copilot-metrics',
    ...(schedule ?? defaultSchedule),
    fn: async () =>
      await TaskManagement.create({ db, logger, api, config }).runAsync(),
  });

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get(
    '/metrics',
    validateQuery(metricsQuerySchema),
    async (req, res) => {
      const { startDate, endDate, type, team } = req.query as MetricsQuery;
      let metrics: Metric[] = [];

      // if startDate is earlier than last date of MetricsV1, fetch the old data
      const lastDayOfOldMetrics = await db.getMostRecentDayFromMetrics(
        type,
        team,
      );

      if (
        startDate &&
        lastDayOfOldMetrics &&
        DateTime.fromISO(startDate) <=
          DateTime.fromJSDate(new Date(lastDayOfOldMetrics))
      ) {
        const result = await db.getMetrics(startDate, endDate, type, team);
        metrics = result.map(metric => ({
          ...metric,
          breakdown: JSON.parse(metric.breakdown),
        }));
      }

      // if endDate is later or equal to first day of new metrics, fetch those also and merge into metrics
      const firstDayOfNewMetrics = await db.getEarliestDayFromMetricsV2(
        type,
        team,
      );
      if (
        endDate &&
        firstDayOfNewMetrics &&
        DateTime.fromISO(endDate) >=
          DateTime.fromJSDate(new Date(firstDayOfNewMetrics))
      ) {
        const result = await db.getMetricsV2(startDate, endDate, type, team);
        const breakdown = await db.getBreakdown(startDate, endDate, type, team);

        const newMetrics = result.map(metric => ({
          ...metric,
          breakdown: breakdown.filter(day => {
            const metricDate = DateTime.fromJSDate(new Date(metric.day));
            const dayDate = DateTime.fromJSDate(new Date(day.day));
            return metricDate.equals(dayDate);
          }),
        }));

        // Merge new metrics with old metrics
        metrics = [...metrics, ...newMetrics];
      }

      return res.json(metrics);
    },
  );

  router.get(
    '/engagements',
    validateQuery(metricsQuerySchema),
    async (req, res) => {
      const { startDate, endDate, type, team } = req.query as MetricsQuery;

      const engagements = await db.getEngagementMetrics(
        startDate,
        endDate,
        type,
        team,
      );
      if (!engagements) {
        throw new NotFoundError();
      }

      return res.json(engagements);
    },
  );

  router.get('/seats', validateQuery(metricsQuerySchema), async (req, res) => {
    const { startDate, endDate, type, team } = req.query as MetricsQuery;

    const seats = await db.getSeatMetrics(startDate, endDate, type, team);
    if (!seats) {
      throw new NotFoundError();
    }

    return res.json(seats);
  });

  router.get(
    '/metrics/period-range',
    validateQuery(periodRangeQuerySchema),
    async (req, res) => {
      const { type } = req.query as PeriodRangeQuery;
      const oldMetricRange = await db.getPeriodRange(type);
      const newMetricRange = await db.getPeriodRangeV2(type);

      if (!oldMetricRange && !newMetricRange) {
        throw new NotFoundError();
      }

      // Determine the minDate, prioritizing oldMetricRange if available
      const minDate = oldMetricRange?.minDate || newMetricRange?.minDate;

      // Determine the maxDate, prioritizing newMetricRange if available
      const maxDate = newMetricRange?.maxDate || oldMetricRange?.maxDate;

      // Make sure both minDate and maxDate are defined
      if (!minDate || !maxDate) {
        throw new NotFoundError('Unable to determine metric date range');
      }

      const result: PeriodRange = { minDate, maxDate };

      return res.json(result);
    },
  );

  router.get('/teams', validateQuery(teamQuerySchema), async (req, res) => {
    const { type, startDate, endDate } = req.query as TeamQuery;

    const result = await db.getTeams(type, startDate, endDate);

    if (!result) {
      throw new NotFoundError();
    }

    return res.json(result);
  });

  // ============================================================================
  // V2 Metrics Endpoints (New API - post April 2026)
  // ============================================================================

  // Check if V2 config is available
  const copilotV2Config = getCopilotV2Config(config);

  if (copilotV2Config) {
    const apiV2 = new GithubClientV2(config, copilotV2Config, logger);
    const orgV2Task = new OrganizationV2Task(db, apiV2, logger);
    const enterpriseV2Task = new EnterpriseV2Task(db, apiV2, logger);

    // Schedule V2 metrics fetch task
    await scheduler.scheduleTask({
      id: 'copilot-metrics-v2',
      ...(schedule ?? defaultSchedule),
      fn: async () => {
        await orgV2Task.run();
        await enterpriseV2Task.run();
      },
    });

    // V2: Get organizations list
    router.get('/v2/organizations', async (_, res) => {
      const organizations = apiV2.getOrganizations();
      const enterprise = apiV2.getEnterprise();

      return res.json({
        organizations,
        enterprise: enterprise || null,
      });
    });

    // V2: Get period range for an entity
    router.get(
      '/v2/period-range',
      validateQuery(metricsV2PeriodRangeQuerySchema),
      async (req, res) => {
        const { type, entityName } = req.query as MetricsV2PeriodRangeQuery;

        const range = await db.getMetricsV2NewPeriodRange(
          type as MetricsV2EntityType,
          entityName,
        );

        if (!range) {
          throw new NotFoundError(
            `No V2 metrics data found for ${type}: ${entityName}`,
          );
        }

        return res.json(range);
      },
    );

    // V2: Get daily metrics
    router.get(
      '/v2/metrics/daily',
      validateQuery(metricsV2QuerySchema),
      async (req, res) => {
        const { startDate, endDate, type, entityName } =
          req.query as MetricsV2Query;

        const metrics = await db.getMetricsV2NewDaily(
          type as MetricsV2EntityType,
          entityName,
          startDate,
          endDate,
        );

        return res.json(metrics);
      },
    );

    // V2: Get metrics by IDE
    router.get(
      '/v2/metrics/by-ide',
      validateQuery(metricsV2QuerySchema),
      async (req, res) => {
        const { startDate, endDate, type, entityName } =
          req.query as MetricsV2Query;

        const metrics = await db.getMetricsV2NewByIde(
          type as MetricsV2EntityType,
          entityName,
          startDate,
          endDate,
        );

        return res.json(metrics);
      },
    );

    // V2: Get metrics by feature
    router.get(
      '/v2/metrics/by-feature',
      validateQuery(metricsV2ByFeatureQuerySchema),
      async (req, res) => {
        const { startDate, endDate, type, entityName, feature } =
          req.query as MetricsV2ByFeatureQuery;

        const metrics = await db.getMetricsV2NewByFeature(
          type as MetricsV2EntityType,
          entityName,
          startDate,
          endDate,
          feature,
        );

        return res.json(metrics);
      },
    );

    // V2: Get metrics by language (language + feature breakdown)
    router.get(
      '/v2/metrics/by-language',
      validateQuery(metricsV2ByLanguageQuerySchema),
      async (req, res) => {
        const { startDate, endDate, type, entityName, language, feature } =
          req.query as MetricsV2ByLanguageQuery;

        const metrics = await db.getMetricsV2NewByLanguageFeature(
          type as MetricsV2EntityType,
          entityName,
          startDate,
          endDate,
          language,
          feature,
        );

        return res.json(metrics);
      },
    );

    // V2: Get metrics by model (language + model breakdown)
    router.get(
      '/v2/metrics/by-model',
      validateQuery(metricsV2ByModelQuerySchema),
      async (req, res) => {
        const { startDate, endDate, type, entityName, model, language } =
          req.query as MetricsV2ByModelQuery;

        const metrics = await db.getMetricsV2NewByLanguageModel(
          type as MetricsV2EntityType,
          entityName,
          startDate,
          endDate,
          language,
          model,
        );

        return res.json(metrics);
      },
    );

    // V2: Get metrics by model + feature
    router.get(
      '/v2/metrics/by-model-feature',
      validateQuery(metricsV2ByModelFeatureQuerySchema),
      async (req, res) => {
        const { startDate, endDate, type, entityName, model, feature } =
          req.query as MetricsV2ByModelFeatureQuery;

        const metrics = await db.getMetricsV2NewByModelFeature(
          type as MetricsV2EntityType,
          entityName,
          startDate,
          endDate,
          model,
          feature,
        );

        return res.json(metrics);
      },
    );

    // V2: Get user adoption metrics (if enabled)
    router.get(
      '/v2/metrics/adoption',
      validateQuery(metricsV2QuerySchema),
      async (req, res) => {
        const { startDate, endDate, type, entityName } =
          req.query as MetricsV2Query;

        if (!apiV2.isUserMetricsEnabled()) {
          return res.json({
            enabled: false,
            message: 'User metrics collection is disabled',
          });
        }

        const userMetrics = await db.getMetricsV2NewUserDaily(
          type as MetricsV2EntityType,
          entityName,
          startDate,
          endDate,
        );

        // Calculate adoption cohorts
        const totalUsers = userMetrics.length;
        const chatUsers = userMetrics.filter(u => u.used_chat).length;
        const agentUsers = userMetrics.filter(u => u.used_agent).length;
        const completionsOnly = userMetrics.filter(
          u => !u.used_chat && !u.used_agent,
        ).length;

        // Create distribution buckets
        const buckets = [
          { label: '0', min: 0, max: 0, count: 0 },
          { label: '1-10', min: 1, max: 10, count: 0 },
          { label: '11-25', min: 11, max: 25, count: 0 },
          { label: '26-50', min: 26, max: 50, count: 0 },
          { label: '51-100', min: 51, max: 100, count: 0 },
          { label: '100+', min: 101, max: undefined, count: 0 },
        ];

        for (const user of userMetrics) {
          const interactions = user.user_initiated_interaction_count ?? 0;
          for (const bucket of buckets) {
            if (
              interactions >= bucket.min &&
              (bucket.max === undefined || interactions <= bucket.max)
            ) {
              bucket.count++;
              break;
            }
          }
        }

        return res.json({
          enabled: true,
          totalUsers,
          cohorts: [
            {
              name: 'Completions Only',
              count: completionsOnly,
              percentage:
                totalUsers > 0 ? (completionsOnly / totalUsers) * 100 : 0,
            },
            {
              name: 'Chat Users',
              count: chatUsers,
              percentage: totalUsers > 0 ? (chatUsers / totalUsers) * 100 : 0,
            },
            {
              name: 'Agent Adopters',
              count: agentUsers,
              percentage: totalUsers > 0 ? (agentUsers / totalUsers) * 100 : 0,
            },
          ],
          distribution: buckets,
        });
      },
    );

    // V2: Get all entities with data
    router.get('/v2/entities', async (_, res) => {
      const entities = await db.getMetricsV2Entities();
      return res.json(entities);
    });

    // V2: Check if legacy metrics should still be fetched
    router.get('/v2/legacy-status', async (_, res) => {
      return res.json({
        shouldFetchLegacy: shouldFetchLegacyMetrics(),
        cutoffDate: '2026-04-02',
      });
    });
  }

  router.use(MiddlewareFactory.create({ config, logger }).error);
  return router;
}
