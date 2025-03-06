import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  makeStyles,
  Tab,
  TabList,
  tokens,
  Title3,
  Avatar,
  Divider,
} from '@fluentui/react-components';
import {
  Home24Regular,
  Chat24Regular,
  Calendar24Regular,
  DocumentText24Regular,
  People24Regular,
  Settings24Regular,
  CheckboxChecked24Regular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  nav: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  logo: {
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
    cursor: 'pointer',
  },
  tabs: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: '20px',
  },
  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
  },
});

const Navigation: React.FC = () => {
  const styles = useStyles();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: <Home24Regular />, label: 'Dashboard' },
    { path: '/chat', icon: <Chat24Regular />, label: 'Chat' },
    { path: '/calendar', icon: <Calendar24Regular />, label: 'Calendar' },
    { path: '/tasks', icon: <CheckboxChecked24Regular />, label: 'Tasks' },
    { path: '/documents', icon: <DocumentText24Regular />, label: 'Documents' },
    { path: '/teams', icon: <People24Regular />, label: 'Teams' },
    { path: '/settings', icon: <Settings24Regular />, label: 'Settings' },
  ];

  const handleTabSelect = (path: string) => {
    navigate(path);
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.header}>
        <Title3 className={styles.logo} onClick={() => navigate('/')}>
          Task Orient
        </Title3>
      </div>

      <TabList 
        vertical 
        selectedValue={location.pathname}
        onTabSelect={(_, data) => handleTabSelect(data.value as string)}
      >
        {navItems.map((item) => (
          <Tab
            key={item.path}
            icon={item.icon}
            value={item.path}
          >
            {item.label}
          </Tab>
        ))}
      </TabList>

      <div className={styles.footer}>
        <Divider />
        <div className={styles.profile}>
          <Avatar
            name="John Doe"
            size={32}
          />
          <div>
            <div>John Doe</div>
            <div style={{ fontSize: '12px', color: tokens.colorNeutralForeground2 }}>
              john@example.com
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;