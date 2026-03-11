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

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { LineChart, BarChart, PieChart } from '@mui/x-charts';
import { Chart } from '../Charts/Chart';
import { DateTime } from 'luxon';
import {
  MetricsV2DailyEntity,
  MetricsV2ByFeatureEntity,
  MetricsV2ByIdeEntity,
  MetricsV2ByLanguageModelEntity,
} from '@backstage-community/plugin-copilot-common';

const MainBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

interface V2DashboardChartsProps {
  dailyMetrics: MetricsV2DailyEntity[];
  byFeature: MetricsV2ByFeatureEntity[];
  byIde: MetricsV2ByIdeEntity[];
  byModel: MetricsV2ByLanguageModelEntity[];
}

/**
 * Dashboard charts for V2 metrics.
 */
export function V2DashboardCharts({
  dailyMetrics,
  byFeature,
  byIde,
  byModel,
}: V2DashboardChartsProps) {
  // Sort daily metrics by day
  const sortedDaily = [...dailyMetrics].sort(
    (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime(),
  );

  // Create adoption trend data
  const adoptionData = sortedDaily.map(m => ({
    day: new Date(m.day),
    daily: m.daily_active_users ?? 0,
    weekly: m.weekly_active_users ?? 0,
    monthly: m.monthly_active_users ?? 0,
  }));

  // Create acceptance rate data
  const acceptanceRateData = sortedDaily.map(m => {
    const generated = m.code_generation_activity_count ?? 0;
    const accepted = m.code_acceptance_activity_count ?? 0;
    return {
      day: new Date(m.day),
      rate: generated > 0 ? (accepted / generated) * 100 : 0,
    };
  });

  // Aggregate feature data
  const featureAggregates = aggregateByKey(byFeature, 'feature', [
    'code_generation_activity_count',
    'code_acceptance_activity_count',
    'loc_added_sum',
  ]);

  // Aggregate IDE data
  const ideAggregates = aggregateByKey(byIde, 'ide', [
    'code_generation_activity_count',
    'user_initiated_interaction_count',
  ]);

  // Aggregate model data
  const modelAggregates = aggregateByKey(byModel, 'model', [
    'code_generation_activity_count',
    'code_acceptance_activity_count',
  ]);

  return (
    <MainBox>
      {/* Adoption Trend Chart */}
      <Chart title="User Adoption Trends">
        <LineChart
          xAxis={[
            {
              id: 'days',
              data: adoptionData.map(d => d.day),
              scaleType: 'point',
              valueFormatter: (date: Date) =>
                DateTime.fromJSDate(date).toFormat('dd-MM-yy'),
            },
          ]}
          bottomAxis={{
            tickLabelStyle: {
              angle: 30,
              textAnchor: 'start',
            },
          }}
          series={[
            {
              data: adoptionData.map(d => d.daily),
              label: 'Daily Active Users',
              color: '#2196F3',
            },
            {
              data: adoptionData.map(d => d.weekly),
              label: 'Weekly Active Users',
              color: '#4CAF50',
            },
            {
              data: adoptionData.map(d => d.monthly),
              label: 'Monthly Active Users',
              color: '#FF9800',
            },
          ]}
          height={300}
        />
      </Chart>

      {/* Acceptance Rate Over Time */}
      <Chart title="Acceptance Rate Over Time">
        <LineChart
          xAxis={[
            {
              id: 'days',
              data: acceptanceRateData.map(d => d.day),
              scaleType: 'point',
              valueFormatter: (date: Date) =>
                DateTime.fromJSDate(date).toFormat('dd-MM-yy'),
            },
          ]}
          bottomAxis={{
            tickLabelStyle: {
              angle: 30,
              textAnchor: 'start',
            },
          }}
          series={[
            {
              data: acceptanceRateData.map(d => d.rate),
              label: 'Acceptance Rate %',
              color: '#4CAF50',
              valueFormatter: (v: number | null) =>
                v !== null ? `${v.toFixed(1)}%` : 'N/A',
            },
          ]}
          height={300}
        />
      </Chart>

      {/* Feature Usage Bar Chart */}
      {featureAggregates.length > 0 && (
        <Chart title="Usage by Feature">
          <BarChart
            xAxis={[
              {
                id: 'features',
                data: featureAggregates.map(f => formatFeatureName(f.key)),
                scaleType: 'band',
              },
            ]}
            series={[
              {
                data: featureAggregates.map(
                  f => f.code_generation_activity_count,
                ),
                label: 'Code Generations',
                color: '#2196F3',
              },
              {
                data: featureAggregates.map(
                  f => f.code_acceptance_activity_count,
                ),
                label: 'Acceptances',
                color: '#4CAF50',
              },
            ]}
            height={300}
          />
        </Chart>
      )}

      {/* IDE Distribution Pie Chart */}
      {ideAggregates.length > 0 && (
        <Chart title="Usage by IDE">
          <PieChart
            series={[
              {
                data: ideAggregates.map((ide, index) => ({
                  id: index,
                  value: ide.code_generation_activity_count,
                  label: formatIdeName(ide.key),
                })),
                highlightScope: { faded: 'global', highlighted: 'item' },
              },
            ]}
            height={300}
          />
        </Chart>
      )}

      {/* Model Usage Bar Chart */}
      {modelAggregates.length > 0 && (
        <Chart title="Usage by AI Model">
          <BarChart
            xAxis={[
              {
                id: 'models',
                data: modelAggregates.map(m => m.key),
                scaleType: 'band',
              },
            ]}
            series={[
              {
                data: modelAggregates.map(
                  m => m.code_generation_activity_count,
                ),
                label: 'Code Generations',
                color: '#9C27B0',
              },
              {
                data: modelAggregates.map(
                  m => m.code_acceptance_activity_count,
                ),
                label: 'Acceptances',
                color: '#E91E63',
              },
            ]}
            height={300}
          />
        </Chart>
      )}
    </MainBox>
  );
}

/**
 * Aggregated result type for metrics.
 */
interface AggregatedMetric {
  key: string;
  code_generation_activity_count: number;
  code_acceptance_activity_count: number;
  user_initiated_interaction_count: number;
  loc_added_sum: number;
}

/**
 * Helper to aggregate metrics by a key field.
 */
function aggregateByKey<T extends Record<string, any>>(
  items: T[],
  keyField: keyof T,
  sumFields: (keyof T)[],
): AggregatedMetric[] {
  const map = new Map<string, Record<string, number>>();

  for (const item of items) {
    const key = String(item[keyField]);
    const existing = map.get(key) || {
      code_generation_activity_count: 0,
      code_acceptance_activity_count: 0,
      user_initiated_interaction_count: 0,
      loc_added_sum: 0,
    };

    for (const field of sumFields) {
      existing[String(field)] =
        (existing[String(field)] || 0) + (Number(item[field]) || 0);
    }

    map.set(key, existing);
  }

  return Array.from(map.entries())
    .map(
      ([key, values]): AggregatedMetric => ({
        key,
        code_generation_activity_count:
          values.code_generation_activity_count || 0,
        code_acceptance_activity_count:
          values.code_acceptance_activity_count || 0,
        user_initiated_interaction_count:
          values.user_initiated_interaction_count || 0,
        loc_added_sum: values.loc_added_sum || 0,
      }),
    )
    .sort(
      (a, b) =>
        b.code_generation_activity_count - a.code_generation_activity_count,
    )
    .slice(0, 10); // Top 10
}

/**
 * Format feature names for display.
 */
function formatFeatureName(feature: string): string {
  return feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Format IDE names for display.
 */
function formatIdeName(ide: string): string {
  const ideNames: Record<string, string> = {
    vscode: 'VS Code',
    intellij: 'IntelliJ',
    neovim: 'Neovim',
    vim: 'Vim',
    visualstudio: 'Visual Studio',
    xcode: 'Xcode',
    jetbrains: 'JetBrains',
  };
  return ideNames[ide.toLowerCase()] || ide;
}
