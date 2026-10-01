import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Percent,
  TrendingDown,
  AlertOctagon,
  ArrowUpRight,
  PieChart as PieIcon,
  CreditCard,
  Building,
  Layers
} from 'lucide-react';
import { useStudioData } from '../context/StudioDataContext';
import { formatPKR, formatDate } from '../utils/calculations';
import { StatusBadge } from '../components/common/StatusBadge';

interface FinancePageProps {
  navigate: (path: string) => void;
}

export const FinancePage: React.FC<FinancePageProps> = ({ navigate }) => {
  const { events, studioExpenses, invoices, payments } = useStudioData();

  // Exclude cancelled events
  const activeEvents = events.filter(e => e.status !== 'Cancelled');

  const totalPackageValue = activeEvents.reduce((acc, e) => acc + (e.packagePrice || 0), 0);
  const totalRevenueCollected = activeEvents.reduce((acc, e) => acc + (e.totalClientPayments || 0), 0);
  const totalStaffCost = activeEvents.reduce((acc, e) => acc + (e.staffCost || 0), 0);
  const totalRentalCost = activeEvents.reduce((acc, e) => acc + (e.rentalCost || 0), 0);
  const totalEventExpenses = activeEvents.reduce((acc, e) => acc + (e.eventExpenses || 0), 0);
  const totalEventCosts = totalStaffCost + totalRentalCost + totalEventExpenses;
  const totalStudioOverheads = studioExpenses.reduce((acc, se) => acc + (se.amount || 0), 0);

  const totalNetProfit = activeEvents.reduce((acc, e) => acc + (e.netProfit || 0), 0);
  const overallNetMargin = totalPackageValue > 0 ? (totalNetProfit / totalPackageValue) * 100 : 0;
  const totalRemainingBalance = activeEvents.reduce((acc, e) => acc + (e.remainingBalance || 0), 0);

  // Top events by profit
  const topEventsByProfit = [...activeEvents].sort((a, b) => b.netProfit - a.netProfit);

  // Loss leaders (NET PROFIT < 0) - Section 31 rule!
  const lossLeaders = activeEvents.filter(e => e.netProfit < 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Financial Performance & Margins</h2>
          <p className="text-xs text-gray-500">
            Comprehensive audit of revenue, production costs, studio overheads, and event profit margins.
          </p>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Revenue Collected</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{formatPKR(totalRevenueCollected)}</div>
          <div className="text-[11px] text-gray-500 mt-1">
            Total Booked: {formatPKR(totalPackageValue)}
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Studio Profit</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{formatPKR(totalNetProfit)}</div>
          <div className="text-[11px] text-gray-500 mt-1">
            Overall Margin: <span className="font-bold text-gray-900">{overallNetMargin.toFixed(1)}%</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Event Costs</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{formatPKR(totalEventCosts)}</div>
          <div className="text-[11px] text-gray-500 mt-1">
            Crew + Gear Rentals + Field Logistics
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Client Receivables</span>
            <CreditCard className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600">{formatPKR(totalRemainingBalance)}</div>
          <div className="text-[11px] text-gray-500 mt-1">
            Uncollected balance on active contracts
          </div>
        </div>
      </div>

      {/* Cost Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase">Staff / Crew Costs</div>
          <div className="text-lg font-bold text-gray-900 mt-1">{formatPKR(totalStaffCost)}</div>
          <div className="text-[11px] text-gray-500">Photographers, cinema & assistants</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase">Equipment Rental Costs</div>
          <div className="text-lg font-bold text-gray-900 mt-1">{formatPKR(totalRentalCost)}</div>
          <div className="text-[11px] text-gray-500">Internal & external gear allocation</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase">Field Logistics & Expenses</div>
          <div className="text-lg font-bold text-gray-900 mt-1">{formatPKR(totalEventExpenses)}</div>
          <div className="text-[11px] text-gray-500">Fuel, crew catering & travel</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase">Studio Overheads (Gulberg)</div>
          <div className="text-lg font-bold text-gray-900 mt-1">{formatPKR(totalStudioOverheads)}</div>
          <div className="text-[11px] text-gray-500">Rent, LESCO electricity & Adobe suites</div>
        </div>
      </div>

      {/* Loss Leaders Alert & Table (Section 31 Requirement) */}
      <div className="p-6 bg-white rounded-xl border border-rose-200 shadow-xs">
        <div className="flex items-center gap-2 mb-2 text-rose-700">
          <AlertOctagon className="w-5 h-5" />
          <h3 className="font-bold text-sm uppercase tracking-wider">
            Loss Leaders (Net Profit &lt; 0)
          </h3>
        </div>
        <p className="text-xs text-gray-600 mb-4">
          Events where combined production costs and expenses exceeded the contract package price. Per studio policy, these must not be hidden.
        </p>

        {lossLeaders.length === 0 ? (
          <div className="p-6 bg-emerald-50 text-emerald-800 rounded-xl text-center text-xs font-medium border border-emerald-200">
            Great job! No loss-making events detected in the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-rose-50 text-rose-900 font-bold uppercase tracking-wider border-b border-rose-200">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Event Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Package Price</th>
                  <th className="py-2.5 px-3">Total Costs</th>
                  <th className="py-2.5 px-3">Net Loss</th>
                  <th className="py-2.5 px-3">Margin</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-100">
                {lossLeaders.map(evt => {
                  const costs = evt.staffCost + evt.rentalCost + evt.eventExpenses;
                  return (
                    <tr key={evt.id} className="hover:bg-rose-50/50">
                      <td className="py-3 px-3 font-medium text-gray-900">{formatDate(evt.eventDate)}</td>
                      <td className="py-3 px-3 font-semibold text-gray-900">{evt.title}</td>
                      <td className="py-3 px-3">{evt.category}</td>
                      <td className="py-3 px-3 font-mono">{formatPKR(evt.packagePrice)}</td>
                      <td className="py-3 px-3 font-mono text-gray-700">{formatPKR(costs)}</td>
                      <td className="py-3 px-3 font-mono font-bold text-rose-600">{formatPKR(evt.netProfit)}</td>
                      <td className="py-3 px-3 font-bold text-rose-600">{evt.netMargin.toFixed(1)}%</td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => navigate(`/events/${evt.id}`)}
                          className="px-2.5 py-1 bg-rose-600 text-white font-medium rounded-md hover:bg-rose-700 text-[11px]"
                        >
                          Audit Event
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Events by Profit */}
      <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Top Productions by Profitability
            </h3>
            <p className="text-xs text-gray-500">Ranked by actual net margin contributions</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-2.5 px-3">Event</th>
                <th className="py-2.5 px-3">Package Price</th>
                <th className="py-2.5 px-3">Staff Cost</th>
                <th className="py-2.5 px-3">Rental Cost</th>
                <th className="py-2.5 px-3">Expenses</th>
                <th className="py-2.5 px-3">Net Profit</th>
                <th className="py-2.5 px-3">Margin</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topEventsByProfit.map(evt => (
                <tr
                  key={evt.id}
                  onClick={() => navigate(`/events/${evt.id}`)}
                  className="hover:bg-amber-50/40 cursor-pointer"
                >
                  <td className="py-3 px-3 font-semibold text-gray-900">
                    <div>{evt.title}</div>
                    <div className="text-[10px] text-gray-400 font-normal">{formatDate(evt.eventDate)} • {evt.venue}</div>
                  </td>
                  <td className="py-3 px-3 font-mono">{formatPKR(evt.packagePrice)}</td>
                  <td className="py-3 px-3 font-mono text-gray-600">{formatPKR(evt.staffCost)}</td>
                  <td className="py-3 px-3 font-mono text-gray-600">{formatPKR(evt.rentalCost)}</td>
                  <td className="py-3 px-3 font-mono text-gray-600">{formatPKR(evt.eventExpenses)}</td>
                  <td className="py-3 px-3 font-mono font-bold">
                    <span className={evt.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                      {formatPKR(evt.netProfit)}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold">
                    <span className={evt.netMargin >= 30 ? 'text-emerald-600' : evt.netMargin >= 0 ? 'text-amber-600' : 'text-rose-600'}>
                      {evt.netMargin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={evt.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
