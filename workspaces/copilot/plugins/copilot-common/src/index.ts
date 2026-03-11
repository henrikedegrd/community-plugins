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

/**
 * Common functionalities for the copilot plugin.
 *
 * @packageDocumentation
 */

/**
 * Represents metrics data for a day in the copilot plugin.
 *
 * This used to be part of an API exposed by GitHub (/usage),
 * that was deprecated. At some point we should fully convert to the new CopilotMetrics way.
 * Until the frontend is fully converted, we need to keep this type, since the new metrics converts its result to this type.
 *
 * @public @deprecated Should not be used in new code.
 */
export interface Breakdown {
  /**
   * The number of times suggestions were accepted.
   */
  acceptances_count: number;

  /**
   * The number of active users.
   */
  active_users: number;

  /**
   * The editor used.
   */
  editor: string;

  /**
   * The programming language.
   */
  language: string;

  /**
   * The number of lines accepted.
   */
  lines_accepted: number;

  /**
   * The number of lines suggested.
   */
  lines_suggested: number;

  /**
   * The number of suggestions made.
   */
  suggestions_count: number;
}

/**
 * Represents the possible types of metrics data.
 *
 * @public
 */
export type MetricsType = 'enterprise' | 'organization';

/**
 * Represents a detailed breakdown of metrics by language and editor.
 * This represents data from the old usage API
 * Until the frontend is fully converted to the new CopilotMetrics way,
 * we need to keep this type, since the new metrics converts its result to this type.
 *
 * @public @deprecated Should not be used in new code.
 */
export interface Metric {
  /**
   * Detailed breakdown of metrics by language and editor.
   */
  breakdown: Breakdown[];

  /**
   * The date for the metrics reported.
   */
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

  /**
   * The total number of suggestions accepted.
   */
  total_acceptances_count: number;

  /**
   * The total number of active chat users.
   */
  total_active_chat_users: number;

  /**
   * The total number of active users.
   */
  total_active_users: number;

  /**
   * The total number of chat acceptances.
   */
  total_chat_acceptances: number;

  /**
   * The total number of chat turns.
   */
  total_chat_turns: number;

  /**
   * The total number of lines accepted.
   */
  total_lines_accepted: number;

  /**
   * The total number of lines suggested.
   */
  total_lines_suggested: number;

  /**
   * The total number of suggestions made.
   */
  total_suggestions_count: number;
}

/**
 * Represents a range of dates for a reporting period.
 *
 * @public
 */
export interface PeriodRange {
  /**
   * The maximum date of the reporting period.
   */
  maxDate: string;

  /**
   * The minimum date of the reporting period.
   */
  minDate: string;
}

/**
 * Represents information about a team.
 *
 * @public
 */
export interface TeamInfo {
  /**
   * The unique identifier of the team.
   */
  id: number;

  /**
   * The slug of the team, used for URL-friendly identifiers.
   */
  slug: string;

  /**
   * The name of the team.
   */
  name: string;
}

/**
 * Represents the metrics data for copilot ide language metrics
 *
 * @public
 */
export interface CopilotLanguages {
  /**
   * The language name
   */
  name: string;
  /**
   * The number of engaged users
   */
  total_engaged_users: number;
  /**
   * total number of code suggestions
   */
  total_code_suggestions: number;
  /**
   * total number of code acceptances
   */
  total_code_acceptances: number;
  /**
   * total number of code lines suggested
   */
  total_code_lines_suggested: number;
  /**
   * total number of code lines accepted
   */
  total_code_lines_accepted: number;
}

/**
 * Represents the metrics data for copilot ide languages
 *
 * @public
 */
export interface CopilotIdeLanguages {
  /**
   * The language name
   */
  name: string;
  /**
   * The number of engaged users
   */
  total_engaged_users: number;
}

/**
 * Represents the metrics data for copilot models
 *
 * @public
 */
export interface CopilotModels {
  /**
   * The model name
   */
  name: string;
  /**
   * List of languages this model was used in
   */
  languages: CopilotLanguages[];
  /**
   * The total number of engaged users
   */
  total_engaged_users: number;
}

/**
 * Represents the metrics data for copilot ide chat models
 *
 * @public
 */
