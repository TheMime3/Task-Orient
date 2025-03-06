import React from 'react';
import { makeStyles, tokens, Spinner } from '@fluentui/react-components';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: tokens.colorNeutralBackground1,
    opacity: 0.8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});

interface LoadingSpinnerProps {
  overlay?: boolean;
  label?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ overlay, label }) => {
  const styles = useStyles();

  if (overlay) {
    return (
      <div className={styles.overlay}>
        <Spinner label={label} />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <Spinner label={label} />
    </div>
  );
};

export default LoadingSpinner;