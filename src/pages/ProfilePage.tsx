import React, { useState } from 'react';
import {
  Settings,
  Building,
  CreditCard,
  FileText,
  Save,
  CheckCircle2,
  Shield,
  UserCheck,
  UserX,
  KeyRound,
  Trash2,
  Lock,
  Users
} from 'lucide-react';
import { useStudioData } from '../context/StudioDataContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { User } from '../types';

export const ProfilePage: React.FC = () => {
  const {
    profile,
    updateProfile,
    users,
    updateUserStatus,
    resetUserPassword,
    deleteUser,
    addToast
  } = useStudioData();
  const { user: currentUser, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'SETTINGS' | 'USERS'>('SETTINGS');

  const [studioName, setStudioName] = useState(profile?.studioName || 'Royal Studio');
  const [tagline, setTagline] = useState(profile?.tagline || 'Luxury wedding photography, cinematic films, and brand shoots.');
  const [description, setDescription] = useState(profile?.description || profile?.tagline || 'Luxury wedding photography, cinematic films, and brand shoots.');
  const [address, setAddress] = useState(profile?.address || 'Al Jannat Town Entrance, Canal Bungalow Road, Opposite Habib Mall, Burewala, Punjab 61010, Pakistan');
  const [city, setCity] = useState(profile?.city || 'Burewala, Punjab, Pakistan');
  const [phone, setPhone] = useState(profile?.phone || '0308-4877073');
  const [phone2, setPhone2] = useState(profile?.phone2 || '0303-2213806');
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp || '0308-4877073');
  const [email, setEmail] = useState(profile?.email || 'royalstudio089@gmail.com');
  const [website, setWebsite] = useState(profile?.website || 'https://royalstudio.online');
  const [instagram, setInstagram] = useState(profile?.instagram || 'https://www.instagram.com/royalstudio089');
  const [facebook, setFacebook] = useState(profile?.facebook || 'https://www.facebook.com/royalstudio089');
  const [youtube, setYoutube] = useState(profile?.youtube || 'https://www.youtube.com/@royalstudio089');
  const [googleMapsUrl, setGoogleMapsUrl] = useState(profile?.googleMapsUrl || 'https://maps.app.goo.gl/mQPek7wm4nCVjy8o9');
  const [bankName, setBankName] = useState(profile?.bankName || 'Meezan Bank Ltd');
  const [accountTitle, setAccountTitle] = useState(profile?.accountTitle || 'Royal Studio');
  const [accountNumber, setAccountNumber] = useState(profile?.accountNumber || '02010103456789');
  const [iban, setIban] = useState(profile?.iban || 'PK45MEZN0002010103456789');
  const [taxRate, setTaxRate] = useState(profile?.taxRate || 5);
  const [currency, setCurrency] = useState(profile?.currency || 'PKR');
  const [quotationPrefix, setQuotationPrefix] = useState(profile?.quotationPrefix || 'RS-QUO-');
  const [invoicePrefix, setInvoicePrefix] = useState(profile?.invoicePrefix || 'RS-INV-');
  const [paymentTerms, setPaymentTerms] = useState(
    profile?.paymentTerms || '50% Advance at booking, 30% on main event date, 20% on final deliverable handover.'
  );

  const [isSaving, setIsSaving] = useState(false);

  // User management modals
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const adminUsers = users.filter(u => u.role === 'ADMIN');
  const staffUsers = users.filter(u => u.role === 'STAFF');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      addToast('Only administrators can modify studio profile settings.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        studioName,
        tagline,
        description,
        address,
        city,
        phone,
        phone2,
        whatsapp,
        email,
        website,
        instagram,
        facebook,
        youtube,
        googleMapsUrl,
        bankName,
        accountTitle,
        accountNumber,
        iban,
        taxRate: Number(taxRate),
        currency,
        quotationPrefix,
        invoicePrefix,
        paymentTerms
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenResetPassword = (u: User) => {
    setTargetUser(u);
    setNewPassword('');
    setIsResetModalOpen(true);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser || !newPassword) return;

    setIsResetting(true);
    try {
      await resetUserPassword(targetUser.id, newPassword);
      setIsResetModalOpen(false);
      setTargetUser(null);
    } finally {
      setIsResetting(false);
    }
  };

  const handleToggleStatus = async (u: User) => {
    const nextStatus = u.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    await updateUserStatus(u.id, nextStatus);
  };

  const handleDeleteUserConfirm = async () => {
    if (!targetUser) return;
    await deleteUser(targetUser.id);
    setTargetUser(null);
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Studio Settings & Official Profile</h2>
          <p className="text-xs text-gray-500">
            Configure studio branding, Pakistani banking details, tax rates, and manage Royal Studio User Accounts.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'SETTINGS'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Studio Identity & Tax
          </button>
          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'USERS'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>User Accounts ({users.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'SETTINGS' ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Studio Identity Card */}
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-slate-900 font-bold text-sm">
              <Building className="w-4 h-4 text-amber-600" />
              <span>Studio Identity & Contact Details</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Studio Brand Name</label>
                <input
                  type="text"
                  value={studioName}
                  onChange={e => setStudioName(e.target.value)}
                  disabled={!isAdmin}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Business Description / Tagline</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => {
                    setDescription(e.target.value);
                    setTagline(e.target.value);
                  }}
                  disabled={!isAdmin}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  disabled={!isAdmin}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Secondary Phone</label>
                <input
                  type="text"
                  value={phone2}
                  onChange={e => setPhone2(e.target.value)}
                  disabled={!isAdmin}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">WhatsApp</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  disabled={!isAdmin}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={!isAdmin}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Website URL</label>
                <input
                  type="text"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  disabled={!isAdmin}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">City / Region</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  disabled={!isAdmin}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Studio Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  disabled={!isAdmin}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              {/* Social Media & Google Maps */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Facebook URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={facebook}
                    onChange={e => setFacebook(e.target.value)}
                    disabled={!isAdmin}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                  />
                  {facebook && (
                    <a
                      href={facebook.startsWith('http') ? facebook : `https://${facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold shrink-0"
                    >
                      Visit
                    </a>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Instagram URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={instagram}
                    onChange={e => setInstagram(e.target.value)}
                    disabled={!isAdmin}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                  />
                  {instagram && (
                    <a
                      href={instagram.startsWith('http') ? instagram : `https://${instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold shrink-0"
                    >
                      Visit
                    </a>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">YouTube URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={youtube}
                    onChange={e => setYoutube(e.target.value)}
                    disabled={!isAdmin}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                  />
                  {youtube && (
                    <a
                      href={youtube.startsWith('http') ? youtube : `https://${youtube}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold shrink-0"
                    >
                      Visit
                    </a>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Google Maps Location Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={googleMapsUrl}
                    onChange={e => setGoogleMapsUrl(e.target.value)}
                    disabled={!isAdmin}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                  />
                  {googleMapsUrl && (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1"
                    >
                      Open Map
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Banking & Wire Transfer Card */}
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-slate-900 font-bold text-sm">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Bank & Wire Transfer Information (Included in Invoices)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  disabled={!isAdmin}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Account Title</label>
                <input
                  type="text"
                  value={accountTitle}
                  onChange={e => setAccountTitle(e.target.value)}
                  disabled={!isAdmin}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  disabled={!isAdmin}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">IBAN</label>
                <input
                  type="text"
                  value={iban}
                  onChange={e => setIban(e.target.value)}
                  disabled={!isAdmin}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Legal & Invoicing Rules */}
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-slate-900 font-bold text-sm">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Document Prefixes & Standard Terms</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Invoice Prefix</label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={e => setInvoicePrefix(e.target.value)}
                  disabled={!isAdmin}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Quotation Prefix</label>
                <input
                  type="text"
                  value={quotationPrefix}
                  onChange={e => setQuotationPrefix(e.target.value)}
                  disabled={!isAdmin}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Sales Tax (%)</label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={e => setTaxRate(Number(e.target.value))}
                  disabled={!isAdmin}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Standard Payment Terms</label>
              <textarea
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value)}
                disabled={!isAdmin}
                rows={2}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {isAdmin && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
              </button>
            </div>
          )}
        </form>
      ) : (
        /* USER ACCOUNTS & ACCESS CONTROL */
        <div className="space-y-6">
          {/* PRIMARY STUDIO ADMIN ACCOUNT */}
          <div className="p-6 bg-white rounded-2xl border-2 border-amber-300 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900 leading-tight">
                    Royal Studio
                  </h3>
                  <div className="text-xs font-semibold text-amber-700 mt-0.5">
                    Administrator
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full">
                Active
              </span>
            </div>

            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 text-xs space-y-2 text-amber-950">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Full System Control & Ownership</span>
              </div>
              <p className="text-[11px] text-amber-900/90 leading-relaxed">
                The <strong>Royal Studio</strong> Admin account represents the official business entity account, possessing comprehensive privileges to manage team members, staff credentials, event bookings, quotes, financial ledgers, gear lockers, and studio settings.
              </p>
            </div>

            {adminUsers.map(admin => (
              <div key={admin.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-gray-900">{admin.name}</div>
                  <div className="text-gray-500 font-mono text-[11px] mt-0.5">{admin.email}</div>
                  <div className="text-[10px] text-amber-800 font-semibold uppercase tracking-wider mt-1">
                    Role: ADMIN • Status: {admin.status}
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleOpenResetPassword(admin)}
                    className="self-start sm:self-auto py-1.5 px-3 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    <span>Change Admin Password</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* STAFF ACCOUNTS LIST */}
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Staff Login Accounts ({staffUsers.length})</span>
              </div>
              <div className="text-xs text-gray-500">
                Restricted to Own Tasks, Shoots & Payments
              </div>
            </div>

            {staffUsers.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-xs text-gray-500">
                No staff login accounts created yet. Visit the <strong>Production Crew</strong> tab to create login credentials for any team member.
              </div>
            ) : (
              <div className="space-y-3">
                {staffUsers.map(staff => (
                  <div
                    key={staff.id}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-gray-300 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{staff.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            staff.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {staff.status}
                        </span>
                      </div>
                      <div className="text-gray-500 font-mono text-[11px] mt-0.5">{staff.email}</div>
                      <div className="text-[10px] text-blue-700 font-semibold mt-1">
                        Role: STAFF • Linked Team Member: {staff.name}
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                          onClick={() => handleOpenResetPassword(staff)}
                          className="py-1.5 px-3 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                          <span>Reset Password</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(staff)}
                          className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            staff.status === 'ACTIVE'
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {staff.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => {
                            setTargetUser(staff);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Remove user account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title={`Reset Password — ${targetUser?.name || 'User'}`}
      >
        {targetUser && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <p className="text-xs text-gray-600">
              Set a new secure password for <strong>{targetUser.name}</strong> ({targetUser.email}).
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
                placeholder="Minimum 4 characters"
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
                <span>{isResetting ? 'Saving...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* CONFIRMATION: DELETE USER ACCOUNT */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteUserConfirm}
        title="Remove Staff User Account?"
        message={`Are you sure you want to delete the login account for ${targetUser?.name}? Their crew member profile and historical production records will not be affected.`}
      />
    </div>
  );
};
