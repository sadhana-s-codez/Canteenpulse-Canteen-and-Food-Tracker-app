import type { Order, OrderItem, OrderStatus } from '../types';
import { getFoodItems, saveFoodItems } from './foodService';

// ─── Mock Order Service (localStorage) ────────────────────────────────

const ORDERS_KEY = 'canteenpulse_orders';
const TOKEN_COUNTER_KEY = 'canteenpulse_token_counter';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9);

const getOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((o: any) => ({
      ...o,
      createdAt: new Date(o.createdAt),
      updatedAt: new Date(o.updatedAt),
    }));
  } catch {
    return [];
  }
};

const saveOrders = (orders: Order[]) => {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  orderListeners.forEach((cb) => cb(orders));
};

const generateTokenNumber = (): string => {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const key = `${TOKEN_COUNTER_KEY}_${dateStr}`;

  let count = parseInt(localStorage.getItem(key) || '0', 10);
  count += 1;
  localStorage.setItem(key, String(count));

  return `A${String(count).padStart(3, '0')}`;
};

// ─── Listeners ────────────────────────────────────────────────────────
const orderListeners: Array<(orders: Order[]) => void> = [];

export const placeOrder = async (
  userId: string,
  studentName: string,
  items: OrderItem[],
  totalAmount: number
): Promise<string> => {
  // Deduct stock
  const foodItems = getFoodItems();
  for (const item of items) {
    const food = foodItems.find((f) => f.id === item.foodId);
    if (!food) throw new Error(`${item.name} is no longer available.`);
    if (!food.available) throw new Error(`${item.name} is currently unavailable.`);
    if (food.stock < item.quantity) {
      throw new Error(`Not enough stock for ${item.name}. Only ${food.stock} left.`);
    }
    food.stock -= item.quantity;
    if (food.stock <= 0) food.available = false;
    food.updatedAt = new Date();
  }
  saveFoodItems(foodItems);

  const tokenNumber = generateTokenNumber();
  const orderId = generateId();

  const order: Order = {
    id: orderId,
    userId,
    studentName,
    items,
    totalAmount,
    tokenNumber,
    status: 'placed',
    estimatedTime: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);

  // Update canteen status queue
  try {
    const statusRaw = localStorage.getItem('canteenpulse_canteen_status');
    if (statusRaw) {
      const status = JSON.parse(statusRaw);
      status.queueCount = (status.queueCount || 0) + 1;
      status.updatedAt = new Date().toISOString();
      localStorage.setItem('canteenpulse_canteen_status', JSON.stringify(status));
    }
  } catch {
    // Non-critical
  }

  return orderId;
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx !== -1) {
    orders[idx].status = status;
    orders[idx].updatedAt = new Date();
    saveOrders(orders);
  }
};

export const subscribeUserOrders = (
  userId: string,
  callback: (orders: Order[]) => void
): (() => void) => {
  const handler = (orders: Order[]) => {
    const userOrders = orders
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(userOrders);
  };

  orderListeners.push(handler);

  // Fire immediately
  setTimeout(() => handler(getOrders()), 50);

  return () => {
    const idx = orderListeners.indexOf(handler);
    if (idx !== -1) orderListeners.splice(idx, 1);
  };
};

export const subscribeAllOrders = (callback: (orders: Order[]) => void): (() => void) => {
  const handler = (orders: Order[]) => {
    const sorted = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    callback(sorted);
  };

  orderListeners.push(handler);
  setTimeout(() => handler(getOrders()), 50);

  return () => {
    const idx = orderListeners.indexOf(handler);
    if (idx !== -1) orderListeners.splice(idx, 1);
  };
};

export const subscribeTodayOrders = (callback: (orders: Order[]) => void): (() => void) => {
  const handler = (orders: Order[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders
      .filter((o) => new Date(o.createdAt).getTime() >= today.getTime())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(todayOrders);
  };

  orderListeners.push(handler);
  setTimeout(() => handler(getOrders()), 50);

  return () => {
    const idx = orderListeners.indexOf(handler);
    if (idx !== -1) orderListeners.splice(idx, 1);
  };
};

export const getActiveOrders = async (): Promise<Order[]> => {
  const activeStatuses: OrderStatus[] = ['placed', 'accepted', 'preparing', 'ready'];
  return getOrders()
    .filter((o) => activeStatuses.includes(o.status))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 50);
};
