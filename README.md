# Tbib El Jou3 – Your Hunger Doctor 🥙

A full‑stack food delivery platform built with **Next.js App Router**, featuring:

- Customer‑facing restaurant discovery & ordering
- Real‑time **admin dashboard** for orders & restaurants
- **Delivery partner** dashboard with live order flow
- Postgres (Neon) persistence and JWT / NextAuth‑backed auth

---

## ✨ Highlights

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" />
  <img src="https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Postgres-Neon-4169e1?logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Auth-NextAuth.js-000000?logo=auth0&logoColor=white" />
  <img src="https://img.shields.io/badge/Styling-TailwindCSS-38bdf8?logo=tailwind-css&logoColor=white" />
</p>

Animated UI built with **Framer Motion**, gradients and glassmorphism for:

- Hero sections with subtle entrance animations
- Floating carts & modals
- Smooth admin & delivery dashboards

---

## 🏠 Public Experience

### Home (`/`)

Animated marketing page:

- Brand hero: _“your hunger doctor – Tbib El Jou3”_
- CTA buttons:
  - **Browse restaurants** → `/restaurants`
  - **Become a partner** → `/signup`
- Stats: orders delivered, partner restaurants, average delivery time
- “Why choose Tbib El Jou3” feature cards

### Restaurants Listing (`/restaurants`)

- Lists all restaurants from `/api/restaurants`
- Each card shows:
  - Name, cuisine, rating, address
  - Delivery time & fee
- Clicking opens a **modal** with the restaurant’s menu (fetched from `/api/menu_items?restaurant_id=...`) and quick order form.

### Restaurant Detail (`/restaurants/[id]`)

File: `app\restaurants\[id]\page.tsx`

- Hero banner with:
  - Cover image, cuisine, open/closed badge
  - Rating, reviews, delivery time, fee
- Contact info cards (address, phone, email)
- Animated menu grid filtered by category
- Item modal:
  - Quantity selector
  - Live price calculation
  - Add to cart with toast feedback
- Floating **cart button** + full **cart modal**:
  - Summary (subtotal, delivery, total)
  - Delivery details form (name, phone, address)
  - On confirm:
    - POST `/api/orders`
    - Payload includes items (`menuItemId`, `quantity`, `price`) and totals

---

## 🧑‍🍳 Admin Dashboard (`/admin`)

File: `app\admin\AdminClient.tsx`

Admin‑only area (checked via `/api/auth/session` or `/api/auth/admin-login`) with two main tabs:

### Orders Tab

- Realtime updates via `useRealtime("admin", ...)`
- Filters:
  - Search (order number, customer name, restaurant)
  - Status (pending → delivered / cancelled)
  - Date range
  - Payment status
- Table columns:
  - Order, customer, restaurant, amount, status, payment, time, actions
- Status badges & icons:
  - `pending`, `confirmed`, `accepted`, `preparing`, `ready_for_pickup`,
    `out_for_delivery`, `delivered`, `cancelled`
- Order details modal:
  - Customer & contact
  - Delivery address
  - Items with quantities and totals
  - Subtotal, delivery fee, total

### Restaurants Management Tab

- CRUD for restaurants:
  - Name, description, address, phone, email
  - Cuisine, delivery fee, min order, delivery time (min/max/label)
  - Opening hours, owner id, active flag
- Menu management per restaurant:
  - Load menu from `/api/menu_items?restaurant_id=...`
  - Create / edit / delete menu items with:
    - Category, name, description, price
    - Flags: available, vegetarian, vegan, gluten‑free
    - Calories, prep time, ingredients, allergens, sort order

> The admin UI hides the global site navbar while active.

---

## 🚴 Delivery Partner Dashboard (`/delivery`)

File: `app\delivery\page.tsx`

Dedicated UI for couriers, with its own top navbar and no global site navbar.

### Realtime workflow

- Fetches nearby orders from `/api/orders` (optionally with `lat/lng/radius`)
- Subscribes to `useRealtime("delivery")`:
  - `order:assigned`
  - `order:update`

### Status flow & actions

Per order card and in the details modal:

1. **Accept** (`pending` / `confirmed` / `preparing`)
   - PATCH `/api/orders/:id` with:
     - `status: "accepted"`
     - `assignDeliveryUserId` = current user id
