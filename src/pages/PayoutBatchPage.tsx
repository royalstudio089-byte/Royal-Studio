import React, { useState } from 'react';
import {
  Layers,
  CheckSquare,
  Square,
  DollarSign,
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useStudioData } from '../context/StudioDataContext';
import { formatPKR } from '../utils/calculations';
import { exportToCSV } from '../utils/csvExporter';

interface PayoutBatchPageProps {
  navigate: (path: string) => void;
}

export const PayoutBatchPage: React.FC<PayoutBatchPageProps> = ({ navigate }) => {
  const { teamMembers, processPayoutBatch, addToast } = useStudioData();

  // Selected members with payout amount
  const [selectedMembers, setSelectedMembers] = useState<Record<string, { selected: boolean; amount: number; method: string; type: string }>>(
    () => {
      const initial: Record<string, any> = {};
      teamMembers.forEach(m => {
        initial[m.id] = {
          selected: false,
          amount: m.eventRate || 10000,
          method: 'Bank Transfer',
          type: 'Event Payment'
        };
      });
      return initial;
    }
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [batchResult, setBatchResult] = useState<any | null>(null);

  const toggleSelect = (id: string) => {
    setSelectedMembers(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        selected: !prev[id]?.selected
      }
    }));
  };

  const updateAmount = (id: string, amount: number) => {
    setSelectedMembers(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        amount
      }
    }));
  };

  const updateMethod = (id: string, method: string) => {
    setSelectedMembers(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        method
      }
    }));
  };

  const selectAll = (select: boolean) => {
    setSelectedMembers(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(id => {
        updated[id].selected = select;
      });
      return updated;
    });
  };

  const selectedList = Object.entries(selectedMembers).filter(([_, val]) => val.selected);
  const totalBatchAmount = selectedList.reduce((sum, [_, val]) => sum + val.amount, 0);

  const handleProcessBatch = async () => {
    if (selectedList.length === 0) {
      addToast('Please select at least one crew member for payout.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const payouts = selectedList.map(([id, val]) => ({
        teamMemberId: id,
        amount: val.amount,
        paymentType: val.type,
        paymentMethod: val.method,
        notes: 'Processed via Royal Studio Payout Batch'
      }));

      const res = await processPayoutBatch(payouts);
      setBatchResult(res);
      addToast(`Batch ${res.batchId} processed successfully!`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportBatchCSV = () => {
    if (!batchResult) return;
    const headers = ['Record ID', 'Team Member ID', 'Amount (PKR)', 'Method', 'Reference', 'Date'];
    const rows = batchResult.records.map((r: any) => [
      r.id,
      r.teamMemberId,
      r.amount,
      r.paymentMethod,
      r.reference,
      r.date
    ]);
    exportToCSV(`Payout_Batch_${batchResult.batchId}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Batch Crew Payout System</h2>
          <p className="text-xs text-gray-500">
            Select crew members, audit payout figures, execute multi-disbursals, and generate bank files.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => selectAll(true)}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold"
          >
            Select All
          </button>
          <button
            onClick={() => selectAll(false)}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold"
          >
            Deselect All
          </button>
        </div>
      </div>

      {batchResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3 text-emerald-900 text-xs font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              <strong>Batch {batchResult.batchId} Completed:</strong> Successfully processed {batchResult.totalProcessed} crew payouts.
            </span>
          </div>
          <button
            onClick={handleExportBatchCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Batch Summary CSV</span>
          </button>
        </div>
      )}

      {/* Roster Selection Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4 w-10">Select</th>
                <th className="py-3 px-4">Crew Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Disbursal Type</th>
                <th className="py-3 px-4">Transfer Channel</th>
                <th className="py-3 px-4">Payout Amount (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teamMembers.map(m => {
                const state = selectedMembers[m.id] || {
                  selected: false,
                  amount: m.eventRate || 10000,
                  method: 'Bank Transfer',
                  type: 'Event Payment'
                };
                return (
                  <tr key={m.id} className={state.selected ? 'bg-amber-50/40' : 'hover:bg-gray-50/50'}>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={state.selected}
                        onChange={() => toggleSelect(m.id)}
                        className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                      />
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      <div>{m.name}</div>
                      <div className="text-[10px] text-gray-400">{m.phone}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-700">{m.role}</td>
                    <td className="py-3 px-4">
                      <select
                        value={state.type}
                        onChange={e => {
                          setSelectedMembers(prev => ({
                            ...prev,
                            [m.id]: { ...prev[m.id], type: e.target.value }
                          }));
                        }}
                        className="px-2 py-1 bg-gray-50 border border-gray-300 rounded text-xs"
                      >
                        <option value="Event Payment">Event Payment</option>
                        <option value="Salary">Salary</option>
                        <option value="Bonus">Bonus</option>
                        <option value="Advance">Advance</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={state.method}
                        onChange={e => updateMethod(m.id, e.target.value)}
                        className="px-2 py-1 bg-gray-50 border border-gray-300 rounded text-xs"
                      >
                        <option value="Bank Transfer">Bank Transfer (Meezan)</option>
                        <option value="JazzCash">JazzCash</option>
                        <option value="EasyPaisa">EasyPaisa</option>
                        <option value="Cash">Cash</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={state.amount}
                        onChange={e => updateAmount(m.id, Number(e.target.value))}
                        min="0"
                        className="w-32 px-2.5 py-1 bg-white border border-gray-300 rounded text-xs font-mono font-bold text-gray-900"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Summary Bar */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="text-xs uppercase font-bold text-amber-400">Batch Processing Summary</div>
          <div className="text-lg font-bold mt-0.5">
            {selectedList.length} crew members selected for payment
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            Total Batch Disbursement: <span className="text-white font-bold text-sm">{formatPKR(totalBatchAmount)}</span>
          </div>
        </div>

        <button
          onClick={handleProcessBatch}
          disabled={isProcessing || selectedList.length === 0}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
        >
          {isProcessing ? 'Processing Batch...' : `Execute Payout (${formatPKR(totalBatchAmount)})`}
        </button>
      </div>
    </div>
  );
};
