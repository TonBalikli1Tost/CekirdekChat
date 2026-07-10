@echo off
setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0"
echo =========================================
echo Vercel Staging Helper
echo =========================================

call :checkVercel
if errorlevel 1 goto end

call :linkProject
if errorlevel 1 goto end

call :deployStaging
if errorlevel 1 goto end

call :pullEnv
if errorlevel 1 goto end

echo.
echo All steps completed successfully.
goto pause

:checkVercel
vercel --version >nul 2>&1
if errorlevel 1 (
  echo Error: Vercel CLI not found in PATH.
  echo Install with: npm i -g vercel
  exit /b 1
)
echo Vercel CLI detected.
goto :eof

:linkProject
echo.
echo Linking this directory to Vercel...
vercel link --yes
if errorlevel 1 (
  echo Error: Failed to link the project.
  exit /b 1
)
echo Project linked.
goto :eof

:deployStaging
echo.
echo Deploying to staging...
vercel deploy --target=staging --confirm
if errorlevel 1 (
  echo Error: Staging deploy failed.
  exit /b 1
)
echo Deployment completed.
goto :eof

:pullEnv
echo.
echo Pulling staging environment variables into .env.local...
vercel env pull .env.local --environment=staging
if errorlevel 1 (
  echo Error: Failed to pull environment variables.
  exit /b 1
)
echo Environment variables pulled.
goto :eof

:pause
echo.
pause
exit /b 0
