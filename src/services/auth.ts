import type { UserProfile, UserRole } from '../types';

// Minimal User interface (replaces Firebase User)
interface User {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  metadata: any;
  providerData: any[];
  providerId: string;
  refreshToken: string;
  tenantId: string | null;
  delete: () => Promise<void>;
  getIdToken: () => Promise<string>;
  getIdTokenResult: () => Promise<any>;
  reload: () => Promise<void>;
  toJSON: () => object;
}

// ─── Mock Auth System ────────────────────────────────────────────────
// No Firebase required. Any email + password combination works.
// Users are stored in localStorage for session persistence.

const MOCK_USERS_KEY = 'canteenpulse_mock_users';
const MOCK_CURRENT_USER_KEY = 'canteenpulse_current_user';

interface MockUser {
  uid: string;
  email: string;
  name: string;
  studentId: string;
  role: UserRole;
  createdAt: string;
}

const generateUID = (): string => {
  return 'user_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
};

const getMockUsers = (): Record<string, MockUser> => {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveMockUsers = (users: Record<string, MockUser>) => {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};

const setCurrentUser = (user: MockUser | null) => {
  if (user) {
    localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(MOCK_CURRENT_USER_KEY);
  }
  // Notify listeners
  authListeners.forEach((cb) => {
    cb(user ? createFakeFirebaseUser(user) : null);
  });
};

const getCurrentMockUser = (): MockUser | null => {
  try {
    const raw = localStorage.getItem(MOCK_CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Determine role from email for demo convenience
const detectRole = (email: string): UserRole => {
  const lower = email.toLowerCase();
  if (lower.includes('admin')) return 'admin';
  if (lower.includes('staff')) return 'staff';
  return 'student';
};

// Create a fake Firebase User-like object
const createFakeFirebaseUser = (mock: MockUser): User => {
  return {
    uid: mock.uid,
    email: mock.email,
    emailVerified: true,
    displayName: mock.name,
    phoneNumber: null,
    photoURL: null,
    isAnonymous: false,
    metadata: {} as any,
    providerData: [],
    providerId: 'mock',
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'mock-id-token',
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({ uid: mock.uid, email: mock.email }),
  } as User;
};

// ─── Exported Auth Functions ─────────────────────────────────────────

export const registerUser = async (
  email: string,
  password: string,
  name: string,
  studentId: string
): Promise<User> => {
  // Simulate slight delay for realism
  await new Promise((r) => setTimeout(r, 500));

  const users = getMockUsers();

  // Check if email already registered
  const existing = Object.values(users).find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    const error: any = new Error('Email already in use');
    error.code = 'auth/email-already-in-use';
    throw error;
  }

  const uid = generateUID();
  const role = detectRole(email);

  const mockUser: MockUser = {
    uid,
    email,
    name,
    studentId,
    role,
    createdAt: new Date().toISOString(),
  };

  users[uid] = mockUser;
  saveMockUsers(users);
  setCurrentUser(mockUser);

  return createFakeFirebaseUser(mockUser);
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  // Simulate slight delay for realism
  await new Promise((r) => setTimeout(r, 500));

  const users = getMockUsers();

  // Check if user exists in our mock store
  let mockUser = Object.values(users).find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  // If user doesn't exist, auto-create them (any email + password works)
  if (!mockUser) {
    const uid = generateUID();
    const role = detectRole(email);
    const namePart = email.split('@')[0].replace(/[._-]/g, ' ');
    const name = namePart
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    mockUser = {
      uid,
      email,
      name,
      studentId: 'STU' + Date.now().toString().slice(-6),
      role,
      createdAt: new Date().toISOString(),
    };

    users[uid] = mockUser;
    saveMockUsers(users);
  }

  setCurrentUser(mockUser);
  return createFakeFirebaseUser(mockUser);
};

export const logoutUser = async (): Promise<void> => {
  setCurrentUser(null);
};

export const resetPassword = async (email: string): Promise<void> => {
  // Mock: always succeeds
  await new Promise((r) => setTimeout(r, 500));
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const users = getMockUsers();
  const mockUser = users[uid];
  if (!mockUser) return null;

  return {
    id: mockUser.uid,
    name: mockUser.name,
    email: mockUser.email,
    studentId: mockUser.studentId,
    role: mockUser.role,
    createdAt: new Date(mockUser.createdAt),
  };
};

// ─── Auth State Listener ─────────────────────────────────────────────
const authListeners: Array<(user: User | null) => void> = [];

export const onAuthChange = (callback: (user: User | null) => void) => {
  authListeners.push(callback);

  // Fire immediately with current state
  const current = getCurrentMockUser();
  setTimeout(() => {
    callback(current ? createFakeFirebaseUser(current) : null);
  }, 100);

  // Return unsubscribe function
  return () => {
    const idx = authListeners.indexOf(callback);
    if (idx !== -1) authListeners.splice(idx, 1);
  };
};
