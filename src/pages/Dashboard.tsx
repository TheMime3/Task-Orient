import React from 'react';
import { 
  Title1, 
  Card,
  CardHeader,
  Body1,
  makeStyles,
  tokens,
} from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    padding: '24px',
  },
  header: {
    marginBottom: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: tokens.colorNeutralBackground1,
  },
});

const Dashboard: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Title1 className={styles.header}>Welcome to Task Orient</Title1>
      <div className={styles.grid}>
        <Card className={styles.card}>
          <CardHeader header={<Body1 weight="semibold">Quick Start</Body1>} />
          <Body1>
            Task Orient brings together communication, task management, and collaboration
            tools into one seamless experience. Get started by exploring the navigation
            menu on the left.
          </Body1>
        </Card>
        <Card className={styles.card}>
          <CardHeader header={<Body1 weight="semibold">Recent Activity</Body1>} />
          <Body1>
            Your recent activities and updates will appear here. Stay connected with
            your team and track progress on ongoing projects.
          </Body1>
        </Card>
        <Card className={styles.card}>
          <CardHeader header={<Body1 weight="semibold">Team Updates</Body1>} />
          <Body1>
            Connect with your team, schedule meetings, and collaborate on projects
            all in one place. Start by creating or joining a team.
          </Body1>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;