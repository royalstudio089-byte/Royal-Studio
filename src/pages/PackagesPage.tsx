import React, { useState } from 'react';
import {
  Package as PackageIcon,
  Plus,
  CheckCircle,
  Users,
  Camera,
  Trash2,
  Edit,
  Clock,
  Sparkles
} from 'lucide-react';
import { useStudioData } from '../context/StudioDataContext';
import { useAuth } from '../context/AuthContext';
import { formatPKR } from '../utils/calculations';
import { Modal } from '../components/common/Modal';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { Package, EventCategory } from '../types';

interface PackagesPageProps {
  navigate: (path: string) => void;
}

export const PackagesPage: React.FC<PackagesPageProps> = () => {
  const { packages, createPackage, updatePackage, deletePackage, addToast } = useStudioData();
  const { isAdmin } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<EventCategory>('Wedding');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(150000);
  const [duration, setDuration] = useState('Full Day (8 Hours)');
  const [requiredPhotographers, setRequiredPhotographers] = useState(2);
  const [requiredVideographers, setRequiredVideographers] = useState(2);
  const [requiredDroneOperators, setRequiredDroneOperators] = useState(1);
  const [requiredAssistants, setRequiredAssistants] = useState(1);
  const [includedServicesStr, setIncludedServicesStr] = useState('');
  const [deliverablesStr, setDeliverablesStr] = useState('');

  const handleOpenCreate = () => {
    setEditingPackage(null);
    setName('');
    setCategory('Wedding');
    setDescription('');
    setPrice(150000);
    setDuration('Full Day');
    setRequiredPhotographers(2);
    setRequiredVideographers(2);
    setRequiredDroneOperators(1);
    setRequiredAssistants(1);
    setIncludedServicesStr('2 Candid Photographers\n2 4K Cinema Videographers\nColor Grading');
    setDeliverablesStr('1 Luxury Storybook Album\n1 4K Highlight Reel (5 mins)\nAll edited photos on USB');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setName(pkg.name);
    setCategory(pkg.category);
    setDescription(pkg.description);
    setPrice(pkg.price);
    setDuration(pkg.duration);
    setRequiredPhotographers(pkg.requiredPhotographers);
    setRequiredVideographers(pkg.requiredVideographers);
    setRequiredDroneOperators(pkg.requiredDroneOperators);
    setRequiredAssistants(pkg.requiredAssistants);
    setIncludedServicesStr((pkg.includedServices || []).join('\n'));
    setDeliverablesStr((pkg.deliverables || []).join('\n'));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      addToast('Package name is required', 'error');
      return;
    }

    const inc = includedServicesStr.split('\n').map(s => s.trim()).filter(Boolean);
    const del = deliverablesStr.split('\n').map(s => s.trim()).filter(Boolean);

    if (editingPackage) {
      await updatePackage(editingPackage.id, {
        name,
        category,
        description,
        price: Number(price),
        duration,
        requiredPhotographers: Number(requiredPhotographers),
        requiredVideographers: Number(requiredVideographers),
        requiredDroneOperators: Number(requiredDroneOperators),
        requiredAssistants: Number(requiredAssistants),
        includedServices: inc,
        deliverables: del
      });
    } else {
      await createPackage({
        name,
        category,
        description,
        price: Number(price),
        duration,
        requiredPhotographers: Number(requiredPhotographers),
        requiredVideographers: Number(requiredVideographers),
        requiredDroneOperators: Number(requiredDroneOperators),
        requiredAssistants: Number(requiredAssistants),
        includedServices: inc,
        deliverables: del,
        isActive: true
      });
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!packageToDelete) return;
    await deletePackage(packageToDelete);
    setPackageToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Service Packages & Inclusions</h2>
          <p className="text-xs text-gray-500">
            Standard pricing tiers, required crew quotas for auto-assignment, and client deliverables.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Package</span>
          </button>
        )}
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <div
            key={pkg.id}
            className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between hover:border-amber-400 transition-all space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
                    {pkg.category}
                  </span>
                  <h3 className="text-lg font-black text-gray-900 mt-1">{pkg.name}</h3>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(pkg)}
                      className="p-1 text-gray-400 hover:text-gray-700 rounded"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setPackageToDelete(pkg.id);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="p-1 text-gray-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-baseline gap-1 text-2xl font-black text-gray-900 font-mono">
                {formatPKR(pkg.price)}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>Duration: {pkg.duration}</span>
              </div>
              <p className="text-xs text-gray-600">{pkg.description}</p>

              {/* Required Crew Quota (Section 12) */}
              <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 border border-gray-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>Required Crew Deployment</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-800">
                  <div>📷 Photographers: <strong>{pkg.requiredPhotographers}</strong></div>
                  <div>🎥 Videographers: <strong>{pkg.requiredVideographers}</strong></div>
                  <div>🛸 Drone Pilots: <strong>{pkg.requiredDroneOperators}</strong></div>
                  <div>💡 Tech Assistants: <strong>{pkg.requiredAssistants}</strong></div>
                </div>
              </div>

              {/* Deliverables */}
              {pkg.deliverables && pkg.deliverables.length > 0 && (
                <div className="space-y-1 text-xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Deliverables Handover</div>
                  <ul className="space-y-1 text-gray-600">
                    {pkg.deliverables.map((del, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{del}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPackage ? 'Edit Service Package' : 'New Studio Package Template'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Package Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Signature 3-Day Wedding"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as EventCategory)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              >
                <option value="Wedding">Wedding</option>
                <option value="Nikah">Nikah</option>
                <option value="Engagement">Engagement</option>
                <option value="Corporate">Corporate</option>
                <option value="Birthday">Birthday</option>
                <option value="Concert">Concert</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Package Price (PKR) *</label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                min="0"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="e.g. 3 Days or 8 Hours"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Required Crew Counters */}
          <div className="p-3 bg-gray-50 rounded-xl space-y-2 border border-gray-200">
            <div className="text-xs font-bold text-gray-800">Required Crew for Auto-Assignment</div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1">Photographers</label>
                <input
                  type="number"
                  value={requiredPhotographers}
                  onChange={e => setRequiredPhotographers(Number(e.target.value))}
                  min="0"
                  className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-xs text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1">Videographers</label>
                <input
                  type="number"
                  value={requiredVideographers}
                  onChange={e => setRequiredVideographers(Number(e.target.value))}
                  min="0"
                  className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-xs text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1">Drone Pilots</label>
                <input
                  type="number"
                  value={requiredDroneOperators}
                  onChange={e => setRequiredDroneOperators(Number(e.target.value))}
                  min="0"
                  className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-xs text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1">Assistants</label>
                <input
                  type="number"
                  value={requiredAssistants}
                  onChange={e => setRequiredAssistants(Number(e.target.value))}
                  min="0"
                  className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-xs text-center"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Deliverables (one per line)</label>
            <textarea
              value={deliverablesStr}
              onChange={e => setDeliverablesStr(e.target.value)}
              rows={3}
              placeholder="Luxury Leather Bound Storybook&#10;4K Cinematic Film&#10;Teasers within 48 hours"
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
              Save Package
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Package Template?"
        message="Are you sure you want to delete this package template from the studio system?"
      />
    </div>
  );
};
