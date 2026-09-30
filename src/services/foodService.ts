import type { FoodItem, Category } from '../types';

// ─── Mock Food Service (localStorage) ─────────────────────────────────

const FOOD_KEY = 'canteenpulse_food_items';
const CATEGORIES_KEY = 'canteenpulse_categories';

// ─── Seed Data ────────────────────────────────────────────────────────
const SAMPLE_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Breakfast', icon: '🍳', order: 1 },
  { name: 'Lunch', icon: '🍛', order: 2 },
  { name: 'Snacks', icon: '🍿', order: 3 },
  { name: 'Beverages', icon: '☕', order: 4 },
  { name: 'Desserts', icon: '🍰', order: 5 },
];

const SAMPLE_FOODS: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Masala Dosa', description: 'Crispy rice crepe filled with spiced potato masala, served with sambar and chutney', price: 50, category: 'Breakfast', imageUrl: '', stock: 25, available: true, isVeg: true, preparationTime: 8 },
  { name: 'Idli (2 pcs)', description: 'Soft steamed rice cakes served with sambar and coconut chutney', price: 30, category: 'Breakfast', imageUrl: '', stock: 40, available: true, isVeg: true, preparationTime: 5 },
  { name: 'Medu Vada (2 pcs)', description: 'Crispy fried lentil doughnuts served with sambar and chutney', price: 35, category: 'Breakfast', imageUrl: '', stock: 30, available: true, isVeg: true, preparationTime: 6 },
  { name: 'Samosa (2 pcs)', description: 'Crispy golden pastry filled with spiced potatoes and peas', price: 20, category: 'Snacks', imageUrl: '', stock: 50, available: true, isVeg: true, preparationTime: 3 },
  { name: 'Veg Puff', description: 'Flaky puff pastry filled with seasoned mixed vegetables', price: 25, category: 'Snacks', imageUrl: '', stock: 35, available: true, isVeg: true, preparationTime: 2 },
  { name: 'Paneer Roll', description: 'Soft roti wrapped around spiced paneer tikka filling with mint chutney', price: 60, category: 'Snacks', imageUrl: '', stock: 20, available: true, isVeg: true, preparationTime: 7 },
  { name: 'Lemon Rice', description: 'Tangy South Indian rice tempered with mustard seeds, peanuts, and curry leaves', price: 40, category: 'Lunch', imageUrl: '', stock: 30, available: true, isVeg: true, preparationTime: 5 },
  { name: 'Veg Meals', description: 'Complete thali with rice, sambar, rasam, poriyal, curd, papad, and pickle', price: 80, category: 'Lunch', imageUrl: '', stock: 40, available: true, isVeg: true, preparationTime: 10 },
  { name: 'Chicken Biryani', description: 'Aromatic basmati rice layered with tender spiced chicken, served with raita', price: 120, category: 'Lunch', imageUrl: '', stock: 25, available: true, isVeg: false, preparationTime: 12 },
  { name: 'Tea', description: 'Hot masala chai brewed with fresh ginger, cardamom, and milk', price: 15, category: 'Beverages', imageUrl: '', stock: 100, available: true, isVeg: true, preparationTime: 3 },
  { name: 'Coffee', description: 'Strong South Indian filter coffee with frothy milk', price: 20, category: 'Beverages', imageUrl: '', stock: 100, available: true, isVeg: true, preparationTime: 3 },
  { name: 'Fresh Juice', description: 'Freshly squeezed seasonal fruit juice — no added sugar', price: 40, category: 'Beverages', imageUrl: '', stock: 30, available: true, isVeg: true, preparationTime: 5 },
  { name: 'Milkshake', description: 'Thick and creamy milkshake — choice of chocolate, mango, or strawberry', price: 50, category: 'Beverages', imageUrl: '', stock: 20, available: true, isVeg: true, preparationTime: 4 },
  { name: 'Gulab Jamun (2 pcs)', description: 'Soft and spongy milk-solid balls soaked in warm rose-flavored sugar syrup', price: 30, category: 'Desserts', imageUrl: '', stock: 25, available: true, isVeg: true, preparationTime: 2 },
  { name: 'Egg Puff', description: 'Flaky pastry stuffed with spiced boiled egg filling', price: 30, category: 'Snacks', imageUrl: '', stock: 30, available: true, isVeg: false, preparationTime: 2 },
];

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9);

