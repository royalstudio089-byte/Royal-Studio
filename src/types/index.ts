export type Role = 'ADMIN' | 'STAFF';

export type UserStatus = 'ACTIVE' | 'DISABLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  avatar?: string;
  password?: string;
  status: UserStatus;
  linkedTeamMemberId?: string;
  createdDate?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  notes: string;
  createdDate: string;
  createdBy: string;
}

export type EventCategory = 
  | 'Wedding'
  | 'Birthday'
  | 'Nikah'
  | 'Corporate'
  | 'Concert'
  | 'Engagement'
  | 'Bridal Shower'
  | 'Other';

export type WeddingSubtype =
  | 'Mehndi'
  | 'Barat'
  | 'Walima'
  | 'Nikah'
  | 'Engagement'
  | 'Other';

export type EventStatus =
  | 'Inquiry'
  | 'Quotation Sent'
  | 'Confirmed'
  | 'Shoot Scheduled'
  | 'Shoot Done'
  | 'Editing'
  | 'Delivered'
  | 'Completed'
  | 'Cancelled';

export interface EventDaySchedule {
  id: string;
  eventId: string;
  dayNumber: number;
  date: string;
  eventType: string; // e.g. Mehndi, Barat, Walima
  venue: string;
  startTime: string;
  endTime: string;
  callTime: string;
  dressCode: string;
  notes: string;
  standardPackageId?: string;
  customPrice: number;
}

export interface Event {
  id: string;
  clientId: string;
  title: string;
  category: EventCategory;
  weddingSubtype?: WeddingSubtype;
  packageId?: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  city: string;
  status: EventStatus;
  packagePrice: number;
  advancePaid: number;
  discount: number;
  tax: number;
  notes: string;
  createdBy: string;
  createdDate: string;
  updatedDate: string;
  isMultiDay: boolean;

  // Cached calculated financials
  staffCost: number;
  rentalCost: number;
  eventExpenses: number;
  netProfit: number;
  netMargin: number;
  totalClientPayments: number;
  remainingBalance: number;
}

export interface Package {
  id: string;
  name: string;
  category: EventCategory;
  description: string;
  price: number;
  duration: string; // e.g. '8 Hours' or '3 Days'
  requiredPhotographers: number;
  requiredVideographers: number;
  requiredDroneOperators: number;
  requiredAssistants: number;
  includedServices: string[];
  deliverables: string[];
  isActive: boolean;
}

export type TeamRole =
  | 'Photographer'
  | 'Videographer'
  | 'Drone Operator'
  | 'Editor'
  | 'Assistant'
  | 'Album Designer'
  | 'Manager'
  | 'Other';

export type AvailabilityStatus = 'Available' | 'Busy' | 'On Leave' | 'Inactive';

export interface TeamMember {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  role: TeamRole;
  specialization: string;
  dailyRate: number;
  eventRate: number;
  availabilityStatus: AvailabilityStatus;
  isActive: boolean;
  joiningDate: string;
  notes: string;
  hasLogin?: boolean;
  userId?: string;
  loginStatus?: UserStatus;
}

export type AssignmentStatus = 'Assigned' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface EventTeamAssignment {
  id: string;
  eventId: string;
  teamMemberId: string;
  role: TeamRole;
  date: string;
  hours: number;
  rate: number;
  cost: number;
  notes: string;
  assignmentStatus: AssignmentStatus;
}

export type EquipmentCategory =
  | 'Camera'
  | 'Lens'
  | 'Drone'
  | 'Light'
  | 'Flash'
  | 'Audio'
  | 'Tripod'
  | 'Gimbal'
  | 'Memory Card'
  | 'Other';

export type EquipmentStatus = 'Available' | 'Assigned' | 'Maintenance' | 'Damaged' | 'Retired';

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  brand: string;
  model: string;
  serialNumber: string;
  quantity: number;
  status: EquipmentStatus;
  rentalRate: number;
  purchaseDate: string;
  serviceAfterUses: number;
  currentUsageCount: number;
  notes: string;
}

