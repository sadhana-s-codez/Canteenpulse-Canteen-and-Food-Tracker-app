import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { placeOrder } from '../../services/orderService';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Loader2, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

const CartPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { items, updateQuantity, removeItem, clearCart, totalAmount, totalItems } = useCart();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    if (!user || !profile) {
      toast.error('Please login to place an order');
      return;
    }
    if (items.length === 0) return;

    setPlacing(true);
    try {
      const orderItems = items.map((i) => ({
        foodId: i.food.id,
        name: i.food.name,
        price: i.food.price,
        quantity: i.quantity,
      }));

      const orderId = await placeOrder(
        user.uid,
        profile.name,
        orderItems,
        totalAmount
      );

      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate('/student/orders');
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ShoppingCart className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-lg font-semibold text-slate-700 mb-1">Your cart is empty</h2>
        <p className="text-sm text-slate-500 mb-6">Add some delicious food from the menu!</p>
        <button
          onClick={() => navigate('/student/menu')}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Your Cart</h1>
          <p className="text-sm text-slate-500">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Cart Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.food.id}
            className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4"
          >
            <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-2xl shrink-0">
              {item.food.isVeg ? '🥬' : '🍗'}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-slate-800 truncate">{item.food.name}</h3>
              <p className="text-sm text-blue-600 font-semibold">₹{item.food.price}</p>
              {item.food.stock <= 5 && (
                <p className="text-[10px] text-amber-600 font-medium">Only {item.food.stock} left</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.food.id, item.quantity - 1)}
                className="w-8 h-8 rounded-lg border border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <Minus className="w-3.5 h-3.5 text-slate-600" />
              </button>
              <span className="w-8 text-center text-sm font-semibold text-slate-800">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.food.id, item.quantity + 1)}
                disabled={item.quantity >= item.food.stock}
                className="w-8 h-8 rounded-lg border border-slate-300 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-slate-600" />
              </button>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">
                ₹{item.food.price * item.quantity}
              </p>
              <button
                onClick={() => removeItem(item.food.id)}
                className="mt-1 text-red-500 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.food.id} className="flex justify-between text-slate-600">
              <span>{item.quantity}× {item.food.name}</span>
              <span>₹{item.food.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t border-slate-100 pt-2 mt-2 flex justify-between font-bold text-slate-800">
            <span>Total</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Place Order Button */}
      <button
        onClick={handlePlaceOrder}
        disabled={placing}
        className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {placing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Placing Order...
          </>
        ) : (
          <>
            <ShoppingBag className="w-4 h-4" />
            Place Order · ₹{totalAmount}
          </>
        )}
      </button>
    </div>
  );
};

export default CartPage;
