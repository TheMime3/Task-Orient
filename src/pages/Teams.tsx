import React from 'react';
import {
  makeStyles,
  tokens,
  Button,
  Title2,
  Card,
  CardHeader,
  Text,
  Avatar,
  AvatarGroup,
  Badge,
} from '@fluentui/react-components';
import { Add24Regular, People24Regular } from '@fluentui/react-icons';
import type { Team } from '../types';

const useStyles = makeStyles({
  root: {
    padding: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  teamCard: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  teamHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  teamIcon: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    padding: '12px',
    borderRadius: '8px',
  },
  teamContent: {
    padding: '16px',
  },
  teamStats: {
    display: 'flex',
    gap: '16px',
    marginTop: '12px',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
});

const Teams: React.FC = () => {
  const styles = useStyles();

  // Mock data - replace with actual data from your state management
  const teams: Team[] = [
    {
      id: '1',
      name: 'Product Team',
      description: 'Core product development team',
      members: [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      ],
      channels: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Marketing',
      description: 'Marketing and communications team',
      members: [
        { id: '3', name: 'Alice Johnson', email: 'alice@example.com' },
      ],
      channels: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Title2>Teams</Title2>
        <Button icon={<Add24Regular />}>Create Team</Button>
      </div>

      <div className={styles.grid}>
        {teams.map((team) => (
          <Card key={team.id} className={styles.teamCard}>
            <CardHeader
              header={
                <div className={styles.teamHeader}>
                  <div className={styles.teamIcon}>
                    <People24Regular />
                  </div>
                  <div>
                    <Text weight="semibold" size={400}>
                      {team.name}
                    </Text>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
                      {team.description}
                    </Text>
                  </div>
                </div>
              }
            />
            <div className={styles.teamContent}>
              <AvatarGroup>
                {team.members.map((member) => (
                  <Avatar
                    key={member.id}
                    name={member.name}
                    size={28}
                  />
                ))}
              </AvatarGroup>
              <div className={styles.teamStats}>
                <div className={styles.statItem}>
                  <Badge>{team.members.length}</Badge>
                  <Text size={200}>Members</Text>
                </div>
                <div className={styles.statItem}>
                  <Badge>{team.channels.length}</Badge>
                  <Text size={200}>Channels</Text>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Teams;