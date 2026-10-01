import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Event, Client, Invoice, Quotation, AdminProfile, EventDaySchedule, Payment } from '../types';
import { formatPKR, formatDate } from './calculations';
import { INVOICE_LENS_BG } from '../assets/lensDataUrl';

// Draws the crown emblem onto jsPDF at (x, y)
function drawRoyalCrownEmblem(doc: jsPDF, x: number, y: number, scale: number = 0.25): void {
  doc.saveGraphicsState();
  
  // Gold Crown
  doc.setFillColor(212, 168, 67); // Gold #d4a843
  doc.setDrawColor(182, 137, 42); // Border #b6892a
  doc.setLineWidth(0.2);

  // Crown 3 peaks
  doc.triangle(
    x + 3 * scale, y + 10 * scale,
    x + 8 * scale, y + 2 * scale,
    x + 13 * scale, y + 10 * scale,
    'FD'
  );
  doc.triangle(
    x + 11 * scale, y + 10 * scale,
    x + 18 * scale, y + 0 * scale,
    x + 25 * scale, y + 10 * scale,
    'FD'
  );
  doc.triangle(
    x + 23 * scale, y + 10 * scale,
    x + 28 * scale, y + 3 * scale,
    x + 33 * scale, y + 10 * scale,
    'FD'
  );
  doc.rect(x + 3 * scale, y + 10 * scale, 30 * scale, 3 * scale, 'FD');

  // Charcoal R body
  doc.setFillColor(44, 48, 54); // Dark charcoal #2c3036
  doc.rect(x + 5 * scale, y + 14 * scale, 5 * scale, 24 * scale, 'F');
  doc.roundedRect(x + 5 * scale, y + 14 * scale, 16 * scale, 12 * scale, 3 * scale, 3 * scale, 'F');
  doc.setFillColor(253, 251, 247); // inner counter cutout
  doc.roundedRect(x + 10 * scale, y + 17 * scale, 7 * scale, 6 * scale, 1 * scale, 1 * scale, 'F');
  // R diagonal leg
  doc.setFillColor(44, 48, 54);
  doc.triangle(
    x + 11 * scale, y + 24 * scale,
    x + 24 * scale, y + 38 * scale,
    x + 17 * scale, y + 38 * scale,
    'F'
  );

  doc.restoreGraphicsState();
}

