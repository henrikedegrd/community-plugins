## API Report File for "@backstage-community/plugin-kiali-backend"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts
import { BackendFeature } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import type { LoggerService } from '@backstage/backend-plugin-api';

// @public (undocumented)
export function createRouter(options: RouterOptions): Promise<express.Router>;

// Warning: (ae-missing-release-tag) "kialiPlugin" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
const kialiPlugin: BackendFeature;
export default kialiPlugin;
export { kialiPlugin };

// Warning: (ae-missing-release-tag) "KialiProvidersApi" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface KialiProvidersApi {
  // Warning: (ae-forgotten-export) The symbol "KialiApiImpl" needs to be exported by the entry point index.d.ts
  //
  // (undocumented)
  api: KialiApiImpl;
  // (undocumented)
  name: string;
  // (undocumented)
  urlExternal: string;
}

// Warning: (ae-missing-release-tag) "makeRouter" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export const makeRouter: (
  logger: LoggerService,
  kialiApis: KialiProvidersApi[],
  config: Config,
) => express.Router;

// Warning: (ae-missing-release-tag) "RouterOptions" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface RouterOptions {
  // (undocumented)
  config: Config;
  // (undocumented)
  logger: LoggerService;
}

// (No @packageDocumentation comment for this package)
```
