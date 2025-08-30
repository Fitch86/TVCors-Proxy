# TVCors-Proxy GitHub 推送脚本
# 请在Git Bash或安装了Git的终端中运行

echo "🚀 开始推送 TVCors-Proxy 到 GitHub..."

# 进入项目目录
cd "$(dirname "$0")"

# 检查Git状态
echo "📋 检查Git状态..."
git status

# 添加所有更改
echo "📦 添加所有更改到暂存区..."
git add .

# 提交更改
echo "💾 提交更改..."
git commit -m "Refactor: Remove startup scripts and simplify package.json

- Remove start.js, start.bat, verify.bat and other startup scripts
- Simplify package.json scripts to use direct Next.js commands
- Update README.md with new startup instructions
- Fix wildcard CORS pattern matching logic
- Add .env.production example
- Create DEPLOYMENT.md guide

This eliminates extra processes in Linux environments and provides 
cross-platform consistency."

# 检查远程仓库
echo "🔗 检查远程仓库配置..."
git remote -v

# 推送到GitHub
echo "📤 推送到GitHub主分支..."
git push origin main

# 检查推送结果
if [ $? -eq 0 ]; then
    echo "✅ 推送成功！"
    echo "🌐 仓库地址: https://github.com/Fitch86/TVCors-Proxy"
    echo "📚 查看更新: https://github.com/Fitch86/TVCors-Proxy/commits/main"
else
    echo "❌ 推送失败，请检查网络连接和权限"
    echo "🔧 如果需要强制推送，请使用："
    echo "   git push origin main --force-with-lease"
fi

echo "📝 如需查看提交历史："
echo "   git log --oneline -10"

read -p "按回车键退出..."