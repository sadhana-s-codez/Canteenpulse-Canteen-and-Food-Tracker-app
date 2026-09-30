import React from 'react';
import type { OrderStatus } from '../types';
import { Check, Circle, Package, ChefHat, Bell, XCircle } from 'lucide-react';

interface OrderTimelineProps {
  status: OrderStatus;
  compact?: boolean;
}

const STEPS: { key: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { key: 'placed', label: 'Placed', icon: <Package className="w-4 h-4" /> },
  { key: 'accepted', label: 'Accepted', icon: <Check className="w-4 h-4" /> },
  { key: 'preparing', label: 'Preparing', icon: <ChefHat className="w-4 h-4" /> },
  { key: 'ready', label: 'Ready', icon: <Bell className="w-4 h-4" /> },
  { key: 'completed', label: 'Completed', icon: <Check className="w-4 h-4" /> },
];

const statusIndex: Record<OrderStatus, number> = {
  placed: 0,
  accepted: 1,
  preparing: 2,
  ready: 3,
  completed: 4,
  cancelled: -1,
};

const OrderTimeline: React.FC<OrderTimelineProps> = ({ status, compact = false }) => {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <XCircle className="w-5 h-5" />
        <span className="font-medium text-sm">Order Cancelled</span>
      </div>
    );
  }

  const currentIdx = statusIndex[status];

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        {STEPS.map((step, idx) => (
          <React.Fragment key={step.key}>
            <div
              className={`w-2 h-2 rounded-full transition-colors ${
                idx <= currentIdx
                  ? idx === currentIdx
                    ? 'bg-blue-600 ring-2 ring-blue-200'
                    : 'bg-green-500'
                  : 'bg-slate-200'
              }`}
            />
            {idx < STEPS.length - 1 && (
              <div
                className={`w-4 h-0.5 ${
                  idx < currentIdx ? 'bg-green-500' : 'bg-slate-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full">
      {STEPS.map((step, idx) => (
        <React.Fragment key={step.key}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                idx < currentIdx
                  ? 'bg-green-500 text-white'
                  : idx === currentIdx
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {idx < currentIdx ? <Check className="w-4 h-4" /> : step.icon}
            </div>
            <span
              className={`text-[10px] font-medium ${
                idx <= currentIdx ? 'text-slate-700' : 'text-slate-400'
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-1 mt-[-16px] ${
                idx < currentIdx ? 'bg-green-500' : 'bg-slate-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default OrderTimeline;

export const getStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    placed: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-blue-100 text-blue-700',
    preparing: 'bg-purple-100 text-purple-700',
    ready: 'bg-green-100 text-green-700',
    completed: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-red-100 text-red-700',
  };
  return colors[status];
};

export const getStatusLabel = (status: OrderStatus): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};
