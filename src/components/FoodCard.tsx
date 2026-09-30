import React from 'react';
import { Plus, Clock, Leaf, Drumstick, AlertTriangle } from 'lucide-react';
import type { FoodItem } from '../types';

interface FoodCardProps {
  food: FoodItem;
  onAddToCart?: (food: FoodItem) => void;
  compact?: boolean;
}

const FoodCard: React.FC<FoodCardProps> = ({ food, onAddToCart, compact = false }) => {
  const isSoldOut = !food.available || food.stock <= 0;
  const isLowStock = food.stock > 0 && food.stock <= 5;

  const fallbackGradients: Record<string, string> = {
    Breakfast: 'from-amber-100 to-orange-100',
    Lunch: 'from-emerald-100 to-teal-100',
    Snacks: 'from-yellow-100 to-amber-100',
    Beverages: 'from-sky-100 to-blue-100',
    Desserts: 'from-pink-100 to-rose-100',
  };

  const fallbackEmoji: Record<string, string> = {
    Breakfast: '🍳',
    Lunch: '🍛',
    Snacks: '🍿',
    Beverages: '☕',
    Desserts: '🍰',
  };

  const gradient = fallbackGradients[food.category] || 'from-slate-100 to-slate-200';
  const emoji = fallbackEmoji[food.category] || '🍽️';

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300 ${
        isSoldOut ? 'opacity-70' : ''
      }`}
    >
      {/* Image / Placeholder */}
      <div className={`relative h-36 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        {food.imageUrl ? (
          <img
            src={food.imageUrl}
            alt={food.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <span className={`text-5xl ${food.imageUrl ? 'hidden' : ''}`}>{emoji}</span>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {food.isVeg ? (
            <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Leaf className="w-3 h-3" /> VEG
            </span>
          ) : (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Drumstick className="w-3 h-3" /> NON-VEG
            </span>
          )}
        </div>

        {isSoldOut && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-600 text-white text-sm font-bold px-4 py-1.5 rounded-full">
              SOLD OUT
            </span>
          </div>
        )}

        {isLowStock && !isSoldOut && (
          <div className="absolute bottom-2 right-2">
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <AlertTriangle className="w-3 h-3" /> {food.stock} left
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-slate-800 text-sm leading-tight">{food.name}</h3>
          <span className="text-blue-600 font-bold text-sm whitespace-nowrap">₹{food.price}</span>
        </div>

        {!compact && (
          <p className="text-xs text-slate-500 mb-2.5 line-clamp-2 leading-relaxed">
            {food.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {food.preparationTime}m
            </span>
            {!isSoldOut && (
              <span className="text-green-600 font-medium">
                {food.stock} avail
              </span>
            )}
          </div>

          {onAddToCart && (
            <button
              onClick={() => onAddToCart(food)}
              disabled={isSoldOut}
              className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                isSoldOut
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
