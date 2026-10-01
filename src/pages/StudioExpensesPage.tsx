import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  Edit,
  DollarSign,
  Calendar,
  Repeat
} from 'lucide-react';
import { useStudioData } from '../context/StudioDataContext';
import { useAuth } from '../context/AuthContext';
import { formatPKR, formatDate } from '../utils/calculations';
import { Modal } from '../components/common/Modal';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { StudioExpense, StudioExpenseCategory } from '../types';

interface StudioExpensesPageProps {
  navigate: (path: string) => void;
}

export const StudioExpensesPage: React.FC<StudioExpensesPageProps> = () => {
  const { studioExpenses, createStudioExpense, deleteStudioExpense, addToast } = useStudioData();
  const { isAdmin } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState<StudioExpenseCategory>('Rent');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(140000);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [recurring, setRecurring] = useState(true);
  const [notes, setNotes] = useState('');

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const totalOverhead = studioExpenses.reduce((sum, se) => sum + (se.amount || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) {
      addToast('Description and amount are required.', 'error');
      return;
    }

    await createStudioExpense({
      category,
      description,
      amount: Number(amount),
      date,
      paymentMethod,
      recurring,
      notes
    });

    setIsModalOpen(false);
    setDescription('');
    setNotes('');
  };

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;
    await deleteStudioExpense(expenseToDelete);
    setExpenseToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Studio Overhead Expenses (Admin)</h2>
          <p className="text-xs text-gray-500">
            Fixed operational overheads: Gulberg office rent, LESCO electricity, StormFiber internet, and Adobe licenses.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Overhead Expense</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase">Total Studio Overheads</div>
          <div className="text-2xl font-black text-rose-600 mt-1">{formatPKR(totalOverhead)}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Recurring & general business costs</div>
        </div>
        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase">Main Studio Facility</div>
          <div className="text-sm font-semibold text-gray-800 mt-1">Plot 42-B, Main Boulevard Gulberg III</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Lahore, Pakistan</div>
        </div>
        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase">Accounting Separation</div>
          <div className="text-sm font-semibold text-emerald-700 mt-1">Isolated from Event Costs</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Does not alter event gross profit</div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Recurring</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {studioExpenses.map(se => (
                <tr key={se.id} className="hover:bg-gray-50/50">
                  <td className="py-3.5 px-4 font-medium text-gray-900">{formatDate(se.date)}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-semibold text-[10px]">
                      {se.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-900">
                    <div>{se.description}</div>
                    {se.notes && <div className="text-[10px] text-gray-400">{se.notes}</div>}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">{se.paymentMethod}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{formatPKR(se.amount)}</td>
                  <td className="py-3.5 px-4">
                    {se.recurring ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">
                        <Repeat className="w-3 h-3" /> Monthly
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[10px]">One-time</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setExpenseToDelete(se.id);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="p-1 text-gray-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Studio Overhead Expense"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as StudioExpenseCategory)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              >
                <option value="Rent">Rent</option>
                <option value="Utilities">Utilities (LESCO)</option>
                <option value="Internet">Internet (StormFiber)</option>
                <option value="Software">Software Subscriptions</option>
                <option value="Marketing">Marketing & Ads</option>
                <option value="Salaries">Studio Staff Salaries</option>
                <option value="Repairs">Facility Maintenance</option>
                <option value="Office supplies">Office Supplies</option>
                <option value="Other">Other</option>
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

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description *</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Monthly Studio Office Rent"
              required
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Method</label>
              <input
                type="text"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                placeholder="Bank Transfer"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="recurringCheck"
              checked={recurring}
              onChange={e => setRecurring(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded border-gray-300"
            />
            <label htmlFor="recurringCheck" className="text-xs font-semibold text-gray-700">
              Recurring Monthly Overhead
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
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
              Save Overhead
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Overhead Expense?"
        message="Are you sure you want to remove this studio overhead record?"
      />
    </div>
  );
};
