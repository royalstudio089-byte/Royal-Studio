import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Camera,
  Layers,
  FileText,
  CreditCard,
  Plus,
  Trash2,
  Edit,
  RotateCw,
  Sparkles,
  Download,
  AlertTriangle,
  CheckCircle,
  Copy,
  UserCheck,
  ChevronRight,
  Phone,
  Mail,
  ShieldCheck,
  ArrowLeft,
  Eye
} from 'lucide-react';
import { useStudioData } from '../context/StudioDataContext';
import { useAuth } from '../context/AuthContext';
import { formatPKR, formatDate } from '../utils/calculations';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { generateInvoicePDF, generateQuotationPDF } from '../utils/pdfGenerator';
import { BrandedDocumentView } from '../components/billing/BrandedDocumentView';
import {
  Event,
  EventDaySchedule,
  EventTeamAssignment,
  EventEquipmentAssignment,
  EventExpense,
  EventTask,
  Payment,
  Invoice,
  Quotation,
  TeamRole,
  ExpenseCategory,
  TaskPriority,
  TaskStatus,
  PaymentMethod,
  EventCategory,
  WeddingSubtype,
  EventStatus
} from '../types';

interface EventDetailPageProps {
  eventId: string;
  navigate: (path: string) => void;
  initialEdit?: boolean;
}

