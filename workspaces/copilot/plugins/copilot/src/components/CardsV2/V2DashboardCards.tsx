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
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { InfoCard } from '@backstage/core-components';
import GroupIcon from '@mui/icons-material/Group';
import CodeIcon from '@mui/icons-material/Code';
import ChatIcon from '@mui/icons-material/Chat';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { MetricsV2DailyEntity } from '@backstage-community/plugin-copilot-common';

const CardBox = styled(Box)({
  flex: '1 1 calc(33% - 16px)',
  minWidth: 200,
  maxWidth: 'calc(33% - 16px)',
  boxSizing: 'border-box',
});

const MetricValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 600,
  color: theme.palette.primary.main,
}));

const MetricLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
}));

interface V2DashboardCardsProps {
  metrics: MetricsV2DailyEntity[];
  startDate: Date;
  endDate: Date;
}

/**
 * Dashboard cards showing V2 aggregate metrics.
 */
export function V2DashboardCards({ metrics }: V2DashboardCardsProps) {
  // Aggregate metrics across all days
  const totals = metrics.reduce(
    (acc, m) => ({
      dailyActiveUsers: Math.max(
        acc.dailyActiveUsers,
        m.daily_active_users ?? 0,
      ),
      monthlyActiveUsers: Math.max(
        acc.monthlyActiveUsers,
        m.monthly_active_users ?? 0,
      ),
      monthlyActiveChatUsers: Math.max(
        acc.monthlyActiveChatUsers,
        m.monthly_active_chat_users ?? 0,
      ),
      monthlyActiveAgentUsers: Math.max(
        acc.monthlyActiveAgentUsers,
        m.monthly_active_agent_users ?? 0,
      ),
      codeGenerationCount:
        acc.codeGenerationCount + (m.code_generation_activity_count ?? 0),
      codeAcceptanceCount:
        acc.codeAcceptanceCount + (m.code_acceptance_activity_count ?? 0),
      locAdded: acc.locAdded + (m.loc_added_sum ?? 0),
      locSuggested: acc.locSuggested + (m.loc_suggested_to_add_sum ?? 0),
    }),
    {
      dailyActiveUsers: 0,
      monthlyActiveUsers: 0,
      monthlyActiveChatUsers: 0,
      monthlyActiveAgentUsers: 0,
      codeGenerationCount: 0,
      codeAcceptanceCount: 0,
      locAdded: 0,
      locSuggested: 0,
    },
  );

  const acceptanceRate =
    totals.codeGenerationCount > 0
      ? (
          (totals.codeAcceptanceCount / totals.codeGenerationCount) *
          100
        ).toFixed(1)
      : 'N/A';

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Box display="flex" flexWrap="wrap" gap={2} justifyContent="space-between">
      <CardBox>
        <InfoCard divider={false}>
          <Box display="flex" alignItems="center" gap={2} p={2}>
            <GroupIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <MetricValue>
                {formatNumber(totals.monthlyActiveUsers)}
              </MetricValue>
              <MetricLabel>Monthly Active Users</MetricLabel>
            </Box>
          </Box>
        </InfoCard>
      </CardBox>

      <CardBox>
        <InfoCard divider={false}>
          <Box display="flex" alignItems="center" gap={2} p={2}>
            <ChatIcon color="secondary" sx={{ fontSize: 40 }} />
            <Box>
              <MetricValue>
                {formatNumber(totals.monthlyActiveChatUsers)}
              </MetricValue>
              <MetricLabel>Chat Users</MetricLabel>
            </Box>
          </Box>
        </InfoCard>
      </CardBox>

      <CardBox>
        <InfoCard divider={false}>
          <Box display="flex" alignItems="center" gap={2} p={2}>
            <SmartToyIcon color="info" sx={{ fontSize: 40 }} />
            <Box>
              <MetricValue>
                {formatNumber(totals.monthlyActiveAgentUsers)}
              </MetricValue>
              <MetricLabel>Agent Users</MetricLabel>
            </Box>
          </Box>
        </InfoCard>
      </CardBox>

      <CardBox>
        <InfoCard divider={false}>
          <Box display="flex" alignItems="center" gap={2} p={2}>
            <CodeIcon color="success" sx={{ fontSize: 40 }} />
            <Box>
              <MetricValue>
                {formatNumber(totals.codeGenerationCount)}
              </MetricValue>
              <MetricLabel>Code Generations</MetricLabel>
            </Box>
          </Box>
        </InfoCard>
      </CardBox>

      <CardBox>
        <InfoCard divider={false}>
          <Box display="flex" alignItems="center" gap={2} p={2}>
            <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
            <Box>
              <MetricValue>{acceptanceRate}%</MetricValue>
              <MetricLabel>Acceptance Rate</MetricLabel>
            </Box>
          </Box>
        </InfoCard>
      </CardBox>

      <CardBox>
        <InfoCard divider={false}>
          <Box display="flex" alignItems="center" gap={2} p={2}>
            <TrendingUpIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <MetricValue>{formatNumber(totals.locAdded)}</MetricValue>
              <MetricLabel>Lines of Code Added</MetricLabel>
            </Box>
          </Box>
        </InfoCard>
      </CardBox>
    </Box>
  );
}
