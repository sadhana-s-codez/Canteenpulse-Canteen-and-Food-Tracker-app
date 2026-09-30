import React, { useEffect, useState } from 'react';
import { subscribeAllOrders } from '../../services/orderService';
import { subscribeFoodItems } from '../../services/foodService';
import { subscribeFeedback } from '../../services/realtimeService';
import type { Order, FoodItem, Feedback } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Star, Clock } from 'lucide-react';

const COLORS = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2'];

const AdminAnalyticsPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubs = [
      subscribeAllOrders((o) => { setOrders(o); setLoading(false); }),
      subscribeFoodItems(setFoods),
      subscribeFeedback(setFeedbacks),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  // Revenue calculation
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const todayOrders = orders.filter((o) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return o.createdAt >= today;
  });

  const weekOrders = orders.filter((o) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return o.createdAt >= weekAgo;
  });

  // Most popular food
  const foodPopularity: Record<string, number> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      foodPopularity[item.name] = (foodPopularity[item.name] || 0) + item.quantity;
    });
  });
  const popularFoods = Object.entries(foodPopularity)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  // Category distribution
  const categoryData: Record<string, number> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      const food = foods.find((f) => f.id === item.foodId);
      if (food) {
        categoryData[food.category] = (categoryData[food.category] || 0) + item.quantity;
      }
    });
  });
  const categoryPieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  // Average rating
  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : 'N/A';

  // Orders by hour
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, orders: 0 }));
  todayOrders.forEach((o) => {
    const hour = o.createdAt.getHours();
    hourlyData[hour].orders++;
  });
  const peakHour = hourlyData.reduce((max, d) => (d.orders > max.orders ? d : max), hourlyData[0]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-800">Analytics</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-slate-500">Total Orders</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{orders.length}</p>
          <p className="text-xs text-slate-400">Today: {todayOrders.length} · Week: {weekOrders.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-xs text-slate-500">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-slate-500">Avg Rating</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{avgRating}</p>
          <p className="text-xs text-slate-400">{feedbacks.length} reviews</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-slate-500">Peak Hour</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{peakHour.hour}</p>
          <p className="text-xs text-slate-400">{peakHour.orders} orders</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Popular Items */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Most Popular Items</h2>
          {popularFoods.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={popularFoods}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">No order data yet</p>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Category Distribution</h2>
          {categoryPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={10}
                >
                  {categoryPieData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">No data yet</p>
          )}
        </div>
      </div>

      {/* Orders by Hour */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Orders by Hour (Today)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={hourlyData.filter((d) => d.hour >= '6:00' && d.hour <= '22:00')}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
            <Bar dataKey="orders" fill="#7C3AED" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Feedback */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Recent Feedback</h2>
        {feedbacks.length > 0 ? (
          <div className="space-y-2">
            {feedbacks.slice(0, 5).map((f) => (
              <div key={f.id} className="border border-slate-100 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-800">{f.userName}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3 h-3 ${s <= f.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                    ))}
                  </div>
                </div>
                {f.comment && <p className="text-xs text-slate-500">{f.comment}</p>}
                <p className="text-[10px] text-slate-400 mt-1">{f.createdAt.toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">No feedback yet</p>
        )}
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
