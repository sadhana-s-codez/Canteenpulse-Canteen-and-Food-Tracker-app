import React, { useEffect, useState } from 'react';
import { subscribeAllOrders } from '../../services/orderService';
import { updateOrderStatus } from '../../services/orderService';
import { createNotification } from '../../services/realtimeService';
import { getStatusColor, getStatusLabel } from '../../components/OrderTimeline';
import LiveBadge from '../../components/LiveBadge';
import type { Order, OrderStatus } from '../../types';
import { ChefHat, Check, Clock, Bell, Loader2, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const nextStatus: Record<string, OrderStatus> = {
  placed: 'accepted',
  accepted: 'preparing',
  preparing: 'ready',
  ready: 'completed',
};

const nextStatusLabel: Record<string, string> = {
  placed: 'Accept',
  accepted: 'Start Preparing',
  preparing: 'Mark Ready',
  ready: 'Complete',
};

const StaffOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [tab, setTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    const unsub = subscribeAllOrders((o) => {
      setOrders(o);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleStatusUpdate = async (order: Order) => {
    const next = nextStatus[order.status];
    if (!next) return;

    setUpdatingId(order.id);
    try {
      await updateOrderStatus(order.id, next);

      // Send notification to student
      let notifMsg = '';
      if (next === 'accepted') notifMsg = `Your order ${order.tokenNumber} has been accepted!`;
      if (next === 'preparing') notifMsg = `Your order ${order.tokenNumber} is now being prepared.`;
      if (next === 'ready') notifMsg = `Your order ${order.tokenNumber} is ready for pickup! 🎉`;
      if (next === 'completed') notifMsg = `Your order ${order.tokenNumber} is completed. Thank you!`;

      if (notifMsg) {
        await createNotification(
          order.userId,
          `Order ${order.tokenNumber} Update`,
          notifMsg,
          'order'
        );
      }

      toast.success(`Order ${order.tokenNumber} → ${getStatusLabel(next)}`);
    } catch (err) {
      toast.error('Failed to update order');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (order: Order) => {
    if (!confirm(`Cancel order ${order.tokenNumber}?`)) return;
    setUpdatingId(order.id);
    try {
      await updateOrderStatus(order.id, 'cancelled');
      await createNotification(
        order.userId,
        `Order ${order.tokenNumber} Cancelled`,
        `Your order ${order.tokenNumber} has been cancelled.`,
        'order'
      );
      toast.success('Order cancelled');
    } catch {
      toast.error('Failed to cancel');
    } finally {
      setUpdatingId(null);
    }
  };

  const activeOrders = orders.filter((o) => !['completed', 'cancelled'].includes(o.status));
  const completedOrders = orders.filter((o) => ['completed', 'cancelled'].includes(o.status));
  const displayOrders = tab === 'active' ? activeOrders : completedOrders;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Live Orders</h1>
          <p className="text-sm text-slate-500">{activeOrders.length} active</p>
        </div>
        <LiveBadge />
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        <button
          onClick={() => setTab('active')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            tab === 'active' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'
          }`}
        >
          Active ({activeOrders.length})
        </button>
        <button
          onClick={() => setTab('completed')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            tab === 'completed' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'
          }`}
        >
          Completed ({completedOrders.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-24 mb-3" />
              <div className="h-4 bg-slate-200 rounded w-full mb-2" />
              <div className="h-10 bg-slate-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : displayOrders.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {displayOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-purple-600">{order.tokenNumber}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-800">₹{order.totalAmount}</span>
              </div>

              <p className="text-xs text-slate-500 mb-1">{order.studentName}</p>

              <div className="bg-slate-50 rounded-lg p-2.5 mb-3 space-y-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-slate-600">{item.quantity} × {item.name}</span>
                    <span className="text-slate-500">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-3">
                <Clock className="w-3 h-3" />
                {order.createdAt.toLocaleTimeString()}
              </div>

              {!['completed', 'cancelled'].includes(order.status) && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusUpdate(order)}
                    disabled={updatingId === order.id}
                    className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {updatingId === order.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    {nextStatusLabel[order.status]}
                  </button>
                  <button
                    onClick={() => handleCancel(order)}
                    disabled={updatingId === order.id}
                    className="px-3 py-2 rounded-lg text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <Package className="w-14 h-14 text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">
            {tab === 'active' ? 'No active orders' : 'No completed orders'}
          </p>
        </div>
      )}
    </div>
  );
};

export default StaffOrdersPage;
