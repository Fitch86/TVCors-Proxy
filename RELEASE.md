# 🎉 TVCors Proxy 项目发布

## 📦 仓库信息

**GitHub仓库**: https://github.com/Fitch86/TVCors-Proxy  
**维护者**: Fitch86  
**许可证**: MIT License

## 🚀 推送状态

✅ **Git初始化完成**  
✅ **代码已提交到本地仓库**  
✅ **远程仓库已配置**  
✅ **代码已推送到GitHub**

## 📋 发布内容

### 核心功能模块
- ✅ **M3U8代理** (`/api/proxy/m3u8`) - HLS播放列表代理和URL重写
- ✅ **视频片段代理** (`/api/proxy/segment`) - TS视频片段流式传输
- ✅ **密钥代理** (`/api/proxy/key`) - HLS加密密钥处理
- ✅ **图片代理** (`/api/proxy/logo`) - Logo和图片资源代理

### 安全功能
- 🛡️ **域名访问控制** - 通过 `ALLOWED_ORIGINS` 环境变量控制访问权限
- 🌐 **完整CORS支持** - 解决跨域访问问题
- 📝 **详细日志记录** - 支持调试和监控

### 部署支持
- 🐳 **Docker容器化** - 完整的Docker和Docker Compose配置
- ⚙️ **环境变量配置** - 灵活的配置管理
- 📚 **完整文档** - 详细的使用说明和部署指南

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **运行时**: Node.js 20
- **容器**: Docker + Docker Compose

## 📁 项目结构

```
TVCors-Proxy/
├── src/
│   ├── app/
│   │   ├── api/proxy/          # 代理API路由
│   │   │   ├── m3u8/
│   │   │   ├── segment/
│   │   │   ├── key/
│   │   │   └── logo/
│   │   ├── layout.tsx          # 根布局
│   │   ├── page.tsx           # 主页
│   │   └── globals.css        # 全局样式
│   └── lib/
│       └── utils.ts           # 工具函数库
├── Dockerfile                 # Docker配置
├── docker-compose.yml        # Docker Compose配置
├── package.json              # 项目依赖
├── README.md                 # 项目文档
├── LICENSE                   # MIT许可证
└── .env.example             # 环境变量示例
```

## 🎯 快速开始

### 克隆项目
```bash
git clone https://github.com/Fitch86/TVCors-Proxy.git
cd TVCors-Proxy
```

### 开发环境
```bash
npm install
npm run dev
```

### Docker部署
```bash
docker-compose up -d
```

## 🔧 环境变量配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 服务端口 | `3001` |
| `DEFAULT_USER_AGENT` | 默认User-Agent | `AptvPlayer/1.4.10` |
| `VERBOSE_LOGGING` | 启用详细日志 | `false` |
| `ALLOWED_ORIGINS` | 允许访问的域名列表 | `""` (允许所有) |

### 域名访问控制示例
```bash
# 只允许特定域名
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# 支持通配符
ALLOWED_ORIGINS=https://*.yourdomain.com

# 混合配置
ALLOWED_ORIGINS=https://yourdomain.com,https://*.yourdomain.com,http://localhost:*
```

## 🌐 API接口

### M3U8代理
```
GET /api/proxy/m3u8?url={encoded_m3u8_url}&allowCORS={true|false}&ua={user_agent}
```

### 视频片段代理
```
GET /api/proxy/segment?url={encoded_segment_url}&ua={user_agent}
```

### 密钥代理
```
GET /api/proxy/key?url={encoded_key_url}&ua={user_agent}
```

### 图片代理
```
GET /api/proxy/logo?url={encoded_image_url}&ua={user_agent}
```

## 🔒 安全建议

1. **生产环境**: 强烈建议配置 `ALLOWED_ORIGINS` 限制访问域名
2. **内网部署**: 建议通过反向代理（如Nginx）使用
3. **监控日志**: 启用 `VERBOSE_LOGGING=true` 监控访问情况
4. **定期更新**: 定期更新依赖包修复安全漏洞

## 📈 使用场景

- 🎥 前端视频播放器的跨域代理
- 📺 HLS流媒体的CORS问题解决
- 🖼️ 图片资源的跨域访问
- 🔐 加密视频流的密钥代理

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 📝 许可证

本项目基于 MIT License 开源，详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

本项目从 [LunaTV](https://github.com/moontechlab/lunatv) 项目中分离而来，感谢原项目的贡献者们。

---

**项目状态**: ✅ 已发布  
**最后更新**: 2025-08-28  
**仓库地址**: https://github.com/Fitch86/TVCors-Proxy