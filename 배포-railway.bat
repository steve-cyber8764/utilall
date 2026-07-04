@echo off
cd /d "F:\AI\antigravity\simple page\util_page"

echo Removing old .git folder...
rmdir /s /q .git 2>nul

echo Installing Railway CLI...
where npm >nul 2>&1
if errorlevel 1 (
    echo npm not found. Trying npx via Node.js...
    where node >nul 2>&1
    if errorlevel 1 (
        echo Node.js not found in PATH.
        echo Please open "Node.js command prompt" from Start menu and run:
        echo   npx @railway/cli login
        echo   npx @railway/cli init
        echo   npx @railway/cli up
        pause
        exit /b 1
    )
    set USE_NPX=1
) else (
    set USE_NPX=0
)

if "%USE_NPX%"=="0" (
    echo npm found. Installing @railway/cli globally...
    npm install -g @railway/cli
    echo Logging into Railway...
    railway login
    echo Initializing project...
    railway init
    echo Deploying...
    railway up
) else (
    echo Using npx...
    npx @railway/cli login
    npx @railway/cli init
    npx @railway/cli up
)

echo.
echo Done! Check https://railway.com/dashboard for your URL.
pause
