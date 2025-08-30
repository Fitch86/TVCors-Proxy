# TVCors Proxy 部署指南

## 简化的启动方式

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 生产环境

#### 方式 1：直接使用 Node.js

```bash
# 1. 安装依赖
npm install

# 2. 构建项目
npm run build

# 3. 启动生产服务器
npm start
```

#### 方式 2：使用 Docker

```bash
# 直接使用docker-compose
docker-compose up -d
```

## 环境变量配置

### 创建配置文件

```bash
# 复制示例配置
cp .env.example .env.local

# 编辑配置
nano .env.local
```

### 推荐的生产环境配置

```env
# 服务端口
PORT=3001

# 运行环境
NODE_ENV=production

# 允许访问的域名（重要！）
ALLOWED_ORIGINS=https://lunatv.judy.dpdns.org,https://cors.judy.dpdns.org

# 默认User-Agent
DEFAULT_USER_AGENT=AptvPlayer/1.4.10

# 详细日志（生产环境建议关闭）
VERBOSE_LOGGING=false
```

## 优势

✅ **无启动脚本**：直接使用 npm 命令，避免在 Linux 中产生额外进程  
✅ **跨平台兼容**：Windows、Linux、macOS 都可以使用相同的命令  
✅ **Docker 支持**：完整的容器化部署支持  
✅ **环境变量管理**：统一使用.env.local 文件管理配置

## 故障排除

### 端口被占用

```bash
# 检查端口占用
netstat -tulpn | grep 3001

# 或者修改端口
echo "PORT=8080" > .env.local
npm start
```

### 权限问题

```bash
# 确保有足够权限
sudo npm start

# 或者使用非特权端口（>1024）
echo "PORT=8080" > .env.local
```
