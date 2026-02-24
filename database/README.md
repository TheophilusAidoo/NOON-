# NoonShop Database Setup

## Import via phpMyAdmin

1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Click **Import** tab
3. Choose file: `noonshop.sql`
4. Click **Go**
5. The database `noonshop` will be created with all tables and seed data

## Login Credentials (after import)

**Admin**
- Email: `admin@noonshop.com`
- Password: `Admin@123`

**Seller** (for testing seller dashboard)
- Email: `seller@noonshop.com`
- Password: `Seller@123`

## Backend .env

Ensure your `backend/.env` has:

```
DATABASE_URL="mysql://root@localhost:3306/noonshop"
```

If your MySQL has a password:
```
DATABASE_URL="mysql://root:yourpassword@localhost:3306/noonshop"
```
