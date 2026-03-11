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

import {
  createContext,
  useContext,
  useState,
  PropsWithChildren,
  useMemo,
} from 'react';
import { MetricsV2EntityType } from '@backstage-community/plugin-copilot-common';

/**
 * State for the V2 organization/entity selector.
 */
interface V2EntityState {
  type: MetricsV2EntityType;
  entityName: string | undefined;
}

type V2EntityContextType = [V2EntityState, (state: V2EntityState) => void];

const V2EntityContext = createContext<V2EntityContextType | undefined>(
  undefined,
);

/**
 * Provider for V2 entity selection state.
 */
export function V2EntityProvider({ children }: PropsWithChildren<{}>) {
  const [state, setState] = useState<V2EntityState>({
    type: 'organization',
    entityName: undefined,
  });

  const value = useMemo((): V2EntityContextType => [state, setState], [state]);

  return (
    <V2EntityContext.Provider value={value}>
      {children}
    </V2EntityContext.Provider>
  );
}

/**
 * Hook to access V2 entity selection state.
 */
export function useV2Entity(): V2EntityContextType {
  const context = useContext(V2EntityContext);
  if (!context) {
    throw new Error('useV2Entity must be used within a V2EntityProvider');
  }
  return context;
}

/**
 * State for the V2 date range.
 */
interface V2DateRangeState {
  startDate: Date;
  endDate: Date;
}

type V2DateRangeContextType = [
  V2DateRangeState,
  (state: V2DateRangeState) => void,
];

const V2DateRangeContext = createContext<V2DateRangeContextType | undefined>(
  undefined,
);

/**
 * Provider for V2 date range state.
 */
export function V2DateRangeProvider({ children }: PropsWithChildren<{}>) {
  // Default to last 28 days
  const [state, setState] = useState<V2DateRangeState>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 28);
    return { startDate: start, endDate: end };
  });

  const value = useMemo(
    (): V2DateRangeContextType => [state, setState],
    [state],
  );

  return (
    <V2DateRangeContext.Provider value={value}>
      {children}
    </V2DateRangeContext.Provider>
  );
}

/**
 * Hook to access V2 date range state.
 */
export function useV2DateRange(): V2DateRangeContextType {
  const context = useContext(V2DateRangeContext);
  if (!context) {
    throw new Error('useV2DateRange must be used within a V2DateRangeProvider');
  }
  return context;
}

/**
 * Combined provider for all V2 contexts.
 */
export function V2MetricsProvider({ children }: PropsWithChildren<{}>) {
  return (
    <V2DateRangeProvider>
      <V2EntityProvider>{children}</V2EntityProvider>
    </V2DateRangeProvider>
  );
}
