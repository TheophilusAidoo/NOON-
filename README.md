# Rakuten - Multi-Vendor E-commerce Platform

A production-ready multi-vendor eCommerce platform inspired by Noon.com UI/UX structure. Built with Next.js 14, Node.js/Express, Prisma, MySQL, and Stripe.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, TailwindCSS, Redux Toolkit, Axios |
| Backend | Node.js, Express.js, Prisma ORM |
| Database | MySQL (managed via phpMyAdmin) |
| Auth | JWT (Access + Refresh tokens), bcrypt |
| Payments | Stripe (test mode) |

## Roles

- **Customer** - Browse, cart, checkout, orders, reviews
- **Seller** - Register (requires admin approval), manage products, view orders, request withdrawal
- **Admin** - Dashboard, approve sellers, categories, brands, orders, coupons, banners, featured products

## Project Structure

```
noon shoping/
├── backend/                 # Express API
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.js          # Seed data
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── utils/
│       ├── validators/
│       └── index.js
├── frontend/                # Next.js app
│   └── src/
│       ├── app/
│       ├── components/
│       ├── lib/
│       └── store/
├── .env.example
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- MySQL (or XAMPP/MAMP with phpMyAdmin)
- Stripe account (test mode)

### 1. Clone & Install

```bash
cd "noon shoping"
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Database Setup

1. Create a MySQL database named `noonshop` (or your choice)
2. Copy `.env.example` to `backend/.env`
3. Set `DATABASE_URL`:
   ```
   DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/noonshop"
   ```
4. Generate Prisma client and run migrations:
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

### 3. Backend Environment

Create `backend/.env`:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000
DATABASE_URL="mysql://root:password@localhost:3306/noonshop"
JWT_SECRET=generate_a_random_32_char_string
JWT_REFRESH_SECRET=generate_another_random_32_char_string
ADMIN_COMMISSION_RATE=0.1
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

Generate JWT secrets:
```bash
openssl rand -hex 32
```

### 4. Frontend Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_KEY=pk_test_xxxxx
```

### 5. Run the App

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Seed Data & Login

After seeding:
- **Admin**: `admin@noonshop.com` / `Admin@123`
- **Seller**: `seller@noonshop.com` / `Seller@123` (pre-approved)

## Stripe Setup

1. Get test API keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. For webhooks (order creation after payment):
   - Install Stripe CLI or use Dashboard
   - Webhook URL: `https://your-api.com/api/payment/webhook`
   - Event: `payment_intent.succeeded`

## API Endpoints

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/auth/register` | POST | - | Register (customer/seller) |
| `/api/auth/login` | POST | - | Login |
| `/api/auth/me` | GET | ✓ | Current user |
| `/api/products` | GET | - | List products (filters) |
| `/api/products/:id` | GET | - | Product detail |
| `/api/cart` | GET/POST | ✓ | Cart operations |
| `/api/orders` | GET/POST | ✓ | Orders (customer) |
| `/api/admin/*` | * | Admin | Admin dashboard |
| `/api/seller/*` | * | Seller | Seller dashboard |

## Security

- Role-based middleware (RBAC)
- JWT refresh rotation
- Rate limiting (auth: 10/15min, general: 100/15min)
- Input validation (Joi)
- Prisma parameterized queries (SQL injection protection)

## License

MIT
