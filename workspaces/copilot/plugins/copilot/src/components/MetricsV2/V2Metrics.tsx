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
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import { Calendar } from 'simple-date-range-calendar';
import { InfoCard, Progress } from '@backstage/core-components';
import { V2DashboardCards } from '../CardsV2';
import { V2DashboardCharts } from '../ChartsV2';
import { V2EntitySelector } from '../FiltersV2';
import { useV2DateRange, useV2Entity } from '../../contexts';
import {
  useV2MetricsDaily,
  useV2MetricsByFeature,
  useV2MetricsByIde,
  useV2MetricsByModel,
} from '../../hooks';

const MainBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

/**
 * Main V2 Metrics component with cards and charts.
 */
export function V2Metrics() {
  const [dateRange, setDateRange] = useV2DateRange();
  const [entity] = useV2Entity();

  const onDateRangeIsSelected = (start: Date, end: Date) => {
    setDateRange({ startDate: start, endDate: end });
  };

  const dailyMetrics = useV2MetricsDaily(
    dateRange.startDate,
    dateRange.endDate,
    entity.type,
    entity.entityName,
  );

  const byFeature = useV2MetricsByFeature(
    dateRange.startDate,
    dateRange.endDate,
    entity.type,
    entity.entityName,
  );

  const byIde = useV2MetricsByIde(
    dateRange.startDate,
    dateRange.endDate,
    entity.type,
    entity.entityName,
  );

  const byModel = useV2MetricsByModel(
    dateRange.startDate,
    dateRange.endDate,
    entity.type,
    entity.entityName,
  );

  const isLoading =
    dailyMetrics.loading ||
    byFeature.loading ||
    byIde.loading ||
    byModel.loading;

  const hasError =
    dailyMetrics.error || byFeature.error || byIde.error || byModel.error;

  return (
    <MainBox>
      <Box display="flex" gap={2}>
        <Box flex={1} maxWidth={296}>
          <InfoCard divider={false} noPadding>
            <Calendar
              styles={{ borderRadius: 4, width: 296 }}
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onDateRangeIsSelected={onDateRangeIsSelected}
            />
          </InfoCard>
        </Box>
        <Box flex={1}>
          <Stack direction="row" spacing={2} pb={1.5} alignItems="center">
            <Box flex={1}>
              <V2EntitySelector />
            </Box>
          </Stack>
          {isLoading && <Progress />}
          {hasError && (
            <Box color="error.main" py={2}>
              Error loading metrics. Please try again.
            </Box>
          )}
          {!isLoading && !hasError && (
            <V2DashboardCards
              metrics={dailyMetrics.items ?? []}
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
            />
          )}
        </Box>
      </Box>
      {!isLoading && !hasError && (
        <V2DashboardCharts
          dailyMetrics={dailyMetrics.items ?? []}
          byFeature={byFeature.items ?? []}
          byIde={byIde.items ?? []}
          byModel={byModel.items ?? []}
        />
      )}
    </MainBox>
  );
}
