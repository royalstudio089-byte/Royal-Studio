import React from 'react';
import {
  Menu,
  RotateCw,
  Clock,
  AlertCircle,
  Bell,
  Search,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudioData } from '../../context/StudioDataContext';

interface TopbarProps {
  currentPath: string;
  onToggleMobileNav: () => void;
  navigate: (path: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentPath,
  onToggleMobileNav,
  navigate
}) => {
  const { user, isAdmin, idleRemainingSeconds } = useAuth();
  const { invoices, tasks, teamMembers, refreshAll, isLoading } = useStudioData();

  const overdueCount = invoices.filter(i => i.status === 'Overdue').length;
  const urgentTaskCount = tasks.filter(t => t.priority === 'Urgent' && t.status !== 'Completed').length;
  const availableTeamCount = teamMembers.filter(m => m.availabilityStatus === 'Available' && m.isActive).length;

  const minutes = Math.floor(idleRemainingSeconds / 60);
  const seconds = idleRemainingSeconds % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const formatPathTitle = (path: string): string => {
    if (path === '/' || path === '/dashboard') return 'Studio Overview';
    if (path === '/finance') return 'Financial Performance & Margins';
    if (path === '/events') return 'Event Bookings & Schedules';
    if (path.startsWith('/events/')) return 'Operational Event Room';
    if (path === '/calendar') return 'Studio Master Calendar';
    if (path === '/clients') return 'Client Directory & CRM';
    if (path === '/team') return 'Production Crew & Talents';
    if (path === '/equipment') return 'Gear Locker & Maintenance';
    if (path === '/packages') return 'Package Service Master';
    if (path === '/invoices') return 'Invoices & Billing';
    if (path === '/team-payments') return 'Crew Payroll Ledger';
    if (path === '/payout-batch') return 'Batch Crew Payout';
    if (path === '/studio-expenses') return 'Studio Overhead Expenses';
    if (path === '/tasks') return 'Post-Production Pipeline';
    if (path === '/reports') return 'Analytics & Reports';
    if (path === '/profile') return 'Studio Settings & Legal';
    return 'Royal Studio Manager';
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-8 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base md:text-lg font-bold text-gray-900 leading-tight">
            {formatPathTitle(currentPath)}
          </h1>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Royal Studio Manager</span>
            <span>/</span>
            <span className="capitalize">{currentPath.replace('/', '') || 'Dashboard'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Alerts Pills */}
        {overdueCount > 0 && (
          <button
            onClick={() => navigate('/invoices')}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-full hover:bg-rose-100 transition-colors"
            title={`${overdueCount} overdue invoice(s)`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{overdueCount} Overdue</span>
          </button>
        )}

        {urgentTaskCount > 0 && (
          <button
            onClick={() => navigate('/tasks')}
            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full hover:bg-amber-100 transition-colors"
            title={`${urgentTaskCount} urgent task(s) pending`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{urgentTaskCount} Urgent Tasks</span>
          </button>
        )}

        {/* Idle lock indicator */}
        <div
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg"
          title="Automatic logout on 30 minutes of inactivity"
        >
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[11px] font-mono">{timeFormatted}</span>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => refreshAll()}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh studio records"
        >
          <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
        </button>

        {/* Role badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <span
            className={`px-2 py-0.5 text-xs font-bold rounded-md uppercase tracking-wider ${
              isAdmin
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-blue-100 text-blue-900 border border-blue-300'
            }`}
          >
            {user?.role}
          </span>
          <div className="hidden sm:block text-right">
            <div className="text-xs font-semibold text-gray-900 leading-tight">{user?.name}</div>
            <div className="text-[10px] text-gray-500">Royal Studio PK</div>
          </div>
        </div>
      </div>
    </header>
  );
};