export interface EventEquipmentAssignment {
  id: string;
  eventId: string;
  equipmentId: string;
  quantity: number;
  rentalRate: number;
  rentalCost: number;
  isCheckedOut: boolean;
  isCheckedIn: boolean;
  notes: string;
}

export interface EquipmentMaintenanceLog {
  id: string;
  equipmentId: string;
  date: string;
  issue: string;
  description: string;
  reportedBy: string;
  cost: number;
  status: 'Pending' | 'In Repair' | 'Completed' | 'Cancelled';
  repairNotes: string;
  completedDate?: string;
}

export type ExpenseCategory =
  | 'Fuel'
  | 'Catering'
  | 'Travel'
  | 'Labour'
  | 'Accommodation'
  | 'Parking'
  | 'Miscellaneous';

export interface EventExpense {
  id: string;
  eventId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  paidBy: string;
  notes: string;
}

export type StudioExpenseCategory =
  | 'Rent'
  | 'Utilities'
  | 'Internet'
  | 'Software'
  | 'Marketing'
  | 'Salaries'
  | 'Repairs'
  | 'Office supplies'
  | 'Transportation'
  | 'Other';

export interface StudioExpense {
  id: string;
  category: StudioExpenseCategory;
  description: string;
  amount: number;
  date: string;
  paymentMethod: string;
  recurring: boolean;
  notes: string;
  createdBy: string;
}

export type InvoiceStatus = 'Unpaid' | 'Partially Paid' | 'Paid' | 'Overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  eventId: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  paymentTerms: string;
  notes: string;
  status: InvoiceStatus;
  createdBy: string;
}

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'JazzCash' | 'EasyPaisa' | 'Other';

export interface Payment {
  id: string;
  paymentId: string;
  eventId: string;
  invoiceId?: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  reference: string;
  notes: string;
  createdBy: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  clientId: string;
  eventId: string;
  issueDate: string;
  validUntil: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentTerms: string;
  notes: string;
  createdBy: string;
}

export type TaskPriority = 'Low' | 'Normal' | 'High' | 'Urgent';
export type TaskStatus = 'Pending' | 'In Progress' | 'Review' | 'Completed' | 'Cancelled';

export interface EventTask {
  id: string;
  eventId: string;
  title: string;
  assigneeId?: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  description: string;
  createdDate: string;
  completedDate?: string;
}

export type TeamPaymentType = 'Event Payment' | 'Salary' | 'Bonus' | 'Advance' | 'Reimbursement' | 'Other';

export interface TeamPayment {
  id: string;
  teamMemberId: string;
  eventId?: string;
  paymentType: TeamPaymentType;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  reference: string;
  notes: string;
  createdBy: string;
}

export interface AdminProfile {
  studioName: string;
  tagline: string;
  description?: string;
  logo: string;
  address: string;
  city: string;
  phone: string;
  phone2?: string;
  whatsapp: string;
  email: string;
  website: string;
  instagram: string;
  facebook: string;
  youtube?: string;
  googleMapsUrl?: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  taxRate: number;
  currency: string;
  quotationPrefix: string;
  invoicePrefix: string;
  paymentTerms: string;
  notificationPreferences: {
    overdueInvoices: boolean;
    urgentTasks: boolean;
    equipmentMaintenance: boolean;
    lowAvailability: boolean;
  };
}

export interface TempHireRecommendation {
  id: string;
  eventId: string;
  requiredStaff: number;
  availableStaff: number;
  shortageCount: number;
  missingRoles: string[];
  suggestedTempMembers: Array<{ role: string; suggestedRate: number; reason: string }>;
  createdAt: string;
}

export interface AIBriefing {
  highlight: string;
  urgentAction: string;
  riskAlert: string;
  opportunity: string;
  todaysTip: string;
  generatedAt: string;
}
