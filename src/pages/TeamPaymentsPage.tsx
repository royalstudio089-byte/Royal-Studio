import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  DollarSign,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useStudioData } from '../context/StudioDataContext';
import { useAuth } from '../context/AuthContext';
import { formatPKR, formatDate } from '../utils/calculations';
import { Modal } from '../components/common/Modal';
import { TeamPaymentType, PaymentMethod } from '../types';

interface TeamPaymentsPageProps {
  navigate: (path: string) => void;
}

export const TeamPaymentsPage: React.FC<TeamPaymentsPageProps> = ({ navigate }) => {
  const { teamPayments, teamMembers, events, createTeamPayment, addToast } = useStudioData();
  const { isAdmin } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberId, setMemberId] = useState('');
  const [eventId, setEventId] = useState('');
  const [paymentType, setPaymentType] = useState<TeamPaymentType>('Event Payment');
  const [amount, setAmount] = useState(15000);
  const [method, setMethod] = useState<PaymentMethod>('Bank Transfer');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const totalPaidOut = teamPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !amount) {
      addToast('Please select team member and amount.', 'error');
      return;
    }

    await createTeamPayment({
      teamMemberId: memberId,
      eventId: eventId || undefined,
      paymentType,
      amount: Number(amount),
      paymentMethod: method,
      reference,
      notes
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Crew Payroll & Remuneration Ledger</h2>
          <p className="text-xs text-gray-500">
            Event compensations, monthly editor salaries, shoot advances, and reimbursements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => navigate('/payout-batch')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-800 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors shadow-xs"
              >
                <Layers className="w-4 h-4 text-amber-600" />
                <span>Process Batch Payout</span>
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Record Crew Payment</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase">Total Payroll Disbursed</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{formatPKR(totalPaidOut)}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Across {teamPayments.length} transactions</div>
        </div>
        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase">Active Crew Members</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{teamMembers.length}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Photographers, cinema & editors</div>
        </div>
        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase">Payout Channels</div>
          <div className="text-sm font-semibold text-gray-800 mt-2">Meezan Bank, JazzCash, Cash</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Instant Pakistani local transfers</div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Crew Member</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Channel / Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Reference & Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teamPayments.map(p => {
                const member = teamMembers.find(m => m.id === p.teamMemberId);
                const event = events.find(e => e.id === p.eventId);
                return (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="py-3.5 px-4 font-medium text-gray-900">{formatDate(p.date)}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      <div>{member?.name || 'Crew Member'}</div>
                      <div className="text-[10px] text-gray-400">{member?.role}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-medium text-[10px]">
                        {p.paymentType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-700">{p.paymentMethod}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{formatPKR(p.amount)}</td>
                    <td className="py-3.5 px-4 text-gray-500">
                      <div>{p.notes || '-'}</div>
                      {p.reference && <div className="text-[10px] text-gray-400 font-mono">Ref: {p.reference}</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Crew Compensation Payment"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Select Crew Member *</label>
            <select
              value={memberId}
              onChange={e => setMemberId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            >
              <option value="">-- Choose Member --</option>
              {teamMembers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Type</label>
              <select
                value={paymentType}
                onChange={e => setPaymentType(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              >
                <option value="Event Payment">Event Payment</option>
                <option value="Salary">Monthly Salary</option>
                <option value="Bonus">Performance Bonus</option>
                <option value="Advance">Shoot Advance</option>
                <option value="Reimbursement">Reimbursement</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (PKR) *</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                min="1"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Method</label>
              <select
                value={method}
                onChange={e => setMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="JazzCash">JazzCash</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Link to Event (Optional)</label>
              <select
                value={eventId}
                onChange={e => setEventId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              >
                <option value="">-- None / General --</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Reference / Bank Transaction ID</label>
            <input
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="e.g. TXN-MEEZ-991"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Details / shoot remuneration"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
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
              Confirm Disbursal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
