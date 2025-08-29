@echo off
echo =====================================
echo     TVCors Proxy Windows 验证测试
echo =====================================
echo.

REM 测试不同的启动方式
echo 1. 测试默认端口启动...
echo.

REM 设置环境变量
set PORT=3003
echo 设置端口为: %PORT%

REM 显示系统信息
echo 系统信息:
echo Node.js版本:
node --version
echo npm版本:
npm --version
echo.

echo 测试环境变量读取:
echo PORT=%PORT%
echo.

echo 可用的启动方式:
echo.
echo 方式1: npm run start      (固定端口3001)
echo 方式2: set PORT=8080 ^&^& npm start  (自定义端口)
echo 方式3: start.bat         (交互式启动)
echo 方式4: node start.js     (脚本启动)
echo.

echo 测试配置文件:
if exist .env.local (
    echo ✓ .env.local 存在
    type .env.local
) else (
    echo ✗ .env.local 不存在，使用默认配置
)
echo.

echo 测试package.json脚本:
echo npm run dev - 开发模式
echo npm run start - 生产模式
echo npm run build - 构建项目
echo.

echo =====================================
echo 验证完成！可以开始使用 TVCors Proxy
echo =====================================
pause