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
import { ApiBlueprint, createApiFactory } from '@backstage/frontend-plugin-api';
import { SonarQubeClient } from '../api';
import { sonarQubeApiRef } from '@backstage-community/plugin-sonarqube-react';
import { discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';

/**
 * @alpha
 */
export const sonarQubeApi = ApiBlueprint.make({
  params: {
    factory: createApiFactory({
      api: sonarQubeApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new SonarQubeClient({
          discoveryApi,
          fetchApi,
        }),
    }),
  },
});
