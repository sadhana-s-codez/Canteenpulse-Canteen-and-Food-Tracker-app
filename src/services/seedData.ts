import { collection, doc, setDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { initializeCanteenStatus } from './realtimeService';

const SAMPLE_CATEGORIES = [
  { name: 'Breakfast', icon: '🍳', order: 1 },
  { name: 'Lunch', icon: '🍛', order: 2 },
  { name: 'Snacks', icon: '🍿', order: 3 },
  { name: 'Beverages', icon: '☕', order: 4 },
  { name: 'Desserts', icon: '🍰', order: 5 },
];

const SAMPLE_FOODS = [
  {
    name: 'Masala Dosa',
    description: 'Crispy rice crepe filled with spiced potato masala, served with sambar and chutney',
    price: 50,
    category: 'Breakfast',
    imageUrl: '',
    stock: 25,
    available: true,
    isVeg: true,
    preparationTime: 8,
  },
  {
    name: 'Idli (2 pcs)',
    description: 'Soft steamed rice cakes served with sambar and coconut chutney',
    price: 30,
    category: 'Breakfast',
    imageUrl: '',
    stock: 40,
    available: true,
    isVeg: true,
    preparationTime: 5,
  },
  {
    name: 'Medu Vada (2 pcs)',
    description: 'Crispy fried lentil doughnuts served with sambar and chutney',
    price: 35,
    category: 'Breakfast',
    imageUrl: '',
    stock: 30,
    available: true,
    isVeg: true,
    preparationTime: 6,
  },
  {
    name: 'Samosa (2 pcs)',
    description: 'Crispy golden pastry filled with spiced potatoes and peas',
    price: 20,
    category: 'Snacks',
    imageUrl: '',
    stock: 50,
    available: true,
    isVeg: true,
    preparationTime: 3,
  },
  {
    name: 'Veg Puff',
    description: 'Flaky puff pastry filled with seasoned mixed vegetables',
    price: 25,
    category: 'Snacks',
    imageUrl: '',
    stock: 35,
    available: true,
    isVeg: true,
    preparationTime: 2,
  },
  {
    name: 'Paneer Roll',
    description: 'Soft roti wrapped around spiced paneer tikka filling with mint chutney',
    price: 60,
    category: 'Snacks',
    imageUrl: '',
    stock: 20,
    available: true,
    isVeg: true,
    preparationTime: 7,
  },
  {
    name: 'Lemon Rice',
    description: 'Tangy South Indian rice tempered with mustard seeds, peanuts, and curry leaves',
    price: 40,
    category: 'Lunch',
    imageUrl: '',
    stock: 30,
    available: true,
    isVeg: true,
    preparationTime: 5,
  },
  {
    name: 'Veg Meals',
    description: 'Complete thali with rice, sambar, rasam, poriyal, curd, papad, and pickle',
    price: 80,
    category: 'Lunch',
    imageUrl: '',
    stock: 40,
    available: true,
    isVeg: true,
    preparationTime: 10,
  },
  {
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice layered with tender spiced chicken, served with raita',
    price: 120,
    category: 'Lunch',
    imageUrl: '',
    stock: 25,
    available: true,
    isVeg: false,
    preparationTime: 12,
  },
  {
    name: 'Tea',
    description: 'Hot masala chai brewed with fresh ginger, cardamom, and milk',
    price: 15,
    category: 'Beverages',
    imageUrl: '',
    stock: 100,
    available: true,
    isVeg: true,
    preparationTime: 3,
  },
  {
    name: 'Coffee',
    description: 'Strong South Indian filter coffee with frothy milk',
    price: 20,
    category: 'Beverages',
    imageUrl: '',
    stock: 100,
    available: true,
    isVeg: true,
    preparationTime: 3,
  },
  {
    name: 'Fresh Juice',
    description: 'Freshly squeezed seasonal fruit juice — no added sugar',
    price: 40,
    category: 'Beverages',
    imageUrl: '',
    stock: 30,
    available: true,
    isVeg: true,
    preparationTime: 5,
  },
  {
    name: 'Milkshake',
    description: 'Thick and creamy milkshake — choice of chocolate, mango, or strawberry',
    price: 50,
    category: 'Beverages',
    imageUrl: '',
    stock: 20,
    available: true,
    isVeg: true,
    preparationTime: 4,
  },
  {
    name: 'Gulab Jamun (2 pcs)',
    description: 'Soft and spongy milk-solid balls soaked in warm rose-flavored sugar syrup',
    price: 30,
    category: 'Desserts',
    imageUrl: '',
    stock: 25,
    available: true,
    isVeg: true,
    preparationTime: 2,
  },
  {
    name: 'Egg Puff',
    description: 'Flaky pastry stuffed with spiced boiled egg filling',
    price: 30,
    category: 'Snacks',
    imageUrl: '',
    stock: 30,
    available: true,
    isVeg: false,
    preparationTime: 2,
  },
];

export const seedDatabase = async () => {
  // Check if data already exists
  const foodSnap = await getDocs(collection(db, 'foodItems'));
  if (!foodSnap.empty) {
    console.log('Database already has food items — skipping seed.');
    return false;
  }

  // Seed categories
  for (const cat of SAMPLE_CATEGORIES) {
    await setDoc(doc(collection(db, 'categories')), cat);
  }

  // Seed food items
  for (const food of SAMPLE_FOODS) {
    await setDoc(doc(collection(db, 'foodItems')), {
      ...food,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  // Initialize canteen status
  await initializeCanteenStatus();

  console.log('Database seeded successfully!');
  return true;
};
