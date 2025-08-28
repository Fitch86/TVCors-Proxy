@echo off
chcp 65001 >nul

echo 🚀 开始推送 TVCors Proxy 到 GitHub...
echo.

REM 进入脚本所在目录
cd /d "%~dp0"

echo 📋 检查Git状态...
git status
echo.

echo 🔗 检查远程仓库配置...
git remote -v
echo.

echo 📤 推送到GitHub主分支...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ 推送成功！
    echo 🌐 仓库地址: https://github.com/Fitch86/TVCors-Proxy
    echo 📚 查看README: https://github.com/Fitch86/TVCors-Proxy/blob/main/README.md
) else (
    echo.
    echo ❌ 推送失败，请检查网络连接和权限
    echo 🔧 如果问题持续，请尝试：
    echo    git push origin main --force-with-lease
)

echo.
echo 📝 如需查看提交历史，请运行：
echo    git log --oneline
echo.

pause