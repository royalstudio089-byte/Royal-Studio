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
  AlertCircle,
  UserPlus,
  KeyRound,
  Lock,
  UserCheck,
  UserX,
  CheckCircle2
} from 'lucide-react';
import { useStudioData } from '../context/StudioDataContext';
import { useAuth } from '../context/AuthContext';
import { formatPKR, formatDate } from '../utils/calculations';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { TeamMember, TeamRole, AvailabilityStatus, User } from '../types';

interface TeamPageProps {
  navigate: (path: string) => void;
}

export const TeamPage: React.FC<TeamPageProps> = () => {
  const {
    teamMembers,
    teamAssignments,
    users,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    createStaffUser,
    updateUserStatus,
    resetUserPassword,
    deleteUser,
    addToast
  } = useStudioData();
  const { isAdmin } = useAuth();

  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  // Staff Login Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [memberForLogin, setMemberForLogin] = useState<TeamMember | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('staff123');
  const [isCreatingLogin, setIsCreatingLogin] = useState(false);

  // Password Reset Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [userForReset, setUserForReset] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Remove Login Dialog
  const [isRemoveLoginDialogOpen, setIsRemoveLoginDialogOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<User | null>(null);

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

  const handleOpenCreateLogin = (m: TeamMember) => {
    setMemberForLogin(m);
    const slug = m.name.toLowerCase().replace(/[^a-z0-9]/g, '.');
    setLoginEmail(m.email || `${slug}@royalstudio.pk`);
    setLoginPassword('staff123');
    setIsLoginModalOpen(true);
  };

  const handleCreateLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForLogin) return;

    setIsCreatingLogin(true);
    try {
      await createStaffUser({
        teamMemberId: memberForLogin.id,
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
        name: memberForLogin.name,
        phone: memberForLogin.phone
      });
      setIsLoginModalOpen(false);
      setMemberForLogin(null);
    } catch {
      // Toast already shown in context
    } finally {
      setIsCreatingLogin(false);
    }
  };

  const handleOpenResetPassword = (u: User) => {
    setUserForReset(u);
    setNewPassword('');
    setIsResetModalOpen(true);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForReset || !newPassword) return;

    setIsResetting(true);
    try {
      await resetUserPassword(userForReset.id, newPassword);
      setIsResetModalOpen(false);
      setUserForReset(null);
    } catch {
      // Handled
    } finally {
      setIsResetting(false);
    }
  };

  const handleToggleUserStatus = async (u: User) => {
    const nextStatus = u.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    await updateUserStatus(u.id, nextStatus);
  };

  const handleConfirmRemoveLogin = async () => {
    if (!userToRemove) return;
    await deleteUser(userToRemove.id);
    setUserToRemove(null);
    setIsRemoveLoginDialogOpen(false);
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

              {/* Staff Login Relationship Section */}
              {(() => {
                const linkedUser = users.find(u => u.linkedTeamMemberId === m.id || u.id === m.userId);
                return (
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                        Staff Login:
                      </span>
                      {linkedUser ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            linkedUser.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          <UserCheck className="w-3 h-3" />
                          Login: {linkedUser.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          <UserX className="w-3 h-3 text-gray-400" />
                          Login: No Login
                        </span>
                      )}
                    </div>

                    {linkedUser ? (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-500 font-medium">Account:</span>
                          <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                            {linkedUser.email}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-500 font-medium">Role:</span>
                          <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">
                            STAFF
                          </span>
                        </div>

                        {isAdmin && (
                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-1.5">
                            <button
                              onClick={() => handleOpenResetPassword(linkedUser)}
                              className="flex-1 py-1 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              title="Reset Staff Password"
                            >
                              <KeyRound className="w-3 h-3 text-amber-600" />
                              <span>Reset Password</span>
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(linkedUser)}
                              className={`py-1 px-2 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                                linkedUser.status === 'ACTIVE'
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                              }`}
                              title={linkedUser.status === 'ACTIVE' ? 'Disable Staff Account' : 'Enable Staff Account'}
                            >
                              {linkedUser.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              onClick={() => {
                                setUserToRemove(linkedUser);
                                setIsRemoveLoginDialogOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                              title="Remove Staff Login"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      isAdmin && (
                        <button
                          onClick={() => handleOpenCreateLogin(m)}
                          className="w-full py-2 px-3 bg-gradient-to-r from-amber-50 to-amber-100/90 hover:from-amber-100 hover:to-amber-200 text-amber-950 border border-amber-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-amber-700" />
                          <span>CREATE STAFF LOGIN</span>
                        </button>
                      )
                    )}
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>

      {/* CREATE STAFF LOGIN MODAL */}
      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title="Create Staff Login Account"
      >
        {memberForLogin && (
          <form onSubmit={handleCreateLoginSubmit} className="space-y-4">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                <Shield className="w-4 h-4 text-amber-700" />
                <span>Restricted Staff Workspace</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                Creating login credentials for <strong>{memberForLogin.name}</strong> will provision a secure Staff account with access restricted strictly to their assigned tasks, production shoots, and individual earnings.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div>
                <span className="text-gray-500 font-medium block">Team Member:</span>
                <span className="font-bold text-gray-900">{memberForLogin.name}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium block">System Role:</span>
                <span className="font-bold text-blue-700">STAFF</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Staff Email (Login Username) *
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
                placeholder="staff@royalstudio.pk"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Initial Password *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  required
                  minLength={4}
                  placeholder="Minimum 4 characters"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Royal Studio Admin can reset or change this password anytime.
              </p>
            </div>

            <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingLogin}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isCreatingLogin ? 'Creating Login...' : 'Create Staff Login'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* RESET PASSWORD MODAL */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Staff Password"
      >
        {userForReset && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <p className="text-xs text-gray-600">
              Reset login credentials for <strong>{userForReset.name}</strong> ({userForReset.email}).
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                New Password *
              </label>
              <input
                type="text"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={4}
                placeholder="Enter new password"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isResetting || !newPassword}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isResetting ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* CONFIRMATION: REMOVE LOGIN */}
      <ConfirmationDialog
        isOpen={isRemoveLoginDialogOpen}
        onClose={() => setIsRemoveLoginDialogOpen(false)}
        onConfirm={handleConfirmRemoveLogin}
        title="Remove Staff Login?"
        message={`Are you sure you want to remove the login account for ${userToRemove?.name || 'this staff member'}? Their team profile and historical shoots will remain intact.`}
      />

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
