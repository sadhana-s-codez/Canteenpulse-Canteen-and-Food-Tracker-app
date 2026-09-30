import React, { useEffect, useState } from 'react';
import { subscribeFoodItems, addFoodItem, updateFoodItem, deleteFoodItem } from '../../services/foodService';
import type { FoodItem } from '../../types';
import { Plus, Pencil, Trash2, X, Loader2, Leaf, Drumstick, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Breakfast', 'Lunch', 'Snacks', 'Beverages', 'Desserts'];

const emptyForm = {
  name: '', description: '', price: 0, category: 'Snacks',
  imageUrl: '', stock: 0, available: true, isVeg: true, preparationTime: 5,
};

const AdminFoodPage: React.FC = () => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeFoodItems((items) => { setFoods(items); setLoading(false); });
    return () => unsub();
  }, []);

  const filtered = search
    ? foods.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : foods;

  const handleEdit = (food: FoodItem) => {
    setForm({
      name: food.name, description: food.description, price: food.price,
      category: food.category, imageUrl: food.imageUrl, stock: food.stock,
      available: food.available, isVeg: food.isVeg, preparationTime: food.preparationTime,
    });
    setEditingId(food.id);
    setShowForm(true);
  };

  const handleNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const handleDelete = async (food: FoodItem) => {
    if (!confirm(`Delete ${food.name}?`)) return;
    try {
      await deleteFoodItem(food.id);
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (form.price <= 0) { toast.error('Price must be positive'); return; }
    if (form.stock < 0) { toast.error('Stock cannot be negative'); return; }

    setSaving(true);
    try {
      if (editingId) {
        await updateFoodItem(editingId, form);
        toast.success('Updated');
      } else {
        await addFoodItem(form);
        toast.success('Added');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Food Items</h1>
        <button
          onClick={handleNew}
          className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? 'Edit Food Item' : 'New Food Item'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Price (₹) *</label>
                  <input type="number" min={1} value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Stock</label>
                  <input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Prep Time (min)</label>
                  <input type="number" min={1} value={form.preparationTime} onChange={(e) => setForm({ ...form, preparationTime: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Image URL</label>
                <input type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://..." className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.isVeg} onChange={(e) => setForm({ ...form, isVeg: e.target.checked })}
                    className="rounded border-slate-300 text-green-600 focus:ring-green-500" />
                  Vegetarian
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  Available
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-slate-800 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {editingId ? 'Update' : 'Add'} Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items Table */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 h-16 animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Item</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Category</th>
                  <th className="text-right text-xs font-medium text-slate-500 px-4 py-3">Price</th>
                  <th className="text-right text-xs font-medium text-slate-500 px-4 py-3">Stock</th>
                  <th className="text-center text-xs font-medium text-slate-500 px-4 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-slate-500 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((food) => (
                  <tr key={food.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {food.isVeg ? <Leaf className="w-3.5 h-3.5 text-green-500" /> : <Drumstick className="w-3.5 h-3.5 text-red-500" />}
                        <span className="text-sm font-medium text-slate-800">{food.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{food.category}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-slate-800">₹{food.price}</td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${food.stock === 0 ? 'text-red-600' : food.stock <= 5 ? 'text-amber-600' : 'text-slate-800'}`}>
                      {food.stock}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        food.available && food.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {food.available && food.stock > 0 ? 'Available' : 'Sold Out'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(food)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(food)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500">No items found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminFoodPage;
