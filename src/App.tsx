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
import { ShieldAlert } from 'lucide-react';

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

    const renderRestricted = (moduleName: string) => (
      <div className="p-8 bg-white rounded-2xl border border-gray-200 text-center max-w-md mx-auto my-12 space-y-3 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center font-bold">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-gray-900">{moduleName} Restricted</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Access to this business management section is restricted to Royal Studio Administrator accounts.
        </p>
        <button
          onClick={() => navigate('/tasks')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          Go to My Tasks
        </button>
      </div>
    );

    if (currentPath === '/' || currentPath === '/dashboard') {
      if (!isAdmin) {
        return <TasksPage navigate={navigate} />;
      }
      return <DashboardPage navigate={navigate} />;
    }

    if (currentPath === '/finance') {
      if (!isAdmin) return renderRestricted('Financial Performance & Margins');
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
      if (!isAdmin) return renderRestricted('Client Directory & CRM');
      return <ClientsPage navigate={navigate} />;
    }

    if (currentPath === '/team') {
      if (!isAdmin) return renderRestricted('Production Team & Crew Management');
      return <TeamPage navigate={navigate} />;
    }

    if (currentPath === '/equipment') {
      if (!isAdmin) return renderRestricted('Gear Locker & Equipment Master');
      return <EquipmentPage navigate={navigate} />;
    }

    if (currentPath === '/packages') {
      if (!isAdmin) return renderRestricted('Package Services Master');
      return <PackagesPage navigate={navigate} />;
    }

    if (currentPath === '/invoices') {
      if (!isAdmin) return renderRestricted('Invoices & Client Billing');
      return <InvoicesPage navigate={navigate} />;
    }

    if (currentPath === '/team-payments') {
      return <TeamPaymentsPage navigate={navigate} />;
    }

    if (currentPath === '/payout-batch') {
      if (!isAdmin) return renderRestricted('Batch Crew Payout');
      return <PayoutBatchPage navigate={navigate} />;
    }

    if (currentPath === '/studio-expenses') {
      if (!isAdmin) return renderRestricted('Studio Overhead Expenses');
      return <StudioExpensesPage navigate={navigate} />;
    }

    if (currentPath === '/tasks') {
      return <TasksPage navigate={navigate} />;
    }

    if (currentPath === '/reports') {
      if (!isAdmin) return renderRestricted('Financial Reports & Analytics');
      return <ReportsPage />;
    }

    if (currentPath === '/profile') {
      return <ProfilePage />;
    }

    // Default fallback
    return isAdmin ? <DashboardPage navigate={navigate} /> : <TasksPage navigate={navigate} />;
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
