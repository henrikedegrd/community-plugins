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

import { JSX } from 'react';
import { Header, Page, Content } from '@backstage/core-components';
import { V2MetricsProvider } from '../../contexts';
import { V2Metrics } from '../MetricsV2';

/**
 * V2 Copilot Page with new metrics format.
 */
export function CopilotV2Page(): JSX.Element {
  return (
    <Page themeId="tool">
      <Header
        title="Copilot Metrics (New)"
        subtitle="New GitHub Copilot Metrics Dashboard with Enhanced Analytics"
      />
      <Content>
        <V2MetricsProvider>
          <V2Metrics />
        </V2MetricsProvider>
      </Content>
    </Page>
  );
}
