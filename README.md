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

## 🚀 Quick Start (Instant Demo)

**No Firebase setup required!** The app runs out of the box with built-in reactive mock data and instant authentication.

### Option A: Windows 1-Click
Double-click **`start.bat`** in the project folder. It will install packages (if needed), launch the dev server, and open your browser automatically!

### Option B: Terminal
```bash
npm install
npm run dev
```
Open **http://localhost:5173/** in your browser.

---

## 🔑 Demo Login (Any Password Works)

| Role | Email Format | Password | Access |
|---|---|---|---|
| **Admin** | Any email containing `admin` (e.g., `admin@test.com`) | *any password* | Full dashboard, food CRUD, user roles, analytics |
| **Staff** | Any email containing `staff` (e.g., `staff@test.com`) | *any password* | Kitchen orders, crowd/queue control, menu stock |
| **Student** | Any other email (e.g., `student@test.com`) | *any password* | Menu, cart, orders, live token tracker, reviews |

*Tip: You don't even need to register first—simply enter any email and password on the Login page and click **Sign In**!*

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
