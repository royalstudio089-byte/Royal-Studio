import React, { useState } from 'react';
import {
  Settings,
  Building,
  CreditCard,
  FileText,
  Save,
  CheckCircle2
} from 'lucide-react';
import { useStudioData } from '../context/StudioDataContext';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { profile, updateProfile, addToast } = useStudioData();
  const { isAdmin } = useAuth();

  const [studioName, setStudioName] = useState(profile?.studioName || 'ROYAL STUDIO');
  const [tagline, setTagline] = useState(profile?.tagline || 'Premier Visuals & Cinema Management');
  const [address, setAddress] = useState(profile?.address || 'Plot 42-B, Main Boulevard, Gulberg III');
  const [city, setCity] = useState(profile?.city || 'Lahore, Pakistan');
  const [phone, setPhone] = useState(profile?.phone || '+92 300 1234567');
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp || '+92 321 7654321');
  const [email, setEmail] = useState(profile?.email || 'royalstudio089@gmail.com');
  const [website, setWebsite] = useState(profile?.website || 'https://royalstudio.pk');
  const [instagram, setInstagram] = useState(profile?.instagram || '@royalstudiopak');
  const [facebook, setFacebook] = useState(profile?.facebook || 'royalstudiopak');
  const [bankName, setBankName] = useState(profile?.bankName || 'Meezan Bank Ltd');
  const [accountTitle, setAccountTitle] = useState(profile?.accountTitle || 'Royal Visual Studios PVT Ltd');
  const [accountNumber, setAccountNumber] = useState(profile?.accountNumber || '02010103456789');
  const [iban, setIban] = useState(profile?.iban || 'PK45MEZN0002010103456789');
  const [taxRate, setTaxRate] = useState(profile?.taxRate || 5);
  const [currency, setCurrency] = useState(profile?.currency || 'PKR');
  const [quotationPrefix, setQuotationPrefix] = useState(profile?.quotationPrefix || 'RS-QUO-');
  const [invoicePrefix, setInvoicePrefix] = useState(profile?.invoicePrefix || 'RS-INV-');
  const [paymentTerms, setPaymentTerms] = useState(
    profile?.paymentTerms || '50% Advance at booking, 30% on event date, 20% on final deliverable handover.'
  );

  const [isSaving, setIsSaving] = useState(false);

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
        address,
        city,
        phone,
        whatsapp,
        email,
        website,
        instagram,
        facebook,
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

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Studio Settings & Official Profile</h2>
        <p className="text-xs text-gray-500">
          Configure studio branding, Pakistani banking details, tax percentages, and invoice numbering.
        </p>
      </div>

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
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                disabled={!isAdmin}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">Website</label>
              <input
                type="text"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                disabled={!isAdmin}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                disabled={!isAdmin}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                disabled={!isAdmin}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
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
    </div>
  );
};
