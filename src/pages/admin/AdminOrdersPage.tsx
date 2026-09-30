import React, { useEffect, useState } from 'react';
import { subscribeAllOrders, updateOrderStatus } from '../../services/orderService';
import { getStatusColor, getStatusLabel } from '../../components/OrderTimeline';
import type { Order } from '../../types';
import { Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const unsub = subscribeAllOrders((o) => { setOrders(o); setLoading(false); });
    return () => unsub();
  }, []);

  const filtered = orders.filter((o) => {
    const matchesSearch = !search ||
      o.tokenNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.studentName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-slate-800">All Orders ({orders.length})</h1>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search token or name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none">
          <option value="all">All Status</option>
          <option value="placed">Placed</option>
          <option value="accepted">Accepted</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-xl border h-16 animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Token</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Student</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Items</th>
                  <th className="text-right text-xs font-medium text-slate-500 px-4 py-3">Amount</th>
                  <th className="text-center text-xs font-medium text-slate-500 px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-bold text-blue-600">{order.tokenNumber}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{order.studentName}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-slate-800">₹{order.totalAmount}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{order.createdAt.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500">No orders found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
