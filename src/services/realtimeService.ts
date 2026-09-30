import type { CanteenStatus, Announcement, Notification, Feedback } from '../types';

// ─── Mock Realtime Service (localStorage) ─────────────────────────────

const CANTEEN_STATUS_KEY = 'canteenpulse_canteen_status';
const ANNOUNCEMENTS_KEY = 'canteenpulse_announcements';
const NOTIFICATIONS_KEY = 'canteenpulse_notifications';
const FEEDBACK_KEY = 'canteenpulse_feedback';
const USERS_KEY = 'canteenpulse_mock_users';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9);

// ─── Generic Storage Helpers ──────────────────────────────────────────
const getStore = <T>(key: string): T[] => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw).map((item: any) => ({
      ...item,
      createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
    }));
  } catch {
    return [];
  }
};

const setStore = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ─── Canteen Status ───────────────────────────────────────────────────

const defaultCanteenStatus: CanteenStatus = {
  isOpen: true,
  crowdCount: 12,
  crowdLevel: 'LOW',
  queueCount: 3,
  currentToken: 'A003',
  estimatedWait: 8,
  avgPreparationTime: 8,
  updatedAt: new Date(),
};

const getCanteenStatus = (): CanteenStatus => {
  try {
    const raw = localStorage.getItem(CANTEEN_STATUS_KEY);
    if (!raw) {
      localStorage.setItem(CANTEEN_STATUS_KEY, JSON.stringify(defaultCanteenStatus));
      return { ...defaultCanteenStatus };
    }
    const data = JSON.parse(raw);
    return { ...data, updatedAt: new Date(data.updatedAt) };
  } catch {
    return { ...defaultCanteenStatus };
  }
};

const canteenListeners: Array<(status: CanteenStatus) => void> = [];

export const subscribeCanteenStatus = (
  callback: (status: CanteenStatus) => void
): (() => void) => {
  canteenListeners.push(callback);
  setTimeout(() => callback(getCanteenStatus()), 50);
  return () => {
    const idx = canteenListeners.indexOf(callback);
    if (idx !== -1) canteenListeners.splice(idx, 1);
  };
};

export const updateCanteenStatus = async (updates: Partial<CanteenStatus>) => {
  const current = getCanteenStatus();
  const crowdCount = updates.crowdCount ?? current.crowdCount;
  let crowdLevel = updates.crowdLevel;

  if (updates.crowdCount !== undefined && !crowdLevel) {
    if (crowdCount <= 20) crowdLevel = 'LOW';
    else if (crowdCount <= 50) crowdLevel = 'MODERATE';
    else if (crowdCount <= 80) crowdLevel = 'HIGH';
    else crowdLevel = 'VERY HIGH';
  }

  const updated = {
    ...current,
    ...updates,
    ...(crowdLevel ? { crowdLevel } : {}),
    updatedAt: new Date(),
  };

  localStorage.setItem(CANTEEN_STATUS_KEY, JSON.stringify(updated));
  canteenListeners.forEach((cb) => cb(updated));
};

export const initializeCanteenStatus = async () => {
  const status = getCanteenStatus();
  localStorage.setItem(CANTEEN_STATUS_KEY, JSON.stringify(status));
};

// ─── Announcements ───────────────────────────────────────────────────

// Seed some default announcements
const initAnnouncements = () => {
  if (!localStorage.getItem(ANNOUNCEMENTS_KEY)) {
    const defaults: Announcement[] = [
      {
        id: generateId(),
        title: '🎉 Welcome to CanteenPulse!',
        message: 'Order your favorite food online and skip the queue. Check out our menu!',
        createdBy: 'system',
        createdByName: 'Admin',
        createdAt: new Date(),
        active: true,
      },
      {
        id: generateId(),
        title: '🍛 Today\'s Special: Chicken Biryani',
        message: 'Aromatic basmati rice layered with tender spiced chicken — only ₹120! Available while stocks last.',
        createdBy: 'system',
        createdByName: 'Admin',
        createdAt: new Date(Date.now() - 3600000),
        active: true,
      },
    ];
    setStore(ANNOUNCEMENTS_KEY, defaults);
  }
};
initAnnouncements();

const announcementListeners: Array<(items: Announcement[]) => void> = [];
const allAnnouncementListeners: Array<(items: Announcement[]) => void> = [];

export const subscribeAnnouncements = (
  callback: (items: Announcement[]) => void
): (() => void) => {
  announcementListeners.push(callback);
  setTimeout(() => {
    const items = getStore<Announcement>(ANNOUNCEMENTS_KEY)
      .filter((a) => a.active)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(items);
  }, 50);
  return () => {
    const idx = announcementListeners.indexOf(callback);
    if (idx !== -1) announcementListeners.splice(idx, 1);
  };
};

export const subscribeAllAnnouncements = (
  callback: (items: Announcement[]) => void
): (() => void) => {
  allAnnouncementListeners.push(callback);
  setTimeout(() => {
    const items = getStore<Announcement>(ANNOUNCEMENTS_KEY)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(items);
  }, 50);
  return () => {
    const idx = allAnnouncementListeners.indexOf(callback);
    if (idx !== -1) allAnnouncementListeners.splice(idx, 1);
  };
};

