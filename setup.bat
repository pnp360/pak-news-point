@echo off
chcp 65001 >nul
title Azad Khabar — Setup
cd /d "%~dp0"

echo =============================================
echo    آزاد خبر — One-Click Setup
echo =============================================
echo.
echo This will install everything needed and start
echo the news server on http://localhost:3000
echo.
echo DO NOT close this window until setup finishes.
echo.

:: ── Step 1: Check / Install Node.js ──────────────────
echo [1/5] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js not found. Downloading...
    echo This may take a minute...
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.18.3/node-v20.18.3-x64.msi' -OutFile '%TEMP%\node-installer.msi'}"
    if not exist "%TEMP%\node-installer.msi" (
        echo ERROR: Could not download Node.js. Check internet connection.
        pause
        exit /b 1
    )
    echo Installing Node.js (silent)...
    msiexec /i "%TEMP%\node-installer.msi" /quiet /norestart
    echo Waiting for installation to complete...
    :waitNode
    where node >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        timeout /t 2 /nobreak >nul
        goto waitNode
    )
    echo Node.js installed successfully!
) else (
    for /f "tokens=*" %%i in ('node -v') do echo Node.js found: %%i
)
echo.

:: ── Step 2: Install npm dependencies ────────────────
echo [2/5] Installing npm packages...
echo This may take 2-5 minutes depending on internet speed...
call npm install --loglevel=error
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm install failed.
    pause
    exit /b 1
)
echo Dependencies installed.
echo.

:: ── Step 3: Generate Prisma client ──────────────────
echo [3/5] Generating Prisma database client...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Prisma generate had an issue. The server may still work.
)
echo.

:: ── Step 4: Build Next.js ───────────────────────────
echo [4/5] Building the application...
echo This may take 2-3 minutes...
call npx next build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed.
    pause
    exit /b 1
)
echo Build complete.
echo.

:: ── Step 5: Add to Windows Startup ──────────────────
echo [5/5] Adding to Windows startup...
reg add "HKCU\Software\Microsoft\Windows\Startup\Programs\AzadKhabar" /ve /t REG_SZ /d "wscript.exe \"%~dp0start-server.vbs\"" /f >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Will start automatically when you log in.
) else (
    echo Could not add to startup. You can manually run start-server.vbs.
)
echo.

:: ── Done ────────────────────────────────────────────
echo =============================================
echo    SETUP COMPLETE!
echo =============================================
echo.
echo The server will start in a few seconds...
echo Open http://localhost:3000 in your browser.
echo.
echo This window will close automatically.
echo.

:: Start the server hidden via VBS
wscript.exe "%~dp0start-server.vbs"

:: Clean up installer
del "%TEMP%\node-installer.msi" 2>nul

:: Close this window after 2 seconds
timeout /t 2 /nobreak >nul
exit
