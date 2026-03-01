# Deploy Rakuten (NOON) – Full Guide

Deploy **both frontend and backend on Vercel**, or use Railway for the backend.

---

## Option 1: All on Vercel (Frontend + Backend)

### Trade-offs

- **Real-time chat (Socket.io)** does not work on Vercel (no WebSockets)
- **Database**: use PlanetScale (free MySQL) or similar
- **File uploads**: use Vercel Blob storage
- **Cron job**: uses Vercel Cron (hourly)

---

### Step 1: Create PlanetScale database

1. Go to **[planetscale.com](https://planetscale.com)** → sign in with GitHub
2. **Create database** → name it e.g. `noon-shop`
3. Select a region close to you
4. **Connect** → **Connect with Prisma** → copy the connection string
5. Add `?sslaccept=strict` if needed for Prisma:  
   `mysql://user:pass@host/db?sslaccept=strict`

---

### Step 2: Deploy backend to Vercel

1. Go to **[vercel.com/new](https://vercel.com/new)** → import your repo
2. **Configure:**
   - **Project name:** e.g. `noon-backend`
   - **Root Directory:** click **Edit** → set to `backend`
   - **Framework Preset:** Other (or leave auto)
3. **Environment variables:**

   | Name | Value |
   |------|--------|
   | `DATABASE_URL` | Your PlanetScale connection string |
   | `JWT_SECRET` | Random 32+ chars (e.g. `openssl rand -hex 32`) |
   | `JWT_REFRESH_SECRET` | Another 32+ chars |
   | `FRONTEND_URL` | `https://noon.vercel.app` (or your frontend URL) |
   | `ADMIN_COMMISSION_RATE` | `0.1` |
   | `STRIPE_SECRET_KEY` | `sk_test_xxx` or `sk_live_xxx` |
   | `STRIPE_WEBHOOK_SECRET` | From Stripe webhooks (add later) |
   | `BLOB_READ_WRITE_TOKEN` | Create Blob store in Vercel → get token |
   | `CRON_SECRET` | Random secret (e.g. `openssl rand -hex 24`) |

4. **Create Blob store:** Vercel Dashboard → Storage → Blob → Create  
   → copy `BLOB_READ_WRITE_TOKEN`
5. Click **Deploy**
6. When done, copy the URL (e.g. `https://noon-backend-xxx.vercel.app`)

---

### Step 3: Run database migrations

1. Install Vercel CLI: `npm i -g vercel`
2. `cd backend` → `vercel link` (link to your backend project)
3. `vercel env pull .env.local` (get env vars)
4. `npx prisma db push`
5. `npx prisma db seed` (optional – seed data)

Or use PlanetScale’s console to run migrations if you prefer.

---

### Step 4: Deploy frontend to Vercel

1. Go to **[vercel.com/new](https://vercel.com/new)** → import the same repo again (new project)
2. **Configure:**
   - **Project name:** e.g. `noon` or `noon-frontend`
   - **Root Directory:** `frontend`
   - **Framework Preset:** Next.js
3. **Environment variables:**

   | Name | Value |
   |------|--------|
   | `NEXT_PUBLIC_API_URL` | Backend URL (e.g. `https://noon-backend-xxx.vercel.app`) |
   | `NEXT_PUBLIC_STRIPE_KEY` | `pk_test_xxx` or `pk_live_xxx` |

4. Click **Deploy**

---

### Step 5: Update `FRONTEND_URL`

1. In the backend project on Vercel → **Settings** → **Environment Variables**
2. Set `FRONTEND_URL` to your frontend URL (e.g. `https://noon-xxx.vercel.app`)
3. Redeploy the backend

---

### Step 6: Stripe webhook

1. [Stripe Dashboard](https://dashboard.stripe.com/webhooks) → Add endpoint
2. URL: `https://YOUR-BACKEND-URL/api/payment/webhook`
3. Events: `checkout.session.completed` (add others as needed)
4. Copy the signing secret → add as `STRIPE_WEBHOOK_SECRET` in backend env vars
5. Redeploy backend

---

## Option 2: Frontend on Vercel, Backend on Railway

If you need **real-time chat (Socket.io)**, use Railway for the backend.

See the previous guide (Railway + MySQL). Steps:

1. Deploy backend to Railway (with MySQL)
2. Deploy frontend to Vercel
3. Set `NEXT_PUBLIC_API_URL` to the Railway backend URL
4. Set `FRONTEND_URL` on Railway to your Vercel frontend URL

---

## Root Directory Reminder

| Project   | Root Directory |
|-----------|-----------------|
| Frontend  | `frontend`      |
| Backend   | `backend`       |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Backend build fails | Ensure Root Directory = `backend` |
| Frontend build fails | Ensure Root Directory = `frontend` |
| `prisma generate` error | `postinstall` runs it automatically |
| API/CORS errors | Check `NEXT_PUBLIC_API_URL` and `FRONTEND_URL` |
| Upload fails on Vercel | Add `BLOB_READ_WRITE_TOKEN` and create a Blob store |
| Chat not working | Use Railway backend (Vercel does not support WebSockets) |
