import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Trash2,
  Edit,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useStudioData } from '../context/StudioDataContext';
import { useAuth } from '../context/AuthContext';
import { formatPKR, formatDate } from '../utils/calculations';
import { Modal } from '../components/common/Modal';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { Client } from '../types';

interface ClientsPageProps {
  navigate: (path: string) => void;
}

export const ClientsPage: React.FC<ClientsPageProps> = ({ navigate }) => {
  const { clients, events, createClient, updateClient, deleteClient, addToast } = useStudioData();
  const { isAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Lahore');
  const [notes, setNotes] = useState('');

  const filteredClients = clients.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.city.toLowerCase().includes(search.toLowerCase());
    const matchesCity = cityFilter === 'ALL' || c.city === cityFilter;
    return matchesSearch && matchesCity;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      addToast('Name and Phone are required.', 'error');
      return;
    }
    await createClient({
      name,
      phone,
      whatsapp: whatsapp || phone,
      email,
      address,
      city,
      notes
    });
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    await updateClient(selectedClient.id, {
      name,
      phone,
      whatsapp,
      email,
      address,
      city,
      notes
    });
    setIsEditModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    await deleteClient(clientToDelete);
    if (selectedClient?.id === clientToDelete) setSelectedClient(null);
    setClientToDelete(null);
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setWhatsapp('');
    setEmail('');
    setAddress('');
    setCity('Lahore');
    setNotes('');
  };

  const openEditModal = (c: Client) => {
    setSelectedClient(c);
    setName(c.name);
    setPhone(c.phone);
    setWhatsapp(c.whatsapp);
    setEmail(c.email);
    setAddress(c.address);
    setCity(c.city);
    setNotes(c.notes);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Client Directory & CRM</h2>
          <p className="text-xs text-gray-500">
            Client contacts, lifetime booking value, wedding histories, and outstanding balances.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Client</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by client name, phone, city..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none"
          >
            <option value="ALL">All Cities</option>
            <option value="Lahore">Lahore</option>
            <option value="Islamabad">Islamabad</option>
            <option value="Karachi">Karachi</option>
            <option value="Rawalpindi">Rawalpindi</option>
            <option value="Faisalabad">Faisalabad</option>
          </select>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map(c => {
          const clientEvents = events.filter(e => e.clientId === c.id);
          const totalSpent = clientEvents.reduce((sum, e) => sum + (e.packagePrice || 0), 0);
          const totalPaid = clientEvents.reduce((sum, e) => sum + (e.totalClientPayments || 0), 0);
          const totalOutstanding = totalSpent - totalPaid;

          return (
            <div
              key={c.id}
              className="p-5 bg-white rounded-xl border border-gray-200 shadow-xs hover:border-amber-400 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{c.name}</h3>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-gray-400" /> {c.city}, Pakistan
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(c)}
                    className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                    title="Edit Client"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setClientToDelete(c.id);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                      title="Delete Client"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-xs space-y-1.5 text-gray-600 bg-gray-50/70 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{c.phone}</span>
                </div>
                {c.whatsapp && (
                  <div className="flex items-center gap-2 text-emerald-700">
                    <span className="font-bold text-[10px]">WA:</span>
                    <span>{c.whatsapp}</span>
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{c.email}</span>
                  </div>
                )}
              </div>

              {/* Financial Snapshot */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center text-xs">
                <div>
                  <div className="text-[10px] text-gray-400 font-medium uppercase">Bookings</div>
                  <div className="font-bold text-gray-900">{clientEvents.length}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 font-medium uppercase">Paid</div>
                  <div className="font-bold text-emerald-600 font-mono">{formatPKR(totalPaid)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 font-medium uppercase">Balance</div>
                  <div className={`font-bold font-mono ${totalOutstanding > 0 ? 'text-amber-700' : 'text-gray-700'}`}>
                    {formatPKR(totalOutstanding)}
                  </div>
                </div>
              </div>

              {/* Events list preview */}
              {clientEvents.length > 0 && (
                <div className="pt-2 border-t border-gray-100 space-y-1">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Latest Event:</div>
                  <div
                    onClick={() => navigate(`/events/${clientEvents[0].id}`)}
                    className="flex items-center justify-between text-xs p-2 bg-amber-50/50 rounded-lg hover:bg-amber-100/50 cursor-pointer transition-colors"
                  >
                    <span className="font-semibold text-gray-900 truncate max-w-[180px]">
                      {clientEvents[0].title}
                    </span>
                    <ArrowRight className="w-3 h-3 text-amber-700" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Studio Client"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Tariq Mehmood"
              required
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">WhatsApp</label>
              <input
                type="text"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="client@example.pk"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Lahore"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Residential Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. House 14-A, DHA Phase 5"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Client Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Special preferences, aesthetic taste, family members..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-lg text-xs"
            >
              Save Client
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Client Information"
      >
        <form onSubmit={handleEditSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">WhatsApp</label>
              <input
                type="text"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-lg text-xs"
            >
              Update Client
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Client Record?"
        message="Are you sure you want to permanently delete this client? Only clients with zero events can be deleted."
      />
    </div>
  );
};
