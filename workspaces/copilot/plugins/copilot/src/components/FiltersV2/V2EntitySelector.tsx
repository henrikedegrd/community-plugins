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

import { useMemo } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import { Progress } from '@backstage/core-components';
import { useV2Entity } from '../../contexts';
import { useV2Entities } from '../../hooks';
import { MetricsV2EntityType } from '@backstage-community/plugin-copilot-common';

/**
 * Selector for V2 entity (organization or enterprise).
 */
export function V2EntitySelector() {
  const [state, setState] = useV2Entity();
  const { items: entities, loading } = useV2Entities();

  const options = useMemo(() => {
    if (!entities) return [];
    return entities.map(e => ({
      label: `${e.entity_name} (${e.type})`,
      value: `${e.type}:${e.entity_name}`,
      type: e.type as MetricsV2EntityType,
      entityName: e.entity_name,
    }));
  }, [entities]);

  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    if (value === 'all') {
      setState({ type: 'organization', entityName: undefined });
    } else {
      const [type, entityName] = value.split(':');
      setState({
        type: type as MetricsV2EntityType,
        entityName,
      });
    }
  };

  const currentValue = state.entityName
    ? `${state.type}:${state.entityName}`
    : 'all';

  if (loading) {
    return <Progress />;
  }

  return (
    <Box minWidth={200}>
      <FormControl fullWidth size="small">
        <InputLabel id="entity-selector-label">Organization</InputLabel>
        <Select
          labelId="entity-selector-label"
          id="entity-selector"
          value={currentValue}
          label="Organization"
          onChange={handleChange}
        >
          <MenuItem value="all">All Organizations</MenuItem>
          {options.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
