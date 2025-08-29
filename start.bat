@echo off
REM TVCors Proxy Windows启动脚本

echo =======================================
echo    TVCors Proxy Windows Startup
echo =======================================

REM 检查Node.js是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM 检查依赖是否安装
if not exist node_modules (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM 设置默认端口
if "%PORT%"=="" set PORT=3001

echo Starting TVCors Proxy on port %PORT%
echo You can change port by: set PORT=8080 && start.bat
echo.

REM 启动服务
node start.js

pause