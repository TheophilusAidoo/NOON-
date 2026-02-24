# Rakuten - Get the Site Running

## Quick Start (Recommended)

```bash
./start.sh
```

This script seeds the database (if empty), clears ports, and starts backend + frontend.

---

If the homepage shows "No products", "No categories", etc., follow these steps:

## 1. Start XAMPP
- Open XAMPP Control Panel
- Start **Apache** and **MySQL**

## 2. Create Database & Import Data

### Option A: Fresh setup (recommended)
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Create database `noonshop` (or it will be created by the import)
3. Select the `noonshop` database
4. Go to **Import** tab
5. Choose `database/noonshop.sql` and click **Go**
6. This creates tables and inserts sample data

### Option B: Tables exist but are empty
1. Open phpMyAdmin, select `noonshop` database
2. Import `database/seed-data.sql`
3. This adds categories, brands, products, banners without dropping tables

### Option C: Use Prisma seed (if using Prisma/Node)
```bash
cd backend
npx prisma db push    # Sync schema if needed
npx prisma db seed   # Add sample data
```

## 3. Start Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs on http://localhost:5001

## 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:3000

## 5. Test
- Homepage: http://localhost:3000
- Admin: http://localhost:3000/admin (login: admin@noonshop.com / Admin@123)

## Troubleshooting

**"No products" / empty sections**
- Database is empty → run `database/seed-data.sql` in phpMyAdmin
- Backend not running → start with `cd backend && npm run dev`
- Wrong DB connection → check `backend/.env` has `DATABASE_URL="mysql://root@localhost:3306/noonshop"`

**Backend connection failed**
- Ensure MySQL is running in XAMPP
- If MySQL uses a password: `DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/noonshop"`
