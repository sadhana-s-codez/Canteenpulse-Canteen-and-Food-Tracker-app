import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { subscribeUserOrders } from '../../services/orderService';
import OrderTimeline, { getStatusColor, getStatusLabel } from '../../components/OrderTimeline';
import { OrderCardSkeleton } from '../../components/Skeleton';
import type { Order } from '../../types';
import { ClipboardList, ArrowRight } from 'lucide-react';

const StudentOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'active' | 'history'>('active');

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeUserOrders(user.uid, (o) => {
      setOrders(o);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const activeOrders = orders.filter(
    (o) => !['completed', 'cancelled'].includes(o.status)
  );
  const historyOrders = orders.filter((o) =>
    ['completed', 'cancelled'].includes(o.status)
  );

  const displayOrders = tab === 'active' ? activeOrders : historyOrders;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-slate-800">My Orders</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        <button
          onClick={() => setTab('active')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
          }`}
        >
          Active ({activeOrders.length})
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
          }`}
        >
          History ({historyOrders.length})
        </button>
      </div>

      {/* Orders */}
      {loading ? (
        <div className="space-y-3">
          <OrderCardSkeleton />
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </div>
      ) : displayOrders.length > 0 ? (
        <div className="space-y-3">
          {displayOrders.map((order) => (
            <Link
              key={order.id}
              to={`/student/orders/${order.id}`}
              className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-blue-600">{order.tokenNumber}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-slate-800">₹{order.totalAmount}</span>
                  <p className="text-[10px] text-slate-400">
                    {order.createdAt.toLocaleString()}
                  </p>
                </div>
              </div>

              <OrderTimeline status={order.status} compact />

              <div className="mt-2.5 text-xs text-slate-500">
                {order.items.map((i) => `${i.quantity}× ${i.name}`).join(' · ')}
              </div>

              <div className="flex items-center justify-end mt-2 text-xs text-blue-600 font-medium gap-1">
                View Details <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <ClipboardList className="w-14 h-14 text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">
            {tab === 'active' ? 'No active orders' : 'No order history'}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {tab === 'active' ? 'Your orders will appear here' : 'Completed orders will show here'}
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentOrdersPage;
