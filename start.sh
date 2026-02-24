#!/bin/bash
# NoonShop - One-command startup
# Ensures DB has data, then starts backend + frontend

set -e
cd "$(dirname "$0")"

echo "=== NoonShop Startup ==="

# 1. Seed database if empty (try XAMPP mysql first, then system mysql)
MYSQL_CMD=""
[ -x /Applications/XAMPP/xamppfiles/bin/mysql ] && MYSQL_CMD="/Applications/XAMPP/xamppfiles/bin/mysql"
[ -z "$MYSQL_CMD" ] && command -v mysql &>/dev/null && MYSQL_CMD="mysql"

if [ -n "$MYSQL_CMD" ]; then
  PRODUCT_COUNT=$($MYSQL_CMD -u root noonshop -N -e "SELECT COUNT(*) FROM products" 2>/dev/null || echo "0")
  if [ "$PRODUCT_COUNT" = "0" ] || [ -z "$PRODUCT_COUNT" ]; then
    echo "Seeding database..."
    $MYSQL_CMD -u root noonshop < database/seed-data.sql 2>/dev/null || true
    echo "Database seeded."
  else
    echo "Database has data ($PRODUCT_COUNT products)."
  fi
else
  echo "MySQL not found. Start XAMPP and import database/seed-data.sql via phpMyAdmin if the site shows no products."
fi

# 2. Kill existing processes on our ports
echo "Clearing ports..."
lsof -ti:3000,5001 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 2

# 3. Start backend
echo "Starting backend on port 5001..."
(cd backend && npm run dev) &
BACKEND_PID=$!
sleep 3

# 4. Start frontend
echo "Starting frontend on port 3000..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "=== NoonShop is running ==="
echo "  Frontend: http://localhost:3000"
echo "  Admin:    http://localhost:3000/admin (admin@noonshop.com / Admin@123)"
echo ""
echo "Press Ctrl+C to stop both servers."

wait $BACKEND_PID $FRONTEND_PID
