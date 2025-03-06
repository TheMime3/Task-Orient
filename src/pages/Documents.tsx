import React from 'react';
import {
  makeStyles,
  tokens,
  Button,
  Title2,
  Card,
  CardHeader,
  Text,
  Input,
  TabList,
  Tab,
  Badge,
} from '@fluentui/react-components';
import {
  Add24Regular,
  Search24Regular,
  DocumentText24Regular,
  People24Regular,
  Clock24Regular,
} from '@fluentui/react-icons';
import type { Document } from '../types';

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
  searchBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
  },
  docCard: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  docIcon: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    padding: '12px',
    borderRadius: '8px',
  },
  docHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  docContent: {
    padding: '16px',
  },
  docMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: tokens.colorNeutralForeground2,
    fontSize: '12px',
    marginTop: '8px',
  },
  statusBadge: {
    textTransform: 'capitalize',
  },
});

const Documents: React.FC = () => {
  const styles = useStyles();

  // Mock data - replace with actual data from your state management
  const documents: Document[] = [
    {
      id: '1',
      title: 'Project Proposal',
      content: '',
      createdBy: { id: '1', name: 'John Doe', email: 'john@example.com' },
      createdAt: new Date(),
      updatedAt: new Date(),
      sharedWith: [],
      version: 1,
      versions: [],
      status: 'draft',
      tags: ['proposal', 'project'],
    },
    {
      id: '2',
      title: 'Meeting Notes',
      content: '',
      createdBy: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      createdAt: new Date(),
      updatedAt: new Date(),
      sharedWith: [],
      version: 1,
      versions: [],
      status: 'published',
      tags: ['notes', 'meeting'],
    },
  ];

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Title2>Documents</Title2>
        <Button icon={<Add24Regular />}>Create Document</Button>
      </div>

      <div className={styles.searchBar}>
        <Input
          placeholder="Search documents..."
          contentBefore={<Search24Regular />}
          style={{ flex: 1 }}
        />
        <TabList>
          <Tab value="all">All</Tab>
          <Tab value="shared">Shared with me</Tab>
          <Tab value="recent">Recent</Tab>
        </TabList>
      </div>

      <div className={styles.grid}>
        {documents.map((doc) => (
          <Card key={doc.id} className={styles.docCard}>
            <CardHeader
              header={
                <div className={styles.docHeader}>
                  <div className={styles.docIcon}>
                    <DocumentText24Regular />
                  </div>
                  <div>
                    <Text weight="semibold">{doc.title}</Text>
                    <div className={styles.docMeta}>
                      <Clock24Regular />
                      <Text>
                        {doc.updatedAt.toLocaleDateString()}
                      </Text>
                      <Badge appearance="filled" className={styles.statusBadge}>
                        {doc.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              }
            />
            <div className={styles.docContent}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <People24Regular />
                <Text size={200}>
                  {doc.sharedWith.length > 0
                    ? `Shared with ${doc.sharedWith.length} people`
                    : 'Only you'}
                </Text>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Documents;