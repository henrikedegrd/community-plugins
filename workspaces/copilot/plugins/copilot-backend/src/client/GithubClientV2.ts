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

import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Octokit } from '@octokit/rest';
import {
  MetricsV2ReportResponse,
  MetricsV2Report,
  MetricsV2DayTotals,
} from '@backstage-community/plugin-copilot-common';
import {
  CopilotV2Config,
  getOrganizationCredentials,
} from '../utils/GithubUtils';

/**
 * Result of fetching V2 metrics report.
 */
export interface MetricsV2FetchResult {
  success: boolean;
  reportDay?: string;
  dayTotals?: MetricsV2DayTotals[];
  error?: string;
}

/**
 * Client for the new GitHub Copilot metrics API (V2 - post April 2026).
 * The new API returns download links to JSON reports rather than direct metrics.
 */
export class GithubClientV2 {
  private octokitCache: Map<string, Octokit> = new Map();

  constructor(
    private readonly config: Config,
    private readonly copilotV2Config: CopilotV2Config,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Get or create an Octokit instance for a specific organization.
   */
  private async getOctokitForOrg(organization: string): Promise<Octokit> {
    const cacheKey = `org:${organization}`;
    let octokit = this.octokitCache.get(cacheKey);

    if (!octokit) {
      const credentials = await getOrganizationCredentials(
        this.config,
        this.copilotV2Config.host,
        organization,
      );

      const octokitConfig: ConstructorParameters<typeof Octokit>[0] = {
        baseUrl: this.copilotV2Config.apiBaseUrl,
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      };

      if (typeof credentials === 'string') {
        // Token-based auth
        octokitConfig.auth = credentials;
      } else {
        // GitHub App auth - use dynamic import for ES Module
        const { createAppAuth } = await import('@octokit/auth-app');

        // First get the installation ID
        const installationId = await this.getInstallationId(
          credentials,
          organization,
        );

        octokitConfig.authStrategy = createAppAuth;
        octokitConfig.auth = {
          appId: credentials.appId,
          privateKey: credentials.privateKey,
          installationId,
        };
      }

      octokit = new Octokit(octokitConfig);

      this.octokitCache.set(cacheKey, octokit);
    }

    return octokit;
  }

  /**
   * Get the installation ID for a GitHub App for a specific organization.
   */
  private async getInstallationId(
    credentials: { appId: number | string; privateKey: string },
    organization: string,
  ): Promise<number> {
    // Dynamic import for ES Module
    const { createAppAuth } = await import('@octokit/auth-app');

    const appOctokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: credentials.appId,
        privateKey: credentials.privateKey,
      },
      baseUrl: this.copilotV2Config.apiBaseUrl,
    });

    const { data: installation } =
      await appOctokit.rest.apps.getOrgInstallation({
        org: organization,
      });

    return installation.id;
  }

  /**
   * Get or create an Octokit instance for enterprise.
   */
  private async getOctokitForEnterprise(): Promise<Octokit> {
    const cacheKey = `enterprise:${this.copilotV2Config.enterprise}`;
    let octokit = this.octokitCache.get(cacheKey);

    if (!octokit) {
      // Enterprise API only works with PAT tokens
      const credentials = await getOrganizationCredentials(
        this.config,
        this.copilotV2Config.host,
        this.copilotV2Config.enterprise!,
      );

      if (typeof credentials !== 'string') {
        throw new Error(
          'Enterprise API only works with PAT tokens, not GitHub Apps.',
        );
      }

      octokit = new Octokit({
        auth: credentials,
        baseUrl: this.copilotV2Config.apiBaseUrl,
      });

      this.octokitCache.set(cacheKey, octokit);
    }

    return octokit;
  }

  /**
   * Fetch the 28-day rolling report for an organization.
   */
  async fetchOrganization28DayReport(
    organization: string,
  ): Promise<MetricsV2FetchResult> {
    try {
      const octokit = await this.getOctokitForOrg(organization);
      const path = `/orgs/${organization}/copilot/metrics/reports/organization-28-days/latest`;

      this.logger.info(`Fetching 28-day report for org: ${organization}`);

      const response = await octokit.request(`GET ${path}`);
      const reportResponse = response.data as MetricsV2ReportResponse;

      // Fetch and parse the JSON from download links
      const dayTotals = await this.fetchAndParseDownloadLinks(
        reportResponse.download_links,
      );

      return {
        success: true,
        reportDay: reportResponse.report_day,
        dayTotals,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch 28-day report for org ${organization}: ${error.message}`,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Fetch the 1-day report for an organization for a specific day.
   */
  async fetchOrganization1DayReport(
    organization: string,
    day: string,
  ): Promise<MetricsV2FetchResult> {
    try {
      const octokit = await this.getOctokitForOrg(organization);
      const path = `/orgs/${organization}/copilot/metrics/reports/organization-1-day`;

      this.logger.info(
        `Fetching 1-day report for org: ${organization}, day: ${day}`,
      );

      const response = await octokit.request(`GET ${path}`, {
        day,
      });
      const reportResponse = response.data as MetricsV2ReportResponse;

      // Fetch and parse the JSON from download links
      const dayTotals = await this.fetchAndParseDownloadLinks(
        reportResponse.download_links,
      );

      return {
        success: true,
        reportDay: reportResponse.report_day,
        dayTotals,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch 1-day report for org ${organization}, day ${day}: ${error.message}`,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Fetch the 28-day rolling report for an enterprise.
   */
  async fetchEnterprise28DayReport(): Promise<MetricsV2FetchResult> {
    if (!this.copilotV2Config.enterprise) {
      return {
        success: false,
        error: 'No enterprise configured',
      };
    }

    try {
      const octokit = await this.getOctokitForEnterprise();
      const path = `/enterprises/${this.copilotV2Config.enterprise}/copilot/metrics/reports/enterprise-28-days/latest`;

      this.logger.info(
        `Fetching 28-day report for enterprise: ${this.copilotV2Config.enterprise}`,
      );

      const response = await octokit.request(`GET ${path}`);
      const reportResponse = response.data as MetricsV2ReportResponse;

      // Fetch and parse the JSON from download links
      const dayTotals = await this.fetchAndParseDownloadLinks(
        reportResponse.download_links,
      );

      return {
        success: true,
        reportDay: reportResponse.report_day,
        dayTotals,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch 28-day report for enterprise ${this.copilotV2Config.enterprise}: ${error.message}`,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Fetch the 1-day report for an enterprise for a specific day.
   */
  async fetchEnterprise1DayReport(day: string): Promise<MetricsV2FetchResult> {
    if (!this.copilotV2Config.enterprise) {
      return {
        success: false,
        error: 'No enterprise configured',
      };
    }

    try {
      const octokit = await this.getOctokitForEnterprise();
      const path = `/enterprises/${this.copilotV2Config.enterprise}/copilot/metrics/reports/enterprise-1-day`;

      this.logger.info(
        `Fetching 1-day report for enterprise: ${this.copilotV2Config.enterprise}, day: ${day}`,
      );

      const response = await octokit.request(`GET ${path}`, {
        day,
      });
      const reportResponse = response.data as MetricsV2ReportResponse;

      // Fetch and parse the JSON from download links
      const dayTotals = await this.fetchAndParseDownloadLinks(
        reportResponse.download_links,
      );

      return {
        success: true,
        reportDay: reportResponse.report_day,
        dayTotals,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch 1-day report for enterprise ${this.copilotV2Config.enterprise}, day ${day}: ${error.message}`,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Fetch the user-level 28-day report for an organization.
   * Only called when collectUserMetrics is enabled.
   */
  async fetchOrganizationUsers28DayReport(
    organization: string,
  ): Promise<MetricsV2FetchResult> {
    if (!this.copilotV2Config.collectUserMetrics) {
      return {
        success: false,
        error: 'User metrics collection is disabled',
      };
    }

    try {
      const octokit = await this.getOctokitForOrg(organization);
      const path = `/orgs/${organization}/copilot/metrics/reports/users-28-day/latest`;

      this.logger.info(`Fetching user 28-day report for org: ${organization}`);

      const response = await octokit.request(`GET ${path}`);
      const reportResponse = response.data as MetricsV2ReportResponse;

      // Fetch and parse the JSON from download links
      const dayTotals = await this.fetchAndParseDownloadLinks(
        reportResponse.download_links,
      );

      return {
        success: true,
        reportDay: reportResponse.report_day,
        dayTotals,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch user 28-day report for org ${organization}: ${error.message}`,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Fetch and parse JSON from download links.
   * The download links are ephemeral and must be fetched immediately.
   */
  private async fetchAndParseDownloadLinks(
    downloadLinks: string[],
  ): Promise<MetricsV2DayTotals[]> {
    const allDayTotals: MetricsV2DayTotals[] = [];

    for (const link of downloadLinks) {
      try {
        this.logger.debug(`Fetching JSON from download link: ${link}`);

        // Fetch the JSON directly (no auth needed for ephemeral links)
        const response = await fetch(link);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch download link: ${response.status} ${response.statusText}`,
          );
        }

        const report = (await response.json()) as MetricsV2Report;

        if (report.day_totals && Array.isArray(report.day_totals)) {
          allDayTotals.push(...report.day_totals);
        }
      } catch (error: any) {
        this.logger.error(
          `Failed to fetch/parse download link ${link}: ${error.message}`,
        );
        // Continue with other links even if one fails
      }
    }

    return allDayTotals;
  }

  /**
   * Get all configured organizations.
   */
  getOrganizations(): string[] {
    return this.copilotV2Config.organizations;
  }

  /**
   * Check if enterprise is configured.
   */
  hasEnterprise(): boolean {
    return !!this.copilotV2Config.enterprise;
  }

  /**
   * Get the enterprise name if configured.
   */
  getEnterprise(): string | undefined {
    return this.copilotV2Config.enterprise;
  }

  /**
   * Check if user metrics collection is enabled.
   */
  isUserMetricsEnabled(): boolean {
    return this.copilotV2Config.collectUserMetrics;
  }
}
