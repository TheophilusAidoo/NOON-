# Run Rakuten

## Quick Start

1. **Start MySQL** (XAMPP) – open XAMPP, start Apache & MySQL
2. **Start the app** – from project root:
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   - **Frontend:** http://localhost:3000
   - **Seller:** http://localhost:3000/seller
   - **Admin:** http://localhost:3000/admin

## If "Connection Refused" or Port in Use

```bash
# Kill processes on ports 3000 and 5001
cd backend && npm run kill-port
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Then start again
cd .. && npm run dev
```

## Or use the start script

```bash
chmod +x start.sh
./start.sh
```

## Ports

- **3000** – Next.js frontend
- **5001** – Express backend API
