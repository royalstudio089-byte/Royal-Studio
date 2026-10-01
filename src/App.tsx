import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudioDataProvider, useStudioData } from './context/StudioDataContext';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { FinancePage } from './pages/FinancePage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { ClientsPage } from './pages/ClientsPage';
import { TeamPage } from './pages/TeamPage';
import { EquipmentPage } from './pages/EquipmentPage';
import { PackagesPage } from './pages/PackagesPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { TeamPaymentsPage } from './pages/TeamPaymentsPage';
import { PayoutBatchPage } from './pages/PayoutBatchPage';
import { StudioExpensesPage } from './pages/StudioExpensesPage';
import { TasksPage } from './pages/TasksPage';
import { CalendarPage } from './pages/CalendarPage';
import { ReportsPage } from './pages/ReportsPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoadingState } from './components/common/LoadingState';

const MainContent: React.FC = () => {
  const { user, isLoading: isAuthLoading, isAdmin } = useAuth();
  const { isLoading: isDataLoading } = useStudioData();

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/dashboard';
  });

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/dashboard');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (isAuthLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-white">
        <LoadingState message="Authenticating session..." />
      </div>
    );
  }

  // If unauthenticated, always render Login page
  if (!user) {
    return <LoginPage />;
  }

  // Route Dispatcher
  const renderRoute = () => {
    if (isDataLoading) {
      return <LoadingState message="Loading studio database..." />;
    }

    if (currentPath === '/' || currentPath === '/dashboard') {
      return <DashboardPage navigate={navigate} />;
    }

    if (currentPath === '/finance') {
      return <FinancePage navigate={navigate} />;
    }

    if (currentPath === '/events') {
      return <EventsPage navigate={navigate} />;
    }

    if (currentPath.startsWith('/events/')) {
      const isEdit = currentPath.endsWith('/edit');
      const id = currentPath.replace('/events/', '').replace('/edit', '').split('/')[0];
      return <EventDetailPage eventId={id} navigate={navigate} initialEdit={isEdit} />;
    }

    if (currentPath === '/calendar') {
      return <CalendarPage navigate={navigate} />;
    }

    if (currentPath === '/clients') {
      return <ClientsPage navigate={navigate} />;
    }

    if (currentPath === '/team') {
      return <TeamPage navigate={navigate} />;
    }

    if (currentPath === '/equipment') {
      return <EquipmentPage navigate={navigate} />;
    }

    if (currentPath === '/packages') {
      return <PackagesPage navigate={navigate} />;
    }

    if (currentPath === '/invoices') {
      return <InvoicesPage navigate={navigate} />;
    }

    if (currentPath === '/team-payments') {
      if (!isAdmin) {
        return (
          <div className="p-8 bg-white rounded-xl border border-gray-200 text-center">
            <h3 className="text-base font-bold text-gray-900">Restricted Section</h3>
            <p className="text-xs text-gray-500 mt-1">Crew payroll administration is restricted to studio owners.</p>
          </div>
        );
      }
      return <TeamPaymentsPage navigate={navigate} />;
    }

    if (currentPath === '/payout-batch') {
      if (!isAdmin) {
        return (
          <div className="p-8 bg-white rounded-xl border border-gray-200 text-center">
            <h3 className="text-base font-bold text-gray-900">Restricted Section</h3>
            <p className="text-xs text-gray-500 mt-1">Batch payout disbursement is restricted to studio owners.</p>
          </div>
        );
      }
      return <PayoutBatchPage navigate={navigate} />;
    }

    if (currentPath === '/studio-expenses') {
      if (!isAdmin) {
        return (
          <div className="p-8 bg-white rounded-xl border border-gray-200 text-center">
            <h3 className="text-base font-bold text-gray-900">Restricted Section</h3>
            <p className="text-xs text-gray-500 mt-1">Studio overheads management is restricted to studio directors.</p>
          </div>
        );
      }
      return <StudioExpensesPage navigate={navigate} />;
    }

    if (currentPath === '/tasks') {
      return <TasksPage navigate={navigate} />;
    }

    if (currentPath === '/reports') {
      return <ReportsPage />;
    }

    if (currentPath === '/profile') {
      return <ProfilePage />;
    }

    // Default fallback
    return <DashboardPage navigate={navigate} />;
  };

  return (
    <AppShell currentPath={currentPath} navigate={navigate}>
      {renderRoute()}
    </AppShell>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StudioDataProvider>
        <MainContent />
      </StudioDataProvider>
    </AuthProvider>
  );
}
