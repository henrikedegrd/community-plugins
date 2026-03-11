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

import { TestDatabaseId, TestDatabases } from '@backstage/backend-test-utils';
import { Knex } from 'knex';
import { DatabaseHandler, migrationsDir } from './DatabaseHandler';
import { MetricsType } from '@backstage-community/plugin-copilot-common';

jest.setTimeout(60_000);

describe('DatabaseHandler', () => {
  const databases = TestDatabases.create();

  async function createDatabase(databaseId: TestDatabaseId) {
    const knex = await databases.init(databaseId);
    await knex.migrate.latest({
      directory: migrationsDir,
    });
    return knex;
  }

  describe.each(databases.eachSupportedId())(
    'getEngagementMetrics - database: %s',
    databaseId => {
      let knex: Knex;
      let databaseHandler: DatabaseHandler;

      // Skip MySQL tests due to known migration issues
      if (databaseId.startsWith('MYSQL')) {
        // eslint-disable-next-line jest/no-disabled-tests, jest/expect-expect
        it.skip('tests for MySQL due to pre-existing migration issue', () => {});
        return;
      }

      beforeEach(async () => {
        knex = await createDatabase(databaseId);
        databaseHandler = await DatabaseHandler.create({
          database: {
            getClient: async () => knex,
            migrations: { skip: true },
          } as any,
        });
      });

      afterEach(async () => {
        await knex?.destroy();
      });

      describe('with empty string team_name', () => {
        const testDate = '2025-11-10';
        const testDate2 = '2025-11-11';

        beforeEach(async () => {
          // Insert test data with empty string team_name (representing organization-level data)
          await knex('copilot_metrics').insert([
            {
              day: testDate,
              type: 'organization',
              team_name: '',
              total_engaged_users: 100,
              total_active_users: 150,
            },
            {
              day: testDate2,
              type: 'organization',
              team_name: '',
              total_engaged_users: 120,
              total_active_users: 160,
            },
          ]);

          await knex('ide_completions').insert([
            {
              day: testDate,
              type: 'organization',
              team_name: '',
              total_engaged_users: 80,
            },
            {
              day: testDate2,
              type: 'organization',
              team_name: '',
              total_engaged_users: 90,
            },
          ]);

          await knex('ide_chats').insert([
            {
              day: testDate,
              type: 'organization',
              team_name: '',
              total_engaged_users: 50,
            },
            {
              day: testDate2,
              type: 'organization',
              team_name: '',
              total_engaged_users: 55,
            },
          ]);

          await knex('dotcom_chats').insert([
            {
              day: testDate,
              type: 'organization',
              team_name: '',
              total_engaged_users: 30,
            },
            {
              day: testDate2,
              type: 'organization',
              team_name: '',
              total_engaged_users: 35,
            },
          ]);

          await knex('dotcom_prs').insert([
            {
              day: testDate,
              type: 'organization',
              team_name: '',
              total_engaged_users: 20,
            },
            {
              day: testDate2,
              type: 'organization',
              team_name: '',
              total_engaged_users: 25,
            },
          ]);
        });

        it('should retrieve organization-level metrics when teamName is undefined', async () => {
          const result = await databaseHandler.getEngagementMetrics(
            testDate,
            testDate2,
            'organization' as MetricsType,
          );

          expect(result).toHaveLength(2);

          const day1 = result.find(r => normalizeDate(r.day) === testDate);
          expect(day1).toBeDefined();
          expect(day1?.team_name).toBe('');
          expect(day1?.total_active_users).toBe(150);
          expect(day1?.total_engaged_users).toBe(100);
          expect(day1?.ide_completions_engaged_users).toBe(80);
          expect(day1?.ide_chats_engaged_users).toBe(50);
          expect(day1?.dotcom_chats_engaged_users).toBe(30);
          expect(day1?.dotcom_prs_engaged_users).toBe(20);

          const day2 = result.find(r => normalizeDate(r.day) === testDate2);
          expect(day2).toBeDefined();
          expect(day2?.team_name).toBe('');
          expect(day2?.total_active_users).toBe(160);
          expect(day2?.total_engaged_users).toBe(120);
          expect(day2?.ide_completions_engaged_users).toBe(90);
          expect(day2?.ide_chats_engaged_users).toBe(55);
          expect(day2?.dotcom_chats_engaged_users).toBe(35);
          expect(day2?.dotcom_prs_engaged_users).toBe(25);
        });

        it('should retrieve organization-level metrics when teamName is explicitly empty string', async () => {
          const result = await databaseHandler.getEngagementMetrics(
            testDate,
            testDate2,
            'organization' as MetricsType,
            '',
          );

          expect(result).toHaveLength(2);
          expect(result[0].team_name).toBe('');
          expect(result[0].total_active_users).toBeGreaterThan(0);
        });
      });

      describe('with specific team_name', () => {
        const testDate = '2025-11-10';
        const teamName = 'engineering-team';

        beforeEach(async () => {
          // Insert organization-level data (team_name = '')
          await knex('copilot_metrics').insert([
            {
              day: testDate,
              type: 'organization',
              team_name: '',
              total_engaged_users: 100,
              total_active_users: 150,
            },
            {
              day: testDate,
              type: 'organization',
              team_name: teamName,
              total_engaged_users: 50,
              total_active_users: 70,
            },
          ]);

          await knex('ide_completions').insert([
            {
              day: testDate,
              type: 'organization',
              team_name: '',
              total_engaged_users: 80,
            },
            {
              day: testDate,
              type: 'organization',
              team_name: teamName,
              total_engaged_users: 40,
            },
          ]);

          await knex('ide_chats').insert([
            {
              day: testDate,
              type: 'organization',
              team_name: '',
              total_engaged_users: 60,
            },
            {
              day: testDate,
              type: 'organization',
              team_name: teamName,
              total_engaged_users: 30,
            },
          ]);

          await knex('dotcom_chats').insert([
            {
              day: testDate,
              type: 'organization',
              team_name: '',
              total_engaged_users: 40,
            },
            {
              day: testDate,
              type: 'organization',
              team_name: teamName,
              total_engaged_users: 20,
            },
          ]);

          await knex('dotcom_prs').insert([
            {
              day: testDate,
              type: 'organization',
              team_name: '',
              total_engaged_users: 30,
            },
            {
              day: testDate,
              type: 'organization',
              team_name: teamName,
              total_engaged_users: 15,
            },
          ]);
        });

        it('should retrieve team-specific metrics when teamName is provided', async () => {
          const result = await databaseHandler.getEngagementMetrics(
            testDate,
            testDate,
            'organization' as MetricsType,
            teamName,
          );

          expect(result).toHaveLength(1);
          expect(result[0].team_name).toBe(teamName);
          expect(result[0].total_active_users).toBe(70);
          expect(result[0].total_engaged_users).toBe(50);
          expect(result[0].ide_completions_engaged_users).toBe(40);
          expect(result[0].ide_chats_engaged_users).toBe(30);
          expect(result[0].dotcom_chats_engaged_users).toBe(20);
          expect(result[0].dotcom_prs_engaged_users).toBe(15);
        });

        it('should not return organization-level data when querying for specific team', async () => {
          const result = await databaseHandler.getEngagementMetrics(
            testDate,
            testDate,
            'organization' as MetricsType,
            teamName,
          );

          expect(result).toHaveLength(1);
          expect(result.every(r => r.team_name === teamName)).toBe(true);
        });

        it('should return organization-level data when no team is specified', async () => {
          const result = await databaseHandler.getEngagementMetrics(
            testDate,
            testDate,
            'organization' as MetricsType,
          );

          expect(result).toHaveLength(1);
          expect(result[0].team_name).toBe('');
          expect(result[0].total_active_users).toBe(150);
        });
      });

      describe('with null values in joined tables', () => {
        const testDate = '2025-11-10';

        beforeEach(async () => {
          // Insert copilot_metrics but not all joined table data
          await knex('copilot_metrics').insert([
            {
              day: testDate,
              type: 'organization',
              team_name: '',
              total_engaged_users: 100,
              total_active_users: 150,
            },
          ]);

          // Only insert ide_completions, leaving other tables empty
          await knex('ide_completions').insert([
            {
              day: testDate,
              type: 'organization',
              team_name: '',
              total_engaged_users: 80,
            },
          ]);
        });

        it('should handle missing data in joined tables gracefully', async () => {
          const result = await databaseHandler.getEngagementMetrics(
            testDate,
            testDate,
            'organization' as MetricsType,
          );

          expect(result).toHaveLength(1);
          expect(result[0].total_active_users).toBe(150);
          expect(result[0].total_engaged_users).toBe(100);
          expect(result[0].ide_completions_engaged_users).toBe(80);
          // These should be null due to LEFT JOIN with no matching data
          expect(result[0].ide_chats_engaged_users).toBeNull();
          expect(result[0].dotcom_chats_engaged_users).toBeNull();
          expect(result[0].dotcom_prs_engaged_users).toBeNull();
        });
      });

      describe('with date range filtering', () => {
        beforeEach(async () => {
          await knex('copilot_metrics').insert([
            {
              day: '2025-11-08',
              type: 'organization',
              team_name: '',
              total_engaged_users: 90,
              total_active_users: 140,
            },
            {
              day: '2025-11-10',
              type: 'organization',
              team_name: '',
              total_engaged_users: 100,
              total_active_users: 150,
            },
            {
              day: '2025-11-12',
              type: 'organization',
              team_name: '',
              total_engaged_users: 110,
              total_active_users: 160,
            },
          ]);
        });

        it('should filter results by date range', async () => {
          const result = await databaseHandler.getEngagementMetrics(
            '2025-11-10',
            '2025-11-12',
            'organization' as MetricsType,
          );

          expect(result).toHaveLength(2);
          const dates = result.map(r => normalizeDate(r.day));
          expect(dates).toContain('2025-11-10');
          expect(dates).toContain('2025-11-12');
          expect(dates).not.toContain('2025-11-08');
        });

        it('should return results ordered by day ascending', async () => {
          const result = await databaseHandler.getEngagementMetrics(
            '2025-11-08',
            '2025-11-12',
            'organization' as MetricsType,
          );

          expect(result).toHaveLength(3);
          const dates = result.map(r => normalizeDate(r.day));
          expect(dates).toEqual(['2025-11-08', '2025-11-10', '2025-11-12']);
        });
      });

      describe('with multiple teams', () => {
        const testDate = '2025-11-10';

        beforeEach(async () => {
          await knex('copilot_metrics').insert([
            {
              day: testDate,
              type: 'organization',
              team_name: '',
              total_engaged_users: 100,
              total_active_users: 150,
            },
            {
              day: testDate,
              type: 'organization',
              team_name: 'team-alpha',
              total_engaged_users: 50,
              total_active_users: 70,
            },
            {
              day: testDate,
              type: 'organization',
              team_name: 'team-beta',
              total_engaged_users: 60,
              total_active_users: 80,
            },
          ]);
        });

        it('should only return data for the requested team', async () => {
          const result = await databaseHandler.getEngagementMetrics(
            testDate,
            testDate,
            'organization' as MetricsType,
            'team-alpha',
          );

          expect(result).toHaveLength(1);
          expect(result[0].team_name).toBe('team-alpha');
          expect(result[0].total_engaged_users).toBe(50);
        });

        it('should only return organization-level data when no team specified', async () => {
          const result = await databaseHandler.getEngagementMetrics(
            testDate,
            testDate,
            'organization' as MetricsType,
          );

          expect(result).toHaveLength(1);
          expect(result[0].team_name).toBe('');
          expect(result[0].total_engaged_users).toBe(100);
        });
      });
    },
  );

  // ============================================================================
  // V2 Metrics Database Tests (New API - post April 2026)
  // ============================================================================

  describe.each(databases.eachSupportedId())(
    'V2 Metrics Methods - database: %s',
    databaseId => {
      let knex: Knex;
      let databaseHandler: DatabaseHandler;

      // Skip MySQL tests due to known migration issues
      if (databaseId.startsWith('MYSQL')) {
        // eslint-disable-next-line jest/no-disabled-tests, jest/expect-expect
        it.skip('tests for MySQL due to pre-existing migration issue', () => {});
        return;
      }

      beforeEach(async () => {
        knex = await createDatabase(databaseId);
        databaseHandler = await DatabaseHandler.create({
          database: {
            getClient: async () => knex,
            migrations: { skip: true },
          } as any,
        });
      });

      afterEach(async () => {
        await knex?.destroy();
      });

      describe('batchInsertMetricsV2Daily', () => {
        it('should insert daily metrics', async () => {
          const metrics = [
            {
              day: '2025-01-15',
              type: 'organization' as const,
              entity_name: 'test-org',
              daily_active_users: 100,
              weekly_active_users: 200,
              monthly_active_users: 300,
              code_generation_activity_count: 1000,
              code_acceptance_activity_count: 800,
            },
          ];

          await databaseHandler.batchInsertMetricsV2Daily(metrics);

          const result = await databaseHandler.getMetricsV2NewDaily(
            'organization',
            'test-org',
            '2025-01-01',
            '2025-01-31',
          );

          expect(result).toHaveLength(1);
          expect(result[0].entity_name).toBe('test-org');
          expect(result[0].daily_active_users).toBe(100);
        });

        it('should ignore duplicate inserts', async () => {
          const metrics = [
            {
              day: '2025-01-15',
              type: 'organization' as const,
              entity_name: 'test-org',
              daily_active_users: 100,
            },
          ];

          await databaseHandler.batchInsertMetricsV2Daily(metrics);
          await databaseHandler.batchInsertMetricsV2Daily(metrics);

          const result = await databaseHandler.getMetricsV2NewDaily(
            'organization',
            'test-org',
            '2025-01-01',
            '2025-01-31',
          );

          expect(result).toHaveLength(1);
        });
      });

      describe('batchInsertMetricsV2ByFeature', () => {
        it('should insert and query metrics by feature', async () => {
          const metrics = [
            {
              day: '2025-01-15',
              type: 'organization' as const,
              entity_name: 'test-org',
              feature: 'code_completion',
              code_generation_activity_count: 500,
            },
            {
              day: '2025-01-15',
              type: 'organization' as const,
              entity_name: 'test-org',
              feature: 'agent_edit',
              code_generation_activity_count: 200,
            },
          ];

          await databaseHandler.batchInsertMetricsV2ByFeature(metrics);

          // Query all features
          const allResults = await databaseHandler.getMetricsV2NewByFeature(
            'organization',
            'test-org',
            '2025-01-01',
            '2025-01-31',
          );
          expect(allResults).toHaveLength(2);

          // Query specific feature
          const codeCompletionResults =
            await databaseHandler.getMetricsV2NewByFeature(
              'organization',
              'test-org',
              '2025-01-01',
              '2025-01-31',
              'code_completion',
            );
          expect(codeCompletionResults).toHaveLength(1);
          expect(codeCompletionResults[0].feature).toBe('code_completion');
        });
      });

      describe('getMetricsV2NewPeriodRange', () => {
        it('should return correct period range', async () => {
          const metrics = [
            {
              day: '2025-01-10',
              type: 'organization' as const,
              entity_name: 'test-org',
              daily_active_users: 100,
            },
            {
              day: '2025-01-15',
              type: 'organization' as const,
              entity_name: 'test-org',
              daily_active_users: 120,
            },
            {
              day: '2025-01-20',
              type: 'organization' as const,
              entity_name: 'test-org',
              daily_active_users: 130,
            },
          ];

          await databaseHandler.batchInsertMetricsV2Daily(metrics);

          const range = await databaseHandler.getMetricsV2NewPeriodRange(
            'organization',
            'test-org',
          );

          expect(range).toBeDefined();
          expect(normalizeDate(range!.minDate)).toBe('2025-01-10');
          expect(normalizeDate(range!.maxDate)).toBe('2025-01-20');
        });

        it('should return undefined when no data exists', async () => {
          const range = await databaseHandler.getMetricsV2NewPeriodRange(
            'organization',
            'non-existent-org',
          );

          expect(range).toBeUndefined();
        });
      });

      describe('getExistingDaysFromMetricsV2New', () => {
        it('should return list of existing days', async () => {
          const metrics = [
            {
              day: '2025-01-10',
              type: 'organization' as const,
              entity_name: 'test-org',
              daily_active_users: 100,
            },
            {
              day: '2025-01-12',
              type: 'organization' as const,
              entity_name: 'test-org',
              daily_active_users: 110,
            },
            {
              day: '2025-01-14',
              type: 'organization' as const,
              entity_name: 'test-org',
              daily_active_users: 120,
            },
          ];

          await databaseHandler.batchInsertMetricsV2Daily(metrics);

          const existingDays =
            await databaseHandler.getExistingDaysFromMetricsV2New(
              'organization',
              'test-org',
              '2025-01-01',
              '2025-01-31',
            );

          expect(existingDays).toHaveLength(3);
          expect(existingDays.map(normalizeDate)).toContain('2025-01-10');
          expect(existingDays.map(normalizeDate)).toContain('2025-01-12');
          expect(existingDays.map(normalizeDate)).toContain('2025-01-14');
        });
      });

      describe('Retry tracking methods', () => {
        it('should create and track fetch retries', async () => {
          const retry = await databaseHandler.getOrCreateFetchRetry(
            'organization',
            'test-org',
            '2025-01-15',
            'organization',
          );

          expect(retry.type).toBe('organization');
          expect(retry.entity_name).toBe('test-org');
          expect(normalizeDate(retry.day)).toBe('2025-01-15');
          expect(retry.status).toBe('pending');
          expect(retry.retry_count).toBe(0);
        });

        it('should update retry status', async () => {
          const retry = await databaseHandler.getOrCreateFetchRetry(
            'organization',
            'test-org',
            '2025-01-15',
            'organization',
          );

          await databaseHandler.updateFetchRetry(
            retry.id!,
            'pending',
            'Test error',
          );

          const pendingRetries = await databaseHandler.getPendingFetchRetries(
            'organization',
            'test-org',
          );

          expect(pendingRetries).toHaveLength(1);
          expect(pendingRetries[0].last_error).toBe('Test error');
        });

        it('should mark retry as successful', async () => {
          const retry = await databaseHandler.getOrCreateFetchRetry(
            'organization',
            'test-org',
            '2025-01-15',
            'organization',
          );

          await databaseHandler.markFetchRetrySuccess(retry.id!);

          const pendingRetries = await databaseHandler.getPendingFetchRetries(
            'organization',
            'test-org',
          );

          expect(pendingRetries).toHaveLength(0);
        });
      });

      describe('getMetricsV2Entities', () => {
        it('should return all unique entities', async () => {
          const metrics = [
            {
              day: '2025-01-15',
              type: 'organization' as const,
              entity_name: 'org-1',
              daily_active_users: 100,
            },
            {
              day: '2025-01-15',
              type: 'organization' as const,
              entity_name: 'org-2',
              daily_active_users: 200,
            },
            {
              day: '2025-01-16',
              type: 'organization' as const,
              entity_name: 'org-1',
              daily_active_users: 110,
            },
          ];

          await databaseHandler.batchInsertMetricsV2Daily(metrics);

          const entities = await databaseHandler.getMetricsV2Entities();

          expect(entities).toHaveLength(2);
          expect(entities.map(e => e.entity_name)).toContain('org-1');
          expect(entities.map(e => e.entity_name)).toContain('org-2');
        });
      });
    },
  );

  function normalizeDate(date: string | Date): string {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date;
  }
});
