#!/bin/bash
# Build project for cPanel deployment
# Run from project root: ./scripts/build-for-cpanel.sh

set -e
echo "Building for cPanel..."

# Clean previous build
rm -rf cpanel-build
mkdir -p cpanel-build

# 1. Build backend (prisma generate)
echo "Building backend..."
cd backend
npm install --production=false
npx prisma generate
cd ..

# 2. Build frontend
echo "Building frontend..."
cd frontend
npm install --production=false
npm run build
cd ..

# 3. Copy files to cpanel-build (keep .next from frontend build)
echo "Creating cPanel package..."
cp -r backend cpanel-build/
cp -r frontend cpanel-build/
rm -rf cpanel-build/backend/node_modules
rm -rf cpanel-build/frontend/node_modules
cp package.json cpanel-build/
cp -r database cpanel-build/ 2>/dev/null || true
cp README.md SETUP.md cpanel-build/ 2>/dev/null || true

# Create env template for cPanel
cat > cpanel-build/ENV_SETUP.txt << 'EOF'
# Copy to .env in backend/ folder
PORT=5001
FRONTEND_URL=https://yourdomain.com
DATABASE_URL="mysql://user:password@localhost:3306/noonshop"
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
ADMIN_COMMISSION_RATE=0.1
STRIPE_SECRET_KEY=sk_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx

# For frontend .env.local
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_STRIPE_KEY=pk_xxxx
EOF

# Create zip
ZIP_NAME="noon-shop-cpanel-$(date +%Y%m%d).zip"
cd cpanel-build
zip -r "../$ZIP_NAME" . -x "*.git*" -x "*node_modules*"
cd ..
rm -rf cpanel-build

echo ""
echo "Done! Created: $ZIP_NAME"
echo "Upload this zip to cPanel, extract, then run:"
echo "  cd backend && npm install && npx prisma db push"
echo "  cd ../frontend && npm install"
echo "  See DEPLOY.md for cPanel setup"
echo ""
