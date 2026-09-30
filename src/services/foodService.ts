import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { FoodItem, Category } from '../types';

const FOOD_COLLECTION = 'foodItems';
const CATEGORIES_COLLECTION = 'categories';

export const subscribeFoodItems = (callback: (items: FoodItem[]) => void): (() => void) => {
  const q = query(collection(db, FOOD_COLLECTION), orderBy('name'));
  return onSnapshot(q, (snapshot) => {
    const items: FoodItem[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as FoodItem;
    });
    callback(items);
  });
};

export const addFoodItem = async (item: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>) => {
  return addDoc(collection(db, FOOD_COLLECTION), {
    ...item,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateFoodItem = async (id: string, updates: Partial<FoodItem>) => {
  const ref = doc(db, FOOD_COLLECTION, id);
  return updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
};

export const deleteFoodItem = async (id: string) => {
  return deleteDoc(doc(db, FOOD_COLLECTION, id));
};

export const subscribeCategories = (callback: (cats: Category[]) => void): (() => void) => {
  const q = query(collection(db, CATEGORIES_COLLECTION), orderBy('order'));
  return onSnapshot(q, (snapshot) => {
    const cats: Category[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Category[];
    callback(cats);
  });
};

export const addCategory = async (cat: Omit<Category, 'id'>) => {
  return addDoc(collection(db, CATEGORIES_COLLECTION), cat);
};

export const updateCategory = async (id: string, updates: Partial<Category>) => {
  return updateDoc(doc(db, CATEGORIES_COLLECTION, id), updates);
};

export const deleteCategory = async (id: string) => {
  return deleteDoc(doc(db, CATEGORIES_COLLECTION, id));
};

export const getCategories = async (): Promise<Category[]> => {
  const q = query(collection(db, CATEGORIES_COLLECTION), orderBy('order'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Category[];
};
