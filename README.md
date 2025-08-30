# TVCors Proxy

一个独立的 CORS 代理服务，从 LunaTV 项目中分离出来，专门用于视频流媒体的跨域代理。

## 功能特性

- 🎯 **M3U8 代理**: 支持 HLS 流媒体文件的代理和 URL 重写
- 📺 **M3U 代理**: 支持 IPTV 直播源列表文件的跨域代理
- 🔑 **密钥代理**: 支持 HLS 加密密钥的代理
- 🎬 **视频片段代理**: 支持 TS 视频片段的流式代理
- 🖼️ **图片代理**: 支持 Logo 图片的代理
- 📡 **Xtream 代理**: 支持 Xtream Codes API 的跨域代理
- 📱 **Stalker 代理**: 支持 Stalker Portal 协议的跨域代理
- 🌐 **CORS 支持**: 完整的跨域资源共享支持
- ⚡ **高性能**: 基于 Next.js 的现代架构
- 🐳 **容器化**: 支持 Docker 部署

## 快速开始

### 使用 Docker（推荐）

```bash
# 使用Docker Compose
docker-compose up -d

# 或使用Docker直接运行
docker run -d -p 3001:3001 --name tvcors-proxy tvcors-proxy
```

### 开发环境

```bash
# 克隆项目
git clone https://github.com/Fitch86/TVCors-Proxy.git
cd tvcors-proxy

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 或者指定端口启动（跨平台支持）
# Windows:
set PORT=8080 && npm run dev
# Linux/Mac:
PORT=8080 npm run dev

# Windows 用户也可以使用批处理脚本
start.bat
```

服务将在 `http://localhost:3001` 启动。

### 生产环境

```bash
# 构建项目
npm run build

# 启动生产服务器
npm start

# 指定端口启动（使用.env.local文件）
echo "PORT=8080" > .env.local
npm start
```

## API 接口

### M3U8 代理

用于代理 HLS 播放列表文件，自动重写其中的 URL 链接。

```
GET /api/proxy/m3u8?url={encoded_m3u8_url}&allowCORS={true|false}&ua={user_agent}
```

**参数说明:**

- `url`: 需要代理的 M3U8 文件 URL（必需，需要 URL 编码）
- `allowCORS`: 是否允许直接 CORS 访问，而不通过代理（可选，默认 false）
- `ua`: 自定义 User-Agent（可选）

**示例:**

```bash
curl "http://localhost:3001/api/proxy/m3u8?url=https%3A//example.com/playlist.m3u8"
```

### 视频片段代理

用于代理 TS 视频片段，支持流式传输。

```
GET /api/proxy/segment?url={encoded_segment_url}&ua={user_agent}
```

**参数说明:**

- `url`: 需要代理的视频片段 URL（必需，需要 URL 编码）
- `ua`: 自定义 User-Agent（可选）

**示例:**

```bash
curl "http://localhost:3001/api/proxy/segment?url=https%3A//example.com/segment001.ts"
```

### 密钥代理

用于代理 HLS 加密密钥文件。

```
GET /api/proxy/key?url={encoded_key_url}&ua={user_agent}
```

**参数说明:**

- `url`: 需要代理的密钥文件 URL（必需，需要 URL 编码）
- `ua`: 自定义 User-Agent（可选）

**示例:**

```bash
curl "http://localhost:3001/api/proxy/key?url=https%3A//example.com/key.key"
```

### 图片代理

用于代理图片文件，支持各种图片格式。

```
GET /api/proxy/logo?url={encoded_image_url}&ua={user_agent}
```

**参数说明:**

- `url`: 需要代理的图片 URL（必需，需要 URL 编码）
- `ua`: 自定义 User-Agent（可选）

**示例:**

```bash
curl "http://localhost:3001/api/proxy/logo?url=https%3A//example.com/logo.png"
```

### M3U 代理

用于代理 IPTV 直播源列表文件，保持原始内容不进行 URL 重写。

```
GET /api/proxy/m3u?url={encoded_m3u_url}&ua={user_agent}
```

**参数说明:**

- `url`: 需要代理的 M3U 文件 URL（必需，需要 URL 编码）
- `ua`: 自定义 User-Agent（可选）

**示例:**

```bash
curl "http://localhost:3001/api/proxy/m3u?url=https%3A//example.com/playlist.m3u"
```

**注意:** 此代理专注于解决 CORS 跨域问题，不会重写 M3U 文件中的 URL 内容，保持与 LunaTV 等应用的完美兼容。

### Xtream 代理

用于代理 Xtream Codes API 请求，支持 IPTV 服务商的 API 接口。

```
GET /api/proxy/xtream?url={encoded_api_url}&username={username}&password={password}&action={action}
```

**参数说明:**

- `url`: 需要代理的 Xtream API URL（必需，需要 URL 编码）
- `username`: Xtream 用户名（可选，透传给目标 API）
- `password`: Xtream 密码（可选，透传给目标 API）
- `action`: API 操作类型（可选，如 get_live_streams）
- 其他参数会透传给目标 API

**示例:**

```bash
curl "http://localhost:3001/api/proxy/xtream?url=https%3A//server.com/player_api.php&username=user&password=pass&action=get_live_categories"
```

### Stalker 代理

用于代理 Stalker Portal 请求，支持 MAG 盒子等 STB 设备的协议。

```
GET /api/proxy/stalker?url={encoded_portal_url}&macAddress={mac_address}
```

**参数说明:**

- `url`: 需要代理的 Stalker Portal URL（必需，需要 URL 编码）
- `macAddress`: 设备 MAC 地址（可选，添加到 Cookie 中）
- 其他参数会透传给目标 Portal

