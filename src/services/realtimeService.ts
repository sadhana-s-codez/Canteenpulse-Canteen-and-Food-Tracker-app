import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  orderBy,
  where,
  getDocs,
  setDoc,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import type { CanteenStatus, Announcement, Notification, Feedback } from '../types';

// ─── Canteen Status ───────────────────────────────────────────────────
export const subscribeCanteenStatus = (
  callback: (status: CanteenStatus) => void
): (() => void) => {
  const ref = doc(db, 'canteenStatus', 'main');
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback({
        ...data,
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as CanteenStatus);
    }
  });
};

export const updateCanteenStatus = async (updates: Partial<CanteenStatus>) => {
  const ref = doc(db, 'canteenStatus', 'main');
  const crowdCount = updates.crowdCount;
  let crowdLevel = updates.crowdLevel;

  if (crowdCount !== undefined && !crowdLevel) {
    if (crowdCount <= 20) crowdLevel = 'LOW';
    else if (crowdCount <= 50) crowdLevel = 'MODERATE';
    else if (crowdCount <= 80) crowdLevel = 'HIGH';
    else crowdLevel = 'VERY HIGH';
  }

  return updateDoc(ref, {
    ...updates,
    ...(crowdLevel ? { crowdLevel } : {}),
    updatedAt: serverTimestamp(),
  });
};

export const initializeCanteenStatus = async () => {
  const ref = doc(db, 'canteenStatus', 'main');
  return setDoc(ref, {
    isOpen: true,
    crowdCount: 0,
    crowdLevel: 'LOW',
    queueCount: 0,
    currentToken: 'A000',
    estimatedWait: 0,
    avgPreparationTime: 8,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

// ─── Announcements ───────────────────────────────────────────────────
export const subscribeAnnouncements = (
  callback: (items: Announcement[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'announcements'),
    where('active', '==', true),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const items: Announcement[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Announcement;
    });
    callback(items);
  });
};

export const subscribeAllAnnouncements = (
  callback: (items: Announcement[]) => void
): (() => void) => {
  const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const items: Announcement[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Announcement;
    });
    callback(items);
  });
};

export const createAnnouncement = async (
  title: string,
  message: string,
  createdBy: string,
  createdByName: string
) => {
  return addDoc(collection(db, 'announcements'), {
    title,
    message,
    createdBy,
    createdByName,
    active: true,
    createdAt: serverTimestamp(),
  });
};

export const toggleAnnouncement = async (id: string, active: boolean) => {
  return updateDoc(doc(db, 'announcements', id), { active });
};

// ─── Notifications ───────────────────────────────────────────────────
export const subscribeNotifications = (
  userId: string,
  callback: (items: Notification[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  return onSnapshot(q, (snapshot) => {
    const items: Notification[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Notification;
    });
    callback(items);
  });
};

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: Notification['type'] = 'general'
) => {
  return addDoc(collection(db, 'notifications'), {
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: serverTimestamp(),
  });
};

export const markNotificationRead = async (id: string) => {
  return updateDoc(doc(db, 'notifications', id), { read: true });
};

export const markAllNotificationsRead = async (userId: string) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false)
  );
  const snap = await getDocs(q);
  const updates = snap.docs.map((d) => updateDoc(d.ref, { read: true }));
  return Promise.all(updates);
};

// ─── Feedback ────────────────────────────────────────────────────────
export const submitFeedback = async (feedback: Omit<Feedback, 'id' | 'createdAt'>) => {
  return addDoc(collection(db, 'feedback'), {
    ...feedback,
    createdAt: serverTimestamp(),
  });
};

export const subscribeFeedback = (
  callback: (items: Feedback[]) => void
): (() => void) => {
  const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const items: Feedback[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Feedback;
    });
    callback(items);
  });
};

// ─── Users (admin) ───────────────────────────────────────────────────
export const subscribeUsers = (
  callback: (users: Array<{ id: string; name: string; email: string; studentId: string; role: string; createdAt: Date }>) => void
): (() => void) => {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    }) as Array<{ id: string; name: string; email: string; studentId: string; role: string; createdAt: Date }>;
    callback(users);
  });
};

export const updateUserRole = async (userId: string, role: string) => {
  return updateDoc(doc(db, 'users', userId), { role });
};