export interface CopilotChatModels {
  /**
   * The model name
   */
  name: string;
  /**
   * The number of engaged users
   */
  total_engaged_users: number;
  /**
   * Total number of chat turns
   */
  total_chats: number;
  /**
   * Total number of chat copy events
   */
  total_chat_copy_events: number;
  /**
   * Total number of chat insertion events
   */
  total_chat_insertion_events: number;
}

/**
 * Represents the metrics data for copilot ide chats
 *
 * @public
 */
export interface CopilotChats {
  /**
   * The number of engaged users
   */
  total_engaged_users: number;
  /**
   * List of editors
   */
  editors: CopilotChatEditors[];
}

/**
 * Represents the metrics data for copilot chat editors
 *
 * @public
 */
export interface CopilotChatEditors {
  /**
   * The Editor name
   */
  name: string;
  /**
   * The number of engaged users
   */
  total_engaged_users: number;
  /**
   * List of models used in this editor
   */
  models: CopilotChatModels[];
}

/**
 * Represents the metrics data for copilot github chats
 *
 * @public
 */
export interface DotcomChat {
  /**
   * The number of engaged users
   */
  total_engaged_users: number;
  /**
   * List of models used in dotcom chat
   */
  models: DotcomChatModels[];
}

/**
 * Represents the metrics data for copilot models
 *
 * @public
 */
export interface DotcomChatModels {
  /**
   * The model name
   */
  name: string;
  /**
   * The number of engaged users
   */
  total_engaged_users: number;
  /**
   * Total number of chat turns
   */
  total_chats: number;
  /**
   * Indicates if it is a custom model
   */
  is_custom_model: boolean;
}

/**
 * Represents the metrics data for copilot editors
 *
 * @public
 */
export interface CopilotEditors {
  /**
   * The editor name
   */
  name: string;
  /**
   * List of models this editor was used in
   */
  models: CopilotModels[];
  /**
   * The total number of engaged users
   */
  total_engaged_users: number;
}

/**
 * Represents the metrics data for copilot ide completions
 *
 * @public
 */
export interface CopilotIdeCodeCompletions {
  /**
   * List of editors
   */
  editors: CopilotEditors[];
  /**
   * The total number of engaged users
   */
  total_engaged_users: number;
  /**
   * List of languages used in IDE
   */
  languages: CopilotIdeLanguages[];
}

/**
 * Represents the metrics data for copilot pull requests
 *
 * @public
 */
export interface DotcomPullRequests {
  /**
   * The total number of engaged users
   */
  total_engaged_users: number;
  /**
   * List of repositories
   */
  repositories: CopilotRepository[];
}

/**
 * Represents the metrics data for copilot repos
 *
 * @public
 */
export interface CopilotRepository {
  /**
   * The repository name
   */
  name: string;
  /**
   * The total number of engaged users
   */
  total_engaged_users: number;
  /**
   * List of models used in this repository
   */
  models: CopilotRepositoryModels[];
}

/**
 * Represents the metrics data for copilot repo models
 *
 * @public
 */
export interface CopilotRepositoryModels {
  /**
   * The model name
   */
  name: string;
  /**
   * The total number of engaged users
   */
  total_engaged_users: number;
  /**
   * The total number of PR summaries created
   */
  total_pr_summaries_created: number;
  /**
   * Indicates if it is a custom model
   */
  is_custom_model: boolean;
  /**
   * The date when the custom model was trained
   */
  custom_model_training_date: string;
}

/**
 * Represents the metrics data for copilot
 *
 * @public
 */
export interface CopilotMetrics {
  /**
   * The date for the metrics reported.
   */
  date: string;

  /**
   * The total number of active users.
   */
  total_active_users: number;

  /**
   * The total number of engaged users.
   */
  total_engaged_users: number;

  /**
   * The total number of code suggestions for IDE users.
   */
  copilot_ide_code_completions: CopilotIdeCodeCompletions;

  /**
   * The total number of chats for IDE users.
   */
  copilot_ide_chat: CopilotChats;

  /**
   * The total number of chats for dotcom users.
   */
  copilot_dotcom_chat: DotcomChat;