export const createAnnouncement = async (
  title: string,
  message: string,
  createdBy: string,
  createdByName: string
) => {
  const items = getStore<Announcement>(ANNOUNCEMENTS_KEY);
  const newItem: Announcement = {
    id: generateId(),
    title,
    message,
    createdBy,
    createdByName,
    active: true,
    createdAt: new Date(),
  };
  items.unshift(newItem);
  setStore(ANNOUNCEMENTS_KEY, items);
  notifyAnnouncementListeners();
  return { id: newItem.id };
};

export const toggleAnnouncement = async (id: string, active: boolean) => {
  const items = getStore<Announcement>(ANNOUNCEMENTS_KEY);
  const idx = items.findIndex((a) => a.id === id);
  if (idx !== -1) {
    items[idx].active = active;
    setStore(ANNOUNCEMENTS_KEY, items);
    notifyAnnouncementListeners();
  }
};

const notifyAnnouncementListeners = () => {
  const all = getStore<Announcement>(ANNOUNCEMENTS_KEY)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const activeOnly = all.filter((a) => a.active);
  announcementListeners.forEach((cb) => cb(activeOnly));
  allAnnouncementListeners.forEach((cb) => cb(all));
};

// ─── Notifications ───────────────────────────────────────────────────
const notificationListeners: Map<string, Array<(items: Notification[]) => void>> = new Map();

export const subscribeNotifications = (
  userId: string,
  callback: (items: Notification[]) => void
): (() => void) => {
  if (!notificationListeners.has(userId)) {
    notificationListeners.set(userId, []);
  }
  notificationListeners.get(userId)!.push(callback);

  setTimeout(() => {
    const items = getStore<Notification>(NOTIFICATIONS_KEY)
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50);
    callback(items);
  }, 50);

  return () => {
    const listeners = notificationListeners.get(userId);
    if (listeners) {
      const idx = listeners.indexOf(callback);
      if (idx !== -1) listeners.splice(idx, 1);
    }
  };
};

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: Notification['type'] = 'general'
) => {
  const items = getStore<Notification>(NOTIFICATIONS_KEY);
  const newItem: Notification = {
    id: generateId(),
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: new Date(),
  };
  items.unshift(newItem);
  setStore(NOTIFICATIONS_KEY, items);

  // Notify listeners for this user
  const listeners = notificationListeners.get(userId);
  if (listeners) {
    const userItems = items
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50);
    listeners.forEach((cb) => cb(userItems));
  }

  return { id: newItem.id };
};

export const markNotificationRead = async (id: string) => {
  const items = getStore<Notification>(NOTIFICATIONS_KEY);
  const idx = items.findIndex((n) => n.id === id);
  if (idx !== -1) {
    items[idx].read = true;
    setStore(NOTIFICATIONS_KEY, items);
  }
};

export const markAllNotificationsRead = async (userId: string) => {
  const items = getStore<Notification>(NOTIFICATIONS_KEY);
  items.forEach((n) => {
    if (n.userId === userId) n.read = true;
  });
  setStore(NOTIFICATIONS_KEY, items);
};

// ─── Feedback ────────────────────────────────────────────────────────
const feedbackListeners: Array<(items: Feedback[]) => void> = [];

export const submitFeedback = async (feedback: Omit<Feedback, 'id' | 'createdAt'>) => {
  const items = getStore<Feedback>(FEEDBACK_KEY);
  const newItem: Feedback = {
    ...feedback,
    id: generateId(),
    createdAt: new Date(),
  };
  items.unshift(newItem);
  setStore(FEEDBACK_KEY, items);
  feedbackListeners.forEach((cb) => cb(items));
  return { id: newItem.id };
};

export const subscribeFeedback = (
  callback: (items: Feedback[]) => void
): (() => void) => {
  feedbackListeners.push(callback);
  setTimeout(() => {
    const items = getStore<Feedback>(FEEDBACK_KEY)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(items);
  }, 50);
  return () => {
    const idx = feedbackListeners.indexOf(callback);
    if (idx !== -1) feedbackListeners.splice(idx, 1);
  };
};

// ─── Users (admin) ───────────────────────────────────────────────────
const userListeners: Array<(users: Array<{ id: string; name: string; email: string; studentId: string; role: string; createdAt: Date }>) => void> = [];

export const subscribeUsers = (
  callback: (users: Array<{ id: string; name: string; email: string; studentId: string; role: string; createdAt: Date }>) => void
): (() => void) => {
  userListeners.push(callback);
  setTimeout(() => {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      if (raw) {
        const usersMap = JSON.parse(raw);
        const users = Object.values(usersMap).map((u: any) => ({
          id: u.uid,
          name: u.name,
          email: u.email,
          studentId: u.studentId,
          role: u.role,
          createdAt: new Date(u.createdAt),
        }));
        callback(users as any);
      } else {
        callback([]);
      }
    } catch {
      callback([]);
    }
  }, 50);
  return () => {
    const idx = userListeners.indexOf(callback);
    if (idx !== -1) userListeners.splice(idx, 1);
  };
};

export const updateUserRole = async (userId: string, role: string) => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      const users = JSON.parse(raw);
      if (users[userId]) {
        users[userId].role = role;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
    }
  } catch {
    // ignore
  }
};