export const EventDetailPage: React.FC<EventDetailPageProps> = ({ eventId, navigate, initialEdit = false }) => {
  const {
    events,
    clients,
    daySchedules,
    packages,
    teamMembers,
    teamAssignments,
    equipment,
    equipmentAssignments,
    eventExpenses,
    invoices,
    payments,
    quotations,
    tasks,
    profile,
    updateEvent,
    deleteEvent,
    recalculateEvent,
    autoAssignCrew,
    createDaySchedule,
    updateDaySchedule,
    deleteDaySchedule,
    createTeamAssignment,
    deleteTeamAssignment,
    assignEquipment,
    deleteEquipmentAssignment,
    createExpense,
    deleteExpense,
    createTask,
    updateTask,
    deleteTask,
    createPayment,
    createInvoice,
    createQuotation,
    addToast
  } = useStudioData();

  const { isAdmin } = useAuth();

  const event = events.find(e => e.id === eventId);
  const client = clients.find(c => c.id === event?.clientId);
  const eventDaySchedules = daySchedules.filter(d => d.eventId === eventId);
  const eventCrew = teamAssignments.filter(t => t.eventId === eventId);
  const eventEquip = equipmentAssignments.filter(eq => eq.eventId === eventId);
  const eventExp = eventExpenses.filter(ex => ex.eventId === eventId);
  const eventTasks = tasks.filter(t => t.eventId === eventId);
  const eventPayments = payments.filter(p => p.eventId === eventId);
  const eventInvoices = invoices.filter(i => i.eventId === eventId);
  const eventQuotations = quotations.filter(q => q.eventId === eventId);
  const selectedPackage = packages.find(p => p.id === event?.packageId);

  // Active Tab for Main Area
  const [activeTab, setActiveTab] = useState<'schedule' | 'crew' | 'equipment' | 'expenses' | 'tasks' | 'billing'>('schedule');

  // Modals state
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isCrewModalOpen, setIsCrewModalOpen] = useState(false);
  const [isEquipModalOpen, setIsEquipModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(initialEdit);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<'INVOICE' | 'QUOTATION' | null>(null);

  // Edit Day Schedule state & modal
  const [isEditDayModalOpen, setIsEditDayModalOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<EventDaySchedule | null>(null);
  const [editDayNumber, setEditDayNumber] = useState(1);
  const [editDayDate, setEditDayDate] = useState('');
  const [editDayType, setEditDayType] = useState('Barat');
  const [editDayVenue, setEditDayVenue] = useState('');
  const [editDayStartTime, setEditDayStartTime] = useState('18:00');
  const [editDayEndTime, setEditDayEndTime] = useState('23:30');
  const [editDayCallTime, setEditDayCallTime] = useState('16:30');
  const [editDayDressCode, setEditDayDressCode] = useState('Formal');
  const [editDayNotes, setEditDayNotes] = useState('');
  const [editDayCustomPrice, setEditDayCustomPrice] = useState(100000);
  const [isSavingDay, setIsSavingDay] = useState(false);

  // Day Schedule form
  const [dayNumber, setDayNumber] = useState(eventDaySchedules.length + 1);
  const [dayDate, setDayDate] = useState(event?.eventDate || new Date().toISOString().split('T')[0]);
  const [dayType, setDayType] = useState('Barat');
  const [dayVenue, setDayVenue] = useState(event?.venue || '');
  const [dayStartTime, setDayStartTime] = useState('18:00');
  const [dayEndTime, setDayEndTime] = useState('23:30');
  const [dayCallTime, setDayCallTime] = useState('16:30');
  const [dayDressCode, setDayDressCode] = useState('Formal');
  const [dayNotes, setDayNotes] = useState('');
  const [dayCustomPrice, setDayCustomPrice] = useState(100000);

  // Crew Form
  const [crewMemberId, setCrewMemberId] = useState('');
  const [crewRole, setCrewRole] = useState<TeamRole>('Photographer');
  const [crewHours, setCrewHours] = useState(8);
  const [crewRate, setCrewRate] = useState(12000);

  // Equipment Form
  const [equipId, setEquipId] = useState('');
  const [equipQty, setEquipQty] = useState(1);
  const [equipRate, setEquipRate] = useState(4000);

  // Expense Form
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Fuel');
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState(5000);

  // Task Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(event?.eventDate || new Date().toISOString().split('T')[0]);
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('Normal');
  const [taskDesc, setTaskDesc] = useState('');

  // Payment Form
  const [paymentAmount, setPaymentAmount] = useState(event?.remainingBalance || 50000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Full Edit Event Form States
  const [editClientId, setEditClientId] = useState(event?.clientId || '');
  const [editTitle, setEditTitle] = useState(event?.title || '');
  const [editCategory, setEditCategory] = useState<EventCategory>(event?.category || 'Wedding');
  const [editWeddingSubtype, setEditWeddingSubtype] = useState<WeddingSubtype>(event?.weddingSubtype || 'Barat');
  const [editPackageId, setEditPackageId] = useState(event?.packageId || '');
  const [editPrice, setEditPrice] = useState(event?.packagePrice || 0);
  const [editDate, setEditDate] = useState(event?.eventDate || '');
  const [editStartTime, setEditStartTime] = useState(event?.startTime || '18:00');
  const [editEndTime, setEditEndTime] = useState(event?.endTime || '23:30');
  const [editVenue, setEditVenue] = useState(event?.venue || '');
  const [editCity, setEditCity] = useState(event?.city || 'Lahore');
  const [editStatus, setEditStatus] = useState<EventStatus>(event?.status || 'Confirmed');
  const [editDiscount, setEditDiscount] = useState<number>(event?.discount || 0);
  const [editTax, setEditTax] = useState<number>(event?.tax || 0);
  const [editIsMultiDay, setEditIsMultiDay] = useState<boolean>(!!event?.isMultiDay);
  const [editNotes, setEditNotes] = useState(event?.notes || '');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const populateEditForm = () => {
    if (!event) return;
    setEditClientId(event.clientId);
    setEditTitle(event.title);
    setEditCategory(event.category);
    setEditWeddingSubtype(event.weddingSubtype || 'Barat');
    setEditPackageId(event.packageId || '');
    setEditPrice(event.packagePrice);
    setEditDate(event.eventDate);
    setEditStartTime(event.startTime || '18:00');
    setEditEndTime(event.endTime || '23:30');
    setEditVenue(event.venue || '');
    setEditCity(event.city || 'Lahore');
    setEditStatus(event.status);
    setEditDiscount(event.discount || 0);
    setEditTax(event.tax || 0);
    setEditIsMultiDay(!!event.isMultiDay);
    setEditNotes(event.notes || '');
  };

  React.useEffect(() => {
    if (event) {
      populateEditForm();
    }
  }, [event?.id, initialEdit]);

  const openEditDayModal = (day: EventDaySchedule) => {
    setEditingDay(day);
    setEditDayNumber(day.dayNumber);
    setEditDayDate(day.date);
    setEditDayType(day.eventType);
    setEditDayVenue(day.venue);
    setEditDayStartTime(day.startTime);
    setEditDayEndTime(day.endTime);
    setEditDayCallTime(day.callTime);
    setEditDayDressCode(day.dressCode || '');
    setEditDayNotes(day.notes || '');
    setEditDayCustomPrice(day.customPrice);
    setIsEditDayModalOpen(true);
  };

  const handleUpdateDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDay) return;
    setIsSavingDay(true);
    try {
      await updateDaySchedule(editingDay.id, {
        dayNumber: Number(editDayNumber),
        date: editDayDate,
        eventType: editDayType,
        venue: editDayVenue,
        startTime: editDayStartTime,
        endTime: editDayEndTime,
        callTime: editDayCallTime,
        dressCode: editDayDressCode,
        notes: editDayNotes,
        customPrice: Number(editDayCustomPrice)
      });
      setIsEditDayModalOpen(false);
      addToast('Day schedule updated successfully.');
    } catch (err: any) {
      addToast(err.message || 'Failed to update day schedule', 'error');
    } finally {
      setIsSavingDay(false);
    }
  };

  if (!event) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
        <h3 className="text-base font-bold text-gray-900">Event Not Found</h3>
        <p className="text-xs text-gray-500 mt-1">This event might have been deleted.</p>
        <button
          onClick={() => navigate('/events')}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
        >
          Back to Events
        </button>
      </div>
    );
  }

  // Handlers
  const handleRecalculate = async () => {
    await recalculateEvent(event.id);
  };

  const handleAutoAssign = async () => {
    await autoAssignCrew(event.id);
  };

  const handleAddDay = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDaySchedule({
      eventId: event.id,
      dayNumber: Number(dayNumber),
      date: dayDate,
      eventType: dayType,
      venue: dayVenue,
      startTime: dayStartTime,
      endTime: dayEndTime,
      callTime: dayCallTime,
      dressCode: dayDressCode,
      notes: dayNotes,
      customPrice: Number(dayCustomPrice)
    });
    setIsDayModalOpen(false);
  };

  const handleAddCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crewMemberId) {
      addToast('Please select a team member', 'error');
      return;
    }
    await createTeamAssignment({
      eventId: event.id,
      teamMemberId: crewMemberId,
      role: crewRole,
      date: event.eventDate,
      hours: Number(crewHours),
      rate: Number(crewRate),
      cost: Number(crewRate),
      assignmentStatus: 'Confirmed'
    });
    setIsCrewModalOpen(false);
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipId) {
      addToast('Please select equipment', 'error');
      return;
    }
    await assignEquipment({
      eventId: event.id,
      equipmentId: equipId,
      quantity: Number(equipQty),
      rentalRate: Number(equipRate),
      rentalCost: Number(equipQty) * Number(equipRate)
    });
    setIsEquipModalOpen(false);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await createExpense({
      eventId: event.id,
      category: expCategory,
      description: expDesc,
      amount: Number(expAmount),
      date: event.eventDate
    });
    setIsExpenseModalOpen(false);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
    await createTask({
      eventId: event.id,
      title: taskTitle,
      assigneeId: taskAssignee || undefined,
      dueDate: taskDueDate,
      priority: taskPriority,
      description: taskDesc
    });
    setIsTaskModalOpen(false);
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPayment({
      eventId: event.id,
      amount: Number(paymentAmount),
      method: paymentMethod,
      reference: paymentRef,
      notes: paymentNotes
    });
    setIsPaymentModalOpen(false);
  };

  const handleCreateInvoice = async () => {
    await createInvoice({
      clientId: event.clientId,
      eventId: event.id,
      dueDate: event.eventDate,
      subtotal: event.packagePrice,
      discount: event.discount,
      tax: event.tax,
      paymentTerms: profile?.paymentTerms,
      notes: `Invoice for ${event.title}`
    });
  };

  const handleGenerateInvoicePDF = () => {
    const inv = eventInvoices[0] || {
      id: 'inv-temp',
      invoiceNumber: `RS-INV-${Date.now().toString().slice(-4)}`,
      clientId: event.clientId,
      eventId: event.id,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: event.eventDate,
      subtotal: event.packagePrice,
      discount: event.discount,
      tax: event.tax,
      total: event.packagePrice - event.discount + event.tax,
      paidAmount: event.totalClientPayments,
      remainingAmount: event.remainingBalance,
      paymentTerms: profile?.paymentTerms || '',
      notes: '',
      status: event.remainingBalance === 0 ? 'Paid' : 'Partially Paid',
      createdBy: 'Royal Studio'
    };

    if (client && profile) {
      generateInvoicePDF(inv, event, client, profile, eventDaySchedules, eventPayments);
      addToast('Invoice PDF downloaded successfully.');
    }
  };

  const handleGenerateQuotationPDF = () => {
    const quo = eventQuotations[0] || {
      id: 'quo-temp',
      quotationNumber: `RS-QUO-${Date.now().toString().slice(-4)}`,
      clientId: event.clientId,
      eventId: event.id,
      issueDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal: event.packagePrice,
      discount: event.discount,
      tax: event.tax,
      total: event.packagePrice - event.discount + event.tax,
      paymentTerms: profile?.paymentTerms || '',
      notes: '',
      createdBy: 'Royal Studio'
    };

    if (client && profile) {
      generateQuotationPDF(quo, event, client, profile, eventDaySchedules);
      addToast('Quotation PDF downloaded successfully.');
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editClientId || !editTitle || !editDate) {
      addToast('Client, Title, and Date are required.', 'error');
      return;
    }
    setIsSavingEdit(true);
    try {
      await updateEvent(event.id, {
        clientId: editClientId,
        title: editTitle,
        category: editCategory,
        weddingSubtype: editCategory === 'Wedding' ? editWeddingSubtype : undefined,
        packageId: editPackageId || undefined,
        packagePrice: Number(editPrice),
        eventDate: editDate,
        startTime: editStartTime,
        endTime: editEndTime,
        venue: editVenue,
        city: editCity,
        status: editStatus,
        discount: Number(editDiscount || 0),
        tax: Number(editTax || 0),
        isMultiDay: editIsMultiDay,
        notes: editNotes
      });
      setIsEditEventModalOpen(false);
      addToast('Event parameters updated successfully.');
    } catch (err: any) {
      addToast(err.message || 'Failed to update event', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteConfirm = async () => {
    await deleteEvent(event.id);
    navigate('/events');
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/events')}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
              <StatusBadge status={event.status} />
              <select
                value={event.status}
                onChange={async (e) => {
                  const newStatus = e.target.value as EventStatus;
                  try {
                    await updateEvent(event.id, { status: newStatus });
                    addToast(`Event status updated to "${newStatus}"`);
                  } catch (err: any) {
                    addToast(err.message || 'Failed to update status', 'error');
                  }
                }}
                className="text-xs font-semibold px-2 py-1 rounded-lg border border-gray-300 bg-white text-gray-800 hover:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs cursor-pointer ml-1"
                title="Quick Change Event Status"
              >
                <option value="Inquiry">Inquiry</option>
                <option value="Quotation Sent">Quotation Sent</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Shoot Scheduled">Shoot Scheduled</option>
                <option value="Shoot Done">Shoot Done</option>
                <option value="Editing">Editing</option>
                <option value="Delivered">Delivered</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
              <span>{formatDate(event.eventDate)}</span>
              <span>•</span>
              <span>{event.venue}</span>
              <span>•</span>
              <span className="font-semibold text-amber-700">{client?.name}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              populateEditForm();
              setIsEditEventModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
            title="Edit Event Parameters"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Event</span>
          </button>

          <button
            onClick={handleRecalculate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
            title="Recalculate all financials from crew, gear, and expense line items"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Recalculate</span>
          </button>

          <button
            onClick={() => setPreviewDoc('QUOTATION')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-900 hover:bg-blue-100 transition-colors shadow-2xs cursor-pointer"
            title="Preview Branded Quotation Template"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>Quotation</span>
          </button>

          <button
            onClick={handleGenerateQuotationPDF}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
            title="Download Quotation PDF"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>PDF</span>
          </button>

          <button
            onClick={() => setPreviewDoc('INVOICE')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-lg text-xs font-bold text-amber-950 hover:bg-amber-100 transition-colors shadow-2xs cursor-pointer"
            title="Preview Official Branded Invoice Template"
          >
            <Eye className="w-3.5 h-3.5 text-amber-700" />
            <span>Invoice</span>
          </button>

          <button
            onClick={handleGenerateInvoicePDF}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            title="Download Invoice PDF"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>PDF</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete Event"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Area (Tabs & Panels) + Right Area (Sticky Financial Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Area (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client & Event Info Card */}
          <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase text-gray-400">Client Information</div>
              <div className="text-base font-bold text-gray-900">{client?.name}</div>
              <div className="text-xs text-gray-600 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" /> {client?.phone}
                </span>
                {client?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400" /> {client?.email}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">{client?.address}, {client?.city}</div>
            </div>

            <div className="space-y-1 md:text-right border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-6">
              <div className="text-xs font-bold uppercase text-gray-400">Package Scope</div>
              <div className="text-sm font-bold text-gray-900">{selectedPackage?.name || 'Custom Coverage'}</div>
              <div className="text-xs text-gray-500">
                Duration: {selectedPackage?.duration || '1 Day'} • Category: {event.category}
              </div>
              <button
                onClick={() => {
                  populateEditForm();
                  setIsEditEventModalOpen(true);
                }}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 md:justify-end mt-1 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Event Parameters
              </button>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-gray-200 gap-2 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`pb-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'schedule'
                  ? 'border-amber-500 text-amber-600 font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Multi-Day Schedules ({eventDaySchedules.length})
            </button>
            <button
              onClick={() => setActiveTab('crew')}
              className={`pb-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'crew'
                  ? 'border-amber-500 text-amber-600 font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Assigned Crew ({eventCrew.length})
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`pb-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'equipment'
                  ? 'border-amber-500 text-amber-600 font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Gear & Equipment ({eventEquip.length})
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`pb-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'expenses'
                  ? 'border-amber-500 text-amber-600 font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Field Expenses ({eventExp.length})
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`pb-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'tasks'
                  ? 'border-amber-500 text-amber-600 font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Post-Production Tasks ({eventTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`pb-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'billing'
                  ? 'border-amber-500 text-amber-600 font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Invoices & Payments ({eventPayments.length})
            </button>
          </div>

          {/* TAB 1: SCHEDULE PANEL */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Event Day Schedules</h3>
                  <p className="text-xs text-gray-500">
                    If individual day prices are set, Event Package Price automatically equals the SUM of all day prices.
                  </p>
                </div>
                <button
                  onClick={() => setIsDayModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Day Schedule</span>
                </button>
              </div>

              {eventDaySchedules.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-gray-100">
                  <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No multi-day schedules added yet.</p>
                  <button
                    onClick={() => setIsDayModalOpen(true)}
                    className="mt-3 text-xs font-bold text-amber-600 hover:underline"
                  >
                    + Add Day 1 Schedule
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eventDaySchedules.map((day) => (
                    <div
                      key={day.id}
                      className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900">
                          Day {day.dayNumber}: {day.eventType}
                        </span>
                        <div className="text-xs font-mono font-bold text-gray-900">
                          {formatPKR(day.customPrice)}
                        </div>
                      </div>

                      <div className="text-xs space-y-1 text-gray-600">
                        <div className="font-semibold text-gray-900 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" /> {day.venue}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" /> {formatDate(day.date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>Shoot: {day.startTime} - {day.endTime}</span>
                          <span className="text-amber-700 font-medium">(Call: {day.callTime})</span>
                        </div>
                        {day.dressCode && (
                          <div className="text-[11px] text-gray-500">
                            <strong>Dress Code:</strong> {day.dressCode}
                          </div>
                        )}
                        {day.notes && (
                          <div className="text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded">
                            {day.notes}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => openEditDayModal(day)}
                          className="text-xs text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200 cursor-pointer shadow-2xs"
                          title="Edit Day Schedule Details"
                        >
                          <Edit className="w-3 h-3 text-amber-600" />
                          <span>Edit Day</span>
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => deleteDaySchedule(day.id)}
                            className="text-gray-400 hover:text-rose-600 transition-colors p-1 rounded hover:bg-rose-50 cursor-pointer"
                            title="Remove Day"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CREW PANEL */}
          {activeTab === 'crew' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Assigned Production Crew</h3>
                  <p className="text-xs text-gray-500">
                    Lead photographers, cinematographers, drone pilots, and lighting techs
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAutoAssign}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer shadow-xs"
                    title="Automatically assigns available team members based on package requirements"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Assign Crew</span>
                  </button>
                  <button
                    onClick={() => setIsCrewModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Assign Member</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="py-2.5 px-3">Team Member</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Cost Rate</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {eventCrew.map(assignment => {
                      const member = teamMembers.find(m => m.id === assignment.teamMemberId);
                      return (
                        <tr key={assignment.id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-3 font-semibold text-gray-900">
                            <div>{member?.name || 'Crew Member'}</div>
                            <div className="text-[10px] text-gray-400">{member?.phone}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-[10px] font-medium">
                              {assignment.role}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-gray-600">{formatDate(assignment.date)}</td>
                          <td className="py-3 px-3 font-mono font-bold text-gray-900">
                            {formatPKR(assignment.cost)}
                          </td>
                          <td className="py-3 px-3">
                            <StatusBadge status={assignment.assignmentStatus} size="sm" />
                          </td>
                          <td className="py-3 px-3 text-right">
                            {isAdmin && (
                              <button
                                onClick={() => deleteTeamAssignment(assignment.id)}
                                className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: EQUIPMENT PANEL */}
          {activeTab === 'equipment' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Assigned Equipment & Cameras</h3>
                  <p className="text-xs text-gray-500">
                    Gear check-out and conflict detection prevents double booking
                  </p>
                </div>
                <button
                  onClick={() => setIsEquipModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign Gear</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="py-2.5 px-3">Equipment</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Qty</th>
                      <th className="py-2.5 px-3">Rental Cost</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {eventEquip.map(assignment => {
                      const item = equipment.find(eq => eq.id === assignment.equipmentId);
                      return (
                        <tr key={assignment.id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-3 font-semibold text-gray-900">
                            <div>{item?.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{item?.serialNumber}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px]">
                              {item?.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold">{assignment.quantity}</td>
                          <td className="py-3 px-3 font-mono font-bold text-gray-900">
                            {formatPKR(assignment.rentalCost)}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${assignment.isCheckedOut ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                              {assignment.isCheckedOut ? 'Checked Out' : 'Ready'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {isAdmin && (
                              <button
                                onClick={() => deleteEquipmentAssignment(assignment.id)}
                                className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: EXPENSES PANEL */}
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Event Field Expenses</h3>
                  <p className="text-xs text-gray-500">
                    Fuel, catering, parking, logistics — directly deducted from Net Profit
                  </p>
                </div>
                <button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Expense</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Paid By</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {eventExp.map(exp => (
                      <tr key={exp.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-3 font-semibold text-gray-900">
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-[10px]">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-700">{exp.description}</td>
                        <td className="py-3 px-3 text-gray-500">{exp.paidBy}</td>
                        <td className="py-3 px-3 font-mono font-bold text-rose-600">
                          {formatPKR(exp.amount)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {isAdmin && (
                            <button
                              onClick={() => deleteExpense(exp.id)}
                              className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: TASKS PANEL */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Post-Production Pipeline</h3>
                  <p className="text-xs text-gray-500">
                    Editing, photo retouching, highlight reels, and album deliveries
                  </p>
                </div>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {eventTasks.map(task => {
                  const assignee = teamMembers.find(m => m.id === task.assigneeId);
                  return (
                    <div
                      key={task.id}
                      className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-gray-900">{task.title}</span>
                        <StatusBadge status={task.priority} size="sm" />
                      </div>
                      <p className="text-[11px] text-gray-500">{task.description}</p>
                      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                        <span>Assignee: <strong>{assignee?.name || 'Unassigned'}</strong></span>
                        <span>Due: {formatDate(task.dueDate)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <select
                          value={task.status}
                          onChange={e => updateTask(task.id, { status: e.target.value as TaskStatus })}
                          className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[11px] font-medium"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Review">Review</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        {isAdmin && (
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-gray-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: BILLING & PAYMENTS */}
          {activeTab === 'billing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Client Payments & Invoices</h3>
                  <p className="text-xs text-gray-500">Verified transaction receipts and invoice generation</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewDoc('QUOTATION')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-900 hover:bg-blue-100 shadow-xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>View Quotation Template</span>
                  </button>
                  <button
                    onClick={() => setPreviewDoc('INVOICE')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-lg text-xs font-bold text-amber-950 hover:bg-amber-100 shadow-xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-700" />
                    <span>View Invoice Template</span>
                  </button>
                  <button
                    onClick={handleCreateInvoice}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-xs cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Create Invoice</span>
                  </button>
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 cursor-pointer shadow-xs"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Record Payment</span>
                  </button>
                </div>
              </div>

              {/* Payments List */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="py-2.5 px-3">Receipt / Ref</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {eventPayments.map(pay => (
                      <tr key={pay.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-3 font-semibold text-gray-900">{pay.paymentId}</td>
                        <td className="py-3 px-3 text-gray-600">{formatDate(pay.paymentDate)}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-[10px]">
                            {pay.method}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-600">
                          {formatPKR(pay.amount)}
                        </td>
                        <td className="py-3 px-3 text-gray-500">{pay.notes || pay.reference || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Sticky Financial Summary Card (Section 34) */}
        <div className="space-y-6">
          <div className="sticky top-20 bg-white rounded-2xl border border-gray-200 shadow-lg p-6 space-y-5">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Studio Operational Room
              </div>
              <h3 className="text-base font-bold text-gray-900 mt-0.5">
                Financial Summary
              </h3>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-gray-600">
                <span>Contract Package Price:</span>
                <span className="font-mono font-bold text-gray-900 text-sm">
                  {formatPKR(event.packagePrice)}
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-600">
                <span>Staff & Crew Cost:</span>
                <span className="font-mono text-rose-600">
                  - {formatPKR(event.staffCost)}
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-600">
                <span>Equipment Rental Cost:</span>
                <span className="font-mono text-rose-600">
                  - {formatPKR(event.rentalCost)}
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-600">
                <span>Other Field Expenses:</span>
                <span className="font-mono text-rose-600">
                  - {formatPKR(event.eventExpenses)}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-900">Net Event Profit:</span>
                <span className={`font-mono text-base font-black ${event.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatPKR(event.netProfit)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Net Margin:</span>
                <span className={`font-bold ${event.netMargin >= 30 ? 'text-emerald-600' : event.netMargin >= 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                  {event.netMargin.toFixed(1)}%
                </span>
              </div>

              <div className="border-t border-gray-200 pt-3 flex justify-between items-center text-gray-600">
                <span>Advance / Paid:</span>
                <span className="font-mono font-bold text-emerald-600">
                  {formatPKR(event.totalClientPayments)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">Remaining Balance:</span>
                <span className="font-mono font-bold text-amber-700 text-sm">
                  {formatPKR(event.remainingBalance)}
                </span>
              </div>
            </div>

            {/* Quick Actions List */}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <button
                onClick={() => {
                  populateEditForm();
                  setIsEditEventModalOpen(true);
                }}
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Event Details</span>
              </button>

              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Record Advance / Payment</span>
              </button>

              <button
                onClick={handleAutoAssign}
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Assign Required Crew</span>
              </button>

              <button
                onClick={() => setPreviewDoc('INVOICE')}
                className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-amber-700" />
                <span>View Branded Invoice Template</span>
              </button>

              <button
                onClick={() => setPreviewDoc('QUOTATION')}
                className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>View Branded Quotation Template</span>
              </button>

              <button
                onClick={handleGenerateInvoicePDF}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Download Verified Invoice (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ADD DAY SCHEDULE */}
      <Modal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        title="Add Event Day Schedule (Multi-Day Wedding)"
      >
        <form onSubmit={handleAddDay} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Day Number</label>
              <input
                type="number"
                value={dayNumber}
                onChange={e => setDayNumber(Number(e.target.value))}
                min="1"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Event Type</label>
              <input
                type="text"
                value={dayType}
                onChange={e => setDayType(e.target.value)}
                placeholder="Mehndi / Barat / Walima"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={dayDate}
                onChange={e => setDayDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Custom Day Price (PKR)</label>
              <input
                type="number"
                value={dayCustomPrice}
                onChange={e => setDayCustomPrice(Number(e.target.value))}
                min="0"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Venue</label>
            <input
              type="text"
              value={dayVenue}
              onChange={e => setDayVenue(e.target.value)}
              placeholder="e.g. Royal Palm Fairways Hall"
              required
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Call Time</label>
              <input
                type="time"
                value={dayCallTime}
                onChange={e => setDayCallTime(e.target.value)}
                className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={dayStartTime}
                onChange={e => setDayStartTime(e.target.value)}
                className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={dayEndTime}
                onChange={e => setDayEndTime(e.target.value)}
                className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Dress Code</label>
            <input
              type="text"
              value={dayDressCode}
              onChange={e => setDayDressCode(e.target.value)}
              placeholder="e.g. Traditional Mustard & Green"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
            <textarea
              value={dayNotes}
              onChange={e => setDayNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsDayModalOpen(false)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs"
            >
              Save Schedule
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT DAY SCHEDULE */}
      <Modal
        isOpen={isEditDayModalOpen}
        onClose={() => setIsEditDayModalOpen(false)}
        title={`Edit Day ${editDayNumber} Schedule: ${editDayType}`}
      >
        <form onSubmit={handleUpdateDay} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Day Number</label>
              <input
                type="number"
                value={editDayNumber}
                onChange={e => setEditDayNumber(Number(e.target.value))}
                min="1"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Event Type</label>
              <input
                type="text"
                value={editDayType}
                onChange={e => setEditDayType(e.target.value)}
                placeholder="Mehndi / Barat / Walima"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={editDayDate}
                onChange={e => setEditDayDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Custom Day Price (PKR)</label>
              <input
                type="number"
                value={editDayCustomPrice}
                onChange={e => setEditDayCustomPrice(Number(e.target.value))}
                min="0"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Venue</label>
            <input
              type="text"
              value={editDayVenue}
              onChange={e => setEditDayVenue(e.target.value)}
              placeholder="e.g. Royal Palm Fairways Hall"
              required
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Call Time</label>
              <input
                type="time"
                value={editDayCallTime}
                onChange={e => setEditDayCallTime(e.target.value)}
                className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={editDayStartTime}
                onChange={e => setEditDayStartTime(e.target.value)}
                className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={editDayEndTime}
                onChange={e => setEditDayEndTime(e.target.value)}
                className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Dress Code</label>
            <input
              type="text"
              value={editDayDressCode}
              onChange={e => setEditDayDressCode(e.target.value)}
              placeholder="e.g. Traditional Mustard & Green"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
            <textarea
              value={editDayNotes}
              onChange={e => setEditDayNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditDayModalOpen(false)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingDay}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs cursor-pointer shadow-xs"
            >
              {isSavingDay ? 'Saving Changes...' : 'Save Day Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ASSIGN CREW */}
      <Modal
        isOpen={isCrewModalOpen}
        onClose={() => setIsCrewModalOpen(false)}
        title="Assign Production Crew Member"
      >
        <form onSubmit={handleAddCrew} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Team Member *</label>
            <select
              value={crewMemberId}
              onChange={e => {
                const id = e.target.value;
                setCrewMemberId(id);
                const mem = teamMembers.find(m => m.id === id);
                if (mem) {
                  setCrewRole(mem.role);
                  setCrewRate(mem.eventRate);
                }
              }}
              required
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            >
              <option value="">-- Choose Crew Member --</option>
              {teamMembers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role} - Rate: {formatPKR(m.eventRate)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Role</label>
              <select
                value={crewRole}
                onChange={e => setCrewRole(e.target.value as TeamRole)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              >
                <option value="Photographer">Photographer</option>
                <option value="Videographer">Videographer</option>
                <option value="Drone Operator">Drone Operator</option>
                <option value="Editor">Editor</option>
                <option value="Assistant">Assistant</option>
                <option value="Album Designer">Album Designer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Event Cost / Fee (PKR)</label>
              <input
                type="number"
                value={crewRate}
                onChange={e => setCrewRate(Number(e.target.value))}
                min="0"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCrewModalOpen(false)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-lg text-xs"
            >
              Assign Crew
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ASSIGN EQUIPMENT */}
      <Modal
        isOpen={isEquipModalOpen}
        onClose={() => setIsEquipModalOpen(false)}
        title="Assign Equipment (with Conflict Detection)"
      >
        <form onSubmit={handleAddEquipment} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Select Equipment *</label>
            <select
              value={equipId}
              onChange={e => {
                const id = e.target.value;
                setEquipId(id);
                const item = equipment.find(eq => eq.id === id);
                if (item) {
                  setEquipRate(item.rentalRate);
                }
              }}
              required
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            >
              <option value="">-- Choose Equipment --</option>
              {equipment.map(eq => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} (Available: {eq.quantity}, Rate: {formatPKR(eq.rentalRate)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                value={equipQty}
                onChange={e => setEquipQty(Number(e.target.value))}
                min="1"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Rental Rate (PKR)</label>
              <input
                type="number"
                value={equipRate}
                onChange={e => setEquipRate(Number(e.target.value))}
                min="0"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEquipModalOpen(false)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-lg text-xs"
            >
              Assign Gear
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD EXPENSE */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Record Event Field Expense"
      >
        <form onSubmit={handleAddExpense} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Expense Category</label>
              <select
                value={expCategory}
                onChange={e => setExpCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              >
                <option value="Fuel">Fuel</option>
                <option value="Catering">Catering</option>
                <option value="Travel">Travel</option>
                <option value="Labour">Labour</option>
                <option value="Accommodation">Accommodation</option>
                <option value="Parking">Parking</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (PKR) *</label>
              <input
                type="number"
                value={expAmount}
                onChange={e => setExpAmount(Number(e.target.value))}
                min="1"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description *</label>
            <input
              type="text"
              value={expDesc}
              onChange={e => setExpDesc(e.target.value)}
              placeholder="e.g. PSO Fuel for van & crew meal"
              required
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(false)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-rose-600 text-white font-bold rounded-lg text-xs"
            >
              Save Expense
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD TASK */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Add Post-Production Task"
      >
        <form onSubmit={handleAddTask} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Task Title *</label>
            <input
              type="text"
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              placeholder="e.g. DaVinci Color Grade & Instagram Reel"
              required
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Assignee</label>
              <select
                value={taskAssignee}
                onChange={e => setTaskAssignee(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              >
                <option value="">-- Unassigned --</option>
                {teamMembers.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
              <select
                value={taskPriority}
                onChange={e => setTaskPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={taskDueDate}
              onChange={e => setTaskDueDate(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Task Description</label>
            <textarea
              value={taskDesc}
              onChange={e => setTaskDesc(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-lg text-xs"
            >
              Create Task
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: RECORD PAYMENT */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Client Payment / Advance Deposit"
      >
        <form onSubmit={handleAddPayment} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (PKR) *</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={e => setPaymentAmount(Number(e.target.value))}
                min="1"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="JazzCash">JazzCash</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Reference / Bank Transaction ID</label>
            <input
              type="text"
              value={paymentRef}
              onChange={e => setPaymentRef(e.target.value)}
              placeholder="e.g. TXN-MEEZ-88192"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
            <input
              type="text"
              value={paymentNotes}
              onChange={e => setPaymentNotes(e.target.value)}
              placeholder="Received via Meezan online portal"
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
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
            >
              Confirm Payment
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT EVENT DETAILS */}
      <Modal
        isOpen={isEditEventModalOpen}
        onClose={() => setIsEditEventModalOpen(false)}
        title="Edit Event Parameters"
        maxWidth="2xl"
      >
        <form onSubmit={handleUpdateEvent} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Client *</label>
              <select
                value={editClientId}
                onChange={e => setEditClientId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone} - {c.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Event Category *</label>
              <select
                value={editCategory}
                onChange={e => setEditCategory(e.target.value as EventCategory)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              >
                <option value="Wedding">Wedding</option>
                <option value="Birthday">Birthday</option>
                <option value="Nikah">Nikah</option>
                <option value="Corporate">Corporate</option>
                <option value="Concert">Concert</option>
                <option value="Engagement">Engagement</option>
                <option value="Bridal Shower">Bridal Shower</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Wedding Subtype */}
            {editCategory === 'Wedding' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Wedding Subtype</label>
                <select
                  value={editWeddingSubtype}
                  onChange={e => setEditWeddingSubtype(e.target.value as WeddingSubtype)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                >
                  <option value="Barat">Barat</option>
                  <option value="Mehndi">Mehndi</option>
                  <option value="Walima">Walima</option>
                  <option value="Nikah">Nikah</option>
                  <option value="Engagement">Engagement</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            {/* Package */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Package Template</label>
              <select
                value={editPackageId}
                onChange={e => {
                  const id = e.target.value;
                  setEditPackageId(id);
                  const pkg = packages.find(p => p.id === id);
                  if (pkg) setEditPrice(pkg.price);
                }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              >
                <option value="">-- Custom / None --</option>
                {packages.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {formatPKR(p.price)}
                  </option>
                ))}
              </select>
            </div>

            {/* Agreed Price */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Contract Package Price (PKR) *</label>
              <input
                type="number"
                value={editPrice}
                onChange={e => setEditPrice(Number(e.target.value))}
                min="0"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
              <select
                value={editStatus}
                onChange={e => setEditStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              >
                <option value="Inquiry">Inquiry</option>
                <option value="Quotation Sent">Quotation Sent</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Shoot Scheduled">Shoot Scheduled</option>
                <option value="Shoot Done">Shoot Done</option>
                <option value="Editing">Editing</option>
                <option value="Delivered">Delivered</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Event Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Event Date *</label>
              <input
                type="date"
                value={editDate}
                onChange={e => setEditDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            {/* Timings */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={editStartTime}
                  onChange={e => setEditStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={editEndTime}
                  onChange={e => setEditEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Venue & City */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Venue</label>
              <input
                type="text"
                value={editVenue}
                onChange={e => setEditVenue(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={editCity}
                onChange={e => setEditCity(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            {/* Discount & Tax */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Discount (PKR)</label>
                <input
                  type="number"
                  value={editDiscount}
                  onChange={e => setEditDiscount(Number(e.target.value))}
                  min="0"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tax (PKR)</label>
                <input
                  type="number"
                  value={editTax}
                  onChange={e => setEditTax(Number(e.target.value))}
                  min="0"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            {/* Multi-Day Toggle */}
            <div className="flex items-center gap-3 pt-5">
              <input
                type="checkbox"
                id="editDetailIsMultiDay"
                checked={editIsMultiDay}
                onChange={e => setEditIsMultiDay(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded-xs border-gray-300 focus:ring-amber-500"
              />
              <label htmlFor="editDetailIsMultiDay" className="text-xs font-semibold text-gray-900 cursor-pointer">
                Multi-Day Event System
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Instructions</label>
            <textarea
              value={editNotes}
              onChange={e => setEditNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditEventModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingEdit}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
            >
              {isSavingEdit ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRMATION: DELETE EVENT */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete this Event?"
        message="This action will permanently delete this event, its day schedules, team assignments, equipment bookings, and expense records. This action cannot be undone."
      />

      {/* BRANDED INVOICE & QUOTATION OFFICIAL TEMPLATE MODAL */}
      {previewDoc && client && profile && (
        <BrandedDocumentView
          type={previewDoc}
          invoice={eventInvoices[0] || {
            id: 'inv-preview',
            invoiceNumber: `RS-INV-${event.id.slice(-4).toUpperCase()}`,
            clientId: event.clientId,
            eventId: event.id,
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: event.eventDate,
            subtotal: event.packagePrice,
            discount: event.discount || 0,
            tax: event.tax || 0,
            total: event.packagePrice - (event.discount || 0) + (event.tax || 0),
            paidAmount: event.totalClientPayments || 0,
            remainingAmount: event.remainingBalance || 0,
            paymentTerms: profile?.paymentTerms || 'Bank Transfer / Cash / JazzCash',
            notes: `Invoice for ${event.title}`,
            status: event.remainingBalance === 0 ? 'Paid' : (event.totalClientPayments > 0 ? 'Partially Paid' : 'Unpaid'),
            createdBy: 'Royal Studio'
          }}
          quotation={eventQuotations[0] || {
            id: 'quo-preview',
            quotationNumber: `RS-QUO-${event.id.slice(-4).toUpperCase()}`,
            clientId: event.clientId,
            eventId: event.id,
            issueDate: new Date().toISOString().split('T')[0],
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            subtotal: event.packagePrice,
            discount: event.discount || 0,
            tax: event.tax || 0,
            total: event.packagePrice - (event.discount || 0) + (event.tax || 0),
            paymentTerms: profile?.paymentTerms || '50% advance to confirm booking',
            notes: `Official quotation proposal for ${event.title}`,
            createdBy: 'Royal Studio'
          }}
          event={event}
          client={client}
          profile={profile}
          daySchedules={eventDaySchedules}
          payments={eventPayments}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};
