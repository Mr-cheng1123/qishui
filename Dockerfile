# 多阶段构建
FROM node:20-alpine AS builder

# 构建前端
WORKDIR /workspace/app
COPY app/package*.json ./
RUN npm ci
COPY app/ ./
RUN npm run build

# 构建后端
WORKDIR /workspace/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./

# 生产环境
FROM node:20-alpine

WORKDIR /app/server

# 复制后端运行文件
COPY --from=builder /workspace/server ./

# 复制前端构建文件到 server/index.js 期望路径（../app/dist）
COPY --from=builder /workspace/app/dist /app/app/dist

# 暴露端口（平台会通过 PORT 注入实际端口）
EXPOSE 3001

CMD ["node", "index.js"]
