import fs from 'fs';
import path from 'path';
import {
  User,
  Client,
  Event,
  EventDaySchedule,
  Package,
  TeamMember,
  EventTeamAssignment,
  Equipment,
  EventEquipmentAssignment,
  EquipmentMaintenanceLog,
  EventExpense,
  StudioExpense,
  Invoice,
  Payment,
  Quotation,
  EventTask,
  TeamPayment,
  AdminProfile,
  TempHireRecommendation
} from '../src/types';
import { calculateEventTotals, computeInvoiceStatus } from '../src/utils/calculations';

export interface DatabaseSchema {
  users: User[];
  profile: AdminProfile;
  clients: Client[];
  events: Event[];
  daySchedules: EventDaySchedule[];
  packages: Package[];
  teamMembers: TeamMember[];
  teamAssignments: EventTeamAssignment[];
  teamPayments: TeamPayment[];
  equipment: Equipment[];
  equipmentAssignments: EventEquipmentAssignment[];
  maintenanceLogs: EquipmentMaintenanceLog[];
  eventExpenses: EventExpense[];
  studioExpenses: StudioExpense[];
  invoices: Invoice[];
  payments: Payment[];
  quotations: Quotation[];
  tasks: EventTask[];
  tempHireRecommendations: TempHireRecommendation[];
}

const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'data') : path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'studio_db.json');

function ensureDirectoryExists() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('Could not create DATA_DIR:', err);
  }
}

