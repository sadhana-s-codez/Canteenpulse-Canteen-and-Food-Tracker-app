# CanteenPulse — Real-Time Canteen Crowd & Food Tracker

A full-stack, real-time canteen management platform built with **React**, **TypeScript**, **Tailwind CSS v4**, and **Firebase** (Auth + Firestore).

Students see live crowd levels, queue lengths, menu availability, and order statuses — all updating in real time without page refreshes. Staff can manage orders, update crowd/queue status, and control the canteen. Admins get full CRUD over users, food items, analytics, and announcements.

---

## ✨ Features

### Student View
- 📊 **Live Dashboard** — crowd level, queue count, wait time, now-serving token
- 🍕 **Menu Browsing** — categories, veg/non-veg filter, search, real-time stock
- 🛒 **Cart & Ordering** — stock-validated atomic orders with Firestore transactions
- 🎫 **Token System** — sequential tokens (A001, A002...) with live status timeline
- 🔔 **Notifications** — push updates on order status changes
- ⭐ **Feedback** — rate completed orders with star ratings
- 📢 **Announcements** — live announcements from staff/admin

### Staff View
- 📋 **Live Orders** — real-time order cards with status progression (Accept → Prepare → Ready → Complete)
- 👥 **Queue & Crowd Control** — increment/decrement crowd, queue, set now-serving token
- 🍽️ **Menu Management** — update stock, toggle availability
- 📢 **Canteen Control** — open/close canteen, publish announcements

### Admin View
- 📊 **Dashboard** — today's orders, revenue, crowd, sold-out alerts
- 👤 **User Management** — view all users, change roles (student/staff/admin)
- 🍕 **Food CRUD** — full create/edit/delete with modal forms
- 📈 **Analytics** — charts (Recharts): popular items, category distribution, hourly orders
- 📢 **Announcements** — create and toggle visibility
- ⚙️ **Settings** — seed data, initialize canteen status, Firebase config

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 8 |
| Styling | Tailwind CSS v4 |
| Auth | Firebase Authentication |
| Database | Cloud Firestore (real-time) |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | react-hot-toast |
| Date Utils | date-fns |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project with Authentication and Firestore enabled

### 1. Clone & Install
```bash
git clone https://github.com/sadhana-s-codez/Canteenpulse-Canteen-and-Food-Tracker-app.git
cd Canteenpulse-Canteen-and-Food-Tracker-app
npm install
```

### 2. Configure Firebase
Copy `.env.example` to `.env` and fill in your Firebase credentials:
```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Enable Firebase Services
In your Firebase Console:
1. **Authentication** → Enable Email/Password sign-in
2. **Cloud Firestore** → Create a database (start in test mode)

### 4. Run Development Server
```bash
npm run dev
```

### 5. Seed Sample Data
1. Register an account and manually set its role to `admin` in Firestore (`users` collection → your user doc → `role: "admin"`)
2. Navigate to **Admin → Settings → Seed Data** to populate sample food items and categories
3. Click **Initialize Canteen Status** to create the canteen status document

---

## 📁 Project Structure

```
src/
├── components/      # Shared UI components
│   ├── FoodCard.tsx
│   ├── LiveBadge.tsx
│   ├── OrderTimeline.tsx
│   ├── ProtectedRoute.tsx
│   └── Skeleton.tsx
├── context/         # React context providers
│   ├── AuthContext.tsx
│   └── CartContext.tsx
├── layouts/         # Layout shells with navigation
│   ├── StudentLayout.tsx
│   ├── StaffLayout.tsx
│   └── AdminLayout.tsx
├── pages/
│   ├── auth/        # Login, Register, Forgot Password
│   ├── student/     # Dashboard, Menu, Cart, Orders, Notifications, Profile
│   ├── staff/       # Orders, Queue Control, Menu, Canteen Control
│   └── admin/       # Dashboard, Users, Food CRUD, Orders, Analytics, Announcements, Settings
├── services/        # Firebase service layer
│   ├── auth.ts
│   ├── firebase.ts
│   ├── foodService.ts
│   ├── orderService.ts
│   ├── realtimeService.ts
│   └── seedData.ts
├── types/           # TypeScript interfaces
│   └── index.ts
├── App.tsx          # Router configuration
└── main.tsx         # Entry point
```

---

## 🔐 Role-Based Access

| Route | Allowed Roles |
|-------|--------------|
| `/student/*` | student |
| `/staff/*` | staff |
| `/admin/*` | admin |

Routes are protected by the `ProtectedRoute` component which checks the user's role from Firestore.

---

## 🔴 Real-Time Architecture

All live features use Firestore `onSnapshot` listeners:
- **Canteen Status** → `canteenStatus/main` document
- **Food Items** → `foodItems` collection
- **Orders** → `orders` collection (filtered by user for students)
- **Announcements** → `announcements` collection
- **Notifications** → `notifications` collection (per user)
- **Feedback** → `feedback` collection

Stock validation uses **Firestore transactions** (`runTransaction`) for atomic read-validate-write to prevent overselling.

---

## 📦 Build for Production

```bash
npm run build
```

Output is in the `dist/` directory, ready for deployment to Firebase Hosting, Vercel, or any static host.

---

## 📄 License

MIT
