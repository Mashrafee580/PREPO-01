# PaperTrail — Full-Stack React Native Bookstore & Marketplace

A complete, production-ready mobile bookstore application with peer-to-peer marketplace, membership system, and admin dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile Frontend | React Native + Expo (SDK 51) |
| Navigation | Expo Router v3 |
| State Management | Zustand |
| Styling | NativeWind + StyleSheet |
| HTTP Client | Axios |
| Persistence | AsyncStorage |
| Backend | Node.js + Express.js (ES Modules) |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Security | Helmet + CORS + Rate Limiting |

---

## Project Structure

```
papertrail/
├── backend/
│   ├── config/db.js
│   ├── controllers/        (auth, books, orders, marketplace, cart, membership, admin, etc.)
│   ├── middleware/         (auth.js, errorHandler.js, validate.js)
│   ├── models/             (User, Book, Order, MarketplaceListing, etc.)
│   ├── routes/             (all API route files)
│   ├── utils/              (seed.js, generateToken.js, notifications.js)
│   ├── .env
│   └── server.js
│
└── mobile/
    ├── app/
    │   ├── (tabs)/         (index, books, marketplace, cart, profile)
    │   ├── books/[id].jsx
    │   ├── marketplace/[id].jsx
    │   ├── marketplace/create.jsx
    │   ├── auth/           (login, register)
    │   ├── checkout/
    │   ├── orders/[id].jsx
    │   ├── profile/        (orders, listings, wishlist, membership, notifications, edit, change-password)
    │   ├── admin/index.jsx
    │   ├── about.jsx
    │   └── _layout.jsx
    ├── components/
    │   ├── ui/             (Button, Input, Badge, Toast, Modal, StarRating, Skeleton, EmptyState)
    │   ├── books/          (BookCard, BookGridCard)
    │   └── marketplace/    (ListingCard)
    ├── context/            (authStore, cartStore, toastStore)
    ├── services/           (api, authService, bookService, orderService, marketplaceService, adminService, membershipService)
    └── constants/          (theme, api)
```

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone, OR Android/iOS simulator

---

### 1. Backend Setup

```bash
cd papertrail/backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and secrets

# Start MongoDB (if local)
mongod

# Seed the database with sample data
npm run seed

# Start the backend server
npm run dev
```

The API will run at: `http://localhost:4000/api`

**Default Accounts (after seeding):**
| Email | Password | Role |
|---|---|---|
| admin@papertrail.com | admin123 | Admin |
| user@papertrail.com | user123 | User |

---

### 2. Mobile Setup

```bash
cd papertrail/mobile
npm install
```

**Configure API URL:**

Open `mobile/constants/api.js` and update `API_BASE_URL`:

```js
// For physical device on same WiFi:
export const API_BASE_URL = 'http://YOUR_MACHINE_IP:4000/api';

// For Android emulator:
export const API_BASE_URL = 'http://10.0.2.2:4000/api';

// For iOS simulator:
export const API_BASE_URL = 'http://localhost:4000/api';
```

**Start the app:**
```bash
npx expo start
```

Scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator.

---

## API Endpoints

| Route | Description |
|---|---|
| `POST /api/auth/register` | Register new user |
| `POST /api/auth/login` | Login |
| `GET /api/auth/me` | Get current user |
| `GET /api/books` | Get all books (search, filter, sort, paginate) |
| `GET /api/books/featured` | Featured books |
| `GET /api/books/new-arrivals` | New arrivals |
| `GET /api/books/best-sellers` | Best sellers |
| `GET /api/books/:id` | Book details |
| `POST /api/orders` | Create order (with stock decrement transaction) |
| `GET /api/orders/my` | My orders |
| `GET /api/marketplace` | Public approved listings |
| `POST /api/marketplace` | Create listing (requires auth, sets pending) |
| `GET /api/marketplace/my` | My listings (all statuses) |
| `POST /api/marketplace/:id/contact` | Contact seller |
| `GET /api/cart` | Get cart |
| `POST /api/cart/add` | Add to cart |
| `POST /api/memberships` | Subscribe to plan |
| `GET /api/notifications/my` | My notifications |
| `GET /api/admin/stats` | Dashboard stats (admin only) |
| `GET /api/admin/marketplace/pending` | Pending listings (admin only) |
| `PATCH /api/admin/marketplace/:id/approve` | Approve listing (admin only) |
| `PATCH /api/admin/marketplace/:id/reject` | Reject with reason (admin only) |

---

## Key Features

### Marketplace Approval System
- Every listing submitted by users starts with `status: "pending"`
- Listings are **never publicly visible** until an admin approves them
- Approval status is enforced **server-side** — the backend rejects unapproved listing requests
- Admins can approve/reject with a reason
- Users see rejection reasons and can edit + resubmit
- If an approved listing's key fields change, it automatically returns to `pending`

### Order Transactions
- Order creation uses a **MongoDB session + transaction**
- Stock is decremented atomically
- If anything fails, the transaction rolls back — no inconsistent inventory

### Authentication
- JWT tokens stored in AsyncStorage
- Token attached to every API request via Axios interceptor
- Backend verifies JWT on all protected routes
- Admin routes enforce `role === "admin"` server-side

### Cart Persistence
- Cart is persisted to AsyncStorage
- Loads on app start
- Stock limits enforced before add-to-cart

---

## Environment Variables (backend/.env)

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/papertrail
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
ADMIN_SECRET=your_admin_setup_secret
NODE_ENV=development
```
