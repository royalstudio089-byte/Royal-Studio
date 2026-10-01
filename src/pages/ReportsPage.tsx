import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Camera,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { useStudioData } from '../context/StudioDataContext';
import { formatPKR, formatDate } from '../utils/calculations';
import { exportToCSV } from '../utils/csvExporter';

export const ReportsPage: React.FC = () => {
  const {
    events,
    clients,
    teamMembers,
    teamAssignments,
    equipment,
    invoices,
    payments,
    eventExpenses,
    studioExpenses
  } = useStudioData();

  const [selectedYear, setSelectedYear] = useState('2026');

  // Filter events for the year (excluding cancelled)
  const yearEvents = events.filter(e => {
    return e.status !== 'Cancelled' && (e.eventDate || '').startsWith(selectedYear);
  });

  const yearRevenue = yearEvents.reduce((sum, e) => sum + (e.totalClientPayments || 0), 0);
  const yearProfit = yearEvents.reduce((sum, e) => sum + (e.netProfit || 0), 0);
  const yearStaffCosts = yearEvents.reduce((sum, e) => sum + (e.staffCost || 0), 0);
  const yearGearCosts = yearEvents.reduce((sum, e) => sum + (e.rentalCost || 0), 0);
  const yearEventExpenses = yearEvents.reduce((sum, e) => sum + (e.eventExpenses || 0), 0);

  // CSV Export Handlers
  const handleExportEvents = () => {
    const headers = [
      'Event ID', 'Title', 'Client ID', 'Category', 'Wedding Subtype', 'Date',
      'Venue', 'City', 'Status', 'Package Price', 'Staff Cost', 'Rental Cost',
      'Expenses', 'Net Profit', 'Margin %', 'Paid Amount', 'Remaining Balance'
    ];
    const rows = events.map(e => [
      e.id, e.title, e.clientId, e.category, e.weddingSubtype || '', e.eventDate,
      e.venue, e.city, e.status, e.packagePrice, e.staffCost, e.rentalCost,
      e.eventExpenses, e.netProfit, e.netMargin, e.totalClientPayments, e.remainingBalance
    ]);
    exportToCSV('Royal_Studio_Events', headers, rows);
  };

  const handleExportClients = () => {
    const headers = ['Client ID', 'Name', 'Phone', 'WhatsApp', 'Email', 'Address', 'City', 'Created Date'];
    const rows = clients.map(c => [
      c.id, c.name, c.phone, c.whatsapp, c.email, c.address, c.city, c.createdDate
    ]);
    exportToCSV('Royal_Studio_Clients', headers, rows);
  };

  const handleExportTeam = () => {
    const headers = ['Crew ID', 'Name', 'Role', 'Specialization', 'Phone', 'Daily Rate', 'Event Rate', 'Status'];
    const rows = teamMembers.map(m => [
      m.id, m.name, m.role, m.specialization, m.phone, m.dailyRate, m.eventRate, m.availabilityStatus
    ]);
    exportToCSV('Royal_Studio_Team_Roster', headers, rows);
  };

  const handleExportPayments = () => {
    const headers = ['Payment ID', 'Event ID', 'Amount', 'Date', 'Method', 'Reference', 'Notes'];
    const rows = payments.map(p => [
      p.paymentId, p.eventId, p.amount, p.paymentDate, p.method, p.reference, p.notes
    ]);
    exportToCSV('Royal_Studio_Payments', headers, rows);
  };

  const handleExportInvoices = () => {
    const headers = ['Invoice Number', 'Client ID', 'Event ID', 'Issue Date', 'Due Date', 'Total', 'Paid', 'Remaining', 'Status'];
    const rows = invoices.map(i => [
      i.invoiceNumber, i.clientId, i.eventId, i.issueDate, i.dueDate, i.total, i.paidAmount, i.remainingAmount, i.status
    ]);
    exportToCSV('Royal_Studio_Invoices', headers, rows);
  };

  const handleExportAll = () => {
    handleExportEvents();
    setTimeout(handleExportInvoices, 300);
    setTimeout(handleExportPayments, 600);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Studio Reports & CSV Data Exports</h2>
          <p className="text-xs text-gray-500">
            Yearly performance, margin auditing, crew compensation metrics, and clean CSV data downloads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 shadow-xs"
          >
            <option value="2026">Financial Year 2026</option>
            <option value="2025">Financial Year 2025</option>
            <option value="2024">Financial Year 2024</option>
          </select>
        </div>
      </div>

      {/* Yearly Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase">Yearly Collected Revenue</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{formatPKR(yearRevenue)}</div>
          <div className="text-[11px] text-gray-500 mt-1">{yearEvents.length} events completed / scheduled</div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase">Yearly Net Profit</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{formatPKR(yearProfit)}</div>
          <div className="text-[11px] text-gray-500 mt-1">
            Margin: {yearRevenue > 0 ? ((yearProfit / yearRevenue) * 100).toFixed(1) : 0}%
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase">Staff & Crew Disbursals</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{formatPKR(yearStaffCosts)}</div>
          <div className="text-[11px] text-gray-500 mt-1">Total talent compensation</div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase">Gear & Field Logistics</div>
          <div className="text-2xl font-black text-purple-600 mt-1">{formatPKR(yearGearCosts + yearEventExpenses)}</div>
          <div className="text-[11px] text-gray-500 mt-1">Rentals + fuel + catering</div>
        </div>
      </div>

      {/* CSV Export Hub (Section 32) */}
      <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide">
              Official CSV Data Export Center
            </h3>
            <p className="text-xs text-gray-500">
              Download clean spreadsheets with column headers for auditing or external bookkeeping.
            </p>
          </div>
          <button
            onClick={handleExportAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Everything Bundle</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handleExportEvents}
            className="p-4 bg-gray-50 hover:bg-amber-50 border border-gray-200 hover:border-amber-400 rounded-xl text-left transition-all group cursor-pointer"
          >
            <FileSpreadsheet className="w-5 h-5 text-gray-500 group-hover:text-amber-600 mb-2" />
            <div className="font-bold text-xs text-gray-900">Events & Bookings CSV</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Financials, margins, venues</div>
          </button>

          <button
            onClick={handleExportClients}
            className="p-4 bg-gray-50 hover:bg-amber-50 border border-gray-200 hover:border-amber-400 rounded-xl text-left transition-all group cursor-pointer"
          >
            <FileSpreadsheet className="w-5 h-5 text-gray-500 group-hover:text-amber-600 mb-2" />
            <div className="font-bold text-xs text-gray-900">Client Directory CSV</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Contacts, addresses, cities</div>
          </button>

          <button
            onClick={handleExportTeam}
            className="p-4 bg-gray-50 hover:bg-amber-50 border border-gray-200 hover:border-amber-400 rounded-xl text-left transition-all group cursor-pointer"
          >
            <FileSpreadsheet className="w-5 h-5 text-gray-500 group-hover:text-amber-600 mb-2" />
            <div className="font-bold text-xs text-gray-900">Production Crew CSV</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Roster, roles, event rates</div>
          </button>

          <button
            onClick={handleExportInvoices}
            className="p-4 bg-gray-50 hover:bg-amber-50 border border-gray-200 hover:border-amber-400 rounded-xl text-left transition-all group cursor-pointer"
          >
            <FileSpreadsheet className="w-5 h-5 text-gray-500 group-hover:text-amber-600 mb-2" />
            <div className="font-bold text-xs text-gray-900">Invoices & Receivables CSV</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Due dates, paid & balances</div>
          </button>
        </div>
      </div>
    </div>
  );
};
