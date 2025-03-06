import React from 'react';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Calendar from './pages/Calendar';
import Teams from './pages/Teams';
import Documents from './pages/Documents';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <FluentProvider theme={webLightTheme}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Navigate to="/" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        </Router>
      </FluentProvider>
    </ErrorBoundary>
  );
};

export default App;