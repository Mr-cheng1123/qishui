# 多阶段构建
FROM node:20-alpine AS builder

# 构建前端
WORKDIR /app/frontend
COPY app/package*.json ./
RUN npm install
COPY app/ ./
RUN npm run build

# 构建后端
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./

# 生产环境
FROM node:20-alpine

WORKDIR /app

# 复制后端
COPY --from=builder /app/server ./

# 复制前端构建文件
COPY --from=builder /app/frontend/dist ./public

# 安装 serve 用于静态文件
RUN npm install -g serve

# 暴露端口
EXPOSE 3001

# 启动脚本
COPY start.sh ./
RUN chmod +x start.sh

CMD ["./start.sh"]