**示例:**

```bash
curl "http://localhost:3001/api/proxy/stalker?url=https%3A//portal.com/stalker_portal/api&macAddress=00:1A:79:XX:XX:XX"
```

## 环境变量

| 变量名               | 说明               | 默认值              |
| -------------------- | ------------------ | ------------------- |
| `PORT`               | 服务端口           | `3001`              |
| `NODE_ENV`           | 运行环境           | `development`       |
| `DEFAULT_USER_AGENT` | 默认 User-Agent    | `AptvPlayer/1.4.10` |
| `VERBOSE_LOGGING`    | 启用详细日志       | `false`             |
| `ALLOWED_ORIGINS`    | 允许访问的域名列表 | `""` (允许所有)     |

### 端口设置方法

**使用.env.local 文件（推荐）：**

```bash
# 创建配置文件
echo "PORT=8080" > .env.local
npm start
```

**命令行临时设置：**

```bash
# Linux/Mac/WSL
PORT=8080 npm start

# Windows PowerShell
$env:PORT=8080; npm start

# Windows CMD
set PORT=8080 && npm start
```

### 域名访问控制

`ALLOWED_ORIGINS` 环境变量用于限制允许访问代理服务的域名。多个域名用逗号分隔，支持通配符 `*`。

**配置示例:**

```bash
# 允许所有域名 (默认)
ALLOWED_ORIGINS=

# 只允许特定域名
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# 允许本地开发环境
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# 支持通配符模式
ALLOWED_ORIGINS=https://*.yourdomain.com

# 混合配置
ALLOWED_ORIGINS=https://yourdomain.com,https://*.yourdomain.com,http://localhost:*
```

**安全说明:**

- 当 `ALLOWED_ORIGINS` 为空时，允许所有域名访问
- 配置域名后，只有匹配的域名才能访问代理接口
- 支持 `Origin` 和 `Referer` 头的验证
- 非匹配域名将返回 403 错误

## Docker 部署

### 构建镜像

```bash
docker build -t tvcors-proxy .
```

### 运行容器

```bash
docker run -d \
  -p 3001:3001 \
  -e DEFAULT_USER_AGENT="MyApp/1.0" \
  -e VERBOSE_LOGGING=true \
  --name tvcors-proxy \
  tvcors-proxy
```

### 使用 Docker Compose

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 开发指南

项目采用 Next.js App Router 架构：

```
src/
├── app/
│   ├── api/
│   │   └── proxy/
│   │       ├── m3u8/route.ts
│   │       ├── segment/route.ts
│   │       ├── key/route.ts
│   │       └── logo/route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
└── lib/
    └── utils.ts
```

### 核心功能说明

1. **URL 重写**: M3U8 代理会自动重写播放列表中的相对 URL 为代理 URL
2. **流式传输**: 视频片段使用流式传输，避免大文件占用内存
3. **CORS 处理**: 所有接口都支持完整的 CORS 跨域访问
4. **错误处理**: 统一的错误处理和日志记录
5. **缓存控制**: 不同类型的资源使用不同的缓存策略

### 添加新的代理类型

1. 在 `src/app/api/proxy/` 下创建新目录
2. 添加 `route.ts` 文件实现 GET 和 OPTIONS 方法
3. 使用 `src/lib/utils.ts` 中的工具函数
4. 确保正确设置 CORS 头和错误处理

## 使用场景

### 前端视频播放器集成

```javascript
// 使用Video.js
const player = videojs('video-player', {
  sources: [
    {
      src:
        'http://your-proxy:3001/api/proxy/m3u8?url=' +
        encodeURIComponent(m3u8Url),
      type: 'application/x-mpegURL',
    },
  ],
});

// 使用HLS.js
const hls = new Hls();
hls.loadSource(
  'http://your-proxy:3001/api/proxy/m3u8?url=' + encodeURIComponent(m3u8Url)
);
hls.attachMedia(video);
```

### 解决跨域问题

当你的前端应用需要访问不同域名的视频资源时，可以通过本代理服务解决跨域限制：

```javascript
// 原始URL（可能存在跨域问题）
const originalUrl = 'https://example.com/video/playlist.m3u8';

// 通过代理访问（解决跨域）
const proxyUrl = `http://your-proxy:3001/api/proxy/m3u8?url=${encodeURIComponent(
  originalUrl
)}`;
```

## 性能优化

- 使用 Node.js 20 Alpine 镜像减小容器体积
- 流式传输避免大文件内存占用
- 合理的缓存策略提升访问速度
- 生产环境使用 standalone 模式提升启动速度

## 安全考虑

- 不建议在公网直接暴露代理服务
- 建议通过反向代理（如 Nginx）使用
- 可以通过防火墙限制访问来源
- 定期更新依赖包修复安全漏洞

## 故障排除

### 常见问题

1. **端口占用**: 确保 3001 端口未被其他服务占用
2. **权限问题**: 确保 Docker 有足够权限访问文件系统
3. **网络问题**: 检查目标 URL 是否可访问
4. **编码问题**: 确保 URL 参数正确进行了 URL 编码

### 调试模式

启用详细日志进行调试：

```bash
# 环境变量方式
export VERBOSE_LOGGING=true
npm start

# Docker方式
docker run -e VERBOSE_LOGGING=true -p 3001:3001 tvcors-proxy
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 致谢

本项目从 [LunaTV](https://github.com/moontechlab/lunatv) 项目中分离而来，现由 [Fitch86](https://github.com/Fitch86) 维护。感谢原项目的贡献者们。
