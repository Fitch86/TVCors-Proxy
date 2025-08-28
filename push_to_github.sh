#!/bin/bash

# TVCors Proxy 推送脚本
# 当网络恢复后运行此脚本以推送代码到GitHub

echo "🚀 开始推送 TVCors Proxy 到 GitHub..."

# 进入项目目录
cd "$(dirname "$0")"

# 检查Git状态
echo "📋 检查Git状态..."
git status

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
    echo "📚 查看README: https://github.com/Fitch86/TVCors-Proxy/blob/main/README.md"
else
    echo "❌ 推送失败，请检查网络连接和权限"
    echo "🔧 如果问题持续，请尝试："
    echo "   git push origin main --force-with-lease"
fi

echo "📝 如需查看提交历史："
echo "   git log --oneline"

read -p "按回车键退出..."