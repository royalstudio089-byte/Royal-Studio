import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { dbInstance } from './server/db';
import { calculateEventTotals, computeInvoiceStatus } from './src/utils/calculations';
import { User, Role } from './src/types';

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-memory session token store (tokens mapped to userId)
const sessions: Map<string, { userId: string; expiresAt: number }> = new Map();

// Helper to get authenticated user
function getAuthUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const session = sessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }

  const db = dbInstance.getData();
  const user = db.users.find(u => u.id === session.userId);
  return user || null;
}

// Middleware: Require valid login
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please log in.' });
    return;
  }
  (req as any).user = user;
  next();
}

// Middleware: Require Admin role
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as User;
  if (!user || user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden. Admin privileges required.' });
    return;
  }
  next();
}

// ================= AUTH ROUTES ================= //
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const db = dbInstance.getData();

  const user = db.users.find(
    u => u.email.toLowerCase() === (email || '').toLowerCase().trim()
  );

  if (!user || user.password !== password) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  // 30 days token expiry or 30 min idle handled in frontend
  const token = `token-${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  sessions.set(token, {
    userId: user.id,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
  });

  const { password: _, ...userSafe } = user;
  res.json({ token, user: userSafe });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Session expired or invalid' });
    return;
  }
  const { password: _, ...userSafe } = user;
  res.json({ user: userSafe });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '');
    sessions.delete(token);
  }
  res.json({ success: true });
});

// ================= ALL DATA FETCH ================= //
app.get('/api/db/all', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = dbInstance.getData();

  // If staff, omit studio expenses and sensitive payroll administration
  const isStaff = user.role === 'STAFF';

  res.json({
    profile: db.profile,
    clients: db.clients,
    events: db.events,
    daySchedules: db.daySchedules,
    packages: db.packages,
    teamMembers: db.teamMembers,
    teamAssignments: db.teamAssignments,
    teamPayments: isStaff ? [] : db.teamPayments,
    equipment: db.equipment,
    equipmentAssignments: db.equipmentAssignments,
    maintenanceLogs: db.maintenanceLogs,
    eventExpenses: db.eventExpenses,
    studioExpenses: isStaff ? [] : db.studioExpenses,
    invoices: db.invoices,
    payments: db.payments,
    quotations: db.quotations,
    tasks: db.tasks,
    tempHireRecommendations: db.tempHireRecommendations
  });
});

// ================= PROFILE / STUDIO SETTINGS ================= //
app.put('/api/profile', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  db.profile = { ...db.profile, ...req.body };
  dbInstance.save();
  res.json(db.profile);
});

// ================= CLIENTS ================= //
app.post('/api/clients', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = dbInstance.getData();
  const { name, phone, whatsapp, email, address, city, notes } = req.body;

  if (!name || !phone) {
    res.status(400).json({ error: 'Name and Phone are required' });
    return;
  }

  // Prevent duplicate phone/name
  const duplicate = db.clients.find(c => c.phone === phone || c.name.toLowerCase() === name.toLowerCase());
  if (duplicate) {
    res.status(400).json({ error: 'A client with this phone number or name already exists.' });
    return;
  }

  const newClient = {
    id: `cli-${Date.now().toString().slice(-6)}`,
    name,
    phone,
    whatsapp: whatsapp || phone,
    email: email || '',
    address: address || '',
    city: city || 'Lahore',
    notes: notes || '',
    createdDate: new Date().toISOString(),
    createdBy: user.id
  };

  db.clients.unshift(newClient);
  dbInstance.save();
  res.json(newClient);
});

app.put('/api/clients/:id', requireAuth, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  const index = db.clients.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Client not found' });
    return;
  }

  db.clients[index] = { ...db.clients[index], ...req.body };
  dbInstance.save();
  res.json(db.clients[index]);
});

app.delete('/api/clients/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  const id = req.params.id;

  // Check if client has active events
  const hasEvents = db.events.some(e => e.clientId === id);
  if (hasEvents) {
    res.status(400).json({ error: 'Cannot delete client with existing events. Remove or reassign events first.' });
    return;
  }

  db.clients = db.clients.filter(c => c.id !== id);
  dbInstance.save();
  res.json({ success: true });
});

// ================= EVENTS ================= //
app.post('/api/events', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = dbInstance.getData();

  const {
    clientId,
    title,
    category,
    weddingSubtype,
    packageId,
    eventDate,
    startTime,
    endTime,
    venue,
    city,
    packagePrice,
    advancePaid,
    discount,
    tax,
    notes,
    isMultiDay
  } = req.body;

  if (!clientId || !title || !eventDate) {
    res.status(400).json({ error: 'Client, Title, and Event Date are required.' });
    return;
  }

  const priceNum = Number(packagePrice || 0);
  const advNum = Number(advancePaid || 0);

  const newEvent = {
    id: `evt-${Date.now().toString().slice(-6)}`,
    clientId,
    title,
    category: category || 'Wedding',
    weddingSubtype,
    packageId,
    eventDate,
    startTime: startTime || '18:00',
    endTime: endTime || '23:00',
    venue: venue || 'Lahore',
    city: city || 'Lahore',
    status: (req.body.status || 'Confirmed') as any,
    packagePrice: priceNum,
    advancePaid: advNum,
    discount: Number(discount || 0),
    tax: Number(tax || 0),
    notes: notes || '',
    createdBy: user.id,
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
    isMultiDay: !!isMultiDay,
    staffCost: 0,
    rentalCost: 0,
    eventExpenses: 0,
    netProfit: priceNum,
    netMargin: priceNum > 0 ? 100 : 0,
    totalClientPayments: 0,
    remainingBalance: priceNum
  };

  db.events.unshift(newEvent);

  // If advance paid > 0, record initial payment automatically
  if (advNum > 0) {
    const payment = {
      id: `pay-${Date.now().toString().slice(-6)}`,
      paymentId: `PAY-${Date.now().toString().slice(-4)}`,
      eventId: newEvent.id,
      amount: advNum,
      paymentDate: eventDate,
      method: 'Bank Transfer' as any,
      reference: 'Booking Advance Deposit',
      notes: 'Initial booking advance payment',
      createdBy: user.id
    };
    db.payments.unshift(payment);
  }

  // Create initial quotation
  const quoNumber = `${db.profile.quotationPrefix}${String(db.quotations.length + 1001).padStart(4, '0')}`;
  const newQuo = {
    id: `quo-${Date.now().toString().slice(-6)}`,
    quotationNumber: quoNumber,
    clientId,
    eventId: newEvent.id,
    issueDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subtotal: priceNum,
    discount: Number(discount || 0),
    tax: Number(tax || 0),
    total: priceNum - Number(discount || 0) + Number(tax || 0),
    paymentTerms: db.profile.paymentTerms,
    notes: 'Official studio proposal and agreement.',
    createdBy: user.id
  };
  db.quotations.unshift(newQuo);

  dbInstance.save();
  dbInstance.recalculateEvent(newEvent.id);

  res.json(newEvent);
});

app.put('/api/events/:id', requireAuth, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  const index = db.events.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  db.events[index] = {
    ...db.events[index],
    ...req.body,
    updatedDate: new Date().toISOString()
  };

  dbInstance.save();
  const updated = dbInstance.recalculateEvent(req.params.id);
  res.json(updated);
});

app.delete('/api/events/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  const id = req.params.id;

  // Clean up cascade
  db.events = db.events.filter(e => e.id !== id);
  db.daySchedules = db.daySchedules.filter(d => d.eventId !== id);
  db.teamAssignments = db.teamAssignments.filter(t => t.eventId !== id);
  db.equipmentAssignments = db.equipmentAssignments.filter(eq => eq.eventId !== id);
  db.eventExpenses = db.eventExpenses.filter(ex => ex.eventId !== id);
  db.invoices = db.invoices.filter(i => i.eventId !== id);
  db.payments = db.payments.filter(p => p.eventId !== id);
  db.quotations = db.quotations.filter(q => q.eventId !== id);
  db.tasks = db.tasks.filter(t => t.eventId !== id);

  dbInstance.save();
  res.json({ success: true });
});

app.post('/api/events/:id/recalculate', requireAuth, (req: Request, res: Response) => {
  const updated = dbInstance.recalculateEvent(req.params.id);
  if (!updated) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }
  res.json(updated);
});

// ================= AUTO TEAM ASSIGNMENT & CONFLICT ENGINE ================= //
app.post('/api/events/:id/auto-assign', requireAuth, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  const event = db.events.find(e => e.id === req.params.id);
  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  const pkg = db.packages.find(p => p.id === event.packageId);
  if (!pkg) {
    res.status(400).json({ error: 'Event does not have an associated package with crew requirements.' });
    return;
  }

  const required = [
    { role: 'Photographer', count: pkg.requiredPhotographers },
    { role: 'Videographer', count: pkg.requiredVideographers },
    { role: 'Drone Operator', count: pkg.requiredDroneOperators },
    { role: 'Assistant', count: pkg.requiredAssistants }
  ];

  const totalRequired = required.reduce((acc, r) => acc + r.count, 0);

  // Check conflicting events on this eventDate
  const conflictingEventIds = db.events
    .filter(e => e.id !== event.id && e.eventDate === event.eventDate && e.status !== 'Cancelled')
    .map(e => e.id);

  // Team members already booked on conflicting events on this date
  const busyTeamMemberIds = new Set(
    db.teamAssignments
      .filter(a => conflictingEventIds.includes(a.eventId) && a.assignmentStatus !== 'Cancelled')
      .map(a => a.teamMemberId)
  );

  // Team members already assigned to THIS event
  const alreadyAssignedMemberIds = new Set(
    db.teamAssignments
      .filter(a => a.eventId === event.id && a.assignmentStatus !== 'Cancelled')
      .map(a => a.teamMemberId)
  );

  const newAssignments: any[] = [];
  const missingRoles: string[] = [];
  let availableCount = 0;

  for (const reqRole of required) {
    let needed = reqRole.count;
    // count already assigned in this role
    const alreadyInRole = db.teamAssignments.filter(
      a => a.eventId === event.id && a.role === reqRole.role && a.assignmentStatus !== 'Cancelled'
    ).length;

    needed = Math.max(0, needed - alreadyInRole);

    if (needed > 0) {
      // Find candidate team members
      const candidates = db.teamMembers.filter(m =>
        m.role === reqRole.role &&
        m.isActive &&
        m.availabilityStatus !== 'On Leave' &&
        m.availabilityStatus !== 'Inactive' &&
        !busyTeamMemberIds.has(m.id) &&
        !alreadyAssignedMemberIds.has(m.id)
      );

      for (let i = 0; i < needed; i++) {
        if (i < candidates.length) {
          const selected = candidates[i];
          alreadyAssignedMemberIds.add(selected.id);
          availableCount++;

          const cost = selected.eventRate || 10000;
          const assignment = {
            id: `eta-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6)}`,
            eventId: event.id,
            teamMemberId: selected.id,
            role: selected.role,
            date: event.eventDate,
            hours: 8,
            rate: cost,
            cost: cost,
            notes: `Auto-assigned based on package ${pkg.name}`,
            assignmentStatus: 'Confirmed' as any
          };
          newAssignments.push(assignment);
        } else {
          missingRoles.push(reqRole.role);
        }
      }
    }
  }

  // Save new assignments
  if (newAssignments.length > 0) {
    db.teamAssignments.push(...newAssignments);
    dbInstance.recalculateEvent(event.id);
  }

  let tempHireRecommendation = null;
  if (missingRoles.length > 0) {
    const shortageCount = missingRoles.length;
    tempHireRecommendation = {
      id: `thr-${Date.now().toString().slice(-6)}`,
      eventId: event.id,
      requiredStaff: totalRequired,
      availableStaff: totalRequired - shortageCount,
      shortageCount,
      missingRoles,
      suggestedTempMembers: missingRoles.map(role => ({
        role,
        suggestedRate: role === 'Photographer' ? 12000 : role === 'Videographer' ? 14000 : 6000,
        reason: `Shortage detected for ${event.title} on ${event.eventDate}`
      })),
      createdAt: new Date().toISOString()
    };
    db.tempHireRecommendations.unshift(tempHireRecommendation);
    dbInstance.save();
  }

  res.json({
    assignedCount: newAssignments.length,
    newAssignments,
    missingRoles,
    hasShortage: missingRoles.length > 0,
    tempHireRecommendation
  });
});

// ================= MULTI-DAY SCHEDULES ================= //
app.post('/api/day-schedules', requireAuth, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  const { eventId, dayNumber, date, eventType, venue, startTime, endTime, callTime, dressCode, notes, customPrice } = req.body;

  const newSchedule = {
    id: `day-${Date.now().toString().slice(-6)}`,
    eventId,
    dayNumber: Number(dayNumber || 1),
    date,
    eventType: eventType || 'Barat',
    venue: venue || 'Venue',
    startTime: startTime || '18:00',
    endTime: endTime || '23:00',
    callTime: callTime || '16:30',
    dressCode: dressCode || 'Formal',
    notes: notes || '',
    customPrice: Number(customPrice || 0)
  };

  db.daySchedules.push(newSchedule);
  dbInstance.save();
  dbInstance.recalculateEvent(eventId);
  res.json(newSchedule);
});

app.put('/api/day-schedules/:id', requireAuth, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  const index = db.daySchedules.findIndex(d => d.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Day schedule not found' });
    return;
  }

  db.daySchedules[index] = { ...db.daySchedules[index], ...req.body };
  dbInstance.save();
  dbInstance.recalculateEvent(db.daySchedules[index].eventId);
  res.json(db.daySchedules[index]);
});

app.delete('/api/day-schedules/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  const schedule = db.daySchedules.find(d => d.id === req.params.id);
  if (!schedule) {
    res.status(404).json({ error: 'Day schedule not found' });
    return;
  }

  const eventId = schedule.eventId;
  db.daySchedules = db.daySchedules.filter(d => d.id !== req.params.id);
  dbInstance.save();
  dbInstance.recalculateEvent(eventId);
  res.json({ success: true });
});

// ================= TEAM MEMBERS ================= //
app.post('/api/team', requireAuth, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  const { name, phone, whatsapp, email, role, specialization, dailyRate, eventRate, availabilityStatus, notes } = req.body;

  if (!name || !role) {
    res.status(400).json({ error: 'Name and Role are required' });
    return;
  }

  const newMember = {
    id: `tm-${Date.now().toString().slice(-6)}`,
    name,
    phone: phone || '',
    whatsapp: whatsapp || phone || '',
    email: email || '',
    role,
    specialization: specialization || '',
    dailyRate: Number(dailyRate || 8000),
    eventRate: Number(eventRate || 12000),
    availabilityStatus: (availabilityStatus || 'Available') as any,
    isActive: true,
    joiningDate: new Date().toISOString().split('T')[0],
    notes: notes || ''
  };

  db.teamMembers.push(newMember);
  dbInstance.save();
  res.json(newMember);
});

app.put('/api/team/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  // Master record changes require admin
  if (user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden. Only administrators can edit team member master records.' });
    return;
  }
  const db = dbInstance.getData();
  const index = db.teamMembers.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Team member not found' });
    return;
  }

  db.teamMembers[index] = { ...db.teamMembers[index], ...req.body };
  dbInstance.save();
  res.json(db.teamMembers[index]);
});

app.delete('/api/team/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  db.teamMembers = db.teamMembers.filter(m => m.id !== req.params.id);
  dbInstance.save();
  res.json({ success: true });
});

// ================= TEAM ASSIGNMENTS ================= //
app.post('/api/team-assignments', requireAuth, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  const { eventId, teamMemberId, role, date, hours, rate, cost, notes, assignmentStatus } = req.body;

  // Conflict check: is team member already assigned to another active event on this date?
  const conflicting = db.teamAssignments.find(a => {
    if (a.teamMemberId !== teamMemberId) return false;
    if (a.assignmentStatus === 'Cancelled') return false;
    if (a.eventId === eventId) return false;
    const otherEvent = db.events.find(e => e.id === a.eventId);
    return otherEvent && otherEvent.eventDate === date && otherEvent.status !== 'Cancelled';
  });

  if (conflicting) {
    const conflictEvent = db.events.find(e => e.id === conflicting.eventId);
    res.status(400).json({
      error: `Conflict detected! This team member is already assigned to "${conflictEvent?.title || 'Another Event'}" on ${date}.`
    });
    return;
  }

  const newAssignment = {
    id: `eta-${Date.now().toString().slice(-6)}`,
    eventId,
    teamMemberId,
    role,
    date,
    hours: Number(hours || 8),
    rate: Number(rate || 0),
    cost: Number(cost || rate || 0),
    notes: notes || '',
    assignmentStatus: (assignmentStatus || 'Confirmed') as any
  };

  db.teamAssignments.push(newAssignment);
  dbInstance.save();
  dbInstance.recalculateEvent(eventId);
  res.json(newAssignment);
});

app.put('/api/team-assignments/:id', requireAuth, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  const index = db.teamAssignments.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Assignment not found' });
    return;
  }

  db.teamAssignments[index] = { ...db.teamAssignments[index], ...req.body };
  dbInstance.save();
  dbInstance.recalculateEvent(db.teamAssignments[index].eventId);
  res.json(db.teamAssignments[index]);
});

app.delete('/api/team-assignments/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  const assignment = db.teamAssignments.find(a => a.id === req.params.id);
  if (!assignment) {
    res.status(404).json({ error: 'Assignment not found' });
    return;
  }

  const eventId = assignment.eventId;
  db.teamAssignments = db.teamAssignments.filter(a => a.id !== req.params.id);
  dbInstance.save();
  dbInstance.recalculateEvent(eventId);
  res.json({ success: true });
});

// ================= EQUIPMENT & CONFLICT DETECTION ================= //
app.post('/api/equipment', requireAuth, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  const { name, category, brand, model, serialNumber, quantity, rentalRate, serviceAfterUses, notes } = req.body;

  if (!name || !category) {
    res.status(400).json({ error: 'Name and Category are required' });
    return;
  }

  const newEquip = {
    id: `eq-${Date.now().toString().slice(-6)}`,
    name,
    category,
    brand: brand || 'Sony',
    model: model || '',
    serialNumber: serialNumber || `SN-${Date.now().toString().slice(-4)}`,
    quantity: Number(quantity || 1),
    status: 'Available' as any,
    rentalRate: Number(rentalRate || 4000),
    purchaseDate: new Date().toISOString().split('T')[0],
    serviceAfterUses: Number(serviceAfterUses || 20),
    currentUsageCount: 0,
    notes: notes || ''
  };

  db.equipment.push(newEquip);
  dbInstance.save();
  res.json(newEquip);
});

app.put('/api/equipment/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden. Only administrators can edit equipment master records.' });
    return;
  }
  const db = dbInstance.getData();
  const index = db.equipment.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Equipment not found' });
    return;
  }

  db.equipment[index] = { ...db.equipment[index], ...req.body };
  dbInstance.save();
  res.json(db.equipment[index]);
});

app.delete('/api/equipment/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  db.equipment = db.equipment.filter(e => e.id !== req.params.id);
  dbInstance.save();
  res.json({ success: true });
});

// Assign Equipment with Conflict Detection (Section 18 & 19)
app.post('/api/equipment-assignments', requireAuth, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  const { eventId, equipmentId, quantity, rentalRate, notes } = req.body;

  const equip = db.equipment.find(e => e.id === equipmentId);
  const event = db.events.find(e => e.id === eventId);

  if (!equip || !event) {
    res.status(404).json({ error: 'Equipment or Event not found' });
    return;
  }

  // Check equipment status
  if (equip.status === 'Damaged' || equip.status === 'Maintenance') {
    res.status(400).json({
      error: `Equipment "${equip.name}" is marked as ${equip.status} and cannot be assigned.`
    });
    return;
  }

  const requestedQty = Number(quantity || 1);

  // Check conflicts across events on the same event date
  const conflictingEvents = db.events.filter(e =>
    e.id !== eventId && e.eventDate === event.eventDate && e.status !== 'Cancelled'
  );
  const conflictingEventIds = conflictingEvents.map(e => e.id);

  const alreadyBookedQty = db.equipmentAssignments
    .filter(a => conflictingEventIds.includes(a.eventId) && a.equipmentId === equipmentId)
    .reduce((sum, a) => sum + a.quantity, 0);

  const availableQty = equip.quantity - alreadyBookedQty;

  if (requestedQty > availableQty) {
    const conflictEvt = conflictingEvents.find(e =>
      db.equipmentAssignments.some(a => a.eventId === e.id && a.equipmentId === equipmentId)
    );
    res.status(400).json({
      error: `Equipment unavailable for selected date/time. "${equip.name}" is already booked on ${event.eventDate} for "${conflictEvt?.title || 'another event'}". Available quantity: ${availableQty}, requested: ${requestedQty}.`
    });
    return;
  }

  const rate = Number(rentalRate || equip.rentalRate || 0);
  const newAssignment = {
    id: `eea-${Date.now().toString().slice(-6)}`,
    eventId,
    equipmentId,
    quantity: requestedQty,
    rentalRate: rate,
    rentalCost: requestedQty * rate,
    isCheckedOut: false,
    isCheckedIn: false,
    notes: notes || ''
  };

  // Increment usage count on equipment
  equip.currentUsageCount = (equip.currentUsageCount || 0) + 1;

  db.equipmentAssignments.push(newAssignment);
  dbInstance.save();
  dbInstance.recalculateEvent(eventId);
  res.json(newAssignment);
});

app.put('/api/equipment-assignments/:id', requireAuth, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  const index = db.equipmentAssignments.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Assignment not found' });
    return;
  }

  db.equipmentAssignments[index] = { ...db.equipmentAssignments[index], ...req.body };
  dbInstance.save();
  dbInstance.recalculateEvent(db.equipmentAssignments[index].eventId);
  res.json(db.equipmentAssignments[index]);
});

app.delete('/api/equipment-assignments/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  const assignment = db.equipmentAssignments.find(a => a.id === req.params.id);
  if (!assignment) {
    res.status(404).json({ error: 'Assignment not found' });
    return;
  }

  const eventId = assignment.eventId;
  db.equipmentAssignments = db.equipmentAssignments.filter(a => a.id !== req.params.id);
  dbInstance.save();
  dbInstance.recalculateEvent(eventId);
  res.json({ success: true });
});

// Equipment Maintenance Logs
app.post('/api/maintenance-logs', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = dbInstance.getData();
  const { equipmentId, issue, description, cost, status, repairNotes } = req.body;

  const newLog = {
    id: `mnt-${Date.now().toString().slice(-6)}`,
    equipmentId,
    date: new Date().toISOString().split('T')[0],
    issue: issue || 'Maintenance Report',
    description: description || '',
    reportedBy: user.name,
    cost: Number(cost || 0),
    status: (status || 'Pending') as any,
    repairNotes: repairNotes || ''
  };

  // If status is In Repair or Pending, mark equipment status as Maintenance
  const equip = db.equipment.find(e => e.id === equipmentId);
  if (equip && (status === 'In Repair' || status === 'Pending')) {
    equip.status = 'Maintenance';
  }

  db.maintenanceLogs.unshift(newLog);
  dbInstance.save();
  res.json(newLog);
});

// ================= PACKAGES ================= //
app.post('/api/packages', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden. Only administrators can create packages.' });
    return;
  }
  const db = dbInstance.getData();
  const { name, category, description, price, duration, requiredPhotographers, requiredVideographers, requiredDroneOperators, requiredAssistants, includedServices, deliverables } = req.body;

  const newPkg = {
    id: `pkg-${Date.now().toString().slice(-6)}`,
    name,
    category: category || 'Wedding',
    description: description || '',
    price: Number(price || 0),
    duration: duration || 'Full Day',
    requiredPhotographers: Number(requiredPhotographers || 1),
    requiredVideographers: Number(requiredVideographers || 1),
    requiredDroneOperators: Number(requiredDroneOperators || 0),
    requiredAssistants: Number(requiredAssistants || 0),
    includedServices: Array.isArray(includedServices) ? includedServices : [],
    deliverables: Array.isArray(deliverables) ? deliverables : [],
    isActive: true
  };

  db.packages.push(newPkg);
  dbInstance.save();
  res.json(newPkg);
});

app.put('/api/packages/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden. Only administrators can edit packages.' });
    return;
  }
  const db = dbInstance.getData();
  const index = db.packages.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Package not found' });
    return;
  }

  db.packages[index] = { ...db.packages[index], ...req.body };
  dbInstance.save();
  res.json(db.packages[index]);
});

app.delete('/api/packages/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  db.packages = db.packages.filter(p => p.id !== req.params.id);
  dbInstance.save();
  res.json({ success: true });
});

// ================= EVENT EXPENSES ================= //
app.post('/api/expenses', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = dbInstance.getData();
  const { eventId, category, description, amount, date, notes } = req.body;

  const newExp = {
    id: `exp-${Date.now().toString().slice(-6)}`,
    eventId,
    category: category || 'Miscellaneous',
    description: description || '',
    amount: Number(amount || 0),
    date: date || new Date().toISOString().split('T')[0],
    paidBy: user.name,
    notes: notes || ''
  };

  db.eventExpenses.push(newExp);
  dbInstance.save();
  dbInstance.recalculateEvent(eventId);
  res.json(newExp);
});

app.put('/api/expenses/:id', requireAuth, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  const index = db.eventExpenses.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Expense not found' });
    return;
  }

  db.eventExpenses[index] = { ...db.eventExpenses[index], ...req.body };
  dbInstance.save();
  dbInstance.recalculateEvent(db.eventExpenses[index].eventId);
  res.json(db.eventExpenses[index]);
});

app.delete('/api/expenses/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  const expense = db.eventExpenses.find(e => e.id === req.params.id);
  if (!expense) {
    res.status(404).json({ error: 'Expense not found' });
    return;
  }

  const eventId = expense.eventId;
  db.eventExpenses = db.eventExpenses.filter(e => e.id !== req.params.id);
  dbInstance.save();
  dbInstance.recalculateEvent(eventId);
  res.json({ success: true });
});

// ================= STUDIO OVERHEAD EXPENSES (ADMIN ONLY) ================= //
app.post('/api/studio-expenses', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = dbInstance.getData();
  const { category, description, amount, date, paymentMethod, recurring, notes } = req.body;

  const newStudioExp = {
    id: `sexp-${Date.now().toString().slice(-6)}`,
    category: category || 'Other',
    description: description || '',
    amount: Number(amount || 0),
    date: date || new Date().toISOString().split('T')[0],
    paymentMethod: paymentMethod || 'Bank Transfer',
    recurring: !!recurring,
    notes: notes || '',
    createdBy: user.id
  };

  db.studioExpenses.unshift(newStudioExp);
  dbInstance.save();
  res.json(newStudioExp);
});

app.put('/api/studio-expenses/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  const index = db.studioExpenses.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Studio expense not found' });
    return;
  }

  db.studioExpenses[index] = { ...db.studioExpenses[index], ...req.body };
  dbInstance.save();
  res.json(db.studioExpenses[index]);
});

app.delete('/api/studio-expenses/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  db.studioExpenses = db.studioExpenses.filter(e => e.id !== req.params.id);
  dbInstance.save();
  res.json({ success: true });
});

// ================= INVOICES ================= //
app.post('/api/invoices', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = dbInstance.getData();
  const { clientId, eventId, dueDate, subtotal, discount, tax, paymentTerms, notes } = req.body;

  const sub = Number(subtotal || 0);
  const disc = Number(discount || 0);
  const tx = Number(tax || 0);
  const tot = sub - disc + tx;

  // Find payments made for this event
  const eventPayments = db.payments.filter(p => p.eventId === eventId);
  const paid = eventPayments.reduce((sum, p) => sum + p.amount, 0);

  const invNum = `${db.profile.invoicePrefix}${String(db.invoices.length + 1001).padStart(4, '0')}`;

  const newInvoice = {
    id: `inv-${Date.now().toString().slice(-6)}`,
    invoiceNumber: invNum,
    clientId,
    eventId,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subtotal: sub,
    discount: disc,
    tax: tx,
    total: tot,
    paidAmount: paid,
    remainingAmount: Math.max(0, tot - paid),
    paymentTerms: paymentTerms || db.profile.paymentTerms,
    notes: notes || '',
    status: computeInvoiceStatus({ dueDate, total: tot }, paid),
    createdBy: user.id
  };

  db.invoices.unshift(newInvoice);
  dbInstance.save();
  res.json(newInvoice);
});

app.put('/api/invoices/:id', requireAuth, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  const index = db.invoices.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Invoice not found' });
    return;
  }

  const existing = db.invoices[index];
  const updated = { ...existing, ...req.body };
  updated.total = updated.subtotal - updated.discount + updated.tax;
  updated.remainingAmount = Math.max(0, updated.total - updated.paidAmount);
  updated.status = computeInvoiceStatus(updated, updated.paidAmount);

  db.invoices[index] = updated;
  dbInstance.save();
  res.json(updated);
});

app.delete('/api/invoices/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  db.invoices = db.invoices.filter(i => i.id !== req.params.id);
  dbInstance.save();
  res.json({ success: true });
});

// ================= CLIENT PAYMENTS ================= //
app.post('/api/payments', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = dbInstance.getData();
  const { eventId, invoiceId, amount, paymentDate, method, reference, notes } = req.body;

  const amt = Number(amount || 0);
  if (amt <= 0) {
    res.status(400).json({ error: 'Payment amount must be greater than zero.' });
    return;
  }

  const event = db.events.find(e => e.id === eventId);
  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  const newPayment = {
    id: `pay-${Date.now().toString().slice(-6)}`,
    paymentId: `PAY-${Date.now().toString().slice(-4)}`,
    eventId,
    invoiceId,
    amount: amt,
    paymentDate: paymentDate || new Date().toISOString().split('T')[0],
    method: method || 'Bank Transfer',
    reference: reference || '',
    notes: notes || '',
    createdBy: user.id
  };

  db.payments.unshift(newPayment);
  dbInstance.save();
  dbInstance.recalculateEvent(eventId);
  res.json(newPayment);
});

app.delete('/api/payments/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  const payment = db.payments.find(p => p.id === req.params.id);
  if (!payment) {
    res.status(404).json({ error: 'Payment not found' });
    return;
  }

  const eventId = payment.eventId;
  db.payments = db.payments.filter(p => p.id !== req.params.id);
  dbInstance.save();
  dbInstance.recalculateEvent(eventId);
  res.json({ success: true });
});

// ================= QUOTATIONS ================= //
app.post('/api/quotations', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = dbInstance.getData();
  const { clientId, eventId, validUntil, subtotal, discount, tax, paymentTerms, notes } = req.body;

  const sub = Number(subtotal || 0);
  const disc = Number(discount || 0);
  const tx = Number(tax || 0);

  const quoNumber = `${db.profile.quotationPrefix}${String(db.quotations.length + 1001).padStart(4, '0')}`;
  const newQuo = {
    id: `quo-${Date.now().toString().slice(-6)}`,
    quotationNumber: quoNumber,
    clientId,
    eventId,
    issueDate: new Date().toISOString().split('T')[0],
    validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subtotal: sub,
    discount: disc,
    tax: tx,
    total: sub - disc + tx,
    paymentTerms: paymentTerms || db.profile.paymentTerms,
    notes: notes || '',
    createdBy: user.id
  };

  db.quotations.unshift(newQuo);
  dbInstance.save();
  res.json(newQuo);
});

// ================= TASKS ================= //
app.post('/api/tasks', requireAuth, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  const { eventId, title, assigneeId, dueDate, priority, description } = req.body;

  if (!title || !eventId) {
    res.status(400).json({ error: 'Title and Event are required.' });
    return;
  }

  const newTask = {
    id: `tsk-${Date.now().toString().slice(-6)}`,
    eventId,
    title,
    assigneeId,
    dueDate: dueDate || new Date().toISOString().split('T')[0],
    priority: (priority || 'Normal') as any,
    status: 'Pending' as any,
    description: description || '',
    createdDate: new Date().toISOString().split('T')[0]
  };

  db.tasks.unshift(newTask);
  dbInstance.save();
  res.json(newTask);
});

app.put('/api/tasks/:id', requireAuth, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  const index = db.tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const updated = { ...db.tasks[index], ...req.body };
  if (updated.status === 'Completed' && !updated.completedDate) {
    updated.completedDate = new Date().toISOString().split('T')[0];
  }
  db.tasks[index] = updated;
  dbInstance.save();
  res.json(updated);
});

app.delete('/api/tasks/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const db = dbInstance.getData();
  db.tasks = db.tasks.filter(t => t.id !== req.params.id);
  dbInstance.save();
  res.json({ success: true });
});

// ================= TEAM PAYMENTS & BATCH PAYOUT (ADMIN ONLY) ================= //
app.post('/api/team-payments', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = dbInstance.getData();
  const { teamMemberId, eventId, paymentType, amount, date, paymentMethod, reference, notes } = req.body;

  const newPayment = {
    id: `tp-${Date.now().toString().slice(-6)}`,
    teamMemberId,
    eventId,
    paymentType: paymentType || 'Event Payment',
    amount: Number(amount || 0),
    date: date || new Date().toISOString().split('T')[0],
    paymentMethod: paymentMethod || 'Bank Transfer',
    reference: reference || '',
    notes: notes || '',
    createdBy: user.id
  };

  db.teamPayments.unshift(newPayment);
  dbInstance.save();
  res.json(newPayment);
});

app.post('/api/payout-batch', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = dbInstance.getData();
  const { payouts } = req.body; // Array of { teamMemberId, amount, paymentType, paymentMethod, notes }

  if (!Array.isArray(payouts) || payouts.length === 0) {
    res.status(400).json({ error: 'No payout items provided' });
    return;
  }

  const createdRecords: any[] = [];
  const batchId = `BATCH-${Date.now().toString().slice(-4)}`;

  for (const item of payouts) {
    const rec = {
      id: `tp-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 5)}`,
      teamMemberId: item.teamMemberId,
      paymentType: item.paymentType || 'Salary',
      amount: Number(item.amount || 0),
      date: new Date().toISOString().split('T')[0],
      paymentMethod: item.paymentMethod || 'Bank Transfer',
      reference: batchId,
      notes: item.notes || `Processed in Batch ${batchId}`,
      createdBy: user.id
    };
    db.teamPayments.unshift(rec);
    createdRecords.push(rec);
  }

  dbInstance.save();
  res.json({ success: true, batchId, totalProcessed: createdRecords.length, records: createdRecords });
});

// ================= AI BUSINESS BRIEFING (GEMINI 3.8 FLASH) ================= //
app.post('/api/ai/briefing', requireAuth, async (req: Request, res: Response) => {
  const db = dbInstance.getData();

  // Compute live studio metrics
  const activeEvents = db.events.filter(e => e.status !== 'Cancelled');
  const totalRevenue = activeEvents.reduce((sum, e) => sum + (e.totalClientPayments || 0), 0);
  const totalProfit = activeEvents.reduce((sum, e) => sum + (e.netProfit || 0), 0);
  const overdueInvoices = db.invoices.filter(i => i.status === 'Overdue');
  const overdueAmount = overdueInvoices.reduce((sum, i) => sum + i.remainingAmount, 0);
  const urgentTasks = db.tasks.filter(t => t.priority === 'Urgent' && t.status !== 'Completed');
  const availableTeam = db.teamMembers.filter(m => m.availabilityStatus === 'Available' && m.isActive).length;
  const lossLeaders = activeEvents.filter(e => (e.netProfit || 0) < 0);
  const equipServiceWarnings = db.equipment.filter(eq => (eq.currentUsageCount || 0) >= (eq.serviceAfterUses || 20)).length;

  const dataSummary = {
    totalActiveEvents: activeEvents.length,
    totalRevenuePKR: totalRevenue,
    totalProfitPKR: totalProfit,
    overdueInvoicesCount: overdueInvoices.length,
    overdueInvoicesAmountPKR: overdueAmount,
    urgentTasksCount: urgentTasks.length,
    availableTeamCount: availableTeam,
    lossLeadersCount: lossLeaders.length,
    equipmentServiceWarningsCount: equipServiceWarnings,
    eventsList: activeEvents.slice(0, 5).map(e => ({
      title: e.title,
      category: e.category,
      date: e.eventDate,
      price: e.packagePrice,
      netProfit: e.netProfit
    }))
  };

  const systemPrompt = `You are the executive AI business intelligence engine for ROYAL STUDIO, a top photography and videography studio in Pakistan.
