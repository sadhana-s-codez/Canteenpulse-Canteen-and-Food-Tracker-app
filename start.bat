@echo off
title CanteenPulse Launcher
echo ==================================================
echo           Starting CanteenPulse App...
echo ==================================================
echo.

cd /d "%~dp0"

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js / npm is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [1/2] Installing dependencies (first run only)...
    call npm install
)

echo [2/2] Starting server...
echo.
echo The app will open in your browser automatically at http://localhost:5173/
echo.
echo Press Ctrl+C in this window anytime to stop the server.
echo.

start "" "http://localhost:5173/"
call npm run dev
