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

/**
 * Migration for V2 metrics tables (new GitHub Copilot API - post April 2026)
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  // Core daily metrics table
  await knex.schema.createTable('metrics_v2_daily', table => {
    table.comment(
      'Daily aggregate metrics from V2 Copilot API (new API post April 2026)',
    );
    table.increments('id').primary();
    table.date('day').notNullable().comment('Date of the metrics data');
    table
      .string('type', 50)
      .notNullable()
      .comment('Entity type: enterprise or organization');
    table
      .string('entity_name', 255)
      .notNullable()
      .comment('Name of the enterprise or organization');

    // Active user counts
    table.integer('daily_active_users').comment('Daily active users count');
    table
      .integer('weekly_active_users')
      .comment('Weekly active users count (rolling 7-day)');
    table
      .integer('monthly_active_users')
      .comment('Monthly active users count (rolling 28-day)');
    table
      .integer('monthly_active_chat_users')
      .comment('Monthly active chat users count');
    table
      .integer('monthly_active_agent_users')
      .comment('Monthly active agent users count');

    // Activity counts
    table
      .integer('user_initiated_interaction_count')
      .comment('Total user-initiated interactions');
    table
      .integer('code_generation_activity_count')
      .comment('Total code generation activities');
    table
      .integer('code_acceptance_activity_count')
      .comment('Total code acceptance activities');

    // LOC metrics
    table
      .integer('loc_suggested_to_add_sum')
      .comment('Lines of code suggested to add');
    table
      .integer('loc_suggested_to_delete_sum')
      .comment('Lines of code suggested to delete');
    table.integer('loc_added_sum').comment('Lines of code actually added');
    table.integer('loc_deleted_sum').comment('Lines of code actually deleted');

    table
      .timestamp('created_at')
      .defaultTo(knex.fn.now())
      .comment('Record creation timestamp');

    table.unique(['day', 'type', 'entity_name'], {
      indexName: 'uk_metrics_v2_daily_day_type_entity',
    });
  });

  // By IDE breakdown table
  await knex.schema.createTable('metrics_v2_by_ide', table => {
    table.comment('V2 metrics breakdown by IDE');
    table.increments('id').primary();
    table.date('day').notNullable().comment('Date of the metrics data');
    table
      .string('type', 50)
      .notNullable()
      .comment('Entity type: enterprise or organization');
    table
      .string('entity_name', 255)
      .notNullable()
      .comment('Name of the enterprise or organization');
    table
      .string('ide', 100)
      .notNullable()
      .comment('IDE identifier (vscode, intellij, etc.)');

    table
      .integer('user_initiated_interaction_count')
      .comment('User-initiated interactions');
    table
      .integer('code_generation_activity_count')
      .comment('Code generation activities');
    table
      .integer('code_acceptance_activity_count')
      .comment('Code acceptance activities');
    table.integer('loc_suggested_to_add_sum').comment('Lines suggested to add');
    table
      .integer('loc_suggested_to_delete_sum')
      .comment('Lines suggested to delete');
    table.integer('loc_added_sum').comment('Lines actually added');
    table.integer('loc_deleted_sum').comment('Lines actually deleted');

    table.unique(['day', 'type', 'entity_name', 'ide'], {
      indexName: 'uk_metrics_v2_by_ide',
    });
  });

  // By Feature breakdown table
  await knex.schema.createTable('metrics_v2_by_feature', table => {
    table.comment('V2 metrics breakdown by feature');
    table.increments('id').primary();
    table.date('day').notNullable().comment('Date of the metrics data');
    table
      .string('type', 50)
      .notNullable()
      .comment('Entity type: enterprise or organization');
    table
      .string('entity_name', 255)
      .notNullable()
      .comment('Name of the enterprise or organization');
    table
      .string('feature', 100)
      .notNullable()
      .comment('Feature identifier (code_completion, agent_edit, etc.)');

    table
      .integer('user_initiated_interaction_count')
      .comment('User-initiated interactions');
    table
      .integer('code_generation_activity_count')
      .comment('Code generation activities');
    table
      .integer('code_acceptance_activity_count')
      .comment('Code acceptance activities');
    table.integer('loc_suggested_to_add_sum').comment('Lines suggested to add');
    table
      .integer('loc_suggested_to_delete_sum')
      .comment('Lines suggested to delete');
    table.integer('loc_added_sum').comment('Lines actually added');
    table.integer('loc_deleted_sum').comment('Lines actually deleted');

    table.unique(['day', 'type', 'entity_name', 'feature'], {
      indexName: 'uk_metrics_v2_by_feature',
    });
  });

  // Add index for feature-centric queries
  await knex.schema.alterTable('metrics_v2_by_feature', table => {
    table.index(['feature', 'day'], 'idx_metrics_v2_by_feature_feature');
  });

  // By Language + Feature breakdown table
  await knex.schema.createTable('metrics_v2_by_language_feature', table => {
    table.comment('V2 metrics breakdown by language and feature');
    table.increments('id').primary();
    table.date('day').notNullable().comment('Date of the metrics data');
    table
      .string('type', 50)
      .notNullable()
      .comment('Entity type: enterprise or organization');
    table
      .string('entity_name', 255)
      .notNullable()
      .comment('Name of the enterprise or organization');
    table.string('language', 100).notNullable().comment('Programming language');
    table.string('feature', 100).notNullable().comment('Feature identifier');

    table
      .integer('code_generation_activity_count')
      .comment('Code generation activities');
    table
      .integer('code_acceptance_activity_count')
      .comment('Code acceptance activities');
    table.integer('loc_suggested_to_add_sum').comment('Lines suggested to add');
    table
      .integer('loc_suggested_to_delete_sum')
      .comment('Lines suggested to delete');
    table.integer('loc_added_sum').comment('Lines actually added');
    table.integer('loc_deleted_sum').comment('Lines actually deleted');

    table.unique(['day', 'type', 'entity_name', 'language', 'feature'], {
      indexName: 'uk_metrics_v2_by_language_feature',
    });
  });

  // Add indexes for language-centric and feature-centric queries
  await knex.schema.alterTable('metrics_v2_by_language_feature', table => {
    table.index(['language', 'day'], 'idx_metrics_v2_lang_feat_language');
    table.index(['feature', 'day'], 'idx_metrics_v2_lang_feat_feature');
  });

  // By Language + Model breakdown table
  await knex.schema.createTable('metrics_v2_by_language_model', table => {
    table.comment('V2 metrics breakdown by language and model');
    table.increments('id').primary();
    table.date('day').notNullable().comment('Date of the metrics data');
    table
      .string('type', 50)
      .notNullable()
      .comment('Entity type: enterprise or organization');
    table
      .string('entity_name', 255)
      .notNullable()
      .comment('Name of the enterprise or organization');
    table.string('language', 100).notNullable().comment('Programming language');
    table
      .string('model', 100)
      .notNullable()
      .comment('Model identifier (may include unknown, auto)');

    table
      .integer('code_generation_activity_count')
      .comment('Code generation activities');
    table
      .integer('code_acceptance_activity_count')
      .comment('Code acceptance activities');
    table.integer('loc_suggested_to_add_sum').comment('Lines suggested to add');
    table
      .integer('loc_suggested_to_delete_sum')
      .comment('Lines suggested to delete');
    table.integer('loc_added_sum').comment('Lines actually added');
    table.integer('loc_deleted_sum').comment('Lines actually deleted');

    table.unique(['day', 'type', 'entity_name', 'language', 'model'], {
      indexName: 'uk_metrics_v2_by_language_model',
    });
  });

  // Add indexes for language-centric and model-centric queries
  await knex.schema.alterTable('metrics_v2_by_language_model', table => {
    table.index(['language', 'day'], 'idx_metrics_v2_lang_model_language');
    table.index(['model', 'day'], 'idx_metrics_v2_lang_model_model');
  });

  // By Model + Feature breakdown table
  await knex.schema.createTable('metrics_v2_by_model_feature', table => {
    table.comment('V2 metrics breakdown by model and feature');
    table.increments('id').primary();
    table.date('day').notNullable().comment('Date of the metrics data');
    table
      .string('type', 50)
      .notNullable()
      .comment('Entity type: enterprise or organization');
    table
      .string('entity_name', 255)
      .notNullable()
      .comment('Name of the enterprise or organization');
    table.string('model', 100).notNullable().comment('Model identifier');
    table.string('feature', 100).notNullable().comment('Feature identifier');

    table
      .integer('user_initiated_interaction_count')
      .comment('User-initiated interactions');
    table
      .integer('code_generation_activity_count')
      .comment('Code generation activities');
    table
      .integer('code_acceptance_activity_count')
      .comment('Code acceptance activities');
    table.integer('loc_suggested_to_add_sum').comment('Lines suggested to add');
    table
      .integer('loc_suggested_to_delete_sum')
      .comment('Lines suggested to delete');
    table.integer('loc_added_sum').comment('Lines actually added');
    table.integer('loc_deleted_sum').comment('Lines actually deleted');

    table.unique(['day', 'type', 'entity_name', 'model', 'feature'], {
      indexName: 'uk_metrics_v2_by_model_feature',
    });
  });

  // Add indexes for model-centric and feature-centric queries
  await knex.schema.alterTable('metrics_v2_by_model_feature', table => {
    table.index(['model', 'day'], 'idx_metrics_v2_model_feat_model');
    table.index(['feature', 'day'], 'idx_metrics_v2_model_feat_feature');
  });

  // User-level metrics table (privacy-preserving)
  await knex.schema.createTable('metrics_v2_user_daily', table => {
    table.comment(
      'V2 user-level daily metrics (privacy-preserving with hashed user IDs)',
    );
    table.increments('id').primary();
    table.date('day').notNullable().comment('Date of the metrics data');
    table
      .string('type', 50)
      .notNullable()
      .comment('Entity type: enterprise or organization');
    table
      .string('entity_name', 255)
      .notNullable()
      .comment('Name of the enterprise or organization');
    table
      .string('user_hash', 64)
      .notNullable()
      .comment('SHA-256 hash of user_id (NOT reversible)');

    table
      .integer('user_initiated_interaction_count')
      .comment('User-initiated interactions');
    table
      .integer('code_generation_activity_count')
      .comment('Code generation activities');
    table
      .integer('code_acceptance_activity_count')
      .comment('Code acceptance activities');
    table.integer('loc_suggested_to_add_sum').comment('Lines suggested to add');
    table
      .integer('loc_suggested_to_delete_sum')
      .comment('Lines suggested to delete');
    table.integer('loc_added_sum').comment('Lines actually added');
    table.integer('loc_deleted_sum').comment('Lines actually deleted');

    table.boolean('used_agent').comment('Whether user used agent features');
    table.boolean('used_chat').comment('Whether user used chat features');

    table
      .string('ide_family', 50)
      .comment('IDE family (vscode, intellij, etc.)');
    table
      .string('plugin_family', 100)
      .comment('Plugin family (copilot-chat, etc.)');

    table.unique(['day', 'type', 'entity_name', 'user_hash'], {
      indexName: 'uk_metrics_v2_user_daily',
    });
  });

  // Add index for user queries
  await knex.schema.alterTable('metrics_v2_user_daily', table => {
    table.index(
      ['day', 'type', 'entity_name'],
      'idx_metrics_v2_user_daily_day',
    );
  });

  // Fetch retry tracking table
  await knex.schema.createTable('metrics_v2_fetch_retries', table => {
    table.comment('Tracking table for V2 metrics fetch retries');
    table.increments('id').primary();
    table
      .string('type', 50)
      .notNullable()
      .comment('Entity type: enterprise or organization');
    table
      .string('entity_name', 255)
      .notNullable()
      .comment('Name of the enterprise or organization');
    table.date('day').notNullable().comment('Date being fetched');
    table
      .string('report_type', 50)
      .notNullable()
      .comment('Report type: organization or users');

    table
      .integer('retry_count')
      .defaultTo(0)
      .comment('Number of retry attempts');
    table.text('last_error').comment('Last error message');
    table.timestamp('last_attempt_at').comment('Timestamp of last attempt');
    table
      .string('status', 20)
      .defaultTo('pending')
      .comment('Status: pending, success, or failed');

    table
      .timestamp('created_at')
      .defaultTo(knex.fn.now())
      .comment('Record creation timestamp');

    table.unique(['type', 'entity_name', 'day', 'report_type'], {
      indexName: 'uk_metrics_v2_fetch_retries',
    });
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('metrics_v2_fetch_retries');
  await knex.schema.dropTable('metrics_v2_user_daily');
  await knex.schema.dropTable('metrics_v2_by_model_feature');
  await knex.schema.dropTable('metrics_v2_by_language_model');
  await knex.schema.dropTable('metrics_v2_by_language_feature');
  await knex.schema.dropTable('metrics_v2_by_feature');
  await knex.schema.dropTable('metrics_v2_by_ide');
  await knex.schema.dropTable('metrics_v2_daily');
};
