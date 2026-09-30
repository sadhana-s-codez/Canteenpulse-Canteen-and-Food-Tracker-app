import React, { useEffect, useState } from 'react';
import { subscribeFoodItems, updateFoodItem } from '../../services/foodService';
import LiveBadge from '../../components/LiveBadge';
import type { FoodItem } from '../../types';
import { Search, Minus, Plus, Loader2, Leaf, Drumstick } from 'lucide-react';
import toast from 'react-hot-toast';

const StaffMenuPage: React.FC = () => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeFoodItems((items) => {
      setFoods(items);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = search
    ? foods.filter(
        (f) =>
          f.name.toLowerCase().includes(search.toLowerCase()) ||
          f.category.toLowerCase().includes(search.toLowerCase())
      )
    : foods;

  const handleStockChange = async (food: FoodItem, newStock: number) => {
    newStock = Math.max(0, newStock);
    setUpdatingId(food.id);
    try {
      await updateFoodItem(food.id, {
        stock: newStock,
        available: newStock > 0,
      });
    } catch {
      toast.error('Failed to update stock');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleAvailable = async (food: FoodItem) => {
    setUpdatingId(food.id);
    try {
      await updateFoodItem(food.id, { available: !food.available });
      toast.success(`${food.name} ${!food.available ? 'enabled' : 'disabled'}`);
    } catch {
      toast.error('Failed to update');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Menu Management</h1>
        <LiveBadge />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((food) => (
            <div
              key={food.id}
              className={`bg-white rounded-xl border p-4 transition-colors ${
                food.available && food.stock > 0
                  ? 'border-slate-200'
                  : 'border-red-200 bg-red-50/30'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm text-slate-800 truncate">{food.name}</h3>
                    {food.isVeg ? (
                      <Leaf className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    ) : (
                      <Drumstick className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    )}
                    <span className="text-xs text-slate-400">₹{food.price}</span>
                  </div>
                  <p className="text-xs text-slate-500">{food.category}</p>
                </div>

                {/* Stock Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStockChange(food, food.stock - 1)}
                    disabled={updatingId === food.id}
                    className="w-8 h-8 rounded-lg border border-slate-300 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className={`w-10 text-center text-sm font-bold ${
                    food.stock === 0 ? 'text-red-600' : food.stock <= 5 ? 'text-amber-600' : 'text-slate-800'
                  }`}>
                    {food.stock}
                  </span>
                  <button
                    onClick={() => handleStockChange(food, food.stock + 5)}
                    disabled={updatingId === food.id}
                    className="w-8 h-8 rounded-lg border border-slate-300 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Toggle */}
                <button
                  onClick={() => handleToggleAvailable(food)}
                  disabled={updatingId === food.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    food.available
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {updatingId === food.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : food.available ? (
                    'Available'
                  ) : (
                    'Unavailable'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffMenuPage;