  /**
   * The total number of pull requests for dotcom users.
   */
  copilot_dotcom_pull_requests: DotcomPullRequests;
}

/**
 * Represents the engagement metrics for copilot.
 *
 * @public
 */
export interface EngagementMetrics {
  /**
   * The date for the metrics reported.
   */
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

  /**
   * The total number of users who have used Copilot.
   */
  total_active_users: number;

  /**
   * The total number of users who have meaningfully interacted with Copilot features.
   */
  total_engaged_users: number;

  /**
   * The number of users who have engaged with IDE code completions.
   */
  ide_completions_engaged_users: number;

  /**
   * The number of users who have engaged with IDE chat features.
   */
  ide_chats_engaged_users: number;

  /**
   * The number of users who have engaged with GitHub.com chat features.
   */
  dotcom_chats_engaged_users: number;

  /**
   * The number of users who have engaged with pull request features.
   */
  dotcom_prs_engaged_users: number;
}

/**
 * Represents the assignee for a copilot seat
 *
 * @public
 */
export interface CopilotAssignee {
  /**
   * The unique identifier of the assignee.
   */
  id: number;
  /**
   * The login username of the assignee.
   */
  login: string;
}

/**
 * Represents the assigning team for a copilot seat
 *
 * @public
 */
export interface CopilotAssigningTeam {
  /**
   * The unique identifier of the team.
   */
  id: number;
  /**
   * The slug of the team, used for URL-friendly identifiers.
   */
  slug: string;
}
/**
 * Represents the a seat for copilot
 *
 * @public
 */
export interface CopilotSeat {
  /**
   * The date when the seat was created.
   */
  created_at: string;
  /**
   * The date when the seat was last updated.
   */
  updated_at: string;
  /**
   * The date when the seat was last active.
   */
  last_activity_at: string;
  /**
   * The editor used in the last activity.
   */
  last_activity_editor: string;
  /**
   * The type of plan for this seat.
   */
  plan_type: string;
  /**
   * The user assigned to this seat.
   */
  assignee: CopilotAssignee;
  /**
   * The team that assigned this seat.
   */
  assigning_team: CopilotAssigningTeam;
}
/**
 * Represents the base seat data for copilot
 *
 * @public
 */
export interface CopilotSeats {
  /**
   * The total number of seats available.
   */
  total_seats: number;
  /**
   * The list of individual seats.
   */
  seats: CopilotSeat[];
}
/**
 * Represents the seat analysis data for copilot
 *
 * @public
 */
export interface SeatAnalysis {
  /**
   * The date for the analysis.
   */
  day: string;
  /**
   * The type of the seat data (enterprise or organization).
   */
  type: MetricsType;
  /**
   * The name of the team for this analysis.
   */
  team_name: string;
  /**
   * The total number of seats available.
   */
  total_seats: number;
  /**
   * The number of seats that have never been used.
   */
  seats_never_used: number;
  /**
   * The number of seats inactive for 7 days.
   */
  seats_inactive_7_days: number;
  /**
   * The number of seats inactive for 14 days.
   */
  seats_inactive_14_days: number;
  /**
   * The number of seats inactive for 28 days.
   */
  seats_inactive_28_days: number;
}

// ============================================================================
// V2 Metrics Types (New API - Post April 2026)
// ============================================================================

/**
 * Response from the new GitHub Copilot metrics report endpoints.
 * The new API returns download links to JSON reports rather than direct metrics.
 *
 * @public
 */
export interface MetricsV2ReportResponse {
  /**
   * Array of download URLs to fetch the actual JSON report data.
   * These URLs are ephemeral and should be fetched immediately.
   */
  download_links: string[];
  /**
   * The date of the report.
   */
  report_day: string;
}

/**
 * The structure of the downloaded JSON report from a V2 metrics endpoint.
 *
 * @public
 */
export interface MetricsV2Report {
  /**
   * Array of daily metrics totals and breakdowns.
   */
  day_totals: MetricsV2DayTotals[];
}

/**
 * Daily totals and breakdowns for V2 metrics.
 *
 * @public
 */
export interface MetricsV2DayTotals {
  /**
   * The date for this day's metrics (YYYY-MM-DD format).
   */
  day: string;

