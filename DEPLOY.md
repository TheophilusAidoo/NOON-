# Deploy Rakuten (NOON) to Vercel

This guide walks you through deploying the frontend to Vercel and the backend to a compatible hosting service.

## Architecture

- **Frontend** (Next.js) → Vercel
- **Backend** (Node.js/Express) → Railway, Render, or similar
- **Database** (MySQL) → PlanetScale, Railway, or Aiven
- **Stripe** → Use your Stripe account (live keys for production)

---

## Part 1: Deploy Backend First

Your frontend needs a live API URL. Deploy the backend before the frontend.

### Option A: Railway (Recommended – easy MySQL)

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. **New Project** → **Deploy from GitHub repo** → Select your `NOON-` repo
3. Set **Root Directory** to `backend`
4. Add **MySQL** from Railway’s template (or use PlanetScale)
5. Add environment variables (Settings → Variables):

   ```
   PORT=5001
   FRONTEND_URL=https://your-app.vercel.app
   DATABASE_URL=<from Railway MySQL or PlanetScale>
   JWT_SECRET=<generate 32+ char secret>
   JWT_REFRESH_SECRET=<generate 32+ char secret>
   ADMIN_COMMISSION_RATE=0.1
   STRIPE_SECRET_KEY=sk_live_xxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxx
   ```

6. Run migrations: **Settings** → **Deploy** → add a one-off command: `npx prisma db push` (or use Prisma Deploy)
7. Copy your backend URL (e.g. `https://your-backend.up.railway.app`)

### Option B: Render

1. Go to [render.com](https://render.com), sign in with GitHub
2. **New** → **Web Service** → connect your repo
3. Set **Root Directory** to `backend`
4. Build: `npm install`
5. Start: `node src/index.js`
6. Add a **PostgreSQL** or use **MySQL** via PlanetScale (Render supports env vars for external DBs)
7. Add environment variables and copy the service URL

---

## Part 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub  
2. **Add New** → **Project** → Import your `NOON-` repo (or `noon shoping`)  
3. Configure:
   - **Root Directory**: Click **Edit** → set to `frontend`
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

4. **Environment Variables** (Settings → Environment Variables):

   | Name                     | Value                                      | Environment |
   |--------------------------|--------------------------------------------|-------------|
   | `NEXT_PUBLIC_API_URL`    | `https://your-backend-url/api`             | Production  |
   | `NEXT_PUBLIC_STRIPE_KEY` | `pk_live_xxxx` (Stripe publishable key)   | Production  |

   - Replace `your-backend-url` with your Railway/Render backend URL
   - No trailing slash on the API URL; axios appends `/api`
   - For preview deployments, you can add the same variables to Preview

5. **Deploy** → Vercel will build and deploy

---

## Part 3: Final Setup

1. **CORS**: On your backend, set `FRONTEND_URL` to your Vercel URL (e.g. `https://your-app.vercel.app`)
2. **Stripe webhooks**: In Stripe Dashboard → Webhooks → add endpoint  
   - URL: `https://your-backend-url/api/payment/webhook`  
   - Events: `checkout.session.completed`, etc.
3. **Database**: If using Prisma, run migrations on your hosted DB:
   ```bash
   cd backend
   DATABASE_URL="mysql://..." npx prisma db push
   # or: npx prisma migrate deploy
   ```

---

## Root Directory Reminder

Because your Next.js app lives in `frontend/`, you must set **Root Directory** to `frontend` in the Vercel project settings.  
Otherwise the build will fail.

---

## Troubleshooting

| Issue                    | Fix                                                                 |
|--------------------------|---------------------------------------------------------------------|
| Build fails              | Ensure Root Directory = `frontend`                                 |
| API requests fail        | Check `NEXT_PUBLIC_API_URL` and backend CORS / `FRONTEND_URL`       |
| Images not loading       | Check `next.config.mjs` `remotePatterns` for your image hosts      |
| 401 on protected routes  | Confirm JWT secrets match between frontend cookies and backend     |
