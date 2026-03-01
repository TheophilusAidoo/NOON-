# Deploy Rakuten (NOON) – Frontend + Backend

Step-by-step guide to deploy both the **frontend** (Vercel) and **backend** (Railway) with MySQL.

---

## Overview

| Service   | Platform | Purpose                     |
|----------|----------|-----------------------------|
| Frontend | Vercel   | Next.js app                 |
| Backend  | Railway  | Node.js/Express API         |
| Database | Railway  | MySQL (or PlanetScale)       |
| Stripe   | Stripe   | Payments (use your keys)    |

**Order:** Deploy backend first → get URL → deploy frontend with that URL.

---

# Part 1: Deploy Backend to Railway

## Step 1: Create Railway project

1. Go to **[railway.app](https://railway.app)** and sign in with **GitHub**
2. Click **New Project** → **Deploy from GitHub repo**
3. Select **TheophilusAidoo/NOON-** (or your repo name)
4. Railway creates a service—you’ll configure it in Step 2 and 3

## Step 2: Add MySQL database

1. In the project, click **+ New**
2. Select **Database** → **Add MySQL**
3. Wait for MySQL to deploy (~1 min)
4. Click the MySQL service → **Variables** → note **`MYSQL_URL`**

## Step 3: Configure the backend service

1. Click the **GitHub/deploy service** (the one created from your repo, not MySQL)
2. Go to **Settings**:
   - **Root Directory:** set to `backend`
   - **Build Command:** `npm install && npx prisma generate` (or leave default if it works)
   - **Start Command:** `node src/index.js`
3. Go to **Variables** and add:

   | Variable              | Value                                                         |
   |-----------------------|---------------------------------------------------------------|
   | `PORT`                | `5001`                                                        |
   | `DATABASE_URL`        | `${{MySQL.MYSQL_URL}}` (reference) or paste the MySQL URL   |
   | `FRONTEND_URL`        | `https://noon.vercel.app` (use your actual Vercel URL later)  |
   | `JWT_SECRET`          | Random 32+ character string (e.g. `openssl rand -hex 32`)    |
   | `JWT_REFRESH_SECRET`  | Another 32+ character string                                  |
   | `ADMIN_COMMISSION_RATE` | `0.1`                                                      |
   | `STRIPE_SECRET_KEY`   | `sk_test_xxxx` or `sk_live_xxxx`                              |
   | `STRIPE_WEBHOOK_SECRET` | (add after setting webhook in Stripe)                       |

4. Save variables

## Step 4: Run database migrations

1. In the backend service, go to **Settings** → **Deploy**
2. Or use Railway CLI:  
   `railway run npx prisma db push`
3. For seed data:  
   `railway run npx prisma db seed`

## Step 5: Generate a public URL

1. Click the backend service → **Settings** → **Networking**
2. Click **Generate Domain**
3. Copy the URL (e.g. `https://noon-backend-production.up.railway.app`)

## Step 6: Test the backend

Open `https://YOUR-BACKEND-URL/api/health` in a browser. You should see:

```json
{"status":"ok","timestamp":"..."}
```

Save this backend URL for the frontend.

---

# Part 2: Deploy Frontend to Vercel

## Step 1: Import project

1. Go to **[vercel.com/new](https://vercel.com/new)** and sign in with **GitHub**
2. Import **TheophilusAidoo/NOON-** (or your repo)
3. Before deploying, click **Edit** next to **Root Directory**
4. Set **Root Directory** to `frontend`

## Step 2: Set environment variables

Add these in the **Environment Variables** section:

| Name                     | Value                                                    |
|--------------------------|----------------------------------------------------------|
| `NEXT_PUBLIC_API_URL`    | `https://YOUR-RAILWAY-BACKEND-URL` *(no /api at end)*    |
| `NEXT_PUBLIC_STRIPE_KEY` | `pk_test_xxxx` or `pk_live_xxxx`                         |

Use the Railway backend URL from Part 1, Step 5.

## Step 3: Deploy

Click **Deploy**. Wait for the build to finish.

## Step 4: Update backend CORS

1. In Railway, open your backend service → **Variables**
2. Set `FRONTEND_URL` to your Vercel URL (e.g. `https://noon.vercel.app`)
3. Redeploy the backend so the new value is used

---

# Part 3: Stripe Webhooks (for payments)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. **Add endpoint**
3. Endpoint URL: `https://YOUR-BACKEND-URL/api/payment/webhook`
4. Events: `checkout.session.completed` (add others as needed)
5. Copy the **Signing secret** (starts with `whsec_`)
6. In Railway backend variables, add `STRIPE_WEBHOOK_SECRET` = that value
7. Redeploy the backend

---

# Part 4: Seed admin user (optional)

To create the admin user in production:

1. Install Railway CLI: `npm i -g @railway/cli`
2. Run: `railway link` (select your project and backend service)
3. Run: `railway run npx prisma db seed`
4. Or run your seed script: `railway run node prisma/seed-products.js`

---

# Troubleshooting

| Issue                    | Fix                                                                 |
|--------------------------|---------------------------------------------------------------------|
| Backend build fails      | Ensure Root Directory = `backend`, Prisma runs in build             |
| Frontend build fails     | Ensure Root Directory = `frontend`                                 |
| API requests fail / CORS | Check `NEXT_PUBLIC_API_URL` and `FRONTEND_URL` on backend          |
| Database connection fail | Check `DATABASE_URL` format (MySQL URL from Railway)                |
| 401 on login             | Ensure JWT secrets are set and not empty                           |
| Images not loading       | Add your image host to `next.config.mjs` `remotePatterns`         |

---

# Quick reference

**Backend URL:** `https://your-backend.up.railway.app`  
**Frontend URL:** `https://your-app.vercel.app`  

`NEXT_PUBLIC_API_URL` = backend URL (no trailing slash)  
`FRONTEND_URL` on backend = frontend URL
