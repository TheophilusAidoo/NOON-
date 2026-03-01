# Deploy Rakuten (NOON)

**Workflow:** Deploy to Vercel first (for testing) → then move to cPanel (final hosting).

---

# Part 1: Deploy to Vercel (Testing / Preview)

Use Vercel to preview the app before moving to cPanel.

## Frontend on Vercel

1. Go to **[vercel.com/new](https://vercel.com/new)** → import your repo
2. **Root Directory:** `frontend`
3. **Framework:** Next.js
4. **Environment variables:**
   - `NEXT_PUBLIC_API_URL` = your backend URL (or `http://localhost:5001` for local backend)
   - `NEXT_PUBLIC_STRIPE_KEY` = your Stripe key
5. Click **Deploy**

## Backend on Vercel (optional – for full preview)

If you want the full app on Vercel:

- **Root Directory:** `backend`
- Add env vars (see Option 1 in the cPanel section below – use PlanetScale for DB)
- **Note:** Real-time chat won't work on Vercel

---

# Part 2: Deploy to cPanel (Final Hosting)

Your cPanel host must support **Node.js** (check **Setup Node.js App** or **Node.js Selector** in cPanel).

## Prerequisites

- cPanel with Node.js (v18+)
- MySQL database (create in cPanel → MySQL Databases)
- Domain or subdomain for the app

---

## Step 1: Create MySQL database in cPanel

1. cPanel → **MySQL Databases**
2. Create database: e.g. `username_noonshop`
3. Create user and add to database (All Privileges)
4. Note the credentials for `DATABASE_URL`:
   - `mysql://user:password@localhost:3306/database_name`

---

## Step 2: Upload your project

### Option A: Upload from local build

1. Run the build script:
   ```bash
   chmod +x scripts/build-for-cpanel.sh
   ./scripts/build-for-cpanel.sh
   ```
2. This creates `noon-shop-cpanel-YYYYMMDD.zip`
3. cPanel → **File Manager** → go to `domains/yourdomain.com` (or `public_html`)
4. Upload the zip → **Extract**
5. Or use **FTP** (FileZilla) to upload the project folder

### Option B: Git (if cPanel has SSH)

```bash
cd ~/domains/yourdomain.com  # or your app directory
git clone https://github.com/TheophilusAidoo/NOON-.git noon-shop
cd noon-shop
```

---

## Step 3: Setup backend (Node.js app #1)

1. cPanel → **Setup Node.js App** (or **Node.js Selector**)
2. **Create Application:**
   - **Node.js version:** 18 or 20
   - **Application root:** `noon-shop/backend` (or path to your backend folder)
   - **Application URL:** e.g. `api` (gives you `https://yourdomain.com/api`) or use a subdomain like `api.yourdomain.com`
   - **Application startup file:** `src/index.js`
3. Click **Create**
4. Open the app → **Edit** → **Run script:** `npm install`
5. Add **Environment variables** in the Node.js app screen:
   - `DATABASE_URL` = `mysql://user:pass@localhost:3306/dbname`
   - `PORT` = `5001` (or the port cPanel assigns)
   - `FRONTEND_URL` = `https://yourdomain.com`
   - `JWT_SECRET` = random 32+ chars
   - `JWT_REFRESH_SECRET` = random 32+ chars
   - `ADMIN_COMMISSION_RATE` = `0.1`
   - `STRIPE_SECRET_KEY` = your key
   - `STRIPE_WEBHOOK_SECRET` = from Stripe webhooks
6. Run: `npx prisma generate` then `npx prisma db push` (via SSH or Run NPM Install / Custom run)
7. **Start** or **Restart** the app
8. Copy the backend URL (e.g. `https://api.yourdomain.com` or `https://yourdomain.com:5001`)

---

## Step 4: Setup frontend (Node.js app #2)

1. cPanel → **Setup Node.js App** → **Create Application**
2. **Application root:** `noon-shop/frontend`
3. **Application URL:** leave blank or use main domain
4. **Application startup file:** `package.json` (uses `next start`)

5. Edit → **Run script:** `npm install`
6. Add **Environment variables:**
   - `NEXT_PUBLIC_API_URL` = your backend URL (e.g. `https://api.yourdomain.com`)
   - `NEXT_PUBLIC_STRIPE_KEY` = your Stripe publishable key
7. Run: `npm run build`
8. **Start** the app

---

## Step 5: Reverse proxy (if needed)

If the frontend runs on a port (e.g. 3000), add `.htaccess` in the domain root:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
```

(Adjust port if different. Some hosts use a different proxy format.)

---

## Step 6: Stripe webhook

1. Stripe Dashboard → Webhooks → Add endpoint
2. URL: `https://YOUR-BACKEND-URL/api/payment/webhook`
3. Events: `checkout.session.completed`
4. Copy signing secret → add as `STRIPE_WEBHOOK_SECRET` in backend env

---

## Step 7: Seed data (optional)

Via SSH:
```bash
cd noon-shop/backend
npx prisma db seed
```

Or run `node prisma/seed-products.js` if you have product seeds.

---

# Quick reference

| Item | Value |
|------|-------|
| Backend startup | `node src/index.js` |
| Frontend startup | `npm run start` (Next.js) |
| Backend port | Usually assigned by cPanel |
| Frontend port | 3000 (or cPanel-assigned) |
| MySQL | Create in cPanel, use in `DATABASE_URL` |

---

# Troubleshooting

| Issue | Fix |
|-------|-----|
| "Node.js" not in cPanel | Ask host to enable it, or use a host with Node.js |
| Build fails | Run `npm install` before `npm run build` |
| DB connection refused | Check `DATABASE_URL`, user privileges, and that MySQL is running |
| API/CORS errors | Set `FRONTEND_URL` on backend to your frontend URL |
| Images not loading | Ensure `next.config.mjs` has the right `remotePatterns` |