function getInitialData(): DatabaseSchema {
  const adminUser: User = {
    id: 'usr-admin',
    name: 'Royal Studio',
    email: 'admin@royalstudio.pk',
    role: 'ADMIN',
    status: 'ACTIVE',
    phone: '+92 308 4877073',
    password: 'admin123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdDate: '2026-01-01T00:00:00.000Z'
  };

  const staffUser: User = {
    id: 'usr-staff',
    name: 'Hamza Tariq',
    email: 'staff@royalstudio.pk',
    role: 'STAFF',
    status: 'ACTIVE',
    linkedTeamMemberId: 'tm-001',
    phone: '+92 321 4455667',
    password: 'staff123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    createdDate: '2026-01-15T00:00:00.000Z'
  };

  const profile: AdminProfile = {
    studioName: 'Royal Studio',
    tagline: 'Luxury wedding photography, cinematic films, and brand shoots.',
    description: 'Luxury wedding photography, cinematic films, and brand shoots.',
    logo: '/royal-logo.svg',
    address: 'Al Jannat Town Entrance, Canal Bungalow Road, Opposite Habib Mall, Burewala, Punjab 61010, Pakistan',
    city: 'Burewala, Punjab, Pakistan',
    phone: '0308-4877073',
    phone2: '0303-2213806',
    whatsapp: '0308-4877073',
    email: 'royalstudio089@gmail.com',
    website: 'https://royalstudio.online',
    instagram: 'https://www.instagram.com/royalstudio089',
    facebook: 'https://www.facebook.com/royalstudio089',
    youtube: 'https://www.youtube.com/@royalstudio089',
    googleMapsUrl: 'https://maps.app.goo.gl/mQPek7wm4nCVjy8o9',
    bankName: 'Meezan Bank Ltd',
    accountTitle: 'Royal Studio',
    accountNumber: '02010103456789',
    iban: 'PK45MEZN0002010103456789',
    taxRate: 5,
    currency: 'PKR',
    quotationPrefix: 'RS-QUO-',
    invoicePrefix: 'RS-INV-',
    paymentTerms: '50% Advance at booking, 30% on main event date, 20% on final deliverable handover.',
    notificationPreferences: {
      overdueInvoices: true,
      urgentTasks: true,
      equipmentMaintenance: true,
      lowAvailability: true
    }
  };

  const clients: Client[] = [
    {
      id: 'cli-001',
      name: 'Tariq Mehmood & Family',
      phone: '+92 300 9876543',
      whatsapp: '+92 300 9876543',
      email: 'tariq.mehmood@example.com',
      address: 'House 14-A, DHA Phase 5',
      city: 'Lahore',
      notes: 'High profile wedding. Require top cinematography and live drone coverage.',
      createdDate: '2026-08-10T10:00:00.000Z',
      createdBy: 'usr-admin'
    },
    {
      id: 'cli-002',
      name: 'Dr. Ayesha Siddiqui',
      phone: '+92 321 5566778',
      whatsapp: '+92 321 5566778',
      email: 'ayesha.siddiqui@example.pk',
      address: 'Sector F-7/2',
      city: 'Islamabad',
      notes: 'Nikah & Reception. Prefers soft pastel aesthetic and candid documentary style.',
      createdDate: '2026-08-15T11:30:00.000Z',
      createdBy: 'usr-admin'
    },
    {
      id: 'cli-003',
      name: 'Nexus Tech Global',
      phone: '+92 42 35789012',
      whatsapp: '+92 333 1122334',
      email: 'events@nexustech.pk',
      address: 'Arfa Software Technology Park, Ferozepur Road',
      city: 'Lahore',
      notes: 'Corporate tech summit and annual award banquet. Fast turnaround needed for PR reels.',
      createdDate: '2026-08-20T14:15:00.000Z',
      createdBy: 'usr-admin'
    },
    {
      id: 'cli-004',
      name: 'Omer Farooq & Hina Sheikh',
      phone: '+92 345 8899001',
      whatsapp: '+92 345 8899001',
      email: 'omer.sheikh@example.com',
      address: 'Clifton Block 4',
      city: 'Karachi',
      notes: 'Beach destination engagement shoot and sunset portraits.',
      createdDate: '2026-09-01T09:40:00.000Z',
      createdBy: 'usr-staff'
    },
    {
      id: 'cli-005',
      name: 'Al-Haram Developers',
      phone: '+92 301 2233445',
      whatsapp: '+92 301 2233445',
      email: 'media@alharamdev.pk',
      address: 'Bahria Town Sector C',
      city: 'Lahore',
      notes: 'Commercial architecture portfolio and aerial 4K video.',
      createdDate: '2026-09-05T16:00:00.000Z',
      createdBy: 'usr-admin'
    }
  ];

  const packages: Package[] = [
    {
      id: 'pkg-001',
      name: 'Royal 3-Day Wedding (Signature)',
      category: 'Wedding',
      description: 'Comprehensive 3-day coverage (Mehndi, Barat, Walima) with multi-cam cinema and aerial drone.',
      price: 370000,
      duration: '3 Days',
      requiredPhotographers: 2,
      requiredVideographers: 2,
      requiredDroneOperators: 1,
      requiredAssistants: 1,
      includedServices: [
        '2 Senior Candid Photographers',
        '2 4K Cinematic Videographers',
        '1 Licensed Drone Pilot',
        '1 Studio Lighting Tech',
        'Color grading & Master edits',
        'Traditional & candid coverage'
      ],
      deliverables: [
        'Luxury Leather Bound Storybook Album (50 pages)',
        '2 Parent Albums',
        'Full 4K Cinematic Highlight Film (5-7 mins)',
        'Full Length Documentary Video (45-60 mins)',
        '3 Instagram Reels / Teasers within 48 hours',
        'All raw & edited high-res digital photos on wooden USB box'
      ],
      isActive: true
    },
    {
      id: 'pkg-002',
      name: 'Standard Single-Day Wedding',
      category: 'Wedding',
      description: 'Full day coverage for Barat or Walima with dual photography and cinematic film.',
      price: 130000,
      duration: '8 Hours',
      requiredPhotographers: 2,
      requiredVideographers: 1,
      requiredDroneOperators: 0,
      requiredAssistants: 1,
      includedServices: [
        '2 Photographers (Candid + Stage)',
        '1 Cinema Videographer',
        '1 Lighting Assistant'
      ],
      deliverables: [
        '1 Premium Flushmount Album (35 pages)',
        'Cinematic Highlight (3-4 mins)',
        'High-res photo gallery with online cloud backup'
      ],
      isActive: true
    },
    {
      id: 'pkg-003',
      name: 'Nikah / Engagement Elegance',
      category: 'Nikah',
      description: 'Intimate ceremony coverage with fine-art portraits.',
      price: 75000,
      duration: '5 Hours',
      requiredPhotographers: 1,
      requiredVideographers: 1,
      requiredDroneOperators: 0,
      requiredAssistants: 1,
      includedServices: ['1 Fine-art Photographer', '1 4K Videographer'],
      deliverables: ['1 Contemporary Album', '3 min Highlight Video', 'Online gallery'],
      isActive: true
    },
    {
      id: 'pkg-004',
      name: 'Corporate Summit & Gala',
      category: 'Corporate',
      description: 'Professional event coverage for conventions, launches, and annual dinners.',
      price: 85000,
      duration: '6 Hours',
      requiredPhotographers: 2,
      requiredVideographers: 1,
      requiredDroneOperators: 0,
      requiredAssistants: 0,
      includedServices: ['Keynote coverage', 'Attendee candid portraits', 'Executive step & repeat'],
      deliverables: ['Same-day press photos', '1 Event Recap Video (2 mins)', 'All processed digital photos'],
      isActive: true
    },
    {
      id: 'pkg-005',
      name: 'Studio Portrait & Commercial Shoot',
      category: 'Other',
      description: 'Controlled studio lights session for fashion, brands, or family portraits.',
      price: 45000,
      duration: '4 Hours',
      requiredPhotographers: 1,
      requiredVideographers: 0,
      requiredDroneOperators: 0,
      requiredAssistants: 1,
      includedServices: ['Master Studio Lighting setup', 'Live tethered monitor review'],
      deliverables: ['25 High-end retouched magazine style frames', 'High-res exports'],
      isActive: true
    }
  ];

  const teamMembers: TeamMember[] = [
    {
      id: 'tm-001',
      name: 'Hamza Tariq',
      phone: '+92 321 4455667',
      whatsapp: '+92 321 4455667',
      email: 'hamza.photo@royalstudio.pk',
      role: 'Photographer',
      specialization: 'Fine-art Bridal & Stage Portraits',
      dailyRate: 12000,
      eventRate: 15000,
      availabilityStatus: 'Available',
      isActive: true,
      joiningDate: '2023-01-15',
      notes: 'Lead photographer with 8+ years experience in high-end Pakistani weddings.'
    },
    {
      id: 'tm-002',
      name: 'Daniyal Raza',
      phone: '+92 333 5566778',
      whatsapp: '+92 333 5566778',
      email: 'daniyal.candid@royalstudio.pk',
      role: 'Photographer',
      specialization: 'Candid Moments & Ambient Light',
      dailyRate: 10000,
      eventRate: 12000,
      availabilityStatus: 'Available',
      isActive: true,
      joiningDate: '2023-06-01',
      notes: 'Expert in street documentary and candid emotional captures.'
    },
    {
      id: 'tm-003',
      name: 'Usman Farooq',
      phone: '+92 300 7788990',
      whatsapp: '+92 300 7788990',
      email: 'usman.cine@royalstudio.pk',
      role: 'Videographer',
      specialization: 'Cinematic Gimbal Movement & Storytelling',
      dailyRate: 14000,
      eventRate: 16000,
      availabilityStatus: 'Available',
      isActive: true,
      joiningDate: '2022-11-10',
      notes: 'Primary director of photography on FX3 and Ronin rigs.'
    },
    {
      id: 'tm-004',
      name: 'Waleed Javed',
      phone: '+92 312 9900112',
      whatsapp: '+92 312 9900112',
      email: 'waleed.video@royalstudio.pk',
      role: 'Videographer',
      specialization: 'Stage Audio & Dual Camera Sync',
      dailyRate: 11000,
      eventRate: 13000,
      availabilityStatus: 'Available',
      isActive: true,
      joiningDate: '2024-02-15',
      notes: 'Second cinema shooter.'
    },
    {
      id: 'tm-005',
      name: 'Shahbaz Ahmed',
      phone: '+92 345 3344556',
      whatsapp: '+92 345 3344556',
      email: 'shahbaz.drone@royalstudio.pk',
      role: 'Drone Operator',
      specialization: 'High Speed Aerial Tracking & Cinematic Reveales',
      dailyRate: 12000,
      eventRate: 14000,
      availabilityStatus: 'Available',
      isActive: true,
      joiningDate: '2023-03-20',
      notes: 'Certified drone pilot for DJI Mavic 3 Cine and Inspire.'
    },
    {
      id: 'tm-006',
      name: 'Kamran Butt',
      phone: '+92 301 6677889',
      whatsapp: '+92 301 6677889',
      email: 'kamran.crew@royalstudio.pk',
      role: 'Assistant',
      specialization: 'Studio Strobes, Off-camera Flash & Rigging',
      dailyRate: 4000,
      eventRate: 5000,
      availabilityStatus: 'Available',
      isActive: true,
      joiningDate: '2024-01-10',
      notes: 'Reliable gear wrangler and boom operator.'
    },
    {
      id: 'tm-007',
      name: 'Zainab Ali',
      phone: '+92 334 2233445',
      whatsapp: '+92 334 2233445',
      email: 'zainab.edit@royalstudio.pk',
      role: 'Editor',
      specialization: 'DaVinci Resolve Color Grading & Teaser Edits',
      dailyRate: 8000,
      eventRate: 8000,
      availabilityStatus: 'Available',
      isActive: true,
      joiningDate: '2022-09-01',
      notes: 'In-house post-production lead.'
    },
    {
      id: 'tm-008',
      name: 'Sarah Sheikh',
      phone: '+92 322 8899112',
      whatsapp: '+92 322 8899112',
      email: 'sarah.design@royalstudio.pk',
      role: 'Album Designer',
      specialization: 'Minimalist Layouts & Typography',
      dailyRate: 6000,
      eventRate: 7000,
      availabilityStatus: 'Available',
      isActive: true,
      joiningDate: '2023-08-01',
      notes: 'Designs luxury Italian & Turkish flushmount books.'
    }
  ];

  const equipment: Equipment[] = [
    {
      id: 'eq-001',
      name: 'Sony Alpha 7 IV Full-Frame Camera',
      category: 'Camera',
      brand: 'Sony',
      model: 'ILCE-7M4',
      serialNumber: 'SN-SNY-9901',
      quantity: 2,
      status: 'Available',
      rentalRate: 5000,
      purchaseDate: '2023-04-12',
      serviceAfterUses: 20,
      currentUsageCount: 22, // Over service threshold -> Service Required warning!
      notes: 'Sensor cleaning and shutter maintenance due.'
    },
    {
      id: 'eq-002',
      name: 'Sony FX3 Cinema Line Camera',
      category: 'Camera',
      brand: 'Sony',
      model: 'ILME-FX3',
      serialNumber: 'SN-FX3-4412',
      quantity: 2,
      status: 'Available',
      rentalRate: 8000,
      purchaseDate: '2023-08-19',
      serviceAfterUses: 20,
      currentUsageCount: 14,
      notes: 'Firmware 4.0 updated with custom S-Cinetone LUTs.'
    },
    {
      id: 'eq-003',
      name: 'Sony FE 24-70mm f/2.8 GM II Lens',
      category: 'Lens',
      brand: 'Sony',
      model: 'SEL2470GM2',
      serialNumber: 'SN-GM-1123',
      quantity: 2,
      status: 'Available',
      rentalRate: 3500,
      purchaseDate: '2023-05-10',
      serviceAfterUses: 25,
      currentUsageCount: 16,
      notes: 'Crisp optics with B+W UV filter.'
    },
    {
      id: 'eq-004',
      name: 'Sony FE 70-200mm f/2.8 GM OSS II Lens',
      category: 'Lens',
      brand: 'Sony',
      model: 'SEL70200GM2',
      serialNumber: 'SN-GM-7788',
      quantity: 1,
      status: 'Available',
      rentalRate: 4500,
      purchaseDate: '2023-09-01',
      serviceAfterUses: 25,
      currentUsageCount: 11,
      notes: 'Ideal for stage candid and telephoto isolation.'
    },
    {
      id: 'eq-005',
      name: 'DJI Mavic 3 Cine Aerial Drone Kit',
      category: 'Drone',
      brand: 'DJI',
      model: 'Mavic 3 Cine (Apple ProRes)',
      serialNumber: 'SN-DJI-8821',
      quantity: 1,
      status: 'Available',
      rentalRate: 9000,
      purchaseDate: '2023-10-15',
      serviceAfterUses: 20,
      currentUsageCount: 9,
      notes: 'Includes 4 intelligent flight batteries and ND filters.'
    },
    {
      id: 'eq-006',
      name: 'Godox AD600 Pro Outdoor Strobe Kit',
      category: 'Light',
      brand: 'Godox',
      model: 'AD600Pro TTL',
      serialNumber: 'SN-GDX-3011',
      quantity: 2,
      status: 'Available',
      rentalRate: 4000,
      purchaseDate: '2023-03-22',
      serviceAfterUses: 30,
      currentUsageCount: 19,
      notes: 'Includes portable softboxes, heavy C-stands and XPro trigger.'
    },
    {
      id: 'eq-007',
      name: 'Rode Wireless PRO Dual Mic System',
      category: 'Audio',
      brand: 'Rode',
      model: 'Wireless PRO 32-bit Float',
      serialNumber: 'SN-ROD-5501',
      quantity: 2,
      status: 'Available',
      rentalRate: 2500,
      purchaseDate: '2024-02-05',
      serviceAfterUses: 30,
      currentUsageCount: 8,
      notes: 'Zero-clipping 32-bit float audio for groom and stage vows.'
    },
    {
      id: 'eq-008',
      name: 'DJI RS 3 Pro Gimbal Stabilizer',
      category: 'Gimbal',
      brand: 'DJI',
      model: 'RS3 Pro Combo',
      serialNumber: 'SN-DJI-2231',
      quantity: 2,
      status: 'Available',
      rentalRate: 3500,
      purchaseDate: '2023-11-12',
      serviceAfterUses: 25,
      currentUsageCount: 15,
      notes: 'With RavenEye image transmitter and focus motor.'
    }
  ];

  const maintenanceLogs: EquipmentMaintenanceLog[] = [
    {
      id: 'mnt-001',
      equipmentId: 'eq-001',
      date: '2026-09-20',
      issue: 'Routine Service & Shutter Calibration Required',
      description: 'Camera passed 20 wedding uses. Sensor has minor dust spots visible above f/8.',
      reportedBy: 'Hamza Tariq',
      cost: 4500,
      status: 'Pending',
      repairNotes: 'Scheduled with official Sony Alpha Service Center in Mall Road, Lahore.'
    }
  ];

  // Realistic Complete Wedding Demo Event (Section 62 Scenario)
  const event1: Event = {
    id: 'evt-001',
    clientId: 'cli-001',
    title: 'Tariq Mehmood & Ayesha Wedding Celebration',
    category: 'Wedding',
    weddingSubtype: 'Barat',
    packageId: 'pkg-001',
    eventDate: '2026-10-15',
    startTime: '18:00',
    endTime: '23:30',
    venue: 'Royal Palm Golf & Country Club / PC Grand Ballroom',
    city: 'Lahore',
    status: 'Confirmed',
    packagePrice: 370000,
    advancePaid: 150000,
    discount: 0,
    tax: 0,
    notes: 'Premier 3-day wedding celebration. Drone clearance approved by venue security.',
    createdBy: 'usr-admin',
    createdDate: '2026-08-11T12:00:00.000Z',
    updatedDate: '2026-09-28T15:30:00.000Z',
    isMultiDay: true,
    staffCost: 88000,
    rentalCost: 32000,
    eventExpenses: 34500,
    netProfit: 215500,
    netMargin: 58.2,
    totalClientPayments: 150000,
    remainingBalance: 220000
  };

  const daySchedules: EventDaySchedule[] = [
    {
      id: 'day-001',
      eventId: 'evt-001',
      dayNumber: 1,
      date: '2026-10-14',
      eventType: 'Mehndi',
      venue: 'Royal Palm Fairways Hall, Lahore',
      startTime: '19:00',
      endTime: '23:30',
      callTime: '17:30',
      dressCode: 'Traditional Mustard & Emerald Green',
      notes: 'High tempo dance performances. Stage lighting needs extra warm strobes.',
      customPrice: 100000
    },
    {
      id: 'day-002',
      eventId: 'evt-001',
      dayNumber: 2,
      date: '2026-10-15',
      eventType: 'Barat',
      venue: 'Pearl Continental Grand Crystal Ballroom, Lahore',
      startTime: '18:30',
      endTime: '23:45',
      callTime: '16:30',
      dressCode: 'Formal Black Tie / Sherwani',
      notes: 'Bride entrance with traditional chadar. Full drone entry shot outside ballroom.',
      customPrice: 150000
    },
    {
      id: 'day-003',
      eventId: 'evt-001',
      dayNumber: 3,
      date: '2026-10-16',
      eventType: 'Walima',
      venue: 'Garrison Golf & Country Club Banquet, Lahore',
      startTime: '19:00',
      endTime: '23:00',
      callTime: '17:30',
      dressCode: 'Contemporary Pastel / Western Formals',
      notes: 'Family portraits before dinner. Couple outdoor sunset shoot on fairway.',
      customPrice: 120000
    }
  ];

  const teamAssignments: EventTeamAssignment[] = [
    {
      id: 'eta-001',
      eventId: 'evt-001',
      teamMemberId: 'tm-001',
      role: 'Photographer',
      date: '2026-10-15',
      hours: 18,
      rate: 15000,
      cost: 25000,
      notes: 'Lead photographer for all 3 days',
      assignmentStatus: 'Confirmed'
    },
    {
      id: 'eta-002',
      eventId: 'evt-001',
      teamMemberId: 'tm-002',
      role: 'Photographer',
      date: '2026-10-15',
      hours: 18,
      rate: 12000,
      cost: 18000,
      notes: 'Second candid photographer',
      assignmentStatus: 'Confirmed'
    },
    {
      id: 'eta-003',
      eventId: 'evt-001',
      teamMemberId: 'tm-003',
      role: 'Videographer',
      date: '2026-10-15',
      hours: 18,
      rate: 16000,
      cost: 22000,
      notes: 'Cinema director on FX3',
      assignmentStatus: 'Confirmed'
    },
    {
      id: 'eta-004',
      eventId: 'evt-001',
      teamMemberId: 'tm-005',
      role: 'Drone Operator',
      date: '2026-10-15',
      hours: 8,
      rate: 14000,
      cost: 14000,
      notes: 'Aerial coverage on Barat & Walima',
      assignmentStatus: 'Confirmed'
    },
    {
      id: 'eta-005',
      eventId: 'evt-001',
      teamMemberId: 'tm-006',
      role: 'Assistant',
      date: '2026-10-15',
      hours: 18,
      rate: 5000,
      cost: 9000,
      notes: 'Lighting assistant for 3 days',
      assignmentStatus: 'Confirmed'
    }
  ];

  const equipmentAssignments: EventEquipmentAssignment[] = [
    {
      id: 'eea-001',
      eventId: 'evt-001',
      equipmentId: 'eq-001',
      quantity: 1,
      rentalRate: 5000,
      rentalCost: 5000,
      isCheckedOut: true,
      isCheckedIn: false,
      notes: 'Hamza lead camera'
    },
    {
      id: 'eea-002',
      eventId: 'evt-001',
      equipmentId: 'eq-002',
      quantity: 1,
      rentalRate: 8000,
      rentalCost: 8000,
      isCheckedOut: true,
      isCheckedIn: false,
      notes: 'Usman primary FX3 rig'
    },
    {
      id: 'eea-003',
      eventId: 'evt-001',
      equipmentId: 'eq-003',
      quantity: 1,
      rentalRate: 3500,
      rentalCost: 3500,
      isCheckedOut: true,
      isCheckedIn: false,
      notes: '24-70mm GM II lens'
    },
    {
      id: 'eea-004',
      eventId: 'evt-001',
      equipmentId: 'eq-005',
      quantity: 1,
      rentalRate: 9000,
      rentalCost: 9000,
      isCheckedOut: false,
      isCheckedIn: false,
      notes: 'DJI Mavic 3 Cine kit'
    },
    {
      id: 'eea-005',
      eventId: 'evt-001',
      equipmentId: 'eq-006',
      quantity: 1,
      rentalRate: 4000,
      rentalCost: 4000,
      isCheckedOut: true,
      isCheckedIn: false,
      notes: 'Godox AD600 Pro strobe'
    },
    {
      id: 'eea-006',
      eventId: 'evt-001',
      equipmentId: 'eq-007',
      quantity: 1,
      rentalRate: 2500,
      rentalCost: 2500,
      isCheckedOut: true,
      isCheckedIn: false,
      notes: 'Rode Wireless PRO system'
    }
  ];

  const eventExpenses: EventExpense[] = [
    {
      id: 'exp-001',
      eventId: 'evt-001',
      category: 'Fuel',
      description: 'Fuel for crew van across Lahore venues (Mehndi, Barat, Walima)',
      amount: 14000,
      date: '2026-10-14',
      paidBy: 'Hamza Tariq',
      notes: 'PSO receipt attached'
    },
    {
      id: 'exp-002',
      eventId: 'evt-001',
      category: 'Catering',
      description: 'Dinner & refreshments for 5 crew members for 3 event days',
      amount: 15500,
      date: '2026-10-15',
      paidBy: 'Royal Studio',
      notes: 'Dinner at PC and venue lounge'
    },
    {
      id: 'exp-003',
      eventId: 'evt-001',
      category: 'Travel',
      description: 'Toll plaza & parking charges for 3 days',
      amount: 5000,
      date: '2026-10-16',
      paidBy: 'Kamran Butt',
      notes: 'VIP parking pass at Garrison'
    }
  ];

  const invoices: Invoice[] = [
    {
      id: 'inv-001',
      invoiceNumber: 'RS-INV-1001',
      clientId: 'cli-001',
      eventId: 'evt-001',
      issueDate: '2026-08-11',
      dueDate: '2026-10-10',
      subtotal: 370000,
      discount: 0,
      tax: 0,
      total: 370000,
      paidAmount: 150000,
      remainingAmount: 220000,
      paymentTerms: '50% Advance at booking, remaining before event',
      notes: 'First advance received via Meezan Bank online transfer.',
      status: 'Partially Paid',
      createdBy: 'usr-admin'
    },
    {
      id: 'inv-002',
      invoiceNumber: 'RS-INV-1002',
      clientId: 'cli-003',
      eventId: 'evt-003',
      issueDate: '2026-08-25',
      dueDate: '2026-09-15', // Past due date!
      subtotal: 85000,
      discount: 0,
      tax: 0,
      total: 85000,
      paidAmount: 0,
      remainingAmount: 85000,
      paymentTerms: 'Net 15 days corporate payment terms',
      notes: 'Pending procurement clearance from client finance department.',
      status: 'Overdue',
      createdBy: 'usr-admin'
    }
  ];

  const payments: Payment[] = [
    {
      id: 'pay-001',
      paymentId: 'PAY-2026-001',
      eventId: 'evt-001',
      invoiceId: 'inv-001',
      amount: 150000,
      paymentDate: '2026-08-12',
      method: 'Bank Transfer',
      reference: 'TXN-MEEZ-994821',
      notes: '50% Booking advance confirmed in Meezan Bank account',
      createdBy: 'usr-admin'
    }
  ];

  const quotations: Quotation[] = [
    {
      id: 'quo-001',
      quotationNumber: 'RS-QUO-0001',
      clientId: 'cli-001',
      eventId: 'evt-001',
      issueDate: '2026-08-10',
      validUntil: '2026-09-10',
      subtotal: 370000,
      discount: 0,
      tax: 0,
      total: 370000,
      paymentTerms: '50% advance booking deposit required to lock dates.',
      notes: 'Includes custom luxury Italian leather album and drone cinematography.',
      createdBy: 'usr-admin'
    }
  ];

  const tasks: EventTask[] = [
    {
      id: 'tsk-001',
      eventId: 'evt-001',
      title: 'Drone Route Planning & Venue Clearance',
      assigneeId: 'tm-005',
      dueDate: '2026-10-10',
      priority: 'Urgent',
      status: 'In Progress',
      description: 'Obtain venue clearance from PC Ballroom and Royal Palm golf management for Mavic 3 aerial filming.',
      createdDate: '2026-08-15'
    },
    {
      id: 'tsk-002',
      eventId: 'evt-001',
      title: 'Shot List & Family Stage Hierarchy Meeting',
      assigneeId: 'tm-001',
      dueDate: '2026-10-11',
      priority: 'High',
      status: 'Pending',
      description: 'Review VIP guest list, key family portraits, and special entrance requests with bride and groom.',
      createdDate: '2026-08-15'
    },
    {
      id: 'tsk-003',
      eventId: 'evt-001',
      title: 'Same-Day Social Media Reel Delivery',
      assigneeId: 'tm-007',
      dueDate: '2026-10-16',
      priority: 'Urgent',
      status: 'Pending',
      description: 'Edit 60-second viral Instagram teaser within 24 hours of Barat event.',
      createdDate: '2026-08-15'
    },
    {
      id: 'tsk-004',
      eventId: 'evt-001',
      title: 'Master Color Grading & 4K Cinema Cut',
      assigneeId: 'tm-007',
      dueDate: '2026-11-05',
      priority: 'Normal',
      status: 'Pending',
      description: 'Complete DaVinci Resolve color grade and audio mix for full documentary film.',
      createdDate: '2026-08-15'
    }
  ];

  // Loss Leader Event (Net Profit < 0) as explicitly required by Section 31 & 60!
  const eventLossLeader: Event = {
    id: 'evt-002',
    clientId: 'cli-004',
    title: 'Clifton Beach Destination Engagement & Fashion Teaser',
    category: 'Engagement',
    packageId: 'pkg-003',
    eventDate: '2026-09-25',
    startTime: '15:00',
    endTime: '20:00',
    venue: 'Do Darya & French Beach',
    city: 'Karachi',
    status: 'Shoot Done',
    packagePrice: 65000,
    advancePaid: 65000,
    discount: 10000,
    tax: 0,
    notes: 'Promotional portfolio shoot. Extra travel and high-speed equipment resulted in operational loss.',
    createdBy: 'usr-admin',
    createdDate: '2026-08-28T09:00:00.000Z',
    updatedDate: '2026-09-26T18:00:00.000Z',
    isMultiDay: false,
    staffCost: 45000,
    rentalCost: 21500,
    eventExpenses: 18000,
    netProfit: -19500, // NET PROFIT < 0!
    netMargin: -30.0,
    totalClientPayments: 65000,
    remainingBalance: 0
  };

  const eventCorporate: Event = {
    id: 'evt-003',
    clientId: 'cli-003',
    title: 'Nexus Tech Global Summit & Innovation Awards',
    category: 'Corporate',
    packageId: 'pkg-004',
    eventDate: '2026-10-05',
    startTime: '09:00',
    endTime: '17:00',
    venue: 'Arfa Software Technology Park Auditorium',
    city: 'Lahore',
    status: 'Shoot Scheduled',
    packagePrice: 85000,
    advancePaid: 0,
    discount: 0,
    tax: 0,
    notes: 'Keynotes, panel discussions, and evening award gala.',
    createdBy: 'usr-admin',
    createdDate: '2026-08-22T10:00:00.000Z',
    updatedDate: '2026-09-27T11:00:00.000Z',
    isMultiDay: false,
    staffCost: 26000,
    rentalCost: 11000,
    eventExpenses: 7500,
    netProfit: 40500,
    netMargin: 47.6,
    totalClientPayments: 0,
    remainingBalance: 85000
  };

  const studioExpenses: StudioExpense[] = [
    {
      id: 'sexp-001',
      category: 'Rent',
      description: 'Monthly Studio Office Rent - Main Boulevard Gulberg III',
      amount: 140000,
      date: '2026-09-01',
      paymentMethod: 'Bank Transfer',
      recurring: true,
      notes: 'Paid via Meezan corporate cheque',
      createdBy: 'usr-admin'
    },
    {
      id: 'sexp-002',
      category: 'Utilities',
      description: 'Electricity & Studio Cooling Bill (LESCO)',
      amount: 45000,
      date: '2026-09-05',
      paymentMethod: 'JazzCash',
      recurring: true,
      notes: 'Peak summer studio editing air conditioning',
      createdBy: 'usr-admin'
    },
    {
      id: 'sexp-003',
      category: 'Internet',
      description: 'StormFiber Enterprise 100Mbps dedicated fiber line',
      amount: 12500,
      date: '2026-09-07',
      paymentMethod: 'Bank Transfer',
      recurring: true,
      notes: 'For fast 4K raw cloud uploads & client galleries',
      createdBy: 'usr-admin'
    },
    {
      id: 'sexp-004',
      category: 'Software',
      description: 'Adobe Creative Cloud Team License & Frame.io storage',
      amount: 28000,
      date: '2026-09-10',
      paymentMethod: 'Bank Transfer',
      recurring: true,
      notes: 'Annual recurring suite for 3 editing stations',
      createdBy: 'usr-admin'
    }
  ];

  const teamPayments: TeamPayment[] = [
    {
      id: 'tp-001',
      teamMemberId: 'tm-001',
      eventId: 'evt-001',
      paymentType: 'Advance',
      amount: 15000,
      date: '2026-09-15',
      paymentMethod: 'Bank Transfer',
      reference: 'TXN-TP-8841',
      notes: 'Advance for Tariq wedding shoot preparation',
      createdBy: 'usr-admin'
    },
    {
      id: 'tp-002',
      teamMemberId: 'tm-007',
      paymentType: 'Salary',
      amount: 65000,
      date: '2026-09-01',
      paymentMethod: 'Bank Transfer',
      reference: 'SAL-SEP-2026',
      notes: 'Monthly in-house editor retainer',
      createdBy: 'usr-admin'
    }
  ];

  return {
    users: [adminUser, staffUser],
    profile,
    clients,
    events: [event1, eventLossLeader, eventCorporate],
    daySchedules,
    packages,
    teamMembers,
    teamAssignments,
    teamPayments,
    equipment,
    equipmentAssignments,
    maintenanceLogs,
    eventExpenses,
    studioExpenses,
    invoices,
    payments,
    quotations,
    tasks,
    tempHireRecommendations: []
  };
}

