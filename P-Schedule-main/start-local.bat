@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js belum terpasang atau tidak ada di PATH.
    echo Install Node.js, lalu buka ulang terminal ini.
    pause
    exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm tidak ditemukan. Pastikan instalasi Node.js menyertakan npm.
    pause
    exit /b 1
)

if not exist "backend\node_modules" (
    echo [ERROR] Dependency backend belum terpasang.
    echo Jalankan: cd backend ^&^& npm install
    pause
    exit /b 1
)

if not exist "frontend\node_modules" (
    echo [ERROR] Dependency frontend belum terpasang.
    echo Jalankan: cd frontend ^&^& npm install
    pause
    exit /b 1
)

echo Membuka terminal backend dan frontend...
start "P-Schedule Backend" /D "%~dp0backend" cmd /k "npm run dev"
start "P-Schedule Frontend" /D "%~dp0frontend" cmd /k "npm run dev"

echo.
echo Backend  : http://localhost:3000
echo Frontend : http://localhost:5173
echo TV       : http://localhost:5173/tv
echo Tutup kedua terminal service untuk menghentikan aplikasi.
endlocal
