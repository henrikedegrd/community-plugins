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
import { z } from 'zod';
import {
  MetricsType,
  MetricsV2EntityType,
} from '@backstage-community/plugin-copilot-common';

const metricsTypeSchema = z.enum(['enterprise', 'organization']);

const isoDateSchema = z.string().refine(date => !isNaN(Date.parse(date)), {
  message: 'Invalid date format',
});

export type MetricsQuery = {
  startDate: string;
  endDate: string;
  type: MetricsType;
  team?: string;
};

export type PeriodRangeQuery = {
  type: MetricsType;
};

export type TeamQuery = {
  type: MetricsType;
  startDate: string;
  endDate: string;
};

export const metricsQuerySchema = z.object({
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  type: metricsTypeSchema,
  team: z.string().optional(),
});

export const periodRangeQuerySchema = z.object({
  type: metricsTypeSchema,
});

export const teamQuerySchema = z.object({
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  type: metricsTypeSchema,
});

// ============================================================================
// V2 Metrics Query Schemas (New API - post April 2026)
// ============================================================================

const metricsV2EntityTypeSchema = z.enum(['enterprise', 'organization']);

export type MetricsV2Query = {
  startDate: string;
  endDate: string;
  type: MetricsV2EntityType;
  entityName: string;
};

export type MetricsV2ByFeatureQuery = MetricsV2Query & {
  feature?: string;
};

export type MetricsV2ByLanguageQuery = MetricsV2Query & {
  language?: string;
  feature?: string;
};

export type MetricsV2ByModelQuery = MetricsV2Query & {
  model?: string;
  language?: string;
};

export type MetricsV2ByModelFeatureQuery = MetricsV2Query & {
  model?: string;
  feature?: string;
};

export type MetricsV2PeriodRangeQuery = {
  type: MetricsV2EntityType;
  entityName: string;
};

export const metricsV2QuerySchema = z.object({
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  type: metricsV2EntityTypeSchema,
  entityName: z.string().min(1),
});

export const metricsV2ByFeatureQuerySchema = metricsV2QuerySchema.extend({
  feature: z.string().optional(),
});

export const metricsV2ByLanguageQuerySchema = metricsV2QuerySchema.extend({
  language: z.string().optional(),
  feature: z.string().optional(),
});

export const metricsV2ByModelQuerySchema = metricsV2QuerySchema.extend({
  model: z.string().optional(),
  language: z.string().optional(),
});

export const metricsV2ByModelFeatureQuerySchema = metricsV2QuerySchema.extend({
  model: z.string().optional(),
  feature: z.string().optional(),
});

export const metricsV2PeriodRangeQuerySchema = z.object({
  type: metricsV2EntityTypeSchema,
  entityName: z.string().min(1),
});