export class StudioDatabase {
  private db: DatabaseSchema;

  constructor() {
    ensureDirectoryExists();
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.db = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading db file, seeding fresh:', err);
        this.db = getInitialData();
        this.save();
      }
    } else {
      const seedFile = path.resolve(process.cwd(), 'data', 'studio_db.json');
      if (fs.existsSync(seedFile)) {
        try {
          const raw = fs.readFileSync(seedFile, 'utf-8');
          this.db = JSON.parse(raw);
        } catch {
          this.db = getInitialData();
        }
      } else {
        this.db = getInitialData();
      }
      this.save();
    }

    // Ensure Admin identity is always Royal Studio and not M. Bilal Khan
    let needsSave = false;
    const admin = this.db.users?.find(u => u.role === 'ADMIN');
    if (admin) {
      if (admin.name === 'M. Bilal Khan' || !admin.name) {
        admin.name = 'Royal Studio';
        needsSave = true;
      }
      if (!admin.status) {
        admin.status = 'ACTIVE';
        needsSave = true;
      }
    }

    // Ensure all users have status and staff linking
    this.db.users?.forEach(u => {
      if (!u.status) {
        u.status = 'ACTIVE';
        needsSave = true;
      }
      if (u.role === 'STAFF' && !u.linkedTeamMemberId && u.name === 'Hamza Tariq') {
        u.linkedTeamMemberId = 'tm-001';
        needsSave = true;
      }
    });

    // Sync team member login status with user accounts
    this.db.teamMembers?.forEach(tm => {
      const linkedUser = this.db.users?.find(u => u.linkedTeamMemberId === tm.id || u.id === tm.userId);
      if (linkedUser) {
        if (!tm.hasLogin || tm.userId !== linkedUser.id || tm.loginStatus !== linkedUser.status) {
          tm.hasLogin = true;
          tm.userId = linkedUser.id;
          tm.loginStatus = linkedUser.status;
          needsSave = true;
        }
      } else {
        if (tm.hasLogin || tm.userId || tm.loginStatus) {
          tm.hasLogin = false;
          delete tm.userId;
          delete tm.loginStatus;
          needsSave = true;
        }
      }
    });

    // Replace any legacy M. Bilal Khan in eventExpenses
    this.db.eventExpenses?.forEach(exp => {
      if (exp.paidBy === 'M. Bilal Khan') {
        exp.paidBy = 'Royal Studio';
        needsSave = true;
      }
    });

    // Sync official Royal Studio business profile settings
    if (this.db.profile) {
      if (!this.db.profile.studioName || this.db.profile.studioName === 'ROYAL STUDIO') {
        this.db.profile.studioName = 'Royal Studio';
        needsSave = true;
      }
      if (!this.db.profile.address || this.db.profile.address.includes('Gulberg')) {
        this.db.profile.address = 'Al Jannat Town Entrance, Canal Bungalow Road, Opposite Habib Mall, Burewala, Punjab 61010, Pakistan';
        needsSave = true;
      }
      if (!this.db.profile.city || this.db.profile.city.includes('Lahore')) {
        this.db.profile.city = 'Burewala, Punjab, Pakistan';
        needsSave = true;
      }
      if (!this.db.profile.phone || this.db.profile.phone === '+92 300 1234567') {
        this.db.profile.phone = '0308-4877073';
        needsSave = true;
      }
      if (!this.db.profile.phone2) {
        this.db.profile.phone2 = '0303-2213806';
        needsSave = true;
      }
      if (!this.db.profile.whatsapp || this.db.profile.whatsapp === '+92 321 7654321') {
        this.db.profile.whatsapp = '0308-4877073';
        needsSave = true;
      }
      if (!this.db.profile.description || this.db.profile.tagline.includes('Premier')) {
        this.db.profile.description = 'Luxury wedding photography, cinematic films, and brand shoots.';
        this.db.profile.tagline = 'Luxury wedding photography, cinematic films, and brand shoots.';
        needsSave = true;
      }
      if (!this.db.profile.facebook || this.db.profile.facebook === 'royalstudiopak') {
        this.db.profile.facebook = 'https://www.facebook.com/royalstudio089';
        needsSave = true;
      }
      if (!this.db.profile.instagram || this.db.profile.instagram === '@royalstudiopak') {
        this.db.profile.instagram = 'https://www.instagram.com/royalstudio089';
        needsSave = true;
      }
      if (!this.db.profile.youtube) {
        this.db.profile.youtube = 'https://www.youtube.com/@royalstudio089';
        needsSave = true;
      }
      if (!this.db.profile.googleMapsUrl) {
        this.db.profile.googleMapsUrl = 'https://maps.app.goo.gl/mQPek7wm4nCVjy8o9';
        needsSave = true;
      }
      if (!this.db.profile.website || this.db.profile.website.includes('.pk')) {
        this.db.profile.website = 'https://royalstudio.online';
        needsSave = true;
      }
    }

    if (needsSave) {
      this.save();
    }
  }

  public save() {
    try {
      ensureDirectoryExists();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Could not persist to local DB_FILE:', err);
    }
  }

  public getData(): DatabaseSchema {
    return this.db;
  }

  // Recalculate event financials and persist
  public recalculateEvent(eventId: string): Event | null {
    const event = this.db.events.find(e => e.id === eventId);
    if (!event) return null;

    const schedules = this.db.daySchedules.filter(d => d.eventId === eventId);
    const team = this.db.teamAssignments.filter(t => t.eventId === eventId);
    const equip = this.db.equipmentAssignments.filter(eq => eq.eventId === eventId);
    const expenses = this.db.eventExpenses.filter(ex => ex.eventId === eventId);
    const payments = this.db.payments.filter(p => p.eventId === eventId);

    const calculated = calculateEventTotals(
      event,
      schedules,
      team,
      equip,
      expenses,
      payments
    );

    event.packagePrice = calculated.packagePrice;
    event.staffCost = calculated.staffCost;
    event.rentalCost = calculated.rentalCost;
    event.eventExpenses = calculated.eventExpenses;
    event.netProfit = calculated.netProfit;
    event.netMargin = calculated.netMargin;
    event.totalClientPayments = calculated.totalClientPayments;
    event.remainingBalance = calculated.remainingBalance;
    event.updatedDate = new Date().toISOString();

    // Also update any related invoices
    const invoice = this.db.invoices.find(inv => inv.eventId === eventId);
    if (invoice) {
      invoice.subtotal = event.packagePrice;
      invoice.total = invoice.subtotal - invoice.discount + invoice.tax;
      invoice.paidAmount = calculated.totalClientPayments;
      invoice.remainingAmount = Math.max(0, invoice.total - invoice.paidAmount);
      invoice.status = computeInvoiceStatus(invoice, invoice.paidAmount);
    }

    this.save();
    return event;
  }
}

export const dbInstance = new StudioDatabase();
