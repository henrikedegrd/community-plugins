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

import { ResponseError } from '@backstage/errors';
import { Config } from '@backstage/config';
import {
  CopilotMetrics,
  CopilotSeats,
  TeamInfo,
} from '@backstage-community/plugin-copilot-common';
import { Octokit } from '@octokit/rest';
import {
  CopilotConfig,
  CopilotCredentials,
  getCopilotConfig,
  getGithubCredentials,
} from '../utils/GithubUtils';

interface GithubApi {
  fetchEnterpriseCopilotMetrics: () => Promise<CopilotMetrics[]>;
  fetchEnterpriseTeamCopilotMetrics: (
    teamId: string,
  ) => Promise<CopilotMetrics[]>;
  fetchOrganizationCopilotMetrics: () => Promise<CopilotMetrics[]>;
  fetchOrganizationTeamCopilotMetrics: (
    teamId: string,
  ) => Promise<CopilotMetrics[]>;

  fetchEnterpriseTeams: () => Promise<TeamInfo[]>;
  fetchOrganizationTeams: () => Promise<TeamInfo[]>;
}

export class GithubClient implements GithubApi {
  private enterpriseOctokit?: Octokit;
  private organizationOctokit?: Octokit;

  constructor(
    private readonly copilotConfig: CopilotConfig,
    private readonly config: Config,
  ) {}

  static async fromConfig(config: Config) {
    const info = getCopilotConfig(config);
    return new GithubClient(info, config);
  }

  private async getCredentials(): Promise<CopilotCredentials> {
    return await getGithubCredentials(this.config, this.copilotConfig);
  }

  private async getEnterpriseOctokit(): Promise<Octokit> {
    if (!this.enterpriseOctokit) {
      const credentials = await this.getCredentials();
      const headers = credentials.enterprise?.headers || {};

      this.enterpriseOctokit = new Octokit({
        baseUrl: this.copilotConfig.apiBaseUrl,
        auth: headers.Authorization?.replace('Bearer ', '') || '',
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
    }
    return this.enterpriseOctokit;
  }

  private async getOrganizationOctokit(): Promise<Octokit> {
    if (!this.organizationOctokit) {
      const credentials = await this.getCredentials();
      const headers = credentials.organization?.headers || {};

      this.organizationOctokit = new Octokit({
        baseUrl: this.copilotConfig.apiBaseUrl,
        auth: headers.Authorization?.replace('Bearer ', '') || '',
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
    }
    return this.organizationOctokit;
  }

  async fetchEnterpriseCopilotMetrics(): Promise<CopilotMetrics[]> {
    const octokit = await this.getEnterpriseOctokit();
    const path = `/enterprises/${this.copilotConfig.enterprise}/copilot/metrics`;

    try {
      const response = await octokit.request(`GET ${path}`);
      return response.data as CopilotMetrics[];
    } catch (error) {
      throw ResponseError.fromResponse(error.response || error);
    }
  }

  async fetchEnterpriseTeamCopilotMetrics(
    teamId: string,
  ): Promise<CopilotMetrics[]> {
    const octokit = await this.getEnterpriseOctokit();
    const path = `/enterprises/${this.copilotConfig.enterprise}/team/${teamId}/copilot/metrics`;

    try {
      const response = await octokit.request(`GET ${path}`);
      return response.data as CopilotMetrics[];
    } catch (error) {
      throw ResponseError.fromResponse(error.response || error);
    }
  }

  async fetchEnterpriseTeams(): Promise<TeamInfo[]> {
    const octokit = await this.getEnterpriseOctokit();
    const path = `/enterprises/${this.copilotConfig.enterprise}/teams`;

    try {
      const teams = await octokit.paginate(`GET ${path}`, {
        per_page: 100, // Maximum allowed per page
      });
      return teams as TeamInfo[];
    } catch (error) {
      throw ResponseError.fromResponse(error.response || error);
    }
  }

  async fetchEnterpriseSeats(): Promise<any> {
    const octokit = await this.getEnterpriseOctokit();
    const path = `/enterprises/${this.copilotConfig.enterprise}/copilot/billing/seats`;

    try {
      const seats = await octokit.paginate(`GET ${path}`, {
        per_page: 100, // Maximum allowed per page
      });

      return this.mergePaginationResult(seats as CopilotSeats[]);
    } catch (error) {
      throw ResponseError.fromResponse(error.response || error);
    }
  }

  async fetchOrganizationCopilotMetrics(): Promise<CopilotMetrics[]> {
    const octokit = await this.getOrganizationOctokit();
    const path = `/orgs/${this.copilotConfig.organization}/copilot/metrics`;

    try {
      const response = await octokit.request(`GET ${path}`);
      return response.data as CopilotMetrics[];
    } catch (error) {
      throw ResponseError.fromResponse(error.response || error);
    }
  }

  async fetchOrganizationTeamCopilotMetrics(
    teamId: string,
  ): Promise<CopilotMetrics[]> {
    const octokit = await this.getOrganizationOctokit();
    const path = `/orgs/${this.copilotConfig.organization}/team/${teamId}/copilot/metrics`;

    try {
      const response = await octokit.request(`GET ${path}`);
      return response.data as CopilotMetrics[];
    } catch (error) {
      throw ResponseError.fromResponse(error.response || error);
    }
  }

  async fetchOrganizationTeams(): Promise<TeamInfo[]> {
    const octokit = await this.getOrganizationOctokit();
    const path = `/orgs/${this.copilotConfig.organization}/teams`;

    try {
      const teams = await octokit.paginate(`GET ${path}`, {
        per_page: 100, // Maximum allowed per page
      });
      return teams as TeamInfo[];
    } catch (error) {
      throw ResponseError.fromResponse(error.response || error);
    }
  }

  async fetchOrganizationSeats(): Promise<CopilotSeats> {
    const octokit = await this.getOrganizationOctokit();

    try {
      const seats = await octokit.paginate(octokit.copilot.listCopilotSeats, {
        org: this.copilotConfig.organization!,
        per_page: 100, // Maximum allowed per page
      });

      return this.mergePaginationResult(seats as CopilotSeats[]);
    } catch (error) {
      throw ResponseError.fromResponse(error.response || error);
    }
  }

  /**
   * This function is used to merge paginated results from the GitHub API
   * that does not work as one would expect. If the api returns a object which
   * contains paginated results, we get an array of the objects instead of merged data.
   * So this function merges this data into one object where the property "seats" are
   * merged into a single array.
   * @param data
   * @returns paginated result as one would expect
   */
  mergePaginationResult(data: CopilotSeats[]): CopilotSeats {
    if (data.length === 0) {
      return {
        total_seats: 0,
        seats: [],
      };
    }

    const totalSeats = data[0].total_seats;
    const seats = data.map(seat => seat.seats).flat();

    return {
      total_seats: totalSeats,
      seats: seats,
    };
  }
}
