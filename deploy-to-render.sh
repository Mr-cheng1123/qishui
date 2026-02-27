#!/bin/bash

# 汽水走私者 - Render 部署脚本
# 使用说明:
# 1. 在 Render 创建账号: https://render.com
# 2. 创建新的 Web Service
# 3. 连接你的 GitHub 仓库
# 4. 使用以下配置:

set -e

echo "🚀 开始部署汽水走私者服务器..."

# 检查是否在正确的目录
if [ ! -f "server/index.js" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

echo ""
echo "📋 Render 部署配置:"
echo "===================="
echo ""
echo "Build Command:"
echo "  cd server && npm install"
echo ""
echo "Start Command:"
echo "  cd server && npm start"
echo ""
echo "Environment Variables:"
echo "  PORT=3001"
echo ""
echo "===================="
echo ""

# 检查 render.yaml
if [ -f "render.yaml" ]; then
    echo "✅ 找到 render.yaml 配置文件"
    echo ""
    echo "💡 提示: 你可以使用 Render 的 Blueprint 功能"
    echo "   直接导入 render.yaml 文件自动配置"
else
    echo "⚠️ 未找到 render.yaml 文件"
fi

echo ""
echo "📝 部署步骤:"
echo "1. 将代码推送到 GitHub"
echo "2. 在 Render 创建新的 Web Service"
echo "3. 选择 GitHub 仓库"
echo "4. 配置 Build Command 和 Start Command"
echo "5. 点击 Deploy"
echo ""
echo "🔗 部署完成后，你会获得一个 URL，如:"
echo "   https://soda-smugglers-server.onrender.com"
echo ""
echo "⚠️  重要: 部署后需要更新前端配置!"
echo "   修改 app/.env 文件中的 VITE_SERVER_URL"
echo "   然后重新构建并部署前端"
echo ""
