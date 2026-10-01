import React, { useState } from 'react';
import {
  FileText,
  Download,
  CreditCard,
  Search,
  Filter,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  Sparkles
} from 'lucide-react';
import { useStudioData } from '../context/StudioDataContext';
import { useAuth } from '../context/AuthContext';
import { formatPKR, formatDate } from '../utils/calculations';
import { StatusBadge } from '../components/common/StatusBadge';
import { generateInvoicePDF, generateQuotationPDF } from '../utils/pdfGenerator';
import { Modal } from '../components/common/Modal';
import { BrandedDocumentView } from '../components/billing/BrandedDocumentView';
import { PaymentMethod, Invoice, Quotation, Event, Client } from '../types';

interface InvoicesPageProps {
  navigate: (path: string) => void;
}

export const InvoicesPage: React.FC<InvoicesPageProps> = ({ navigate }) => {
  const { invoices, quotations, events, clients, daySchedules, payments, profile, createPayment, deleteInvoice, addToast } = useStudioData();
  const { isAdmin } = useAuth();

  const [mainTab, setMainTab] = useState<'invoices' | 'quotations'>('invoices');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Preview Document Modal state
  const [previewDocData, setPreviewDocData] = useState<{
    type: 'INVOICE' | 'QUOTATION';
    invoice?: Invoice;
    quotation?: Quotation;
    event: Event;
    client: Client;
  } | null>(null);

  // Record Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState(50000);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Bank Transfer');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  const filteredInvoices = invoices.filter(inv => {
    const client = clients.find(c => c.id === inv.clientId);
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (client?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredQuotations = quotations.filter(quo => {
    const client = clients.find(c => c.id === quo.clientId);
    const matchesSearch =
      quo.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
      (client?.name || '').toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleDownloadPDF = (inv: any) => {
    const evt = events.find(e => e.id === inv.eventId);
    const cli = clients.find(c => c.id === inv.clientId);
    const schedules = daySchedules.filter(d => d.eventId === inv.eventId);
    const relPayments = payments.filter(p => p.eventId === inv.eventId || p.invoiceId === inv.id);

    if (evt && cli && profile) {
      generateInvoicePDF(inv, evt, cli, profile, schedules, relPayments);
      addToast(`Invoice ${inv.invoiceNumber} PDF downloaded.`);
    } else {
      addToast('Missing event or client information for this invoice.', 'error');
    }
  };

  const handleDownloadQuoPDF = (quo: any) => {
    const evt = events.find(e => e.id === quo.eventId);
    const cli = clients.find(c => c.id === quo.clientId);
    const schedules = daySchedules.filter(d => d.eventId === quo.eventId);

    if (evt && cli && profile) {
      generateQuotationPDF(quo, evt, cli, profile, schedules);
      addToast(`Quotation ${quo.quotationNumber} PDF downloaded.`);
    } else {
      addToast('Missing event or client information for this quotation.', 'error');
    }
  };

  const handleViewInvoice = (inv: Invoice) => {
    const evt = events.find(e => e.id === inv.eventId);
    const cli = clients.find(c => c.id === inv.clientId);
    if (evt && cli) {
      setPreviewDocData({
        type: 'INVOICE',
        invoice: inv,
        event: evt,
        client: cli
      });
    } else {
      addToast('Cannot find associated event or client for preview.', 'error');
    }
  };

  const handleViewQuotation = (quo: Quotation) => {
    const evt = events.find(e => e.id === quo.eventId);
    const cli = clients.find(c => c.id === quo.clientId);
    if (evt && cli) {
      setPreviewDocData({
        type: 'QUOTATION',
        quotation: quo,
        event: evt,
        client: cli
      });
    } else {
      addToast('Cannot find associated event or client for preview.', 'error');
    }
  };

  const handleOpenGeneralPreview = (docType: 'INVOICE' | 'QUOTATION') => {
    const firstEvent = events[0];
    const firstClient = firstEvent ? clients.find(c => c.id === firstEvent.clientId) : clients[0];
    if (firstEvent && firstClient) {
      const firstInvoice = invoices.find(i => i.eventId === firstEvent.id) || invoices[0];
      const firstQuotation = quotations.find(q => q.eventId === firstEvent.id) || quotations[0];
      setPreviewDocData({
        type: docType,
        invoice: firstInvoice,
        quotation: firstQuotation,
        event: firstEvent,
        client: firstClient
      });
    } else {
      addToast('No events available to populate template preview.', 'warning');
    }
  };

  const handleOpenPayment = (inv: any) => {
    setSelectedInvoiceId(inv.id);
    setPayAmount(inv.remainingAmount || 50000);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const inv = invoices.find(i => i.id === selectedInvoiceId);
    if (!inv) return;

    await createPayment({
      eventId: inv.eventId,
      invoiceId: inv.id,
      amount: Number(payAmount),
      method: payMethod,
      reference: payRef,
      notes: payNotes
    });
    setIsPaymentModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Invoices & Quotations Billing Ledger</h2>
          <p className="text-xs text-gray-500">
            Automated tax invoices, proposals, balance tracking, and branded template previews with official lens watermark and logos.
          </p>
        </div>

        {/* Top Quick Preview Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenGeneralPreview('INVOICE')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-lg text-xs font-bold text-amber-950 hover:bg-amber-100 shadow-2xs cursor-pointer transition-colors"
            title="Preview the official branded Invoice template with camera lens background and Royal Studio logos"
          >
            <Eye className="w-3.5 h-3.5 text-amber-700" />
            <span>Invoice Template</span>
          </button>
          <button
            onClick={() => handleOpenGeneralPreview('QUOTATION')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-900 hover:bg-blue-100 shadow-2xs cursor-pointer transition-colors"
            title="Preview the official branded Quotation template with camera lens background and Royal Studio logos"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>Quotation Template</span>
          </button>
        </div>
      </div>

      {/* Main Tabs (Invoices vs Quotations) */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setMainTab('invoices')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            mainTab === 'invoices'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-400" />
          <span>Official Invoices ({filteredInvoices.length})</span>
        </button>

        <button
          onClick={() => setMainTab('quotations')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            mainTab === 'quotations'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-400" />
          <span>Quotations & Proposals ({filteredQuotations.length})</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={mainTab === 'invoices' ? 'Search by invoice number, client...' : 'Search by quotation number, client...'}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
          />
        </div>

        {mainTab === 'invoices' && (
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Overdue">Overdue</option>
          </select>
        )}
      </div>

      {/* TAB 1: INVOICES TABLE */}
      {mainTab === 'invoices' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Client & Event</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Balance Due</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map(inv => {
                  const client = clients.find(c => c.id === inv.clientId);
                  const event = events.find(e => e.id === inv.eventId);
                  return (
                    <tr key={inv.id} className="hover:bg-amber-50/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{inv.invoiceNumber}</td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        <div>{client?.name || 'Client'}</div>
                        <div
                          onClick={() => navigate(`/events/${inv.eventId}`)}
                          className="text-[11px] text-amber-700 hover:underline cursor-pointer"
                        >
                          {event?.title || 'View Event'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 font-medium">{formatDate(inv.dueDate)}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{formatPKR(inv.total)}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-600 font-bold">{formatPKR(inv.paidAmount)}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-600">{formatPKR(inv.remainingAmount)}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={inv.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Template Button */}
                          <button
                            onClick={() => handleViewInvoice(inv)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-[11px] font-bold transition-colors cursor-pointer"
                            title="Preview Official Branded Invoice Template (Lens BG & Logos)"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-700" />
                            <span>View</span>
                          </button>

                          {inv.remainingAmount > 0 && (
                            <button
                              onClick={() => handleOpenPayment(inv)}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded text-[11px] font-semibold cursor-pointer"
                              title="Record Payment"
                            >
                              Pay
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadPDF(inv)}
                            className="p-1.5 text-gray-600 hover:text-slate-950 hover:bg-gray-100 rounded cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => deleteInvoice(inv.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                              title="Delete Invoice"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: QUOTATIONS TABLE */}
      {mainTab === 'quotations' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Quotation #</th>
                  <th className="py-3 px-4">Client & Event</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4">Quoted Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQuotations.map(quo => {
                  const client = clients.find(c => c.id === quo.clientId);
                  const event = events.find(e => e.id === quo.eventId);
                  return (
                    <tr key={quo.id} className="hover:bg-blue-50/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{quo.quotationNumber}</td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        <div>{client?.name || 'Client'}</div>
                        <div
                          onClick={() => quo.eventId && navigate(`/events/${quo.eventId}`)}
                          className="text-[11px] text-blue-700 hover:underline cursor-pointer"
                        >
                          {event?.title || 'View Event'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 font-medium">{formatDate(quo.issueDate)}</td>
                      <td className="py-3.5 px-4 text-gray-600 font-medium">{formatDate(quo.validUntil)}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{formatPKR(quo.total)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewQuotation(quo)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded text-[11px] font-bold transition-colors cursor-pointer"
                            title="Preview Official Branded Quotation Template (Lens BG & Logos)"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleDownloadQuoPDF(quo)}
                            className="p-1.5 text-gray-600 hover:text-slate-950 hover:bg-gray-100 rounded cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Client Payment on Invoice"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (PKR) *</label>
              <input
                type="number"
                value={payAmount}
                onChange={e => setPayAmount(Number(e.target.value))}
                min="1"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Method</label>
              <select
                value={payMethod}
                onChange={e => setPayMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="JazzCash">JazzCash</option>
                <option value="EasyPaisa">EasyPaisa</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Transaction Ref</label>
            <input
              type="text"
              value={payRef}
              onChange={e => setPayRef(e.target.value)}
              placeholder="e.g. TXN-MEEZ-12009"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
            <input
              type="text"
              value={payNotes}
              onChange={e => setPayNotes(e.target.value)}
              placeholder="Received via Meezan corporate portal"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-xs cursor-pointer"
            >
              Confirm Payment
            </button>
          </div>
        </form>
      </Modal>

      {/* BRANDED INVOICE & QUOTATION DOCUMENT PREVIEW MODAL */}
      {previewDocData && profile && (
        <BrandedDocumentView
          type={previewDocData.type}
          invoice={previewDocData.invoice}
          quotation={previewDocData.quotation}
          event={previewDocData.event}
          client={previewDocData.client}
          profile={profile}
          daySchedules={daySchedules.filter(d => d.eventId === previewDocData.event.id)}
          payments={payments.filter(p => p.eventId === previewDocData.event.id || (previewDocData.invoice && p.invoiceId === previewDocData.invoice.id))}
          onClose={() => setPreviewDocData(null)}
        />
      )}
    </div>
  );
};
