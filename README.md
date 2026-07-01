# NOON - Multi-Vendor E-Commerce Platform

A production-ready multi-vendor eCommerce platform inspired by Noon.com. Built with Next.js 14, Express.js, Prisma, MySQL, and Stripe for a complete modern shopping experience.

## Overview

NOON is a comprehensive e-commerce solution featuring vendor management, customer shopping, admin dashboard, and secure payments. It demonstrates best practices in full-stack development with React, TypeScript, and Node.js.

## Live Demo

Visit: https://noon-pi.vercel.app

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, TailwindCSS, Redux Toolkit |
| Backend | Node.js, Express.js, Prisma ORM |
| Database | MySQL |
| Authentication | JWT (Access + Refresh tokens), bcrypt |
| Payments | Stripe (test mode) |

## User Roles

- **Customer**: Browse products, manage cart, checkout, track orders, post reviews
- **Seller**: Product management, order fulfillment, withdrawal requests
- **Admin**: Dashboard, seller approval, category management, order oversight, promotions

## Key Features

- Multi-vendor marketplace
- Secure user authentication
- Shopping cart and checkout
- Stripe payment integration
- Order tracking and management
- Product reviews and ratings
- Admin dashboard
- Seller dashboard
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL database
- Stripe account (test mode)

### Installation

```bash
# Clone repository
git clone https://github.com/TheophilusAidoo/NOON-.git
cd NOON-

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Environment Setup

**Backend (.env)**
```
PORT=5000
FRONTEND_URL=http://localhost:3000
DATABASE_URL="mysql://root:password@localhost:3306/noonshop"
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_xxxxx
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_KEY=pk_test_xxxxx
```

### Database Setup

```bash
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed
```

### Run Application

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/auth/register` | POST | - | Register user |
| `/api/auth/login` | POST | - | User login |
| `/api/products` | GET | - | List products |
| `/api/cart` | GET/POST | ✓ | Cart operations |
| `/api/orders` | GET/POST | ✓ | Order management |
| `/api/admin/*` | * | Admin | Admin operations |
| `/api/seller/*` | * | Seller | Seller operations |

## Security Features

- Role-based access control
- JWT refresh token rotation
- Rate limiting
- Input validation
- SQL injection protection

## Author

Theophilus Aidoo - Full Stack Developer & UI/UX Designer

## License

MIT