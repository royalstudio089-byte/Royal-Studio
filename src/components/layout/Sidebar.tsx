import React from 'react';
import {
  LayoutDashboard,
  DollarSign,
  CalendarDays,
  Calendar,
  Users,
  UserCheck,
  Camera,
  Package,
  FileText,
  CreditCard,
  Layers,
  Building2,
  CheckSquare,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPath: string;
  navigate: (path: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  navigate,
  isCollapsed,
  setIsCollapsed
}) => {
  const { user, isAdmin, logout } = useAuth();

  const adminNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Finance', path: '/finance', icon: DollarSign },
    { label: 'Events', path: '/events', icon: CalendarDays },
    { label: 'Calendar', path: '/calendar', icon: Calendar },
    { label: 'Clients', path: '/clients', icon: Users },
    { label: 'Team', path: '/team', icon: UserCheck },
    { label: 'Equipment', path: '/equipment', icon: Camera },
    { label: 'Packages', path: '/packages', icon: Package },
    { label: 'Invoices', path: '/invoices', icon: FileText },
    { label: 'Team Payments', path: '/team-payments', icon: CreditCard },
    { label: 'Payout Batch', path: '/payout-batch', icon: Layers },
    { label: 'Studio Expenses', path: '/studio-expenses', icon: Building2 },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Studio Settings', path: '/profile', icon: Settings }
  ];

  const staffNavItems = [
    { label: 'My Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'My Events', path: '/events', icon: CalendarDays },
    { label: 'My Payments', path: '/team-payments', icon: CreditCard },
    { label: 'My Profile', path: '/profile', icon: Settings }
  ];

  const navItems = isAdmin ? adminNavItems : staffNavItems;

  return (
    <aside
      className={`relative flex flex-col bg-slate-950 text-slate-200 border-r border-slate-800 transition-all duration-300 z-30 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800">
        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 cursor-pointer overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-bold text-slate-950 shadow-md shrink-0">
            RS
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-wider text-white truncate">
                ROYAL STUDIO
              </span>
              <span className="text-[11px] text-amber-400 font-medium tracking-wide">
                STUDIO MANAGER
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {!isCollapsed && (isAdmin ? 'Studio Management' : 'Staff Workspace')}
        </div>
        {navItems.map(item => {
          const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/70">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 font-bold shrink-0 border border-slate-700">
              {isAdmin ? <Shield className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {isAdmin ? 'Royal Studio' : user?.name}
                </div>
                <div className="text-[10px] text-amber-400 font-medium truncate">
                  {isAdmin ? 'Administrator • Active' : user?.email}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => logout()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