2. **Picked Up**
   - PATCH with `status: "out_for_delivery"`
3. **Delivered**
   - PATCH with `status: "delivered"`
   - UI updates:
     - Today’s earnings += delivery fee (or fallback)
     - Today’s deliveries count += 1

### Dashboard stats

- **Today’s earnings** (driver‑side computed)
- **Today’s deliveries** count
- Online / offline toggle (controls ability to accept orders)

### Quick Guide (in sidebar)

1. Go **Online** to receive orders
2. Orders assigned to you appear in **Active Orders**
3. Mark **Picked Up** when leaving restaurant
4. Mark **Delivered** upon completion

---

## 🗂 API & Data Model (High‑level)

> Actual implementation lives under `/api/**` and your database schema.

### Core entities

- **Restaurant**
  - `id`, `name`, `description`, `address`, `phone`, `email`
  - `cuisine_type`
  - Delivery: `delivery_fee`, `minimum_order`, `delivery_time_min`, `delivery_time_max`, `delivery_time`
  - Metadata: `opening_hours`, `owner_id`, `is_active`, `image`, `average_rating`, `review_count`
- **Menu Item**
  - `id`, `restaurant_id`
  - `category`, `name`, `description`, `price`
  - Flags: `is_available`, `is_vegetarian`, `is_vegan`, `is_gluten_free`
  - Extras: `calories`, `preparation_time`, `ingredients`, `allergens`, `sort_order`
- **Order**
  - `id`, `order_number`
  - `restaurant_id`, `restaurant_name`
  - `user_name`, `user_email`, `customer_phone`
  - Delivery: `delivery_address`, `delivery_fee`
  - Totals: `subtotal`, `total`
  - Status: `status`, `payment_method`, `payment_status`
  - Delivery assignment: `delivery_user_id`
  - Timestamps: `created_at`, `updated_at`

---

## 🧱 Tech Stack

- **Frontend**

  - Next.js App Router (`app/` directory)
  - React 18, TypeScript
  - TailwindCSS + custom utility classes
  - Framer Motion for animations
  - lucide‑react icons
  - `react-hot-toast` for notifications

- **Backend**
  - Next.js API routes under `/api/**`
  - PostgreSQL (Neon) via `DATABASE_URL`
  - JWT‑based admin cookie (`JWT_SECRET`)
  - Optional NextAuth session for users

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
# or
yarn
# or
pnpm install
```

### 2. Configure environment

Create `.env.local` (or update `.env`) with your own values:

```bash
DATABASE_URL=postgresql://user:password@host:port/db?sslmode=require
DATABASE_USER=your_user
DATABASE_PASSWORD=your_password
DATABASE_HOST=your_host
DATABASE_PORT=5432

JWT_SECRET=your_jwt_secret

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
NODE_ENV=development
```

> Never commit real secrets to version control in production.

### 3. Run the dev server

```bash
npm run dev
# http://localhost:3000
```

---

## 🔐 Admin & Delivery Access

- Admin login uses:
  - `/admin` UI (see `app\admin\AdminClient.tsx`)
  - Session check at `/api/auth/session`
  - Fallback debug cookie at `/api/auth/admin-login`
- Delivery partner:
  - Access `/delivery`
  - Requires a user with delivery permissions (checked by backend when updating orders)

Implementation details live in the corresponding API routes and auth utilities.

---

## 📂 Project Structure (excerpt)

```text
app/
  page.tsx                     # Public home page
  restaurants/
    [id]/
      page.tsx                 # Restaurant detail + local cart & ordering
    ...                        # Restaurants listing page
  admin/
    AdminClient.tsx            # Admin SPA (orders + restaurants)
    signin/                    # Admin signin page (uses Suspense + useSearchParams)
  delivery/
    page.tsx                   # Delivery partner dashboard

hooks/
  useRealtime.ts               # Realtime channel hook (admin / delivery)

public/
  images/
    placeholder-restaurant.jpg # Fallback restaurant image
```

---

## 🧩 Future Ideas

- Persistent user cart with localStorage + per‑restaurant grouping
- Live driver location tracking on a map
- Reviews & ratings per order
- Multi‑language UI (Arabic / French / English toggle)
- PWA install & offline support for delivery partners

---

Made with ❤️ for Algerian food‑lovers and busy people everywhere.
