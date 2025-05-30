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

import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import { makeStyles } from '@material-ui/core/styles';

type AssigneesProps = {
  name?: string;
  avatar?: string;
};

const useStyles = makeStyles(theme => ({
  small: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginLeft: theme.spacing(1),
  },
  noAssignees: {
    height: theme.spacing(4),
  },
}));

export const Assignees = (props: AssigneesProps) => {
  const { name, avatar } = props;
  const classes = useStyles();

  // todo: many assignees -> NUM assignees + stock images on each other
  return name ? (
    <Box display="flex" alignItems="center" marginX={1}>
      <Typography color="primary" variant="body2" component="p">
        {name}
      </Typography>
      <Avatar alt={name} src={avatar} className={classes.small} />
    </Box>
  ) : (
    <Box display="flex" alignItems="center" marginX={1}>
      <Typography
        color="primary"
        variant="body2"
        component="p"
        className={classes.noAssignees}
      >
        No assignees
      </Typography>
    </Box>
  );
};
