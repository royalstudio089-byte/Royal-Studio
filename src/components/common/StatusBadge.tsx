import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const s = (status || '').toLowerCase();

  let colorClasses = 'bg-gray-100 text-gray-800 border-gray-200';

  if (s === 'confirmed' || s === 'completed' || s === 'paid' || s === 'available') {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (s === 'in progress' || s === 'partially paid' || s === 'editing' || s === 'shoot scheduled') {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (s === 'shoot done' || s === 'review' || s === 'delivered' || s === 'quotation sent') {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (s === 'overdue' || s === 'cancelled' || s === 'damaged' || s === 'urgent') {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (s === 'maintenance' || s === 'busy' || s === 'high' || s === 'on leave') {
    colorClasses = 'bg-orange-50 text-orange-700 border-orange-200';
  } else if (s === 'unpaid' || s === 'pending') {
    colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${sizeClass} ${colorClasses}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
};
