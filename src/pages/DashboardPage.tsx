import React, { useState } from 'react';
import {
  CalendarDays,
  DollarSign,
  TrendingUp,
  FileWarning,
  AlertTriangle,
  Clock,
  Sparkles,
  Camera,
  Users,
  CheckCircle2,
  ArrowRight,
  Flame,
  ShieldAlert,
  Lightbulb,
  Target,
  Edit
} from 'lucide-react';
import { useStudioData } from '../context/StudioDataContext';
import { formatPKR, formatDate } from '../utils/calculations';
import { StatusBadge } from '../components/common/StatusBadge';
import { AIBriefing } from '../types';

interface DashboardPageProps {
  navigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
  const {
    events,
    invoices,
    teamMembers,
    equipment,
    tasks,
    fetchAIBriefing,
    addToast
  } = useStudioData();

  const [aiBriefing, setAiBriefing] = useState<AIBriefing | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);

  // Filter active events (exclude cancelled)
  const activeEvents = events.filter(e => e.status !== 'Cancelled');

  // KPI 1: Total Events
  const totalEventsCount = activeEvents.length;

  // KPI 2: Revenue Collected
  const totalRevenueCollected = activeEvents.reduce((sum, e) => sum + (e.totalClientPayments || 0), 0);

  // KPI 3: Total Profit
  const totalProfit = activeEvents.reduce((sum, e) => sum + (e.netProfit || 0), 0);

  // KPI 4: Pending Invoices Amount
  const unpaidInvoices = invoices.filter(i => i.status === 'Unpaid' || i.status === 'Partially Paid' || i.status === 'Overdue');
  const pendingInvoicesAmount = unpaidInvoices.reduce((sum, i) => sum + i.remainingAmount, 0);

  // Alerts
  const overdueInvoices = invoices.filter(i => i.status === 'Overdue');
  const urgentTasks = tasks.filter(t => t.priority === 'Urgent' && t.status !== 'Completed');
  const availableTeam = teamMembers.filter(m => m.availabilityStatus === 'Available' && m.isActive);
  const busyTeam = teamMembers.filter(m => m.availabilityStatus === 'Busy');
  const serviceNeededEquipment = equipment.filter(
    eq => (eq.currentUsageCount || 0) >= (eq.serviceAfterUses || 20) || eq.status === 'Maintenance'
  );

  // Upcoming Events (sorted by date)
  const sortedUpcoming = [...activeEvents].sort(
    (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
  );

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      const briefing = await fetchAIBriefing();
      setAiBriefing(briefing);
      addToast('AI business briefing refreshed with live studio data.');
    } catch {
      // error handled in context
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Monthly Revenue & Profit chart data calculation from real events
  const monthMap: Record<string, { revenue: number; profit: number }> = {};
  activeEvents.forEach(e => {
    if (!e.eventDate) return;
    const month = e.eventDate.slice(0, 7); // YYYY-MM
    if (!monthMap[month]) monthMap[month] = { revenue: 0, profit: 0 };
    monthMap[month].revenue += (e.totalClientPayments || 0);
    monthMap[month].profit += (e.netProfit || 0);
  });

  const monthKeys = Object.keys(monthMap).sort();
  const maxBarValue = Math.max(
    1,
    ...monthKeys.map(m => Math.max(monthMap[m].revenue, monthMap[m].profit))
  );

  return (
    <div className="space-y-6">
      {/* Top Welcome & AI Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold mb-2 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Executive Briefing Ready</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Royal Studio Command Center
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
            Live operations, wedding schedules, crew availability, and financial performance across Lahore & Pakistan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateAI}
            disabled={isGeneratingAI}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isGeneratingAI ? 'animate-spin' : ''}`} />
            <span>{isGeneratingAI ? 'Analyzing Live Database...' : 'Generate AI Insights'}</span>
          </button>
        </div>
      </div>

      {/* Critical Alert Banners */}
      <div className="space-y-2.5">
        {overdueInvoices.length > 0 && (
          <div className="flex items-center justify-between p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs font-medium animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="p-1 bg-rose-100 text-rose-600 rounded-lg">
                <FileWarning className="w-4 h-4" />
              </span>
              <span>
                <strong>Overdue Invoices:</strong> {overdueInvoices.length} invoice(s) totalling{' '}
                {formatPKR(overdueInvoices.reduce((acc, i) => acc + i.remainingAmount, 0))} require urgent recovery.
              </span>
            </div>
            <button
              onClick={() => navigate('/invoices')}
              className="text-xs font-bold text-rose-700 underline hover:text-rose-900"
            >
              Review Invoices
            </button>
          </div>
        )}

        {availableTeam.length < 2 && (
          <div className="flex items-center justify-between p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-medium animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="p-1 bg-amber-100 text-amber-600 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <span>
                <strong>Low Team Availability:</strong> Only {availableTeam.length} active crew member available — consider temporary hiring for upcoming shoots.
              </span>
            </div>
            <button
              onClick={() => navigate('/team')}
              className="text-xs font-bold text-amber-800 underline hover:text-amber-950"
            >
              View Roster
            </button>
          </div>
        )}

        {serviceNeededEquipment.length > 0 && (
          <div className="flex items-center justify-between p-3.5 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-900 text-xs font-medium animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="p-1 bg-yellow-100 text-yellow-700 rounded-lg">
                <Camera className="w-4 h-4" />
              </span>
              <span>
                <strong>Equipment Service Required:</strong> {serviceNeededEquipment.length} piece(s) of camera or drone gear exceeded 20 uses or need maintenance.
              </span>
            </div>
            <button
              onClick={() => navigate('/equipment')}
              className="text-xs font-bold text-yellow-800 underline hover:text-yellow-950"
            >
              Gear Locker
            </button>
          </div>
        )}
      </div>

      {/* AI Business Briefing Panel (Section 39) */}
      {aiBriefing && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2 text-slate-900">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-sm uppercase tracking-wide">
                Live AI Executive Briefing (Gemini 3.8 Flash)
              </h3>
            </div>
            <span className="text-[11px] text-gray-500">
              Generated: {new Date(aiBriefing.generatedAt).toLocaleTimeString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* 1. HIGHLIGHT */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>1. Highlight</span>
              </div>
              <p className="text-xs text-emerald-950 leading-relaxed">{aiBriefing.highlight}</p>
            </div>

            {/* 2. URGENT ACTION */}
            <div className="p-4 bg-rose-50/60 border border-rose-200/80 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs uppercase tracking-wider">
                <Flame className="w-4 h-4 text-rose-600" />
                <span>2. Urgent Action</span>
              </div>
              <p className="text-xs text-rose-950 leading-relaxed">{aiBriefing.urgentAction}</p>
            </div>

            {/* 3. RISK ALERT */}
            <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>3. Risk Alert</span>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed">{aiBriefing.riskAlert}</p>
            </div>

            {/* 4. OPPORTUNITY */}
            <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-blue-800 font-bold text-xs uppercase tracking-wider">
                <Target className="w-4 h-4 text-blue-600" />
                <span>4. Opportunity</span>
              </div>
              <p className="text-xs text-blue-950 leading-relaxed">{aiBriefing.opportunity}</p>
            </div>

            {/* 5. TODAY'S TIP */}
            <div className="p-4 bg-purple-50/60 border border-purple-200/80 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-purple-800 font-bold text-xs uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-purple-600" />
                <span>5. Today's Tip</span>
              </div>
              <p className="text-xs text-purple-950 leading-relaxed">{aiBriefing.todaysTip}</p>
            </div>
          </div>
        </div>
      )}

      {/* Top 4 KPI Cards (Section 30) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Events */}
        <div
          onClick={() => navigate('/events')}
          className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs hover:border-gray-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Active Events</span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <CalendarDays className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-gray-900">{totalEventsCount}</div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
            <span>Confirmed & scheduled</span>
            <span className="text-blue-600 font-semibold flex items-center gap-0.5">
              View all <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 2: Revenue Collected */}
        <div
          onClick={() => navigate('/finance')}
          className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs hover:border-gray-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Revenue Collected</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-gray-900">{formatPKR(totalRevenueCollected)}</div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
            <span>Verified bank & cash</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
              Financials <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 3: Total Profit */}
        <div
          onClick={() => navigate('/finance')}
          className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs hover:border-gray-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Net Profit</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-gray-900">{formatPKR(totalProfit)}</div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
            <span>After crew, gear & expenses</span>
            <span className="text-amber-600 font-semibold flex items-center gap-0.5">
              Breakdown <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 4: Pending Invoices */}
        <div
          onClick={() => navigate('/invoices')}
          className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs hover:border-gray-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Invoices</span>
            <span className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <FileWarning className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-gray-900">{formatPKR(pendingInvoicesAmount)}</div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
            <span>Across {unpaidInvoices.length} balance(s)</span>
            <span className="text-purple-600 font-semibold flex items-center gap-0.5">
              Invoices <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Charts & Operational Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue vs Profit Chart (Section 30 Chart A) */}
        <div className="lg:col-span-2 p-6 bg-white rounded-xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Monthly Revenue vs Net Profit
              </h3>
              <p className="text-xs text-gray-500">Actual financial totals recorded from event bookings</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500" />
                <span className="text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-amber-500" />
                <span className="text-gray-600">Net Profit</span>
              </div>
            </div>
          </div>

          {monthKeys.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-gray-400">
              No monthly event data recorded yet.
            </div>
          ) : (
            <div className="space-y-4">
              {monthKeys.map(month => {
                const data = monthMap[month];
                const revPct = Math.min(100, Math.round((data.revenue / maxBarValue) * 100));
                const profPct = Math.max(0, Math.min(100, Math.round((data.profit / maxBarValue) * 100)));

                return (
                  <div key={month} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-700">{month}</span>
                      <div className="flex gap-4">
                        <span className="text-emerald-700 font-mono">{formatPKR(data.revenue)}</span>
                        <span className="text-amber-700 font-mono">{formatPKR(data.profit)}</span>
                      </div>
                    </div>
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                      <div
                        style={{ width: `${revPct}%` }}
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        title={`Revenue: ${formatPKR(data.revenue)}`}
                      />
                      <div
                        style={{ width: `${profPct}%` }}
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        title={`Profit: ${formatPKR(data.profit)}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Team Availability & Equipment Health */}
        <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Crew & Equipment Health
              </h3>
              <Users className="w-4 h-4 text-gray-400" />
            </div>

            {/* Crew Status */}
            <div className="p-4 bg-gray-50 rounded-xl space-y-3 mb-4">
              <div className="flex justify-between text-xs font-medium text-gray-700">
                <span>Crew Availability:</span>
                <span className="font-bold text-gray-900">{teamMembers.length} Total</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-white rounded-lg border border-emerald-100">
                  <div className="text-lg font-black text-emerald-600">{availableTeam.length}</div>
                  <div className="text-[10px] text-gray-500 font-medium uppercase">Available</div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-amber-100">
                  <div className="text-lg font-black text-amber-600">{busyTeam.length}</div>
                  <div className="text-[10px] text-gray-500 font-medium uppercase">On Shoot</div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-gray-100">
                  <div className="text-lg font-black text-gray-600">
                    {teamMembers.length - availableTeam.length - busyTeam.length}
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium uppercase">Leave/Off</div>
                </div>
              </div>
            </div>

            {/* Gear Status */}
            <div className="p-4 bg-gray-50 rounded-xl space-y-2">
              <div className="flex justify-between text-xs font-medium text-gray-700">
                <span>Camera & Drone Locker:</span>
                <span className="font-bold text-gray-900">{equipment.length} Units</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 pt-1">
                <span>Ready for Shoot:</span>
                <span className="font-semibold text-emerald-600">
                  {equipment.filter(e => e.status === 'Available').length} units
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Service Warnings (&gt;20 uses):</span>
                <span className="font-semibold text-amber-600">{serviceNeededEquipment.length} units</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/team')}
            className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Manage Production Crew
          </button>
        </div>
      </div>

      {/* Bottom Grid: Upcoming Events & Urgent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events Table */}
        <div className="lg:col-span-2 p-6 bg-white rounded-xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Upcoming Studio Events
              </h3>
              <p className="text-xs text-gray-500">Scheduled weddings, commercial shoots and galas</p>
            </div>
            <button
              onClick={() => navigate('/events')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
            >
              All Events <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Event Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Package Value</th>
                  <th className="py-2.5 px-3">Profit</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {sortedUpcoming.slice(0, 5).map(evt => (
                  <tr
                    key={evt.id}
                    onClick={() => navigate(`/events/${evt.id}`)}
                    className="hover:bg-amber-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-medium text-gray-900 whitespace-nowrap">
                      {formatDate(evt.eventDate)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-gray-900">
                      <div className="truncate max-w-[200px]">{evt.title}</div>
                      <div className="text-[10px] text-gray-400 font-normal">{evt.venue}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-gray-100 rounded-md font-medium text-gray-700 text-[10px]">
                        {evt.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium">{formatPKR(evt.packagePrice)}</td>
                    <td className="py-3 px-3 font-mono font-medium">
                      <span className={evt.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700 font-bold'}>
                        {formatPKR(evt.netProfit)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={evt.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/events/${evt.id}/edit`)}
                          className="px-2 py-1 text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title="Edit Event"
                        >
                          <Edit className="w-3 h-3 text-amber-600" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => navigate(`/events/${evt.id}`)}
                          className="p-1 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-md transition-colors"
                          title="Open Event"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Urgent Tasks */}
        <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Post-Production Urgencies
                </h3>
                <p className="text-xs text-gray-500">Critical reels, album layouts and teasers</p>
              </div>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>

            {urgentTasks.length === 0 ? (
              <div className="text-xs text-gray-400 py-8 text-center">
                No urgent tasks pending right now.
              </div>
            ) : (
              <div className="space-y-2.5">
                {urgentTasks.slice(0, 4).map(task => (
                  <div
                    key={task.id}
                    onClick={() => navigate('/tasks')}
                    className="p-3 bg-rose-50/40 border border-rose-100 rounded-xl hover:bg-rose-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-rose-950 truncate max-w-[170px]">
                        {task.title}
                      </span>
                      <StatusBadge status="Urgent" size="sm" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                      <span>Due: {formatDate(task.dueDate)}</span>
                      <span className="capitalize text-slate-700 font-medium">{task.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/tasks')}
            className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold transition-colors"
          >
            Open Post-Production Kanban
          </button>
        </div>
      </div>
    </div>
  );
};
