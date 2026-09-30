export type UserRole = 'student' | 'staff' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  studentId: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Date;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  available: boolean;
  isVeg: boolean;
  preparationTime: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  food: FoodItem;
  quantity: number;
}

export type OrderStatus = 'placed' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  studentName: string;
  items: OrderItem[];
  totalAmount: number;
  tokenNumber: string;
  status: OrderStatus;
  estimatedTime: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CanteenStatus {
  isOpen: boolean;
  crowdCount: number;
  crowdLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';
  queueCount: number;
  currentToken: string;
  estimatedWait: number;
  avgPreparationTime: number;
  updatedAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  active: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'announcement' | 'stock' | 'general';
  read: boolean;
  createdAt: Date;
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  order: number;
}
