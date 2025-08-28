# TVCors Proxy 更新说明

## 更新内容

### 1. 🔗 GitHub仓库地址更新

- **package.json**: 更新作者信息为 `Fitch86`，添加仓库信息
- **README.md**: 更新克隆地址和致谢信息
- **页面链接**: 更新主页中的GitHub链接
- **LICENSE**: 更新版权信息为 `Fitch86`

**新的仓库地址**: `https://github.com/Fitch86/TVCors-Proxy`

### 2. 🛡️ 域名访问控制功能

添加了完整的域名访问控制系统，通过环境变量 `ALLOWED_ORIGINS` 配置允许访问的域名。

#### 新增功能特性

**核心功能**:
- ✅ 支持多域名配置（逗号分隔）
- ✅ 支持通配符模式（`*.example.com`）
- ✅ 支持 Origin 和 Referer 头验证
- ✅ 非法访问返回 403 错误
- ✅ 完整的 CORS 头管理

**安全增强**:
- 🔒 可限制特定域名访问代理服务
- 🔒 防止未授权的跨域请求
- 🔒 支持开发和生产环境不同配置
- 🔒 详细的访问日志记录

#### 配置说明

**环境变量**: `ALLOWED_ORIGINS`

**配置示例**:
```bash
# 允许所有域名（默认）
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

#### 技术实现

**新增工具函数**:
- `isOriginAllowed()`: 验证请求来源是否允许访问
- `setCorsHeadersWithOrigin()`: 基于来源设置 CORS 头
- 增强的 `createErrorResponse()`: 支持域名验证的错误响应

**API路由更新**:
- 所有代理路由 (`/api/proxy/*`) 都支持域名访问控制
- OPTIONS 预检请求正确处理域名验证
- 统一的错误处理和日志记录

**验证机制**:
1. 检查 `Origin` 请求头
2. 检查 `Referer` 请求头（备选）
3. 支持精确匹配和通配符匹配
4. 失败时返回 403 错误和详细日志

#### 使用场景

**生产环境**:
```bash
# 只允许你的网站访问
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**开发环境**:
```bash
# 允许本地开发
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000
```

**企业内网**:
```bash
# 允许内网子域名
ALLOWED_ORIGINS=https://*.internal.company.com
```

**混合部署**:
```bash
# 生产和测试环境
ALLOWED_ORIGINS=https://app.yourdomain.com,https://test.yourdomain.com,https://*.dev.yourdomain.com
```

#### 兼容性说明

- ✅ **向后兼容**: 默认配置（空值）允许所有域名访问
- ✅ **无破坏性变更**: 现有部署无需修改即可正常工作
- ✅ **渐进式增强**: 可根据需要逐步启用域名限制

#### 安全建议

1. **生产环境**: 强烈建议配置 `ALLOWED_ORIGINS` 限制访问域名
2. **开发环境**: 可以保持默认配置（允许所有域名）方便调试
3. **内网部署**: 建议配置内网域名范围限制外部访问
4. **监控日志**: 启用 `VERBOSE_LOGGING=true` 监控访问情况

## 文件更新清单

### 核心代码文件
- ✅ `src/lib/utils.ts` - 新增域名验证和 CORS 管理功能
- ✅ `src/app/api/proxy/m3u8/route.ts` - 添加域名访问控制
- ✅ `src/app/api/proxy/segment/route.ts` - 添加域名访问控制  
- ✅ `src/app/api/proxy/key/route.ts` - 添加域名访问控制
- ✅ `src/app/api/proxy/logo/route.ts` - 添加域名访问控制

### 配置文件
- ✅ `package.json` - 更新仓库信息
- ✅ `.env.example` - 添加域名配置示例
- ✅ `docker-compose.yml` - 添加环境变量示例

### 文档文件
- ✅ `README.md` - 更新仓库地址和域名配置说明
- ✅ `LICENSE` - 更新版权信息
- ✅ `src/app/page.tsx` - 更新页面链接

## 升级指南

### 现有部署升级

1. **拉取最新代码**:
   ```bash
   git pull origin main
   ```

2. **重新构建镜像**:
   ```bash
   docker build -t tvcors-proxy .
   ```

3. **更新配置**（可选）:
   ```bash
   # 复制环境变量示例
   cp .env.example .env.local
   
   # 编辑配置文件，设置 ALLOWED_ORIGINS
   nano .env.local
   ```

4. **重启服务**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### 新部署

按照 README.md 中的最新部署指南进行部署，注意配置 `ALLOWED_ORIGINS` 环境变量。

## 验证更新

更新完成后，可以通过以下方式验证功能：

1. **检查服务状态**:
   ```bash
   curl http://localhost:3001/
   ```

2. **测试域名限制**（如果配置了 ALLOWED_ORIGINS）:
   ```bash
   # 应该被允许的请求
   curl -H "Origin: https://yourdomain.com" \
        "http://localhost:3001/api/proxy/m3u8?url=https%3A//example.com/test.m3u8"
   
   # 应该被拒绝的请求（返回403）
   curl -H "Origin: https://malicious.com" \
        "http://localhost:3001/api/proxy/m3u8?url=https%3A//example.com/test.m3u8"
   ```

3. **查看日志**:
   ```bash
   docker-compose logs -f tvcors-proxy
   ```

## 总结

本次更新主要实现了两个重要功能：

1. **🔗 GitHub仓库迁移**: 将项目迁移到新的维护者仓库
2. **🛡️ 域名访问控制**: 增强安全性，支持限制特定域名访问

这些更新提升了项目的安全性和可维护性，同时保持了向后兼容性。建议在生产环境中启用域名访问控制功能以提高安全性。