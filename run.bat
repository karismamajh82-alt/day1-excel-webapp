@echo off
chcp 65001 >nul
echo.
echo  ============================================================
echo    EXCEL DASHBOARD
echo  ============================================================
echo.

cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js가 설치되어 있지 않습니다.
    echo          https://nodejs.org 에서 설치 후 다시 실행해주세요.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo  의존성 패키지를 설치합니다. 잠시 기다려주세요...
    echo.
    npm install
    echo.
)

echo  대시보드를 시작합니다...
echo  브라우저에서 http://localhost:5173 이 자동으로 열립니다.
echo  종료하려면 이 창에서 Ctrl+C 를 누르세요.
echo.
npm run dev
