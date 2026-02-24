@echo off
REM NoonShop - Windows startup
cd /d "%~dp0"

echo === NoonShop Startup ===

REM 1. Seed database (if mysql available)
where mysql >nul 2>nul
if %errorlevel% equ 0 (
  mysql -u root noonshop -N -e "SELECT COUNT(*) FROM products" 2>nul | findstr /r "0" >nul 2>nul
  if %errorlevel% equ 0 (
    echo Seeding database...
    mysql -u root noonshop < database\seed-data.sql 2>nul
    echo Database seeded.
  )
)

REM 2. Start backend
echo Starting backend...
start "NoonShop Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

REM 3. Start frontend
echo Starting frontend...
start "NoonShop Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo === NoonShop is starting ===
echo   Frontend: http://localhost:3000
echo   Admin:    http://localhost:3000/admin
echo.
pause
