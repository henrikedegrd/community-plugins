/*
 * Copyright 2022 The Backstage Authors
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

import { useMemo } from 'react';
import {
  InfoCard,
  MarkdownContent,
  Progress,
  WarningPanel,
} from '@backstage/core-components';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';
import { scmIntegrationsApiRef } from '@backstage/integration-react';
import { getAdrLocationUrl } from '@backstage-community/plugin-adr-common';
import { useEntity } from '@backstage/plugin-catalog-react';
import { CookieAuthRefreshProvider } from '@backstage/plugin-auth-react';

import { adrDecoratorFactories } from './decorators';
import { AdrContentDecorator } from './types';
import { adrApiRef } from '../../api';
import useAsync from 'react-use/esm/useAsync';

/**
 * Component to fetch and render an ADR.
 *
 * @public
 */
export const AdrReader = (props: {
  adr: string;
  decorators?: AdrContentDecorator[];
}) => {
  const { adr, decorators } = props;
  const { entity } = useEntity();
  const scmIntegrations = useApi(scmIntegrationsApiRef);
  const adrApi = useApi(adrApiRef);
  const adrLocationUrl = getAdrLocationUrl(entity, scmIntegrations);
  const adrFileLocationUrl = getAdrLocationUrl(entity, scmIntegrations, adr);
  const discoveryApi = useApi(discoveryApiRef);

  const { value, loading, error } = useAsync(
    async () => adrApi.readAdr(adrFileLocationUrl),
    [adrFileLocationUrl],
  );

  const {
    value: backendUrl,
    loading: backendUrlLoading,
    error: backendUrlError,
  } = useAsync(async () => discoveryApi.getBaseUrl('adr'), []);
  const adrContent = useMemo(() => {
    if (!value?.data) {
      return '';
    }
    const adrDecorators = decorators ?? [
      adrDecoratorFactories.createRewriteRelativeLinksDecorator(),
      adrDecoratorFactories.createRewriteRelativeEmbedsDecorator(),
      adrDecoratorFactories.createFrontMatterFormatterDecorator(),
    ];

    return adrDecorators.reduce(
      (content, decorator) =>
        decorator({ baseUrl: adrLocationUrl, content }).content,
      value.data,
    );
  }, [adrLocationUrl, decorators, value]);

  return (
    <CookieAuthRefreshProvider pluginId="adr">
      <InfoCard>
        {loading && <Progress />}

        {!loading && error && (
          <WarningPanel title="Failed to fetch ADR" message={error?.message} />
        )}

        {!backendUrlLoading && backendUrlError && (
          <WarningPanel
            title="Failed to fetch ADR images"
            message={backendUrlError?.message}
          />
        )}

        {!loading &&
          !backendUrlLoading &&
          !error &&
          !backendUrlError &&
          value?.data && (
            <MarkdownContent
              content={adrContent}
              linkTarget="_blank"
              transformImageUri={href => {
                return `${backendUrl}/image?url=${href}`;
              }}
            />
          )}
      </InfoCard>
    </CookieAuthRefreshProvider>
  );
};

AdrReader.decorators = adrDecoratorFactories;
