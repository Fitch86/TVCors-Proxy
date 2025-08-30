@echo off
echo =====================================
echo     TVCors Proxy GitHub 推送脚本
echo =====================================
echo.

REM 检查Git是否可用
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git 未安装或不在 PATH 中
    echo 请先安装 Git: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo ✅ Git 已就绪
echo.

REM 检查Git状态
echo 📋 检查Git状态...
git status
echo.

REM 添加所有更改
echo 📦 添加所有更改到暂存区...
git add .
echo.

REM 提交更改
echo 💾 提交更改...
git commit -m "Refactor: Remove startup scripts and simplify package.json" -m "- Remove start.js, start.bat, verify.bat and other startup scripts" -m "- Simplify package.json scripts to use direct Next.js commands" -m "- Update README.md with new startup instructions" -m "- Fix wildcard CORS pattern matching logic" -m "- Add .env.production example" -m "- Create DEPLOYMENT.md guide" -m "" -m "This eliminates extra processes in Linux environments and provides cross-platform consistency."
echo.

REM 检查远程仓库
echo 🔗 检查远程仓库配置...
git remote -v
echo.

REM 推送到GitHub
echo 📤 推送到GitHub主分支...
git push origin main

if %errorlevel% == 0 (
    echo.
    echo ✅ 推送成功！
    echo 🌐 仓库地址: https://github.com/Fitch86/TVCors-Proxy
    echo 📚 查看更新: https://github.com/Fitch86/TVCors-Proxy/commits/main
) else (
    echo.
    echo ❌ 推送失败，请检查网络连接和权限
    echo 🔧 如果需要强制推送，请运行：
    echo    git push origin main --force-with-lease
)

echo.
echo 📝 如需查看提交历史，请运行：
echo    git log --oneline -10

echo.
echo =====================================
echo 推送完成！
echo =====================================
pause