  /**
   * Daily active users count.
   */
  daily_active_users?: number;

  /**
   * Weekly active users count (rolling 7-day).
   */
  weekly_active_users?: number;

  /**
   * Monthly active users count (rolling 28-day).
   */
  monthly_active_users?: number;

  /**
   * Monthly active chat users count.
   */
  monthly_active_chat_users?: number;

  /**
   * Monthly active agent users count.
   */
  monthly_active_agent_users?: number;

  /**
   * Total user-initiated interaction count for the day.
   */
  user_initiated_interaction_count?: number;

  /**
   * Total code generation activity count for the day.
   */
  code_generation_activity_count?: number;

  /**
   * Total code acceptance activity count for the day.
   */
  code_acceptance_activity_count?: number;

  /**
   * Lines of code suggested to add.
   */
  loc_suggested_to_add_sum?: number;

  /**
   * Lines of code suggested to delete.
   */
  loc_suggested_to_delete_sum?: number;

  /**
   * Lines of code actually added.
   */
  loc_added_sum?: number;

  /**
   * Lines of code actually deleted.
   */
  loc_deleted_sum?: number;

  /**
   * Breakdown of metrics by IDE.
   */
  totals_by_ide?: MetricsV2ByIde[];

  /**
   * Breakdown of metrics by feature.
   */
  totals_by_feature?: MetricsV2ByFeature[];

  /**
   * Breakdown of metrics by language and feature.
   */
  totals_by_language_feature?: MetricsV2ByLanguageFeature[];

  /**
   * Breakdown of metrics by language and model.
   */
  totals_by_language_model?: MetricsV2ByLanguageModel[];

  /**
   * Breakdown of metrics by model and feature.
   */
  totals_by_model_feature?: MetricsV2ByModelFeature[];
}

/**
 * V2 metrics breakdown by IDE.
 *
 * @public
 */
export interface MetricsV2ByIde {
  /**
   * IDE identifier (e.g., 'vscode', 'intellij', 'neovim').
   */
  ide: string;

  /**
   * User-initiated interaction count.
   */
  user_initiated_interaction_count?: number;

  /**
   * Code generation activity count.
   */
  code_generation_activity_count?: number;

  /**
   * Code acceptance activity count.
   */
  code_acceptance_activity_count?: number;

  /**
   * Lines of code suggested to add.
   */
  loc_suggested_to_add_sum?: number;

  /**
   * Lines of code suggested to delete.
   */
  loc_suggested_to_delete_sum?: number;

  /**
   * Lines of code actually added.
   */
  loc_added_sum?: number;

  /**
   * Lines of code actually deleted.
   */
  loc_deleted_sum?: number;
}

/**
 * V2 metrics breakdown by feature.
 *
 * @public
 */
export interface MetricsV2ByFeature {
  /**
   * Feature identifier (e.g., 'code_completion', 'agent_edit', 'chat_panel_*').
   */
  feature: string;

  /**
   * User-initiated interaction count.
   */
  user_initiated_interaction_count?: number;

  /**
   * Code generation activity count.
   */
  code_generation_activity_count?: number;

  /**
   * Code acceptance activity count.
   */
  code_acceptance_activity_count?: number;

  /**
   * Lines of code suggested to add.
   */
  loc_suggested_to_add_sum?: number;

  /**
   * Lines of code suggested to delete.
   */
  loc_suggested_to_delete_sum?: number;

  /**
   * Lines of code actually added.
   */
  loc_added_sum?: number;

  /**
   * Lines of code actually deleted.
   */
  loc_deleted_sum?: number;
}

/**
 * V2 metrics breakdown by language and feature.
 *
 * @public
 */
export interface MetricsV2ByLanguageFeature {
  /**
   * Programming language.
   */
  language: string;

  /**
   * Feature identifier.
   */
  feature: string;

  /**
   * Code generation activity count.
   */
  code_generation_activity_count?: number;

  /**
   * Code acceptance activity count.
   */
  code_acceptance_activity_count?: number;

  /**
   * Lines of code suggested to add.
   */
  loc_suggested_to_add_sum?: number;

