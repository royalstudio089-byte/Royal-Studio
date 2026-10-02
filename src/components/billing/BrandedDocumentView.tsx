import React, { useRef, useState } from 'react';
import { Download, Printer, X, CheckCircle, Clock, Eye, FileText } from 'lucide-react';
import { Event, Client, Invoice, Quotation, AdminProfile, EventDaySchedule, Payment } from '../../types';
import { formatPKR, formatDate } from '../../utils/calculations';
import { RoyalLogo, RoyalMark } from '../../assets/RoyalBrandAssets';
import { INVOICE_LENS_BG } from '../../assets/lensDataUrl';
import { generateInvoicePDF, generateQuotationPDF } from '../../utils/pdfGenerator';

interface BrandedDocumentViewProps {
  type: 'INVOICE' | 'QUOTATION';
  invoice?: Invoice;
  quotation?: Quotation;
  event: Event;
  client: Client;
  profile: AdminProfile;
  daySchedules?: EventDaySchedule[];
  payments?: Payment[];
  onClose: () => void;
}

export const BrandedDocumentView: React.FC<BrandedDocumentViewProps> = ({
  type,
  invoice,
  quotation,
  event,
  client,
  profile,
  daySchedules = [],
  payments = [],
  onClose
}) => {
  const printContainerRef = useRef<HTMLDivElement>(null);
  const [activeDocType, setActiveDocType] = useState<'INVOICE' | 'QUOTATION'>(type);

  const isInvoice = activeDocType === 'INVOICE';
  const docNumber = isInvoice
    ? (invoice?.invoiceNumber || `RS-INV-${event.id.slice(-4).toUpperCase()}`)
    : (quotation?.quotationNumber || `RS-QUO-${event.id.slice(-4).toUpperCase()}`);
  const issueDate = isInvoice
    ? (invoice?.issueDate || event.createdDate?.split('T')[0] || new Date().toISOString().split('T')[0])
    : (quotation?.issueDate || event.createdDate?.split('T')[0] || new Date().toISOString().split('T')[0]);
  const secondaryDate = isInvoice
    ? (invoice?.dueDate || event.eventDate)
    : (quotation?.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const secondaryLabel = isInvoice ? 'Due Date' : 'Valid Until';

  const subtotal = isInvoice ? (invoice?.subtotal || event.packagePrice) : (quotation?.subtotal || event.packagePrice);
  const discount = isInvoice ? (invoice?.discount || event.discount || 0) : (quotation?.discount || event.discount || 0);
  const tax = isInvoice ? (invoice?.tax || event.tax || 0) : (quotation?.tax || event.tax || 0);
  const grandTotal = isInvoice ? (invoice?.total || subtotal - discount + tax) : (quotation?.total || subtotal - discount + tax);
  const amountPaid = isInvoice ? (invoice?.paidAmount || event.totalClientPayments || 0) : 0;
  const balanceDue = isInvoice ? (invoice?.remainingAmount ?? Math.max(0, grandTotal - amountPaid)) : grandTotal;

  // Status Stamp
  let stampText = 'OFFICIAL PROPOSAL';
  let stampColor = 'border-amber-700 text-amber-900 bg-amber-100/80';
  if (isInvoice) {
    if (balanceDue <= 0) {
      stampText = 'PAID IN FULL';
      stampColor = 'border-emerald-600 text-emerald-800 bg-emerald-50';
    } else if (amountPaid > 0) {
      stampText = 'PARTIALLY PAID';
      stampColor = 'border-amber-600 text-amber-800 bg-amber-50';
    } else {
      stampText = 'UNPAID';
      stampColor = 'border-rose-600 text-rose-800 bg-rose-50';
    }
  }

  // Items to display
  const items = event.isMultiDay && daySchedules.length > 0
    ? daySchedules.map((d, i) => ({
        desc: `Day ${d.dayNumber || i + 1}: ${d.eventType} Ceremony Coverage (${d.venue || event.venue})`,
        qty: 1,
        rate: d.customPrice,
        amount: d.customPrice
      }))
    : [{
        desc: `${event.category} Premium Photography & Cinema Package (${event.title})`,
        qty: 1,
        rate: subtotal,
        amount: subtotal
      }];

  const relevantPayments = payments.filter(p => p.eventId === event.id || (invoice && p.invoiceId === invoice.id));

  const handleDownloadPDF = () => {
    if (isInvoice) {
      const invToPrint: Invoice = invoice || {
        id: 'inv-dl',
        invoiceNumber: docNumber,
        clientId: client.id,
        eventId: event.id,
        issueDate: issueDate,
        dueDate: secondaryDate,
        subtotal: subtotal,
        discount: discount,
        tax: tax,
        total: grandTotal,
        paidAmount: amountPaid,
        remainingAmount: balanceDue,
        paymentTerms: profile.paymentTerms || 'Bank Transfer / Cash / JazzCash',
        notes: `Invoice for ${event.title}`,
        status: balanceDue <= 0 ? 'Paid' : (amountPaid > 0 ? 'Partially Paid' : 'Unpaid'),
        createdBy: 'Royal Studio'
      };
      generateInvoicePDF(invToPrint, event, client, profile, daySchedules, relevantPayments);
    } else {
      const quoToPrint: Quotation = quotation || {
        id: 'quo-dl',
        quotationNumber: docNumber,
        clientId: client.id,
        eventId: event.id,
        issueDate: issueDate,
        validUntil: secondaryDate,
        subtotal: subtotal,
        discount: discount,
        tax: tax,
        total: grandTotal,
        paymentTerms: profile.paymentTerms || '50% advance to lock dates and crew',
        notes: `Proposal for ${event.title}`,
        createdBy: 'Royal Studio'
      };
      generateQuotationPDF(quoToPrint, event, client, profile, daySchedules);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white">
      {/* Control Top Bar */}
      <div className="max-w-4xl w-full flex flex-col items-center">
        <div className="w-full flex flex-wrap items-center justify-between pb-3 gap-2 text-white print:hidden">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm tracking-wide text-amber-400 uppercase flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              Royal Studio {activeDocType} Template
            </span>
            <span className="text-xs text-gray-300 font-mono">({docNumber})</span>

            {/* Template Switcher */}
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 ml-2">
              <button
                type="button"
                onClick={() => setActiveDocType('INVOICE')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${activeDocType === 'INVOICE' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-gray-300 hover:text-white'}`}
              >
                Invoice View
              </button>
              <button
                type="button"
                onClick={() => setActiveDocType('QUOTATION')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${activeDocType === 'QUOTATION' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-gray-300 hover:text-white'}`}
              >
                Quotation View
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer border border-slate-600"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CANVAS (Matches Royal Studio official template) */}
        <div
          ref={printContainerRef}
          className="w-full bg-[#fdfbf7] text-slate-900 rounded-xl shadow-2xl border border-amber-900/10 p-6 sm:p-10 relative overflow-hidden font-sans print:shadow-none print:border-none print:p-8 print:w-full print:m-0"
          style={{ minHeight: '1050px' }}
        >
          {/* Header watermark timestamp */}
          <div className="flex justify-between items-center text-[10px] text-gray-400 pb-3 border-b border-gray-200/60 mb-6">
            <span>{new Date().toLocaleDateString('en-GB')}, {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="font-semibold tracking-wider text-slate-500 uppercase">
              Royal Studio — Official {activeDocType}
            </span>
          </div>

          {/* TOP RIGHT BACKGROUND CAMERA LENS WATERMARK */}
          <div className="absolute top-10 right-4 sm:right-8 w-64 h-64 sm:w-72 sm:h-72 opacity-35 pointer-events-none select-none z-0 mix-blend-multiply overflow-hidden rounded-full border-4 border-amber-800/10 shadow-inner">
            <img
              src={INVOICE_LENS_BG || "/invoice_lens_bg.jpg"}
              alt="Royal Studio Camera Lens"
              className="w-full h-full object-cover scale-110 filter contrast-125 brightness-95"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/invoice_lens_bg.jpg";
              }}
            />
          </div>

          {/* HEADER SECTION */}
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
            {/* Left: Document Title, Brand Mark & Tagline */}
            <div>
              <div className="flex items-center gap-3.5 mb-1.5">
                <RoyalMark className="h-12 w-auto shrink-0 text-slate-900" />
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 font-serif">
                    {activeDocType}
                  </h1>
                  <p className="text-[11px] font-bold tracking-[0.2em] text-[#a58137] uppercase">
                    {profile.studioName || 'ROYAL STUDIO'} — PHOTOGRAPHY & FILMS
                  </p>
                </div>
              </div>
              <p className="text-[11px] font-bold tracking-wide italic text-slate-600 pl-1 mt-1">
                "We Capture Your Memories.!"
              </p>
            </div>

            {/* Right: Status Stamp & Document Metadata */}
            <div className="flex flex-col sm:items-end">
              {/* Stamp Badge */}
              <div className={`px-4 py-1 rounded border-2 border-dashed ${stampColor} font-black text-xs uppercase tracking-wider mb-2.5 shadow-2xs rotate-[-2deg]`}>
                {stampText}
              </div>
              <div className="text-xs text-right space-y-0.5">
                <div>
                  <span className="font-bold text-gray-800">No: </span>
                  <span className="font-mono font-semibold text-gray-700">{docNumber}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-800">Issue Date: </span>
                  <span className="text-gray-700">{formatDate(issueDate || '')}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-800">{secondaryLabel}: </span>
                  <span className="text-gray-700">{formatDate(secondaryDate || '')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* BILL TO & FROM SECTION */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 mb-7 pb-4">
            {/* BILL TO */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#a58137] mb-1">
                {isInvoice ? 'BILL TO' : 'PROPOSAL PREPARED FOR'}
              </div>
              <div className="text-sm font-bold text-slate-900">{client.name}</div>
              <div className="text-xs text-slate-600">{client.phone}</div>
              <div className="text-xs text-slate-600">{client.address || event.venue}, {client.city}</div>
            </div>

            {/* FROM */}
            <div className="sm:text-left">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#a58137] mb-1">
                FROM
              </div>
              <div className="text-sm font-bold text-slate-900">{profile.studioName || 'Royal Studio'}</div>
              <div className="text-xs text-slate-600">{profile.address || 'Burewala'}, {profile.city || 'Punjab, Pakistan'}</div>
              <div className="text-xs text-slate-600">{profile.phone || '+92 308 4877073'}</div>
            </div>
          </div>

          {/* EVENT BANNER TABLE */}
          <div className="relative z-10 mb-6 rounded-lg overflow-hidden border border-slate-800/10 shadow-xs">
            <div className="bg-[#0b172a] text-white grid grid-cols-4 px-4 py-2 text-[10px] font-bold uppercase tracking-wider">
              <div>EVENT</div>
              <div>DATE</div>
              <div>TIME</div>
              <div>VENUE</div>
            </div>
            <div className="bg-[#f1f5f9] text-slate-900 grid grid-cols-4 px-4 py-2.5 text-xs font-medium border-t border-slate-200">
              <div className="font-bold text-slate-900">{event.title}</div>
              <div>{formatDate(event.eventDate)}</div>
              <div>{event.startTime || '18:00'}</div>
              <div className="truncate">{event.venue}</div>
            </div>
          </div>

          {/* DESCRIPTION & SCOPE TABLE */}
          <div className="relative z-10 mb-6 rounded-lg overflow-hidden border border-slate-800/10 shadow-xs">
            <div className="bg-[#0b172a] text-white grid grid-cols-12 px-4 py-2 text-[10px] font-bold uppercase tracking-wider">
              <div className="col-span-6">DESCRIPTION & COVERAGE SCOPE</div>
              <div className="col-span-2 text-center">QTY</div>
              <div className="col-span-2 text-right">RATE</div>
              <div className="col-span-2 text-right">AMOUNT</div>
            </div>
            <div className="divide-y divide-gray-200 bg-white">
              {items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-12 px-4 py-3 text-xs text-slate-700 items-center">
                  <div className="col-span-6 font-medium text-slate-900 pr-2">{it.desc}</div>
                  <div className="col-span-2 text-center text-slate-600">{it.qty}</div>
                  <div className="col-span-2 text-right font-mono">{formatPKR(it.rate)}</div>
                  <div className="col-span-2 text-right font-mono font-bold text-slate-900">{formatPKR(it.amount)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* FINANCIAL SUMMARY TOTALS (Aligned Right) */}
          <div className="relative z-10 flex justify-end mb-7">
            <div className="w-full sm:w-80 space-y-1.5 text-xs">
              <div className="flex justify-between py-1 text-slate-600 border-b border-gray-100">
                <span>Subtotal</span>
                <span className="font-mono font-medium">{formatPKR(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between py-1 text-rose-600 border-b border-gray-100">
                  <span>Discount</span>
                  <span className="font-mono font-medium">- {formatPKR(discount)}</span>
                </div>
              )}

              {tax > 0 && (
                <div className="flex justify-between py-1 text-slate-600 border-b border-gray-100">
                  <span>Tax ({profile.taxRate || 0}%)</span>
                  <span className="font-mono font-medium">+ {formatPKR(tax)}</span>
                </div>
              )}

              <div className="flex justify-between py-2 px-3 bg-[#e2e8f0] rounded-md font-bold text-slate-900 text-sm">
                <span>{isInvoice ? 'Grand Total' : 'Quoted Total'}</span>
                <span className="font-mono">{formatPKR(grandTotal)}</span>
              </div>

              {isInvoice && (
                <>
                  <div className="flex justify-between py-1 text-emerald-700 font-bold px-1">
                    <span>Amount Paid</span>
                    <span className="font-mono">{formatPKR(amountPaid)}</span>
                  </div>

                  <div className="flex justify-between py-1 text-rose-600 font-black px-1 text-sm border-t border-gray-200">
                    <span>Balance Due</span>
                    <span className="font-mono">{formatPKR(balanceDue)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* PAYMENT HISTORY SECTION (Only on Invoices) */}
          {isInvoice && (
            <div className="relative z-10 mb-6">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#a58137] mb-1.5">
                PAYMENT HISTORY & ADVANCE LEDGER
              </div>
              <div className="p-3 bg-white rounded-lg border border-gray-200 text-xs divide-y divide-gray-100">
                {relevantPayments.length > 0 ? (
                  relevantPayments.map((p, idx) => (
                    <div key={idx} className="flex justify-between py-1.5 text-slate-700">
                      <div>
                        <span className="font-semibold text-slate-900">{formatDate(p.paymentDate)}</span>
                        <span className="text-gray-400 mx-1.5">—</span>
                        <span className="text-gray-600">{p.method}</span>
                        {p.reference && <span className="text-gray-500 font-mono ml-1.5">({p.reference})</span>}
                        {p.notes && <span className="text-gray-500 italic ml-1.5">• {p.notes}</span>}
                      </div>
                      <div className="font-mono font-bold text-slate-900">{formatPKR(p.amount)}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-500 italic py-1">
                    No client payments recorded yet for this invoice.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PAYMENT METHOD & BANK INFO */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#a58137] mb-1">
                ACCEPTED PAYMENT METHODS
              </div>
              <div className="text-xs text-slate-800 font-medium">
                {profile.paymentTerms || 'Bank Transfer / Cash / JazzCash / EasyPaisa'}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#a58137] mb-1">
                BANK / ACCOUNT INFO FOR DEPOSIT
              </div>
              <div className="text-xs text-slate-700 space-y-0.5">
                <div>
                  <span className="font-semibold text-slate-900">Account Title: </span>
                  <span>{profile.accountTitle || 'Royal Studio'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Bank: </span>
                  <span>{profile.bankName || 'Meezan Bank / HBL'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Account No: </span>
                  <span className="font-mono">{profile.accountNumber || profile.iban || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* TERMS & NOTES */}
          <div className="relative z-10 mb-8 pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#a58137] mb-1">
              TERMS & CONDITIONS
            </div>
            <div className="text-xs text-slate-600 leading-relaxed bg-[#f8fafc] p-3 rounded-lg border border-gray-200/70">
              50% advance deposit required upon contract confirmation to lock dates, camera crew, and equipment. Balance payable before final delivery. Edited highlight reels and albums delivered within 15-20 working days. Unedited raw 4K cinema footage remains studio property until full account settlement.
            </div>
          </div>

          {/* SIGNATURE & AUTHENTICATION SEAL */}
          <div className="relative z-10 grid grid-cols-2 gap-8 pt-6 mb-6 border-t border-gray-200">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#a58137] mb-8">
                CLIENT ACCEPTANCE & SIGNATURE
              </div>
              <div className="border-b border-gray-300 w-48 mb-1"></div>
              <div className="text-xs text-gray-500">{client.name}</div>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#a58137] mb-8">
                AUTHORIZED STUDIO REPRESENTATIVE
              </div>
              <div className="border-b border-gray-300 w-48 mb-1"></div>
              <div className="text-xs font-semibold text-slate-800">
                {profile.studioName || 'Royal Studio'} Official Seal
              </div>
            </div>
          </div>

          {/* CENTERED FOOTER */}
          <div className="relative z-10 pt-4 border-t border-gray-200 text-center text-xs text-gray-500 font-medium">
            Thank you for choosing Royal Studio. We Capture Your Memories!
          </div>

          {/* BOTTOM BRAND EMBLEM */}
          <div className="mt-4 flex flex-col items-center justify-center opacity-90 gap-1">
            <RoyalLogo className="h-12" />
          </div>
        </div>
      </div>
    </div>
  );
};
