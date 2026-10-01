import {
  Event,
  EventDaySchedule,
  EventExpense,
  EventTeamAssignment,
  EventEquipmentAssignment,
  Payment,
  Invoice,
  InvoiceStatus
} from '../types';

export function calculateEventTotals(
  event: Partial<Event>,
  daySchedules: EventDaySchedule[] = [],
  teamAssignments: EventTeamAssignment[] = [],
  equipmentAssignments: EventEquipmentAssignment[] = [],
  expenses: EventExpense[] = [],
  payments: Payment[] = []
): {
  packagePrice: number;
  staffCost: number;
  rentalCost: number;
  eventExpenses: number;
  grossProfit: number;
  netProfit: number;
  netMargin: number;
  totalClientPayments: number;
  remainingBalance: number;
} {
  // If multi-day and day schedules have custom prices > 0, package price is sum of day prices
  let packagePrice = Number(event.packagePrice || 0);
  if (event.isMultiDay && daySchedules.length > 0) {
    const sumDayPrices = daySchedules.reduce((acc, day) => acc + Number(day.customPrice || 0), 0);
    if (sumDayPrices > 0) {
      packagePrice = sumDayPrices;
    }
  }

  // Calculate staff cost
  const staffCost = teamAssignments.reduce((acc, assignment) => {
    if (assignment.assignmentStatus === 'Cancelled') return acc;
    return acc + Number(assignment.cost || 0);
  }, 0);

  // Calculate rental cost
  const rentalCost = equipmentAssignments.reduce((acc, item) => {
    return acc + (Number(item.quantity || 0) * Number(item.rentalRate || 0));
  }, 0);

  // Calculate event expenses
  const eventExpenses = expenses.reduce((acc, exp) => acc + Number(exp.amount || 0), 0);

  // Gross profit & Net profit
  const grossProfit = packagePrice - staffCost - rentalCost;
  const netProfit = grossProfit - eventExpenses;

  // Net margin % (only calculate when package price > 0)
  const netMargin = packagePrice > 0 ? (netProfit / packagePrice) * 100 : 0;

  // Client payments
  const totalClientPayments = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const remainingBalance = Math.max(0, packagePrice - totalClientPayments);

  return {
    packagePrice,
    staffCost,
    rentalCost,
    eventExpenses,
    grossProfit,
    netProfit,
    netMargin: Number(netMargin.toFixed(1)),
    totalClientPayments,
    remainingBalance
  };
}

export function computeInvoiceStatus(
  invoice: { dueDate: string; total: number },
  paidAmount: number
): InvoiceStatus {
  const total = Number(invoice.total || 0);
  const paid = Number(paidAmount || 0);

  if (paid >= total && total > 0) {
    return 'Paid';
  }
  if (paid > 0 && paid < total) {
    return 'Partially Paid';
  }

  const today = new Date().toISOString().split('T')[0];
  if (invoice.dueDate && invoice.dueDate < today && paid < total) {
    return 'Overdue';
  }

  return 'Unpaid';
}

export function formatPKR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'PKR 0';
  return 'PKR ' + Math.round(amount).toLocaleString('en-PK');
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}