  /**
   * Lines of code suggested to delete.
   */
  loc_suggested_to_delete_sum?: number;

  /**
   * Lines of code actually added.
   */
  loc_added_sum?: number;

  /**
   * Lines of code actually deleted.
   */
  loc_deleted_sum?: number;
}

/**
 * V2 metrics breakdown by language and model.
 *
 * @public
 */
export interface MetricsV2ByLanguageModel {
  /**
   * Programming language.
   */
  language: string;

  /**
   * Model identifier (free-form string, may include 'unknown', 'auto').
   */
  model: string;

  /**
   * Code generation activity count.
   */
  code_generation_activity_count?: number;

  /**
   * Code acceptance activity count.
   */
  code_acceptance_activity_count?: number;

  /**
   * Lines of code suggested to add.
   */
  loc_suggested_to_add_sum?: number;

  /**
   * Lines of code suggested to delete.
   */
  loc_suggested_to_delete_sum?: number;

  /**
   * Lines of code actually added.
   */
  loc_added_sum?: number;

  /**
   * Lines of code actually deleted.
   */
  loc_deleted_sum?: number;
}

/**
 * V2 metrics breakdown by model and feature.
 *
 * @public
 */
export interface MetricsV2ByModelFeature {
  /**
   * Model identifier.
   */
  model: string;

  /**
   * Feature identifier.
   */
  feature: string;

  /**
   * User-initiated interaction count.
   */
  user_initiated_interaction_count?: number;

  /**
   * Code generation activity count.
   */
  code_generation_activity_count?: number;

  /**
   * Code acceptance activity count.
   */
  code_acceptance_activity_count?: number;

  /**
   * Lines of code suggested to add.
   */
  loc_suggested_to_add_sum?: number;

  /**
   * Lines of code suggested to delete.
   */
  loc_suggested_to_delete_sum?: number;

  /**
   * Lines of code actually added.
   */
  loc_added_sum?: number;

  /**
   * Lines of code actually deleted.
   */
  loc_deleted_sum?: number;
}

/**
 * User-level metrics from the V2 API (for user distribution analysis).
 *
 * @public
 */
export interface MetricsV2UserData {
  /**
   * The user's numeric ID (to be hashed before storage).
   */
  user_id: number;

  /**
   * The user's login (to be discarded, not stored).
   */
  user_login?: string;

  /**
   * User-initiated interaction count.
   */
  user_initiated_interaction_count?: number;

  /**
   * Code generation activity count.
   */
  code_generation_activity_count?: number;

  /**
   * Code acceptance activity count.
   */
  code_acceptance_activity_count?: number;

  /**
   * Lines of code suggested to add.
   */
  loc_suggested_to_add_sum?: number;

  /**
   * Lines of code suggested to delete.
   */
  loc_suggested_to_delete_sum?: number;

  /**
   * Lines of code actually added.
   */
  loc_added_sum?: number;

  /**
   * Lines of code actually deleted.
   */
  loc_deleted_sum?: number;

  /**
   * Whether the user used agent features.
   */
  used_agent?: boolean;

  /**
   * Whether the user used chat features.
   */
  used_chat?: boolean;

  /**
   * Last known IDE family (e.g., 'vscode', 'intellij').
   */
  last_known_ide_family?: string;

  /**
   * Last known plugin family.
   */
  last_known_plugin_family?: string;

  /**
   * Last known IDE version (to be discarded, not stored).
   */
  last_known_ide_version?: string;

  /**
   * Last known plugin version (to be discarded, not stored).
   */
  last_known_plugin_version?: string;
}

// ============================================================================
// V2 Database Entity Types
// ============================================================================

/**
 * Entity type for the V2 metrics (enterprise vs organization).
 *
 * @public
 */
export type MetricsV2EntityType = 'enterprise' | 'organization';

/**
 * Database entity for daily V2 metrics.
 *
 * @public
 */
