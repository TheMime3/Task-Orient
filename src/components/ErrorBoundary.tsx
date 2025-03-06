import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  makeStyles,
  tokens,
  Title2,
  Body1,
  Button,
} from '@fluentui/react-components';
import { ErrorCircle24Regular, ArrowCounterclockwise24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '24px',
    textAlign: 'center',
  },
  icon: {
    fontSize: '48px',
    color: tokens.colorPaletteRedForeground1,
    marginBottom: '16px',
  },
  message: {
    marginBottom: '24px',
  },
});

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <ErrorCircle24Regular className={styles.icon} />
      <Title2>Something went wrong</Title2>
      <Body1 className={styles.message}>
        {error?.message || 'An unexpected error occurred'}
      </Body1>
      <Button
        icon={<ArrowCounterclockwise24Regular />}
        onClick={onReset}
      >
        Try Again
      </Button>
    </div>
  );
};

export default ErrorBoundary;