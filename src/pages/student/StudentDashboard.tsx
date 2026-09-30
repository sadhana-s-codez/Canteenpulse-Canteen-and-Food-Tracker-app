import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { subscribeCanteenStatus, subscribeAnnouncements } from '../../services/realtimeService';
import { subscribeFoodItems } from '../../services/foodService';
import { subscribeUserOrders } from '../../services/orderService';
import LiveBadge from '../../components/LiveBadge';
import FoodCard from '../../components/FoodCard';
import OrderTimeline, { getStatusColor, getStatusLabel } from '../../components/OrderTimeline';
import { StatusCardSkeleton, FoodCardSkeleton } from '../../components/Skeleton';
import type { CanteenStatus, Announcement, FoodItem, Order } from '../../types';
import {
  Users, Clock, ListOrdered, DoorOpen, DoorClosed,
  Megaphone, ArrowRight, Ticket, TrendingUp
} from 'lucide-react';

const crowdColors: Record<string, string> = {
  LOW: 'text-green-600 bg-green-50',
  MODERATE: 'text-yellow-600 bg-yellow-50',
  HIGH: 'text-orange-600 bg-orange-50',
  'VERY HIGH': 'text-red-600 bg-red-50',
};

const crowdBarWidth: Record<string, string> = {
  LOW: 'w-1/4',
  MODERATE: 'w-2/4',
  HIGH: 'w-3/4',
  'VERY HIGH': 'w-full',
};

const crowdBarColor: Record<string, string> = {
  LOW: 'bg-green-500',
  MODERATE: 'bg-yellow-500',
  HIGH: 'bg-orange-500',
  'VERY HIGH': 'bg-red-500',
};

const StudentDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { addItem } = useCart();
  const [status, setStatus] = useState<CanteenStatus | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubs: (() => void)[] = [];
    unsubs.push(subscribeCanteenStatus((s) => { setStatus(s); setLoading(false); }));
    unsubs.push(subscribeAnnouncements(setAnnouncements));
    unsubs.push(subscribeFoodItems(setFoods));
    if (user) {
      unsubs.push(subscribeUserOrders(user.uid, setOrders));
    }
    return () => unsubs.forEach((u) => u());
  }, [user]);

  const activeOrders = orders.filter(
    (o) => !['completed', 'cancelled'].includes(o.status)
  );
  const popularFoods = foods.filter((f) => f.available && f.stock > 0).slice(0, 6);

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? 'Good Morning' : greetingHour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {greeting}, {profile?.name?.split(' ')[0] || 'Student'} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">What's happening at the canteen?</p>
      </div>

      {/* Live Status Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Live Status</h2>
          <LiveBadge updatedAt={status?.updatedAt} />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatusCardSkeleton />
            <StatusCardSkeleton />
            <StatusCardSkeleton />
            <StatusCardSkeleton />
          </div>
        ) : status ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Crowd */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-500 uppercase">Crowd</span>
              </div>
              <p className="text-2xl font-bold text-slate-800 mb-1">{status.crowdCount}</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${crowdColors[status.crowdLevel]}`}>
                {status.crowdLevel}
              </span>
            </div>

            {/* Queue */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <ListOrdered className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-500 uppercase">Queue</span>
              </div>
              <p className="text-2xl font-bold text-slate-800 mb-1">{status.queueCount}</p>
              <span className="text-xs text-slate-500">people waiting</span>
            </div>

            {/* Wait Time */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-500 uppercase">Wait</span>
              </div>
              <p className="text-2xl font-bold text-slate-800 mb-1">{status.estimatedWait}</p>
              <span className="text-xs text-slate-500">minutes est.</span>
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                {status.isOpen ? (
                  <DoorOpen className="w-4 h-4 text-green-500" />
                ) : (
                  <DoorClosed className="w-4 h-4 text-red-500" />
                )}
                <span className="text-xs font-medium text-slate-500 uppercase">Status</span>
              </div>
              <p className={`text-xl font-bold mb-1 ${status.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                {status.isOpen ? 'OPEN' : 'CLOSED'}
              </p>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${status.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-slate-500">
                  {status.isOpen ? 'Serving now' : 'Come back later'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500 text-sm">Canteen status unavailable</p>
          </div>
        )}
      </div>

      {/* Crowd Meter */}
      {status && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-700">Current Crowd Level</h3>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${crowdColors[status.crowdLevel]}`}>
              {status.crowdCount} people
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${crowdBarColor[status.crowdLevel]} ${crowdBarWidth[status.crowdLevel]}`}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium">
            <span>Low</span>
            <span>Moderate</span>
            <span>High</span>
            <span>Very High</span>
          </div>
        </div>
      )}

      {/* Active Token / Queue */}
      {status && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Ticket className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700">Live Queue</h3>
            <LiveBadge />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-500 mb-1">Now Serving</p>
              <p className="text-xl font-bold text-blue-600">{status.currentToken || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">In Queue</p>
              <p className="text-xl font-bold text-slate-800">{status.queueCount}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Est. Wait</p>
              <p className="text-xl font-bold text-slate-800">{status.estimatedWait} min</p>
            </div>
          </div>
          {activeOrders.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Your Active Token</p>
              <p className="text-2xl font-bold text-green-600">{activeOrders[0].tokenNumber}</p>
            </div>
          )}
        </div>
      )}

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Your Active Orders</h2>
            <Link to="/student/orders" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {activeOrders.slice(0, 2).map((order) => (
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
                  <span className="text-sm font-semibold text-slate-800">₹{order.totalAmount}</span>
                </div>
                <OrderTimeline status={order.status} compact />
                <div className="mt-2 text-xs text-slate-500">
                  {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Megaphone className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Announcements</h2>
            <LiveBadge />
          </div>
          <div className="space-y-2">
            {announcements.slice(0, 3).map((a) => (
              <div
                key={a.id}
                className="bg-blue-50 border border-blue-100 rounded-xl p-3.5"
              >
                <p className="text-sm font-medium text-blue-800">{a.title}</p>
                <p className="text-xs text-blue-600 mt-0.5">{a.message}</p>
                <p className="text-[10px] text-blue-400 mt-1.5">
                  {a.createdAt.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Available Now</h2>
          <Link to="/student/menu" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            Full Menu <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {foods.length === 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <FoodCardSkeleton />
            <FoodCardSkeleton />
            <FoodCardSkeleton />
            <FoodCardSkeleton />
          </div>
        ) : popularFoods.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {popularFoods.map((food) => (
              <FoodCard key={food.id} food={food} onAddToCart={addItem} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500 text-sm">No items available right now</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