export interface MetricsV2DailyEntity {
  id?: number;
  day: string;
  type: MetricsV2EntityType;
  entity_name: string;
  daily_active_users?: number;
  weekly_active_users?: number;
  monthly_active_users?: number;
  monthly_active_chat_users?: number;
  monthly_active_agent_users?: number;
  user_initiated_interaction_count?: number;
  code_generation_activity_count?: number;
  code_acceptance_activity_count?: number;
  loc_suggested_to_add_sum?: number;
  loc_suggested_to_delete_sum?: number;
  loc_added_sum?: number;
  loc_deleted_sum?: number;
  created_at?: string;
}

/**
 * Database entity for V2 metrics by IDE.
 *
 * @public
 */
export interface MetricsV2ByIdeEntity {
  id?: number;
  day: string;
  type: MetricsV2EntityType;
  entity_name: string;
  ide: string;
  user_initiated_interaction_count?: number;
  code_generation_activity_count?: number;
  code_acceptance_activity_count?: number;
  loc_suggested_to_add_sum?: number;
  loc_suggested_to_delete_sum?: number;
  loc_added_sum?: number;
  loc_deleted_sum?: number;
}

/**
 * Database entity for V2 metrics by feature.
 *
 * @public
 */
export interface MetricsV2ByFeatureEntity {
  id?: number;
  day: string;
  type: MetricsV2EntityType;
  entity_name: string;
  feature: string;
  user_initiated_interaction_count?: number;
  code_generation_activity_count?: number;
  code_acceptance_activity_count?: number;
  loc_suggested_to_add_sum?: number;
  loc_suggested_to_delete_sum?: number;
  loc_added_sum?: number;
  loc_deleted_sum?: number;
}

/**
 * Database entity for V2 metrics by language and feature.
 *
 * @public
 */
export interface MetricsV2ByLanguageFeatureEntity {
  id?: number;
  day: string;
  type: MetricsV2EntityType;
  entity_name: string;
  language: string;
  feature: string;
  code_generation_activity_count?: number;
  code_acceptance_activity_count?: number;
  loc_suggested_to_add_sum?: number;
  loc_suggested_to_delete_sum?: number;
  loc_added_sum?: number;
  loc_deleted_sum?: number;
}

/**
 * Database entity for V2 metrics by language and model.
 *
 * @public
 */
export interface MetricsV2ByLanguageModelEntity {
  id?: number;
  day: string;
  type: MetricsV2EntityType;
  entity_name: string;
  language: string;
  model: string;
  code_generation_activity_count?: number;
  code_acceptance_activity_count?: number;
  loc_suggested_to_add_sum?: number;
  loc_suggested_to_delete_sum?: number;
  loc_added_sum?: number;
  loc_deleted_sum?: number;
}

/**
 * Database entity for V2 metrics by model and feature.
 *
 * @public
 */
export interface MetricsV2ByModelFeatureEntity {
  id?: number;
  day: string;
  type: MetricsV2EntityType;
  entity_name: string;
  model: string;
  feature: string;
  user_initiated_interaction_count?: number;
  code_generation_activity_count?: number;
  code_acceptance_activity_count?: number;
  loc_suggested_to_add_sum?: number;
  loc_suggested_to_delete_sum?: number;
  loc_added_sum?: number;
  loc_deleted_sum?: number;
}

/**
 * Database entity for V2 user-level metrics (privacy-preserving).
 *
 * @public
 */
export interface MetricsV2UserDailyEntity {
  id?: number;
  day: string;
  type: MetricsV2EntityType;
  entity_name: string;
  user_hash: string;
  user_initiated_interaction_count?: number;
  code_generation_activity_count?: number;
  code_acceptance_activity_count?: number;
  loc_suggested_to_add_sum?: number;
  loc_suggested_to_delete_sum?: number;
  loc_added_sum?: number;
  loc_deleted_sum?: number;
  used_agent?: boolean;
  used_chat?: boolean;
  ide_family?: string;
  plugin_family?: string;
}

/**
 * Retry status for V2 metrics fetch operations.
 *
 * @public
 */
export type MetricsV2FetchStatus = 'pending' | 'success' | 'failed';

/**
 * Report type for V2 fetch retry tracking.
 *
 * @public
 */
export type MetricsV2ReportType = 'organization' | 'users';

/**
 * Database entity for V2 fetch retry tracking.
 *
 * @public
 */