export function generateInvoicePDF(
  invoice: Invoice,
  event: Event,
  client: Client,
  profile: AdminProfile,
  daySchedules: EventDaySchedule[] = [],
  paymentsList: Payment[] = []
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Subtle warm background canvas (#fdfbf7)
  doc.setFillColor(253, 251, 247);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Top header system watermark line
  const now = new Date();
  const dateStr = `${now.toLocaleDateString('en-GB')}, ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(156, 163, 175); // gray-400
  doc.text(dateStr, 15, 10);
  doc.text('Royal Studio - Invoice & Quotation System', pageWidth - 15, 10, { align: 'right' });
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.2);
  doc.line(15, 12, pageWidth - 15, 12);

  // CAMERA LENS WATERMARK (Top Right Background)
  try {
    if (INVOICE_LENS_BG) {
      // Draw background camera lens on top-right quadrant
      doc.saveGraphicsState();
      doc.addImage(INVOICE_LENS_BG, 'JPEG', pageWidth - 78, 20, 64, 64, undefined, 'FAST');
      doc.restoreGraphicsState();
    }
  } catch (err) {
    // Non-fatal if image loading fails
  }

  // LOGO & TITLE SECTION (Top Left)
  drawRoyalCrownEmblem(doc, 15, 16, 0.45);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('INVOICE', 35, 26);

  // Subtitle: ROYAL STUDIO — PHOTOGRAPHY & FILMS
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(165, 129, 55); // warm gold/bronze #a58137
  doc.text('R O Y A L   S T U D I O   —   P H O T O G R A P H Y   &   F I L M S', 15, 36);

  // TOP RIGHT STATUS STAMP & METADATA
  const balanceDue = invoice.remainingAmount ?? Math.max(0, invoice.total - (invoice.paidAmount || 0));
  let stampText = 'PARTIALLY PAID';
  let stampBorder = [217, 119, 6]; // amber-600
  let stampFill = [254, 243, 199]; // amber-100
  let stampTextColor = [180, 83, 9]; // amber-800

  if (balanceDue <= 0) {
    stampText = 'PAID IN FULL';
    stampBorder = [22, 163, 74]; // emerald-600
    stampFill = [220, 252, 231]; // emerald-100
    stampTextColor = [21, 128, 61]; // emerald-700
  } else if (!invoice.paidAmount || invoice.paidAmount === 0) {
    stampText = 'UNPAID';
    stampBorder = [225, 29, 72]; // rose-600
    stampFill = [255, 228, 230]; // rose-100
    stampTextColor = [190, 18, 60]; // rose-700
  }

  // Stamp Box
  doc.setDrawColor(stampBorder[0], stampBorder[1], stampBorder[2]);
  doc.setFillColor(stampFill[0], stampFill[1], stampFill[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(pageWidth - 65, 15, 50, 9, 1.5, 1.5, 'FD');
  doc.setTextColor(stampTextColor[0], stampTextColor[1], stampTextColor[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(stampText, pageWidth - 40, 21, { align: 'center' });

  // Document Metadata below stamp
  doc.setTextColor(31, 41, 55); // gray-800
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('No:', pageWidth - 65, 29);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.invoiceNumber, pageWidth - 15, 29, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text('Issue Date:', pageWidth - 65, 34);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(invoice.issueDate), pageWidth - 15, 34, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text('Due Date:', pageWidth - 65, 39);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(invoice.dueDate), pageWidth - 15, 39, { align: 'right' });

  // BILL TO & FROM SECTION
  // BILL TO (Left Column)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(165, 129, 55); // bronze
  doc.text('BILL TO', 15, 49);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(client.name, 15, 54.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(client.phone, 15, 59.5);
  doc.text(`${client.address || event.venue}, ${client.city}`, 15, 64.5);

  // FROM (Right Column)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(165, 129, 55); // bronze
  doc.text('FROM', 105, 49);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(profile.studioName || 'Royal Studio', 105, 54.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`${profile.address || 'Burewala'}, ${profile.city || 'Punjab, Pakistan'}`, 105, 59.5);
  doc.text(profile.phone || '+92 308 4877073', 105, 64.5);

  // EVENT DETAILS BAR TABLE
  autoTable(doc, {
    startY: 70,
    head: [['EVENT', 'DATE', 'TIME', 'VENUE']],
    body: [[
      event.title,
      formatDate(event.eventDate),
      event.startTime || '18:00',
      event.venue
    ]],
    headStyles: {
      fillColor: [11, 23, 42], // Deep navy #0b172a
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 3.5
    },
    bodyStyles: {
      fillColor: [241, 245, 249], // Slate-100 #f1f5f9
      textColor: [15, 23, 42],
      fontSize: 8.5,
      cellPadding: 3.5,
      fontStyle: 'bold'
    },
    theme: 'plain',
    margin: { left: 15, right: 15 }
  });

  const eventTableFinalY = (doc as any).lastAutoTable.finalY || 84;

  // DESCRIPTION & SCOPE ITEMS TABLE
  const itemRows: any[] = [];
  if (event.isMultiDay && daySchedules.length > 0) {
    daySchedules.forEach((day, idx) => {
      itemRows.push([
        `Day ${day.dayNumber || idx + 1}: ${day.eventType} Ceremony Coverage (${day.venue || event.venue})`,
        '1',
        formatPKR(day.customPrice),
        formatPKR(day.customPrice)
      ]);
    });
  } else {
    itemRows.push([
      `${event.category} Premium Photography & Cinema Package (${event.title})`,
      '1',
      formatPKR(invoice.subtotal),
      formatPKR(invoice.subtotal)
    ]);
  }

  autoTable(doc, {
    startY: eventTableFinalY + 4,
    head: [['DESCRIPTION', 'QTY', 'RATE', 'AMOUNT']],
    body: itemRows,
    headStyles: {
      fillColor: [11, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 3.5
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
      textColor: [30, 41, 59],
      fontSize: 8.5,
      cellPadding: 3.5
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
    },
    theme: 'plain',
    margin: { left: 15, right: 15 }
  });

  const itemsTableFinalY = (doc as any).lastAutoTable.finalY || 120;

  // FINANCIAL BREAKDOWN TOTALS (Aligned Right)
  const summaryX = pageWidth - 80;
  let curY = itemsTableFinalY + 6;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal', summaryX, curY);
  doc.text(formatPKR(invoice.subtotal), pageWidth - 15, curY, { align: 'right' });

  if (invoice.discount > 0) {
    curY += 5;
    doc.setTextColor(225, 29, 72); // rose
    doc.text('Discount', summaryX, curY);
    doc.text(`- ${formatPKR(invoice.discount)}`, pageWidth - 15, curY, { align: 'right' });
  }

  if (invoice.tax > 0) {
    curY += 5;
    doc.setTextColor(71, 85, 105);
    doc.text(`Tax (${profile.taxRate || 0}%)`, summaryX, curY);
    doc.text(`+ ${formatPKR(invoice.tax)}`, pageWidth - 15, curY, { align: 'right' });
  }

  // Grand Total Box
  curY += 6;
  doc.setFillColor(226, 232, 240); // slate-200 #e2e8f0
  doc.roundedRect(summaryX - 3, curY - 4.5, 68, 7.5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Grand Total', summaryX, curY);
  doc.text(formatPKR(invoice.total), pageWidth - 15, curY, { align: 'right' });

  // Amount Paid
  curY += 6;
  doc.setFontSize(9);
  doc.setTextColor(22, 101, 52); // emerald-700
  doc.text('Amount Paid', summaryX, curY);
  doc.text(formatPKR(invoice.paidAmount), pageWidth - 15, curY, { align: 'right' });

  // Balance Due
  curY += 6;
  doc.setTextColor(190, 18, 60); // rose-700
  doc.setFont('helvetica', 'bold');
  doc.text('Balance Due', summaryX, curY);
  doc.text(formatPKR(balanceDue), pageWidth - 15, curY, { align: 'right' });

  // PAYMENT HISTORY (Left Side or Below Totals)
  let sectionY = curY + 10;

  // Header: PAYMENT HISTORY
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(165, 129, 55); // bronze
  doc.text('PAYMENT HISTORY', 15, sectionY);

  sectionY += 4;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);

  const displayPayments = paymentsList.length > 0 ? paymentsList : [];
  if (displayPayments.length > 0) {
    const boxHeight = Math.max(14, displayPayments.length * 6 + 4);
    doc.roundedRect(15, sectionY, pageWidth - 30, boxHeight, 1.5, 1.5, 'FD');

    let payRowY = sectionY + 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(31, 41, 55);

    displayPayments.forEach(p => {
      const lineLeft = `${formatDate(p.paymentDate)} — ${p.method} (${p.notes || p.reference || 'Advance payment'})`;
      doc.text(lineLeft, 19, payRowY);
      doc.text(formatPKR(p.amount), pageWidth - 19, payRowY, { align: 'right' });
      payRowY += 5.5;
    });
    sectionY += boxHeight + 6;
  } else {
    doc.roundedRect(15, sectionY, pageWidth - 30, 9, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('No payment transactions recorded yet for this invoice.', 19, sectionY + 5.5);
    sectionY += 15;
  }

  // PAYMENT METHOD & BANK INFO
  const bankY = sectionY;

  // PAYMENT METHOD
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(165, 129, 55);
  doc.text('PAYMENT METHOD', 15, bankY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.paymentTerms || 'Bank Transfer', 15, bankY + 5);

  // BANK / ACCOUNT INFO
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(165, 129, 55);
  doc.text('BANK / ACCOUNT INFO', 105, bankY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('Account Title:', 105, bankY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(profile.accountTitle || 'Royal Studio', 128, bankY + 5);

  doc.setFont('helvetica', 'bold');
  doc.text('Bank:', 105, bankY + 9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(profile.bankName || 'Meezan Bank / HBL', 128, bankY + 9.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Account No:', 105, bankY + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(profile.accountNumber || profile.iban || '—', 128, bankY + 14);

  // TERMS & NOTES
  const termsY = bankY + 21;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(165, 129, 55);
  doc.text('TERMS & NOTES', 15, termsY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const termsText = profile.paymentTerms ||
    '50% advance required to confirm booking. Balance due before final delivery. Edited files delivered within 15-20 working days.';
  const splitTerms = doc.splitTextToSize(termsText, pageWidth - 30);
  doc.text(splitTerms, 15, termsY + 4.5);

  // CENTERED FOOTER
  const footerY = pageHeight - 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(156, 163, 175);
  doc.text('Thank you for choosing Royal Studio.', pageWidth / 2, footerY, { align: 'center' });

  // Bottom page number / footer link
  doc.setFontSize(7);
  doc.text(`file:///RoyalStudio/invoices/${invoice.invoiceNumber}.pdf`, 15, pageHeight - 8);
  doc.text('1/1', pageWidth - 15, pageHeight - 8, { align: 'right' });

  doc.save(`${invoice.invoiceNumber}_${client.name.replace(/\s+/g, '_')}.pdf`);
}

export function generateQuotationPDF(
  quotation: Quotation,
  event: Event,
  client: Client,
  profile: AdminProfile,
  daySchedules: EventDaySchedule[] = []
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Subtle warm background canvas (#fdfbf7)
  doc.setFillColor(253, 251, 247);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Top header system watermark line
  const now = new Date();
  const dateStr = `${now.toLocaleDateString('en-GB')}, ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(156, 163, 175);
  doc.text(dateStr, 15, 10);
  doc.text('Royal Studio - Invoice & Quotation System', pageWidth - 15, 10, { align: 'right' });
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.2);
  doc.line(15, 12, pageWidth - 15, 12);

  // CAMERA LENS WATERMARK (Top Right Background)
  try {
    if (INVOICE_LENS_BG) {
      doc.saveGraphicsState();
      doc.addImage(INVOICE_LENS_BG, 'JPEG', pageWidth - 78, 20, 64, 64, undefined, 'FAST');
      doc.restoreGraphicsState();
    }
  } catch (err) {
    // Non-fatal
  }

  // LOGO & TITLE SECTION (Top Left)
  drawRoyalCrownEmblem(doc, 15, 16, 0.45);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('QUOTATION', 35, 26);

  // Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(165, 129, 55); // bronze
  doc.text('R O Y A L   S T U D I O   —   P H O T O G R A P H Y   &   F I L M S', 15, 36);

  // TOP RIGHT STATUS STAMP & METADATA
  doc.setDrawColor(217, 119, 6); // amber-600
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setLineWidth(0.6);
  doc.roundedRect(pageWidth - 65, 15, 50, 9, 1.5, 1.5, 'FD');
  doc.setTextColor(180, 83, 9); // amber-800
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL PROPOSAL', pageWidth - 40, 21, { align: 'center' });

  // Document Metadata below stamp
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('No:', pageWidth - 65, 29);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.quotationNumber, pageWidth - 15, 29, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text('Issue Date:', pageWidth - 65, 34);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(quotation.issueDate), pageWidth - 15, 34, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text('Valid Until:', pageWidth - 65, 39);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(quotation.validUntil), pageWidth - 15, 39, { align: 'right' });

  // BILL TO & FROM SECTION
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(165, 129, 55);
  doc.text('PROPOSAL PREPARED FOR', 15, 49);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(client.name, 15, 54.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(client.phone, 15, 59.5);
  doc.text(`${client.address || event.venue}, ${client.city}`, 15, 64.5);

  // FROM
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(165, 129, 55);
  doc.text('FROM', 105, 49);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(profile.studioName || 'Royal Studio', 105, 54.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`${profile.address || 'Burewala'}, ${profile.city || 'Punjab, Pakistan'}`, 105, 59.5);
  doc.text(profile.phone || '+92 308 4877073', 105, 64.5);

  // EVENT DETAILS BAR TABLE
  autoTable(doc, {
    startY: 70,
    head: [['EVENT', 'DATE', 'TIME', 'VENUE']],
    body: [[
      event.title,
      formatDate(event.eventDate),
      event.startTime || '18:00',
      event.venue
    ]],
    headStyles: {
      fillColor: [11, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 3.5
    },
    bodyStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontSize: 8.5,
      cellPadding: 3.5,
      fontStyle: 'bold'
    },
    theme: 'plain',
    margin: { left: 15, right: 15 }
  });

  const eventTableFinalY = (doc as any).lastAutoTable.finalY || 84;

  // DESCRIPTION & SCOPE ITEMS TABLE
  const itemRows: any[] = [];
  if (event.isMultiDay && daySchedules.length > 0) {
    daySchedules.forEach((day, idx) => {
      itemRows.push([
        `Day ${day.dayNumber || idx + 1}: ${day.eventType} Ceremony Coverage (${day.venue || event.venue})`,
        '1',
        formatPKR(day.customPrice),
        formatPKR(day.customPrice)
      ]);
    });
  } else {
    itemRows.push([
      `${event.category} Premium Photography & Cinema Package (${event.title})`,
      '1',
      formatPKR(quotation.subtotal),
      formatPKR(quotation.subtotal)
    ]);
  }

  autoTable(doc, {
    startY: eventTableFinalY + 4,
    head: [['DESCRIPTION', 'QTY', 'RATE', 'AMOUNT']],
    body: itemRows,
    headStyles: {
      fillColor: [11, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 3.5
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
      textColor: [30, 41, 59],
      fontSize: 8.5,
      cellPadding: 3.5
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
    },
    theme: 'plain',
    margin: { left: 15, right: 15 }
  });

  const itemsTableFinalY = (doc as any).lastAutoTable.finalY || 120;

  // FINANCIAL BREAKDOWN TOTALS (Aligned Right)
  const summaryX = pageWidth - 80;
  let curY = itemsTableFinalY + 6;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal', summaryX, curY);
  doc.text(formatPKR(quotation.subtotal), pageWidth - 15, curY, { align: 'right' });

  if (quotation.discount > 0) {
    curY += 5;
    doc.setTextColor(225, 29, 72);
    doc.text('Discount', summaryX, curY);
    doc.text(`- ${formatPKR(quotation.discount)}`, pageWidth - 15, curY, { align: 'right' });
  }

  if (quotation.tax > 0) {
    curY += 5;
    doc.setTextColor(71, 85, 105);
    doc.text(`Tax (${profile.taxRate || 0}%)`, summaryX, curY);
    doc.text(`+ ${formatPKR(quotation.tax)}`, pageWidth - 15, curY, { align: 'right' });
  }

  // Grand Total Box
  curY += 6;
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(summaryX - 3, curY - 4.5, 68, 7.5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Quoted Investment', summaryX, curY);
  doc.text(formatPKR(quotation.total), pageWidth - 15, curY, { align: 'right' });

  // PAYMENT TERMS & CONDITIONS
  const termsY = curY + 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(165, 129, 55);
  doc.text('BOOKING TERMS & SCHEDULE', 15, termsY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('50% advance required upon contract signing to lock crew and date.', 15, termsY + 5);
  doc.text('Remaining balance payable prior to final deliverables delivery.', 15, termsY + 9.5);

  // BANK DETAILS FOR DEPOSIT
  const bankY = termsY + 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(165, 129, 55);
  doc.text('BANK / WIRE TRANSFER FOR ADVANCE', 15, bankY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Account Title: ${profile.accountTitle || 'Royal Studio'} | Bank: ${profile.bankName || 'Meezan Bank'} | Account: ${profile.accountNumber || profile.iban || '—'}`, 15, bankY + 5);

  // CENTERED FOOTER
  const footerY = pageHeight - 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(156, 163, 175);
  doc.text('Thank you for considering Royal Studio. We Capture Your Memories!', pageWidth / 2, footerY, { align: 'center' });

  // Bottom page link
  doc.setFontSize(7);
  doc.text(`file:///RoyalStudio/quotations/${quotation.quotationNumber}.pdf`, 15, pageHeight - 8);
  doc.text('1/1', pageWidth - 15, pageHeight - 8, { align: 'right' });

  doc.save(`${quotation.quotationNumber}_${client.name.replace(/\s+/g, '_')}.pdf`);
}
