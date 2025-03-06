import React from 'react';
import {
  makeStyles,
  tokens,
  Title2,
  Card,
  CardHeader,
  Text,
  TabList,
  Tab,
} from '@fluentui/react-components';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const useStyles = makeStyles({
  root: {
    padding: '24px',
  },
  header: {
    marginBottom: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    marginTop: '24px',
  },
  card: {
    padding: '20px',
  },
  chartContainer: {
    width: '100%',
    height: '300px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const Analytics: React.FC = () => {
  const styles = useStyles();

  // Mock data - replace with actual data from your state management
  const tasksByStatus = [
    { name: 'To Do', value: 12 },
    { name: 'In Progress', value: 8 },
    { name: 'Review', value: 4 },
    { name: 'Done', value: 16 },
  ];

  const taskCompletionTrend = [
    { date: '2024-01', completed: 15 },
    { date: '2024-02', completed: 20 },
    { date: '2024-03', completed: 25 },
  ];

  const teamProductivity = [
    { name: 'Product', tasks: 25, hours: 120 },
    { name: 'Marketing', tasks: 18, hours: 90 },
    { name: 'Engineering', tasks: 30, hours: 150 },
  ];

  const COLORS = [
    tokens.colorBrandBackground,
    tokens.colorBrandBackground2,
    tokens.colorBrandBackground3,
    tokens.colorPaletteGreenBackground2,
  ];

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Title2>Analytics Dashboard</Title2>
        <TabList>
          <Tab value="overview">Overview</Tab>
          <Tab value="productivity">Productivity</Tab>
          <Tab value="trends">Trends</Tab>
        </TabList>
      </div>

      <div className={styles.grid}>
        <Card className={styles.card}>
          <CardHeader header={<Text weight="semibold">Task Distribution</Text>} />
          <div className={styles.chartContainer}>
            <PieChart width={300} height={300}>
              <Pie
                data={tasksByStatus}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {tasksByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </Card>

        <Card className={styles.card}>
          <CardHeader header={<Text weight="semibold">Task Completion Trend</Text>} />
          <div className={styles.chartContainer}>
            <LineChart width={500} height={300} data={taskCompletionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="completed"
                stroke={tokens.colorBrandBackground}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </div>
        </Card>

        <Card className={styles.card}>
          <CardHeader header={<Text weight="semibold">Team Productivity</Text>} />
          <div className={styles.chartContainer}>
            <BarChart width={500} height={300} data={teamProductivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="tasks" fill={tokens.colorBrandBackground} />
              <Bar dataKey="hours" fill={tokens.colorBrandBackground2} />
            </BarChart>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;