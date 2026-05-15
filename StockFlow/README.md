# StockFlow - SaaS Inventory Management System

A production-ready, multi-tenant inventory management SaaS application built with **Node.js**, **Express**, **Next.js**, **Tailwind CSS**, and **SQLite**.

🎯 **Demo-ready MVP** built in 6 hours. Deploy to Render.com and share the live link.

---

## ✨ Features

### Core Functionality
- **Multi-tenant Architecture** — Every user gets their own organization. All data is scoped per org.
- **Authentication** — Email/password signup & login with JWT, bcrypt hashing (12 rounds).
- **Dashboard** — Real-time inventory summary with total products, stock quantity, and low-stock alerts with visual bar charts and stock level indicators.
- **Product Management** — Full CRUD with SKU uniqueness validation per organization.
- **Stock Adjustments** — Quick +/-1 inline buttons on product list + detailed stock adjustment form on product detail page.
- **Low Stock Detection** — Configurable global threshold (per-org) + per-product overrides with visual badges (Critical/Low/In Stock).
- **Search** — Search by product name or SKU with clear filters.
- **Product Detail Page** — Full product view with all fields, stock adjustment, and quick actions.

### UI/UX
- **Dark theme auth pages** — Animated 3D floating cubes (inventory-themed), glassmorphism card, staggered entrance animations, dot-grid background.
- **Sidebar layout** — Responsive sidebar with icons, user avatar, org name, collapsible mobile drawer with overlay.
- **Toast notification system** — Context-based toast stack with auto-dismiss, success/error/info variants.
- **Confirmation modals** — Reusable Modal component with backdrop, escape-to-close, focus trap.
- **Loading skeletons** — PageSkeleton, CardSkeleton, TableSkeleton for all async states.
- **Empty states** — Contextual empty states with action buttons for each view.
- **Password strength indicator** — Real-time strength bar on signup with color coding.
- **Status badges** — In Stock (green), Low Stock (red), Out of Stock (red) with ring styling.
- **Animated transitions** — Fade, slide, and entrance animations throughout.

### Security
- **Helmet.js** — Security headers (XSS, clickjacking, MIME sniffing, etc.)
- **Rate Limiting** — 100 req/15min global, 20 req/15min on login endpoint
- **Input Validation** — express-validator on all endpoints (sanitization, normalization, type coercion)
- **CORS** — Strict origin whitelist via CLIENT_URL env
- **SQL Injection** — Prevented by Prisma ORM (parameterized queries)
- **Password Hashing** — bcrypt with 12 salt rounds
- **JWT** — Signed tokens with 7-day expiry, Bearer auth scheme
- **Request Size Limit** — 1MB body limit
- **HTTP Security Headers** — Content-Type enforcement, XSS filter, no sniff, frameguard

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js + Express |
| **Database** | SQLite (via Prisma ORM) |
| **Auth** | JWT + bcryptjs |
| **Frontend** | Next.js 14 (App Router) |
| **Styling** | Tailwind CSS |
| **Security** | Helmet, express-rate-limit, express-validator |

---

## 📁 Project Structure

```
StockFlow/
├── server/                              # Express API server
│   ├── prisma/
│   │   └── schema.prisma                # DB schema (Organization, User, Product, Settings)
│   ├── src/
│   │   ├── index.js                     # Express app (helmet, CORS, rate-limit, routes)
│   │   ├── middleware/auth.js           # JWT Bearer verification
│   │   └── routes/
│   │       ├── auth.js                  # POST signup/login, GET /me (validated)
│   │       ├── products.js              # CRUD + PATCH stock (validated)
│   │       ├── dashboard.js             # GET summary + low-stock items
│   │       └── settings.js              # GET/PUT default threshold (validated)
│   ├── .env / .env.example
│   └── package.json
├── client/                              # Next.js 14 App Router frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.js                # Root layout: AuthProvider + Toast system
│   │   │   ├── globals.css              # Tailwind + animations + component classes
│   │   │   ├── page.js                  # Auto-redirect to /dashboard or /login
│   │   │   ├── (auth)/                  # Route group — no sidebar
│   │   │   │   ├── login/page.js        # Dark theme, 3D cubes, glassmorphism card
│   │   │   │   └── signup/page.js       # Same theme + password strength bar
│   │   │   └── (dashboard)/             # Route group — with Sidebar
│   │   │       ├── layout.js            # Wraps children with Sidebar
│   │   │       ├── dashboard/page.js    # Stat cards + low-stock table + bar chart
│   │   │       ├── products/
│   │   │       │   ├── page.js          # Table, search, +/-1, edit, delete
│   │   │       │   ├── create/page.js   # Full form with validation
│   │   │       │   ├── [id]/page.js     # Detail view + stock adjust form
│   │   │       │   └── [id]/edit/page.js# Edit form prefilled
│   │   │       └── settings/page.js     # Global threshold with save indicator
│   │   ├── components/
│   │   │   ├── Sidebar.js               # Nav links, user avatar, org name, logout
│   │   │   ├── Modal.js                 # Reusable overlay dialog (esc to close)
│   │   │   ├── EmptyState.js            # Icon + message + action button
│   │   │   └── LoadingSkeleton.js       # CardSkeleton, TableSkeleton, PageSkeleton
│   │   └── lib/
│   │       ├── api.js                   # Typed HTTP client (auth, products, etc.)
│   │       └── utils.js                 # formatCurrency, formatDate, formatDateTime
│   ├── .env / .env.example
│   └── package.json
├── render.yaml                          # Render.com Blueprint (2 services)
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- npm

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd StockFlow

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

```bash
# Server env (already has defaults for dev)
cp server/.env.example server/.env
# Edit server/.env if needed

