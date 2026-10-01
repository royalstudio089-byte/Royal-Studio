import React, { useState } from 'react';
import {
  Users,
  Plus,
  Phone,
  Mail,
  Shield,
  Trash2,
  Edit,
  DollarSign,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useStudioData } from '../context/StudioDataContext';
import { useAuth } from '../context/AuthContext';
import { formatPKR, formatDate } from '../utils/calculations';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { TeamMember, TeamRole, AvailabilityStatus } from '../types';

interface TeamPageProps {
  navigate: (path: string) => void;
}

export const TeamPage: React.FC<TeamPageProps> = () => {
  const { teamMembers, teamAssignments, createTeamMember, updateTeamMember, deleteTeamMember, addToast } = useStudioData();
  const { isAdmin } = useAuth();

  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TeamRole>('Photographer');
  const [specialization, setSpecialization] = useState('');
  const [dailyRate, setDailyRate] = useState(10000);
  const [eventRate, setEventRate] = useState(12000);
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('Available');
  const [notes, setNotes] = useState('');

  const filteredMembers = teamMembers.filter(m => {
    const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || m.availabilityStatus === statusFilter;
    return matchesRole && matchesStatus;
  });

  const handleOpenCreate = () => {
    setEditingMember(null);
    setName('');
    setPhone('');
    setWhatsapp('');
    setEmail('');
    setRole('Photographer');
    setSpecialization('');
    setDailyRate(10000);
    setEventRate(12000);
    setAvailabilityStatus('Available');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: TeamMember) => {
    setEditingMember(m);
    setName(m.name);
    setPhone(m.phone);
    setWhatsapp(m.whatsapp);
    setEmail(m.email);
    setRole(m.role);
    setSpecialization(m.specialization);
    setDailyRate(m.dailyRate);
    setEventRate(m.eventRate);
    setAvailabilityStatus(m.availabilityStatus);
    setNotes(m.notes);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      addToast('Name and Phone are required', 'error');
      return;
    }

    if (editingMember) {
      await updateTeamMember(editingMember.id, {
        name,
        phone,
        whatsapp: whatsapp || phone,
        email,
        role,
        specialization,
        dailyRate: Number(dailyRate),
        eventRate: Number(eventRate),
        availabilityStatus,
        notes
      });
    } else {
      await createTeamMember({
        name,
        phone,
        whatsapp: whatsapp || phone,
        email,
        role,
        specialization,
        dailyRate: Number(dailyRate),
        eventRate: Number(eventRate),
        availabilityStatus,
        notes
      });
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;
    await deleteTeamMember(memberToDelete);
    setMemberToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Production Crew & Talents</h2>
          <p className="text-xs text-gray-500">
            Photographers, cinematographers, drone pilots, and editors with standard daily/event rates.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Crew Member</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="Photographer">Photographers</option>
            <option value="Videographer">Videographers</option>
            <option value="Drone Operator">Drone Operators</option>
            <option value="Editor">Editors</option>
            <option value="Assistant">Assistants</option>
            <option value="Album Designer">Album Designers</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Busy">Busy (On Shoot)</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map(m => {
          const assignments = teamAssignments.filter(a => a.teamMemberId === m.id);
          const totalEarned = assignments.reduce((sum, a) => sum + (a.cost || 0), 0);

          return (
            <div
              key={m.id}
              className="p-5 bg-white rounded-xl border border-gray-200 shadow-xs hover:border-amber-400 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{m.name}</h3>
                  <div className="text-xs font-medium text-amber-700 mt-0.5">{m.role}</div>
                  <div className="text-[11px] text-gray-500 italic mt-0.5">{m.specialization}</div>
                </div>
                <div className="flex items-center gap-1">
                  <StatusBadge status={m.availabilityStatus} size="sm" />
                  {isAdmin && (
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-1 text-gray-400 hover:text-gray-700 rounded ml-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setMemberToDelete(m.id);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="p-1 text-gray-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-xs space-y-1 text-gray-600 bg-gray-50/70 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{m.phone}</span>
                </div>
                {m.email && (
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{m.email}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-medium">Standard Rates</div>
                  <div className="font-mono font-bold text-gray-900">{formatPKR(m.eventRate)} / event</div>
                  <div className="text-[10px] text-gray-500 font-mono">{formatPKR(m.dailyRate)} / day</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-400 uppercase font-medium">Productions Done</div>
                  <div className="font-bold text-gray-900">{assignments.length} shoots</div>
                  <div className="text-[10px] font-mono text-emerald-600 font-bold">{formatPKR(totalEarned)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? 'Edit Crew Member' : 'New Crew Member Registration'}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone *</label>
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">Role *</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as TeamRole)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              >
                <option value="Photographer">Photographer</option>
                <option value="Videographer">Videographer</option>
                <option value="Drone Operator">Drone Operator</option>
                <option value="Editor">Editor</option>
                <option value="Assistant">Assistant</option>
                <option value="Album Designer">Album Designer</option>
                <option value="Manager">Manager</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Availability</label>
              <select
                value={availabilityStatus}
                onChange={e => setAvailabilityStatus(e.target.value as AvailabilityStatus)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              >
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Specialization / Gear Rig</label>
            <input
              type="text"
              value={specialization}
              onChange={e => setSpecialization(e.target.value)}
              placeholder="e.g. Fine-art Bridal Portraits & Prime Lenses"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Standard Event Rate (PKR)</label>
              <input
                type="number"
                value={eventRate}
                onChange={e => setEventRate(Number(e.target.value))}
                min="0"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Daily Rate (PKR)</label>
              <input
                type="number"
                value={dailyRate}
                onChange={e => setDailyRate(Number(e.target.value))}
                min="0"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-lg text-xs"
            >
              Save Member
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Remove Crew Member?"
        message="Are you sure you want to remove this team member from the studio database?"
      />
    </div>
  );
};
