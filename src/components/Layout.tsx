import React from 'react';
import { makeStyles, shorthands, tokens } from '@fluentui/react-components';
import Navigation from './Navigation';

const useStyles = makeStyles({
  root: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    height: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  sidebar: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRight('1px', 'solid', tokens.colorNeutralStroke1),
  },
  main: {
    ...shorthands.overflow('auto'),
  },
});

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <nav className={styles.sidebar}>
        <Navigation />
      </nav>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
};

export default Layout;