You must analyze the provided real-time studio financial and operational data and return a JSON object with EXACTLY these five fields:
1. "highlight": One positive business observation based on the live data.
2. "urgentAction": The single most critical operational issue requiring immediate executive attention.
3. "riskAlert": A specific financial or operational risk grounded in the data (e.g. overdue invoices, negative margin events, or maintenance).
4. "opportunity": A practical business growth or upsell recommendation.
5. "todaysTip": A practical studio management tip for wedding/commercial photography operations in Pakistan.

Rules:
- DO NOT invent facts; ground all numbers strictly in the provided data.
- Mention PKR currency values where relevant.
- Return ONLY valid JSON with keys: highlight, urgentAction, riskAlert, opportunity, todaysTip.`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Here is the current live data from Royal Studio database:\n${JSON.stringify(dataSummary, null, 2)}`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json'
        }
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);
      res.json({
        ...parsed,
        generatedAt: new Date().toISOString()
      });
      return;
    }
  } catch (err) {
    console.error('Gemini API call failed, generating deterministic fallback:', err);
  }

  // Fallback grounded strictly in the real database metrics
  const fallback = {
    highlight: `Solid revenue pipeline of PKR ${totalRevenue.toLocaleString()} with PKR ${totalProfit.toLocaleString()} net profit across ${activeEvents.length} active studio productions.`,
    urgentAction: overdueInvoices.length > 0
      ? `Recover PKR ${overdueAmount.toLocaleString()} across ${overdueInvoices.length} overdue invoices immediately to preserve cash flow.`
      : urgentTasks.length > 0
      ? `Clear ${urgentTasks.length} urgent post-production tasks (${urgentTasks[0]?.title || 'pending reels'}) before delivery deadlines.`
      : `Complete pre-production crew call-sheets for upcoming wedding schedules.`,
    riskAlert: lossLeaders.length > 0
      ? `Notice: ${lossLeaders.length} production(s) like "${lossLeaders[0]?.title}" operated at negative margin due to high gear and travel overheads.`
      : equipServiceWarnings > 0
      ? `Sensor calibration & service overdue on ${equipServiceWarnings} flagship camera bodies.`
      : `Monitor equipment checkout schedules to avoid gear shortages during multi-day coverage.`,
    opportunity: `Package multi-day wedding clients with luxury Italian flushmount album upgrades and drone 4K aerial reels at a 25% margin.`,
    todaysTip: `Ensure double SD-card redundancy and battery recharge checklists are verified before departure for Barat and Walima banquet shoots.`,
    generatedAt: new Date().toISOString()
  };

  res.json(fallback);
});

// Vite Middleware for development
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Royal Studio Manager server listening on http://localhost:${PORT}`);
  });
}

startServer();
