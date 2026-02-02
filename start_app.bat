@echo off
TITLE LinguaTale Launcher

echo ========================================================
echo                 LinguaTale Launcher
echo ========================================================

echo.
echo [1/3] Checking for updates (git pull)...
call git pull
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo [WARNING] Git pull failed. You might be offline or have local changes.
    echo Starting the application with the current version...
    echo.
) ELSE (
    echo Update check complete.
)

echo.
echo [2/3] Installing dependencies (checks for new packages)...
call npm install

echo.
echo [3/3] Starting Local Server...
echo.
echo The application will open automatically in your default browser at http://localhost:1234
echo Press Ctrl+C to stop the server.
echo.

:: npm start (Vite) is configured to open the browser automatically via vite.config.ts
npm run dev