// ─── Initialize Seed Data ─────────────────────────────────────────────
const initSeedData = () => {
  if (!localStorage.getItem(FOOD_KEY)) {
    const items: FoodItem[] = SAMPLE_FOODS.map((f) => ({
      ...f,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    localStorage.setItem(FOOD_KEY, JSON.stringify(items));
  }
  if (!localStorage.getItem(CATEGORIES_KEY)) {
    const cats: Category[] = SAMPLE_CATEGORIES.map((c) => ({
      ...c,
      id: generateId(),
    }));
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
  }
};

initSeedData();

// ─── Storage Helpers ──────────────────────────────────────────────────
const getFoodItems = (): FoodItem[] => {
  try {
    const raw = localStorage.getItem(FOOD_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((f: any) => ({
      ...f,
      createdAt: new Date(f.createdAt),
      updatedAt: new Date(f.updatedAt),
    }));
  } catch {
    return [];
  }
};

const saveFoodItems = (items: FoodItem[]) => {
  localStorage.setItem(FOOD_KEY, JSON.stringify(items));
  foodListeners.forEach((cb) => cb(items));
};

const getCategoriesList = (): Category[] => {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveCategoriesList = (cats: Category[]) => {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
  categoryListeners.forEach((cb) => cb(cats));
};

// ─── Listeners (simulates onSnapshot) ─────────────────────────────────
const foodListeners: Array<(items: FoodItem[]) => void> = [];
const categoryListeners: Array<(cats: Category[]) => void> = [];

export const subscribeFoodItems = (callback: (items: FoodItem[]) => void): (() => void) => {
  foodListeners.push(callback);
  // Fire immediately
  setTimeout(() => callback(getFoodItems().sort((a, b) => a.name.localeCompare(b.name))), 50);
  return () => {
    const idx = foodListeners.indexOf(callback);
    if (idx !== -1) foodListeners.splice(idx, 1);
  };
};

export const addFoodItem = async (item: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>) => {
  const items = getFoodItems();
  const newItem: FoodItem = {
    ...item,
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  items.push(newItem);
  saveFoodItems(items);
  return { id: newItem.id };
};

export const updateFoodItem = async (id: string, updates: Partial<FoodItem>) => {
  const items = getFoodItems();
  const idx = items.findIndex((i) => i.id === id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...updates, updatedAt: new Date() };
    saveFoodItems(items);
  }
};

export const deleteFoodItem = async (id: string) => {
  const items = getFoodItems().filter((i) => i.id !== id);
  saveFoodItems(items);
};

export const subscribeCategories = (callback: (cats: Category[]) => void): (() => void) => {
  categoryListeners.push(callback);
  setTimeout(() => callback(getCategoriesList().sort((a, b) => a.order - b.order)), 50);
  return () => {
    const idx = categoryListeners.indexOf(callback);
    if (idx !== -1) categoryListeners.splice(idx, 1);
  };
};

export const addCategory = async (cat: Omit<Category, 'id'>) => {
  const cats = getCategoriesList();
  const newCat: Category = { ...cat, id: generateId() };
  cats.push(newCat);
  saveCategoriesList(cats);
  return { id: newCat.id };
};

export const updateCategory = async (id: string, updates: Partial<Category>) => {
  const cats = getCategoriesList();
  const idx = cats.findIndex((c) => c.id === id);
  if (idx !== -1) {
    cats[idx] = { ...cats[idx], ...updates };
    saveCategoriesList(cats);
  }
};

export const deleteCategory = async (id: string) => {
  const cats = getCategoriesList().filter((c) => c.id !== id);
  saveCategoriesList(cats);
};

export const getCategories = async (): Promise<Category[]> => {
  return getCategoriesList().sort((a, b) => a.order - b.order);
};

// Re-export for use by seedData
export { getFoodItems, saveFoodItems };
