# 🚀 快速开始指南

## 方案1: 本地游玩（最简单）

### 步骤

1. **下载项目代码**
   ```bash
   git clone <repository-url>
   cd soda-smugglers
   ```

2. **一键启动**
   ```bash
   ./start-local.sh
   ```

3. **打开浏览器访问**
   - 前端: http://localhost:5173
   - 后端: http://localhost:3001

4. **邀请朋友**
   - 确保所有人在同一局域网
   - 使用你的局域网 IP 访问（如 http://192.168.1.100:5173）

---

## 方案2: 部署到互联网（推荐）

### 步骤1: 部署后端服务器

#### 使用 Render（免费）

1. 访问 [Render](https://render.com) 并注册账号
2. 创建新的 **Web Service**
3. 连接你的 GitHub 仓库
4. 配置:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment**: `Node`
5. 点击 **Deploy**
6. 等待部署完成，获得服务器 URL（如 `https://soda-smugglers.onrender.com`）

#### 使用 Railway（免费）

1. 访问 [Railway](https://railway.app) 并注册账号
2. 创建新项目，选择 **Deploy from GitHub repo**
3. 选择你的仓库
4. 添加环境变量: `PORT=3001`
5. 部署

### 步骤2: 更新前端配置

1. 修改 `app/.env` 文件:
   ```
   VITE_SERVER_URL=https://你的服务器地址
   ```

2. 重新构建前端:
   ```bash
   cd app
   npm run build
   ```

### 步骤3: 部署前端

#### 使用 Netlify（免费）

1. 访问 [Netlify](https://netlify.com) 并注册账号
2. 拖拽 `app/dist` 文件夹到上传区域
3. 获得网站 URL

#### 使用 Vercel（免费）

1. 访问 [Vercel](https://vercel.com) 并注册账号
2. 导入 GitHub 仓库
3. 设置根目录为 `app`
4. 部署

---

## 方案3: 使用 Docker（高级）

### 构建镜像

```bash
docker build -t soda-smugglers .
```

### 运行容器

```bash
docker run -p 3000:3000 -p 3001:3001 soda-smugglers
```

### 部署到支持 Docker 的平台

- **Railway**: 直接推送代码，自动检测 Dockerfile
- **Fly.io**: `fly launch && fly deploy`
- **AWS/GCP/Azure**: 使用容器服务

---

## 🎮 游戏玩法

1. **创建房间**
   - 打开游戏网站
   - 输入昵称，选择头像
   - 点击"创建房间"
   - 复制6位房间代码

2. **加入房间**
   - 其他玩家输入房间代码
   - 输入昵称，选择头像
   - 点击"加入房间"

3. **开始游戏**
   - 当3-8人都加入后
   - 房主点击"开始游戏"

4. **游戏流程**
   - 轮流担任边境守卫
   - 旅行者选择行李和贿赂
   - 守卫决定接受贿赂、检查或逮捕
   - 收集瓶盖，成为汽水大亨！

---

## 🔧 常见问题

### Q: 无法连接到服务器？

**A:** 
1. 检查服务器是否运行
2. 检查防火墙设置
3. 确认前端配置的服务器地址正确
4. 查看浏览器控制台的网络请求

### Q: 房间不存在？

**A:**
1. 确认所有玩家使用相同的服务器
2. 检查房间代码是否正确
3. 服务器重启后房间数据会丢失

### Q: 如何修改游戏规则？

**A:**
- 修改 `server/index.js` 中的游戏逻辑
- 修改 `app/src/types/game.ts` 中的类型定义

---

## 📚 更多文档

- [详细部署指南](./DEPLOY.md)
- [游戏规则](./README.md)

---

## 💡 提示

- 免费托管服务（Render/Railway）在闲置时会进入休眠状态
- 首次访问可能需要等待10-30秒唤醒服务器
- 建议在游戏开始前先访问一次服务器唤醒它

---

## 🆘 需要帮助？

- 查看 [GitHub Issues](https://github.com/your-repo/issues)
- 联系开发者

**祝你游戏愉快！🥤**
