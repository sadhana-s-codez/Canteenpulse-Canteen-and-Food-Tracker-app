import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  runTransaction,
  getDoc,
  getDocs,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Order, OrderItem, OrderStatus } from '../types';

const ORDERS_COLLECTION = 'orders';
const FOOD_COLLECTION = 'foodItems';
const CANTEEN_STATUS_DOC = 'canteenStatus/main';

const generateTokenNumber = async (): Promise<string> => {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

  const tokenDocRef = doc(db, 'tokenCounters', dateStr);

  const newToken = await runTransaction(db, async (transaction) => {
    const tokenDoc = await transaction.get(tokenDocRef);
    let currentCount = 0;
    if (tokenDoc.exists()) {
      currentCount = tokenDoc.data().count || 0;
    }
    const nextCount = currentCount + 1;
    transaction.set(tokenDocRef, { count: nextCount, date: dateStr });
    return `A${String(nextCount).padStart(3, '0')}`;
  });

  return newToken;
};

export const placeOrder = async (
  userId: string,
  studentName: string,
  items: OrderItem[],
  totalAmount: number
): Promise<string> => {
  // Use a transaction to verify stock and create order atomically
  const orderId = await runTransaction(db, async (transaction) => {
    // Verify stock for all items
    for (const item of items) {
      const foodRef = doc(db, FOOD_COLLECTION, item.foodId);
      const foodDoc = await transaction.get(foodRef);
      if (!foodDoc.exists()) {
        throw new Error(`${item.name} is no longer available.`);
      }
      const foodData = foodDoc.data();
      if (!foodData.available) {
        throw new Error(`${item.name} is currently unavailable.`);
      }
      if (foodData.stock < item.quantity) {
        throw new Error(
          `Not enough stock for ${item.name}. Only ${foodData.stock} left.`
        );
      }
    }

    // Deduct stock
    for (const item of items) {
      const foodRef = doc(db, FOOD_COLLECTION, item.foodId);
      const foodDoc = await transaction.get(foodRef);
      const currentStock = foodDoc.data()!.stock;
      const newStock = currentStock - item.quantity;
      transaction.update(foodRef, {
        stock: newStock,
        available: newStock > 0,
        updatedAt: serverTimestamp(),
      });
    }

    // We need to generate token outside transaction since it uses its own transaction
    return null;
  });

  // Generate token after stock transaction succeeds
  const tokenNumber = await generateTokenNumber();

  // Get estimated time from canteen status
  let estimatedTime = 10;
  try {
    const statusDoc = await getDoc(doc(db, 'canteenStatus', 'main'));
    if (statusDoc.exists()) {
      estimatedTime = statusDoc.data().avgPreparationTime || 10;
    }
  } catch {
    // Use default
  }

  // Create the order
  const orderRef = await addDoc(collection(db, ORDERS_COLLECTION), {
    userId,
    studentName,
    items,
    totalAmount,
    tokenNumber,
    status: 'placed' as OrderStatus,
    estimatedTime,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update queue count
  try {
    const statusRef = doc(db, 'canteenStatus', 'main');
    const statusDoc = await getDoc(statusRef);
    if (statusDoc.exists()) {
      const currentQueue = statusDoc.data().queueCount || 0;
      await updateDoc(statusRef, {
        queueCount: currentQueue + 1,
        updatedAt: serverTimestamp(),
      });
    }
  } catch {
    // Non-critical
  }

  return orderRef.id;
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  const ref = doc(db, ORDERS_COLLECTION, orderId);
  return updateDoc(ref, { status, updatedAt: serverTimestamp() });
};

export const subscribeUserOrders = (
  userId: string,
  callback: (orders: Order[]) => void
): (() => void) => {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const orders: Order[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Order;
    });
    callback(orders);
  });
};

export const subscribeAllOrders = (callback: (orders: Order[]) => void): (() => void) => {
  const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const orders: Order[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Order;
    });
    callback(orders);
  });
};

export const subscribeTodayOrders = (callback: (orders: Order[]) => void): (() => void) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where('createdAt', '>=', today),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const orders: Order[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Order;
    });
    callback(orders);
  });
};

export const getActiveOrders = async (): Promise<Order[]> => {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where('status', 'in', ['placed', 'accepted', 'preparing', 'ready']),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Order;
  });
};