export interface MetricsV2FetchRetryEntity {
  id?: number;
  type: MetricsV2EntityType;
  entity_name: string;
  day: string;
  report_type: MetricsV2ReportType;
  retry_count: number;
  last_error?: string;
  last_attempt_at?: string;
  status: MetricsV2FetchStatus;
  created_at?: string;
}

// ============================================================================
// V2 Frontend Types
// ============================================================================

/**
 * Aggregated metrics for the V2 dashboard.
 *
 * @public
 */
export interface MetricsV2DashboardData {
  /**
   * Total daily active users for the selected period.
   */
  totalDailyActiveUsers: number;

  /**
   * Total weekly active users (from the most recent day).
   */
  weeklyActiveUsers: number;

  /**
   * Total monthly active users (from the most recent day).
   */
  monthlyActiveUsers: number;

  /**
   * Total code generation activities.
   */
  totalCodeGenerationActivity: number;

  /**
   * Total code acceptance activities.
   */
  totalCodeAcceptanceActivity: number;

  /**
   * Code acceptance rate (acceptance / generation * 100).
   */
  codeAcceptanceRate: number;

  /**
   * Total lines suggested to add.
   */
  totalLocSuggestedToAdd: number;

  /**
   * Total lines actually added.
   */
  totalLocAdded: number;

  /**
   * Add acceptance rate (added / suggested * 100).
   */
  addAcceptanceRate: number;

  /**
   * Total lines suggested to delete.
   */
  totalLocSuggestedToDelete: number;

  /**
   * Total lines actually deleted.
   */
  totalLocDeleted: number;

  /**
   * Delete acceptance rate (deleted / suggested * 100).
   */
  deleteAcceptanceRate: number;
}

/**
 * User distribution bucket for anonymized histograms.
 *
 * @public
 */
export interface MetricsV2UserDistributionBucket {
  /**
   * Bucket label (e.g., '0', '1-10', '11-25', '26-50', '51-100', '100+').
   */
  label: string;

  /**
   * Minimum value for this bucket (inclusive).
   */
  min: number;

  /**
   * Maximum value for this bucket (inclusive, undefined for unbounded).
   */
  max?: number;

  /**
   * Count of users in this bucket.
   */
  count: number;
}

/**
 * Cohort data for user adoption analysis.
 *
 * @public
 */
export interface MetricsV2UserCohort {
  /**
   * Cohort name (e.g., 'Completions Only', 'Chat Users', 'Agent Adopters').
   */
  name: string;

  /**
   * Number of users in this cohort.
   */
  count: number;

  /**
   * Percentage of total users.
   */
  percentage: number;
}

/**
 * Adoption trend data point for time-series charts.
 *
 * @public
 */
export interface MetricsV2AdoptionTrend {
  /**
   * Date for this data point.
   */
  day: string;

  /**
   * Percentage of active users using agent features.
   */
  agentAdoptionRate: number;

  /**
   * Percentage of active users using chat features.
   */
  chatAdoptionRate: number;

  /**
   * Total active users for this day.
   */
  totalActiveUsers: number;
}

// ============================================================================
// V2 Frontend Types
// ============================================================================

/**
 * Period range for V2 metrics.
 *
 * @public
 */
export interface MetricsV2PeriodRange {
  /**
   * Earliest available date.
   */
  startDate: string;

  /**
   * Latest available date.
   */
  endDate: string;
}

/**
 * Information about a V2 entity (organization or enterprise).
 *
 * @public
 */
export interface MetricsV2EntityInfo {
  /**
   * Type of entity.
   */
  type: MetricsV2EntityType;

  /**
   * Name of the entity.
   */
  entity_name: string;

  /**
   * Earliest date with data.
   */
  earliest_day?: string;

  /**
   * Latest date with data.
   */
  latest_day?: string;
}

/**
 * Legacy API status information.
 *
 * @public
 */
export interface MetricsV2LegacyStatus {
  /**
   * Whether legacy API is still available.
   */
  isLegacyAvailable: boolean;

  /**
   * Date when legacy API will be shut down.
   */
  legacyCutoffDate: string;

  /**
   * Days remaining until cutoff.
   */
  daysRemaining: number;
}
