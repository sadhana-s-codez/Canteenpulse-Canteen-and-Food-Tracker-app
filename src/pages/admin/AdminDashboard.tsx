import React, { useEffect, useState } from 'react';
import { subscribeFoodItems } from '../../services/foodService';
import { subscribeTodayOrders } from '../../services/orderService';
import { subscribeCanteenStatus } from '../../services/realtimeService';
import { seedDatabase } from '../../services/seedData';
import LiveBadge from '../../components/LiveBadge';
import { StatusCardSkeleton } from '../../components/Skeleton';
import type { FoodItem, Order, CanteenStatus } from '../../types';
import {
  ClipboardList, DollarSign, ShoppingBag, Users, UtensilsCrossed,
  AlertTriangle, Loader2, Database
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [status, setStatus] = useState<CanteenStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const unsubs = [
      subscribeTodayOrders((o) => { setOrders(o); setLoading(false); }),
      subscribeFoodItems(setFoods),
      subscribeCanteenStatus(setStatus),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await seedDatabase();
      if (result) {
        toast.success('Sample data added!');
      } else {
        toast('Data already exists', { icon: 'ℹ️' });
      }
    } catch (err) {
      toast.error('Failed to seed data');
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  const todayRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const activeOrders = orders.filter(
    (o) => !['completed', 'cancelled'].includes(o.status)
  );

  const availableItems = foods.filter((f) => f.available && f.stock > 0);
  const soldOut = foods.filter((f) => !f.available || f.stock <= 0);

  const stats = [
    {
      label: "Today's Orders",
      value: orders.length,
      icon: ClipboardList,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: "Today's Revenue",
      value: `₹${todayRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Active Orders',
      value: activeOrders.length,
      icon: ShoppingBag,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Current Crowd',
      value: status?.crowdCount || 0,
      icon: Users,
      color: 'text-orange-600 bg-orange-50',
    },
    {
      label: 'Available Items',
      value: availableItems.length,
      icon: UtensilsCrossed,
      color: 'text-teal-600 bg-teal-50',
    },
    {
      label: 'Sold Out',
      value: soldOut.length,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of your canteen today</p>
        </div>
        <div className="flex items-center gap-3">
          <LiveBadge updatedAt={status?.updatedAt} />
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
            Seed Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <StatusCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Recent Orders Today</h2>
        </div>
        {orders.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {orders.slice(0, 10).map((order) => (
              <div key={order.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-blue-600">{order.tokenNumber}</span>
                  <div>
                    <p className="text-sm text-slate-700">{order.studentName}</p>
                    <p className="text-[10px] text-slate-400">
                      {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-slate-800">₹{order.totalAmount}</span>
                  <p className="text-[10px] text-slate-400 capitalize">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500">No orders today yet</p>
          </div>
        )}
      </div>

      {/* Sold Out Items */}
      {soldOut.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Sold Out Items ({soldOut.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {soldOut.map((f) => (
              <span key={f.id} className="bg-white text-red-700 text-xs px-2.5 py-1 rounded-lg border border-red-200">
                {f.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
