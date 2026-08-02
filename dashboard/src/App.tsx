import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar, PageId } from './components/Sidebar';
import { Header } from './components/Header';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';

import { LoginPage } from './pages/LoginPage';
import { OverviewPage } from './pages/OverviewPage';
import { SessionsPage } from './pages/SessionsPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { TimelinePage } from './pages/TimelinePage';
import { ScreenshotsPage } from './pages/ScreenshotsPage';
import { AIInsightsPage } from './pages/AIInsightsPage';
import { WorkflowExplorerPage } from './pages/WorkflowExplorerPage';
import { SettingsPage } from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const [currentPage, setCurrentPage] = useState<PageId>('overview');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewPage />;
      case 'sessions':
        return <SessionsPage />;
      case 'activities':
        return <ActivitiesPage />;
      case 'timeline':
        return <TimelinePage />;
      case 'screenshots':
        return <ScreenshotsPage />;
      case 'ai-insights':
        return <AIInsightsPage />;
      case 'workflow-explorer':
        return <WorkflowExplorerPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div
      className={`min-h-screen flex ${isDarkMode ? 'dark bg-gray-950 text-gray-100' : 'bg-gray-100 text-gray-900'}`}
    >
      <Sidebar currentPage={currentPage} onSelectPage={setCurrentPage} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={currentPage.replace('-', ' ')} />
        <main className="p-6 flex-1 overflow-y-auto">{renderPage()}</main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
