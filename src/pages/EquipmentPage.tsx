import React, { useState } from 'react';
import {
  Camera,
  Plus,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Trash2,
  Edit,
  ShieldAlert,
  Search,
  RotateCw,
  FileText
} from 'lucide-react';
import { useStudioData } from '../context/StudioDataContext';
import { useAuth } from '../context/AuthContext';
import { formatPKR, formatDate } from '../utils/calculations';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { Equipment, EquipmentCategory, EquipmentStatus } from '../types';

interface EquipmentPageProps {
  navigate: (path: string) => void;
}

export const EquipmentPage: React.FC<EquipmentPageProps> = () => {
  const {
    equipment,
    maintenanceLogs,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    createMaintenanceLog,
    addToast
  } = useStudioData();
  const { isAdmin } = useAuth();

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [selectedEquipForMaintenance, setSelectedEquipForMaintenance] = useState<Equipment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<EquipmentCategory>('Camera');
  const [brand, setBrand] = useState('Sony');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [rentalRate, setRentalRate] = useState(5000);
  const [serviceAfterUses, setServiceAfterUses] = useState(20);
  const [notes, setNotes] = useState('');

  // Maintenance Log Form State
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState(4000);
  const [repairStatus, setRepairStatus] = useState<'Pending' | 'In Repair' | 'Completed'>('Pending');
  const [repairNotes, setRepairNotes] = useState('');

  const filteredEquipment = equipment.filter(eq => {
    const matchesCategory = categoryFilter === 'ALL' || eq.category === categoryFilter;
    const matchesSearch =
      eq.name.toLowerCase().includes(search.toLowerCase()) ||
      eq.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      eq.brand.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenCreate = () => {
    setEditingItem(null);
    setName('');
    setCategory('Camera');
    setBrand('Sony');
    setModel('');
    setSerialNumber(`SN-${Date.now().toString().slice(-4)}`);
    setQuantity(1);
    setRentalRate(5000);
    setServiceAfterUses(20);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Equipment) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setBrand(item.brand);
    setModel(item.model);
    setSerialNumber(item.serialNumber);
    setQuantity(item.quantity);
    setRentalRate(item.rentalRate);
    setServiceAfterUses(item.serviceAfterUses);
    setNotes(item.notes);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category) {
      addToast('Name and Category are required', 'error');
      return;
    }

    if (editingItem) {
      await updateEquipment(editingItem.id, {
        name,
        category,
        brand,
        model,
        serialNumber,
        quantity: Number(quantity),
        rentalRate: Number(rentalRate),
        serviceAfterUses: Number(serviceAfterUses),
        notes
      });
    } else {
      await createEquipment({
        name,
        category,
        brand,
        model,
        serialNumber,
        quantity: Number(quantity),
        rentalRate: Number(rentalRate),
        serviceAfterUses: Number(serviceAfterUses),
        notes
      });
    }
    setIsModalOpen(false);
  };

  const handleOpenMaintenance = (item: Equipment) => {
    setSelectedEquipForMaintenance(item);
    setIssue(
      item.currentUsageCount >= item.serviceAfterUses
        ? 'Service Overdue — Routine Sensor & Calibration'
        : 'Maintenance Inspection'
    );
    setDescription(`Usage count is ${item.currentUsageCount} / ${item.serviceAfterUses} threshold.`);
    setCost(3500);
    setRepairStatus('Pending');
    setRepairNotes('');
    setIsMaintenanceModalOpen(true);
  };

  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipForMaintenance) return;
    await createMaintenanceLog({
      equipmentId: selectedEquipForMaintenance.id,
      issue,
      description,
      cost: Number(cost),
      status: repairStatus,
      repairNotes
    });
    setIsMaintenanceModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    await deleteEquipment(itemToDelete);
    setItemToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Equipment Locker & Maintenance</h2>
          <p className="text-xs text-gray-500">
            High-end cameras, GM lenses, Mavic drones, studio strobes, and automated usage calibration logs.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Gear Item</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by equipment, brand, serial..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700"
        >
          <option value="ALL">All Categories</option>
          <option value="Camera">Cameras</option>
          <option value="Lens">Lenses</option>
          <option value="Drone">Drones</option>
          <option value="Light">Lights & Strobes</option>
          <option value="Audio">Audio & Wireless</option>
          <option value="Gimbal">Gimbals</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEquipment.map(item => {
          const isServiceDue = item.currentUsageCount >= item.serviceAfterUses;
          return (
            <div
              key={item.id}
              className={`p-5 bg-white rounded-xl border shadow-xs transition-all space-y-3 ${
                isServiceDue ? 'border-amber-300 bg-amber-50/10' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    {item.brand} • {item.category}
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 mt-0.5">{item.name}</h3>
                  <div className="text-xs font-mono text-gray-500 mt-0.5">SN: {item.serialNumber}</div>
                </div>
                <div className="flex items-center gap-1">
                  <StatusBadge status={item.status} size="sm" />
                  {isAdmin && (
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1 text-gray-400 hover:text-gray-700 rounded ml-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setItemToDelete(item.id);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="p-1 text-gray-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Usage Calibration Progress (Section 19) */}
              <div className="p-3 bg-gray-50 rounded-lg space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Usage Cycle Tracker:</span>
                  <span className="font-mono font-bold">
                    {item.currentUsageCount} / {item.serviceAfterUses} uses
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${Math.min(100, (item.currentUsageCount / item.serviceAfterUses) * 100)}%`
                    }}
                    className={`h-full rounded-full transition-all ${
                      isServiceDue ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                    }`}
                  />
                </div>
                {isServiceDue && (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 pt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Service Required (Passed {item.serviceAfterUses} uses)</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <div className="text-[10px] text-gray-400 uppercase">Available Quantity</div>
                  <div className="font-bold text-gray-900">{item.quantity} in inventory</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-400 uppercase">Internal Rental Rate</div>
                  <div className="font-mono font-bold text-gray-900">{formatPKR(item.rentalRate)} / shoot</div>
                </div>
              </div>

              {/* Maintenance button */}
              <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                <span className="text-[11px] text-gray-400 truncate max-w-[150px]">
                  {item.notes || 'In active studio rotation'}
                </span>
                <button
                  onClick={() => handleOpenMaintenance(item)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-medium text-[11px] transition-colors"
                >
                  <Wrench className="w-3 h-3 text-amber-600" />
                  <span>Report Maintenance</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Equipment Master' : 'Add New Equipment'}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Equipment Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Sony FX3 Cinema Line Camera"
              required
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as EquipmentCategory)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              >
                <option value="Camera">Camera</option>
                <option value="Lens">Lens</option>
                <option value="Drone">Drone</option>
                <option value="Light">Light</option>
                <option value="Audio">Audio</option>
                <option value="Gimbal">Gimbal</option>
                <option value="Tripod">Tripod</option>
                <option value="Memory Card">Memory Card</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="Sony / DJI / Godox"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Model</label>
              <input
                type="text"
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="ILME-FX3"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Serial Number</label>
              <input
                type="text"
                value={serialNumber}
                onChange={e => setSerialNumber(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                min="1"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Rental Rate (PKR)</label>
              <input
                type="number"
                value={rentalRate}
                onChange={e => setRentalRate(Number(e.target.value))}
                min="0"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Service Threshold</label>
              <input
                type="number"
                value={serviceAfterUses}
                onChange={e => setServiceAfterUses(Number(e.target.value))}
                min="5"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Firmware</label>
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
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-lg text-xs"
            >
              Save Equipment
            </button>
          </div>
        </form>
      </Modal>

      {/* MAINTENANCE LOG MODAL */}
      <Modal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        title={`Maintenance & Service Log — ${selectedEquipForMaintenance?.name || ''}`}
      >
        <form onSubmit={handleMaintenanceSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Issue Reported *</label>
            <input
              type="text"
              value={issue}
              onChange={e => setIssue(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Estimated Cost (PKR)</label>
              <input
                type="number"
                value={cost}
                onChange={e => setCost(Number(e.target.value))}
                min="0"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Service Status</label>
              <select
                value={repairStatus}
                onChange={e => setRepairStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              >
                <option value="Pending">Pending</option>
                <option value="In Repair">In Repair (Lock from Booking)</option>
                <option value="Completed">Completed & Calibrated</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description / Notes</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsMaintenanceModalOpen(false)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-600 text-white font-bold rounded-lg text-xs"
            >
              Log Service Record
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Equipment?"
        message="Are you sure you want to delete this piece of equipment from the studio inventory?"
      />
    </div>
  );
};
