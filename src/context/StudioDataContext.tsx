import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
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
  TempHireRecommendation,
  AIBriefing
} from '../types';
import { apiRequest } from '../services/api';
import { useAuth } from './AuthContext';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface StudioDataContextType {
  isLoading: boolean;
  error: string | null;
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;

  // Data Entities
  profile: AdminProfile | null;
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

  // Refresh
  refreshAll: () => Promise<void>;

  // CRUD Operations
  updateProfile: (profileData: Partial<AdminProfile>) => Promise<void>;
  createClient: (clientData: Partial<Client>) => Promise<Client>;
  updateClient: (id: string, clientData: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  createEvent: (eventData: any) => Promise<Event>;
  updateEvent: (id: string, eventData: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  recalculateEvent: (id: string) => Promise<Event>;
  autoAssignCrew: (eventId: string) => Promise<any>;

  createDaySchedule: (data: Partial<EventDaySchedule>) => Promise<void>;
  updateDaySchedule: (id: string, data: Partial<EventDaySchedule>) => Promise<void>;
  deleteDaySchedule: (id: string) => Promise<void>;

  createTeamMember: (data: Partial<TeamMember>) => Promise<void>;
  updateTeamMember: (id: string, data: Partial<TeamMember>) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;

  createTeamAssignment: (data: Partial<EventTeamAssignment>) => Promise<void>;
  deleteTeamAssignment: (id: string) => Promise<void>;

  createEquipment: (data: Partial<Equipment>) => Promise<void>;
  updateEquipment: (id: string, data: Partial<Equipment>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;

  assignEquipment: (data: Partial<EventEquipmentAssignment>) => Promise<void>;
  deleteEquipmentAssignment: (id: string) => Promise<void>;
  createMaintenanceLog: (data: Partial<EquipmentMaintenanceLog>) => Promise<void>;

  createPackage: (data: Partial<Package>) => Promise<void>;
  updatePackage: (id: string, data: Partial<Package>) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;

  createExpense: (data: Partial<EventExpense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  createStudioExpense: (data: Partial<StudioExpense>) => Promise<void>;
  deleteStudioExpense: (id: string) => Promise<void>;

  createInvoice: (data: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;

  createPayment: (data: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;

  createQuotation: (data: Partial<Quotation>) => Promise<void>;

  createTask: (data: Partial<EventTask>) => Promise<void>;
  updateTask: (id: string, data: Partial<EventTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  createTeamPayment: (data: Partial<TeamPayment>) => Promise<void>;
  processPayoutBatch: (payouts: any[]) => Promise<any>;

  fetchAIBriefing: () => Promise<AIBriefing>;
}

const StudioDataContext = createContext<StudioDataContextType | undefined>(undefined);

export const StudioDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Entities state
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [daySchedules, setDaySchedules] = useState<EventDaySchedule[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamAssignments, setTeamAssignments] = useState<EventTeamAssignment[]>([]);
  const [teamPayments, setTeamPayments] = useState<TeamPayment[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [equipmentAssignments, setEquipmentAssignments] = useState<EventEquipmentAssignment[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<EquipmentMaintenanceLog[]>([]);
  const [eventExpenses, setEventExpenses] = useState<EventExpense[]>([]);
  const [studioExpenses, setStudioExpenses] = useState<StudioExpense[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [tasks, setTasks] = useState<EventTask[]>([]);
  const [tempHireRecommendations, setTempHireRecommendations] = useState<TempHireRecommendation[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const refreshAll = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiRequest<any>('/api/db/all');
      setProfile(data.profile);
      setClients(data.clients || []);
      setEvents(data.events || []);
      setDaySchedules(data.daySchedules || []);
      setPackages(data.packages || []);
      setTeamMembers(data.teamMembers || []);
      setTeamAssignments(data.teamAssignments || []);
      setTeamPayments(data.teamPayments || []);
      setEquipment(data.equipment || []);
      setEquipmentAssignments(data.equipmentAssignments || []);
      setMaintenanceLogs(data.maintenanceLogs || []);
      setEventExpenses(data.eventExpenses || []);
      setStudioExpenses(data.studioExpenses || []);
      setInvoices(data.invoices || []);
      setPayments(data.payments || []);
      setQuotations(data.quotations || []);
      setTasks(data.tasks || []);
      setTempHireRecommendations(data.tempHireRecommendations || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load studio data.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshAll();
    } else {
      setIsLoading(false);
    }
  }, [user, refreshAll]);

  // Operations
  const updateProfile = async (profileData: Partial<AdminProfile>) => {
    try {
      const updated = await apiRequest('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
      setProfile(updated);
      addToast('Studio profile and settings updated successfully.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const createClient = async (clientData: Partial<Client>) => {
    try {
      const newClient = await apiRequest<Client>('/api/clients', {
        method: 'POST',
        body: JSON.stringify(clientData)
      });
      setClients(prev => [newClient, ...prev]);
      addToast('Client created successfully.');
      return newClient;
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    try {
      const updated = await apiRequest<Client>(`/api/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(clientData)
      });
      setClients(prev => prev.map(c => (c.id === id ? updated : c)));
      addToast('Client updated successfully.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await apiRequest(`/api/clients/${id}`, { method: 'DELETE' });
      setClients(prev => prev.filter(c => c.id !== id));
      addToast('Client deleted successfully.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const createEvent = async (eventData: any) => {
    try {
      const newEvent = await apiRequest<Event>('/api/events', {
        method: 'POST',
        body: JSON.stringify(eventData)
      });
      await refreshAll();
      addToast('Event created successfully.');
      return newEvent;
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const updateEvent = async (id: string, eventData: Partial<Event>) => {
    try {
      const updated = await apiRequest<Event>(`/api/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(eventData)
      });
      setEvents(prev => prev.map(e => (e.id === id ? updated : e)));
      addToast('Event updated successfully.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await apiRequest(`/api/events/${id}`, { method: 'DELETE' });
      await refreshAll();
      addToast('Event deleted successfully.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const recalculateEvent = async (id: string) => {
    try {
      const updated = await apiRequest<Event>(`/api/events/${id}/recalculate`, {
        method: 'POST'
      });
      setEvents(prev => prev.map(e => (e.id === id ? updated : e)));
      addToast('Event financials recalculated successfully.');
      return updated;
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const autoAssignCrew = async (eventId: string) => {
    try {
      const res = await apiRequest<any>(`/api/events/${eventId}/auto-assign`, {
        method: 'POST'
      });
      await refreshAll();
      if (res.hasShortage) {
        addToast(
          `Insufficient team availability: Shortage of ${res.missingRoles.join(', ')}. Temporary hire recommendation generated.`,
          'warning'
        );
      } else {
        addToast(`Auto-assigned ${res.assignedCount} team members successfully.`);
      }
      return res;
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const createDaySchedule = async (data: Partial<EventDaySchedule>) => {
    try {
      await apiRequest('/api/day-schedules', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      await refreshAll();
      addToast('Event day schedule added.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const updateDaySchedule = async (id: string, data: Partial<EventDaySchedule>) => {
    try {
      await apiRequest(`/api/day-schedules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      await refreshAll();
      addToast('Day schedule updated.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const deleteDaySchedule = async (id: string) => {
    try {
      await apiRequest(`/api/day-schedules/${id}`, { method: 'DELETE' });
      await refreshAll();
      addToast('Day schedule removed.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const createTeamMember = async (data: Partial<TeamMember>) => {
    try {
      await apiRequest('/api/team', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      await refreshAll();
      addToast('Team member created successfully.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const updateTeamMember = async (id: string, data: Partial<TeamMember>) => {
    try {
      await apiRequest(`/api/team/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      await refreshAll();
      addToast('Team member updated successfully.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const deleteTeamMember = async (id: string) => {
    try {
      await apiRequest(`/api/team/${id}`, { method: 'DELETE' });
      await refreshAll();
      addToast('Team member removed.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const createTeamAssignment = async (data: Partial<EventTeamAssignment>) => {
    try {
      await apiRequest('/api/team-assignments', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      await refreshAll();
      addToast('Team member assigned to event.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const deleteTeamAssignment = async (id: string) => {
    try {
      await apiRequest(`/api/team-assignments/${id}`, { method: 'DELETE' });
      await refreshAll();
      addToast('Assignment removed.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const createEquipment = async (data: Partial<Equipment>) => {
    try {
      await apiRequest('/api/equipment', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      await refreshAll();
      addToast('Equipment added successfully.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const updateEquipment = async (id: string, data: Partial<Equipment>) => {
    try {
      await apiRequest(`/api/equipment/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      await refreshAll();
      addToast('Equipment updated successfully.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const deleteEquipment = async (id: string) => {
    try {
      await apiRequest(`/api/equipment/${id}`, { method: 'DELETE' });
      await refreshAll();
      addToast('Equipment deleted.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const assignEquipment = async (data: Partial<EventEquipmentAssignment>) => {
    try {
      await apiRequest('/api/equipment-assignments', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      await refreshAll();
      addToast('Equipment assigned to event.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const deleteEquipmentAssignment = async (id: string) => {
    try {
      await apiRequest(`/api/equipment-assignments/${id}`, { method: 'DELETE' });
      await refreshAll();
      addToast('Equipment assignment removed.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const createMaintenanceLog = async (data: Partial<EquipmentMaintenanceLog>) => {
    try {
      await apiRequest('/api/maintenance-logs', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      await refreshAll();
      addToast('Maintenance log recorded.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const createPackage = async (data: Partial<Package>) => {
    try {
      await apiRequest('/api/packages', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      await refreshAll();
      addToast('Package created successfully.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const updatePackage = async (id: string, data: Partial<Package>) => {
    try {
      await apiRequest(`/api/packages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      await refreshAll();
      addToast('Package updated successfully.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const deletePackage = async (id: string) => {
    try {
      await apiRequest(`/api/packages/${id}`, { method: 'DELETE' });
      await refreshAll();
      addToast('Package deleted.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const createExpense = async (data: Partial<EventExpense>) => {
    try {
      await apiRequest('/api/expenses', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      await refreshAll();
      addToast('Event expense recorded.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await apiRequest(`/api/expenses/${id}`, { method: 'DELETE' });
      await refreshAll();
      addToast('Expense removed.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const createStudioExpense = async (data: Partial<StudioExpense>) => {
    try {
      await apiRequest('/api/studio-expenses', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      await refreshAll();
      addToast('Studio overhead expense recorded.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const deleteStudioExpense = async (id: string) => {
    try {
      await apiRequest(`/api/studio-expenses/${id}`, { method: 'DELETE' });
      await refreshAll();
      addToast('Studio expense removed.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const createInvoice = async (data: Partial<Invoice>) => {
    try {
      await apiRequest('/api/invoices', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      await refreshAll();
      addToast('Invoice generated successfully.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      await apiRequest(`/api/invoices/${id}`, { method: 'DELETE' });
      await refreshAll();
      addToast('Invoice deleted.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const createPayment = async (data: Partial<Payment>) => {
    try {
      await apiRequest('/api/payments', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      await refreshAll();
      addToast('Payment recorded successfully.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const deletePayment = async (id: string) => {
    try {
      await apiRequest(`/api/payments/${id}`, { method: 'DELETE' });
      await refreshAll();
      addToast('Payment deleted.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const createQuotation = async (data: Partial<Quotation>) => {
    try {
      await apiRequest('/api/quotations', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      await refreshAll();
      addToast('Quotation created successfully.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const createTask = async (data: Partial<EventTask>) => {
    try {
      await apiRequest('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      await refreshAll();
      addToast('Task created successfully.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const updateTask = async (id: string, data: Partial<EventTask>) => {
    try {
      await apiRequest(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      await refreshAll();
      addToast('Task updated successfully.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await apiRequest(`/api/tasks/${id}`, { method: 'DELETE' });
      await refreshAll();
      addToast('Task deleted.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const createTeamPayment = async (data: Partial<TeamPayment>) => {
    try {
      await apiRequest('/api/team-payments', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      await refreshAll();
      addToast('Team payment recorded successfully.');
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const processPayoutBatch = async (payouts: any[]) => {
    try {
      const res = await apiRequest('/api/payout-batch', {
        method: 'POST',
        body: JSON.stringify({ payouts })
      });
      await refreshAll();
      addToast(`Batch ${res.batchId} processed with ${res.totalProcessed} payouts.`);
      return res;
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const fetchAIBriefing = async (): Promise<AIBriefing> => {
    try {
      const briefing = await apiRequest<AIBriefing>('/api/ai/briefing', {
        method: 'POST'
      });
      return briefing;
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  return (
    <StudioDataContext.Provider
      value={{
        isLoading,
        error,
        toasts,
        addToast,
        removeToast,
        profile,
        clients,
        events,
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
        tempHireRecommendations,
        refreshAll,
        updateProfile,
        createClient,
        updateClient,
        deleteClient,
        createEvent,
        updateEvent,
        deleteEvent,
        recalculateEvent,
        autoAssignCrew,
        createDaySchedule,
        updateDaySchedule,
        deleteDaySchedule,
        createTeamMember,
        updateTeamMember,
        deleteTeamMember,
        createTeamAssignment,
        deleteTeamAssignment,
        createEquipment,
        updateEquipment,
        deleteEquipment,
        assignEquipment,
        deleteEquipmentAssignment,
        createMaintenanceLog,
        createPackage,
        updatePackage,
        deletePackage,
        createExpense,
        deleteExpense,
        createStudioExpense,
        deleteStudioExpense,
        createInvoice,
        deleteInvoice,
        createPayment,
        deletePayment,
        createQuotation,
        createTask,
        updateTask,
        deleteTask,
        createTeamPayment,
        processPayoutBatch,
        fetchAIBriefing
      }}
    >
      {children}
    </StudioDataContext.Provider>
  );
};

export function useStudioData() {
  const context = useContext(StudioDataContext);
  if (!context) {
    throw new Error('useStudioData must be used within a StudioDataProvider');
  }
  return context;
}