# Client env
cp client/.env.example client/.env
```

### 3. Initialize Database

```bash
cd server
npx prisma db push
```

### 4. Run the App

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```
Server starts at `http://localhost:3001`

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```
App opens at `http://localhost:3000`

### 5. Using the App

1. Go to `http://localhost:3000/signup`
2. Create an account (Organization name, Email, Password)
3. You'll be logged in and redirected to the Dashboard
4. Add products, adjust stock, and watch the dashboard update in real-time

---

## 🌐 Deploy to Render.com

This project is configured for easy deployment on Render.com using the `render.yaml` file.

### One-Click Deploy (Blueprint)

1. Push the code to a GitHub repository
2. Log in to [Render.com](https://render.com)
3. Click **New → Blueprint**
4. Connect your repository
5. Render will automatically detect `render.yaml` and create two services:
   - **stockflow-api** — Express backend on port 3001
   - **stockflow-client** — Next.js frontend on port 3000

### Manual Deploy

#### Backend Service
1. Create a new **Web Service** on Render
2. Connect your GitHub repo
3. Set:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npx prisma db push`
   - **Start Command**: `npm start`
4. Add environment variables:
   - `NODE_ENV=production`
   - `JWT_SECRET` (generate a strong secret)
   - `CLIENT_URL=https://your-client-service.onrender.com`

#### Frontend Service
1. Create a new **Web Service** on Render
2. Connect your GitHub repo
3. Set:
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add environment variables:
   - `NODE_ENV=production`
   - `NEXT_PUBLIC_API_URL=https://your-api-service.onrender.com/api`

> ⚠️ SQLite stores data in a local file. On Render's free tier, the file will be reset on each deploy. For production, migrate to PostgreSQL (Prisma supports it with a one-line config change).

---

## 📋 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account (email, password, org name) |
| POST | `/api/auth/login` | Sign in (email, password) |
| GET | `/api/auth/me` | Get current user info (requires token) |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (optional `?search=`) |
| GET | `/api/products/:id` | Get product details |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |
| PATCH | `/api/products/:id/stock` | Adjust stock by +/- N |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Summary stats + low stock items |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get org settings |
| PUT | `/api/settings` | Update global low stock threshold |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

---

## 🧪 Testing

### Backend health check
```bash
curl http://localhost:3001/api/health
```

### Manual testing flow
1. Sign up → creates org + user
2. Create 2-3 products with different quantities
3. Verify dashboard shows total products and stock count
4. Set a product's quantity below its threshold → appears in low-stock
5. Use quick adjust (+/-) buttons on product list
6. Search by name or SKU
7. Edit and delete products
8. Change global threshold in Settings

---

## 🔐 Security Checklist

| Measure | Status |
|---------|--------|
| Helmet security headers | ✅ |
| Rate limiting (global + auth) | ✅ |
| Input validation (all endpoints) | ✅ |
| CORS whitelist | ✅ |
| SQL injection protection (Prisma ORM) | ✅ |
| Password hashing (bcrypt, 12 rounds) | ✅ |
| JWT with expiry | ✅ |
| Request body size limit | ✅ |
| Environment-based configuration | ✅ |
| No secrets in code | ✅ |

---

## 📝 License

MIT — Built for assessment/demo purposes.

---

## 🙋 FAQ

**Why SQLite instead of PostgreSQL?**  
SQLite requires zero setup — perfect for a 6-hour MVP and demo. Swap to PostgreSQL in `prisma/schema.prisma` for production.

**Is this production-ready?**  
For a small internal team, yes. For public SaaS with thousands of users, add PostgreSQL, proper migration tooling, CI/CD, monitoring, and a CDN.

**How do I reset the database?**  
Delete `server/prisma/dev.db` and run `npx prisma db push` again.
