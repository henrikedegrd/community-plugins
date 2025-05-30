/*
 * Copyright 2021 The Backstage Authors
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
import { TrendLine } from '@backstage/core-components';
import Typography from '@material-ui/core/Typography';

interface TrendProps {
  data?: number[];
  title: string;
  color: string;
}

export const Trend = ({ data, title, color }: TrendProps) => {
  const emptyData = [0, 0];
  const max = Math.max(...(data ?? emptyData));

  return (
    <>
      <Typography variant="overline">{title}</Typography>
      <TrendLine
        data={data ?? emptyData}
        title={title}
        max={max}
        color={data && color}
      />
    </>
  );
};
