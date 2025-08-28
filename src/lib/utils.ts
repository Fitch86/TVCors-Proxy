/**
 * URL解析和处理工具函数
 * 从LunaTV项目中提取的核心工具函数
 */

/**
 * 解析相对URL为绝对URL
 * @param baseUrl 基础URL
 * @param relativePath 相对路径
 * @returns 解析后的绝对URL
 */
export function resolveUrl(baseUrl: string, relativePath: string): string {
  try {
    // 如果已经是完整的 URL，直接返回
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }

    // 如果是协议相对路径 (//example.com/path)
    if (relativePath.startsWith('//')) {
      const baseUrlObj = new URL(baseUrl);
      return `${baseUrlObj.protocol}${relativePath}`;
    }

    // 使用 URL 构造函数处理相对路径
    const baseUrlObj = new URL(baseUrl);
    const resolvedUrl = new URL(relativePath, baseUrlObj);
    return resolvedUrl.href;
  } catch (error) {
    // 降级处理
    return fallbackUrlResolve(baseUrl, relativePath);
  }
}

/**
 * 降级URL解析处理
 * @param baseUrl 基础URL
 * @param relativePath 相对路径
 * @returns 解析后的URL
 */
function fallbackUrlResolve(baseUrl: string, relativePath: string): string {
  // 移除 baseUrl 末尾的文件名，保留目录路径
  let base = baseUrl;
  if (!base.endsWith('/')) {
    base = base.substring(0, base.lastIndexOf('/') + 1);
  }

  // 处理不同类型的相对路径
  if (relativePath.startsWith('/')) {
    // 绝对路径 (/path/to/file)
    const urlObj = new URL(base);
    return `${urlObj.protocol}//${urlObj.host}${relativePath}`;
  } else if (relativePath.startsWith('../')) {
    // 上级目录相对路径 (../path/to/file)
    const segments = base.split('/').filter(s => s);
    const relativeSegments = relativePath.split('/').filter(s => s);

    for (const segment of relativeSegments) {
      if (segment === '..') {
        segments.pop();
      } else if (segment !== '.') {
        segments.push(segment);
      }
    }

    const urlObj = new URL(base);
    return `${urlObj.protocol}//${urlObj.host}/${segments.join('/')}`;
  } else {
    // 当前目录相对路径 (file.ts 或 ./file.ts)
    const cleanRelative = relativePath.startsWith('./') ? relativePath.slice(2) : relativePath;
    return base + cleanRelative;
  }
}

/**
 * 获取M3U8文件的基础URL
 * @param m3u8Url M3U8文件的URL
 * @returns 基础URL路径
 */
export function getBaseUrl(m3u8Url: string): string {
  try {
    const url = new URL(m3u8Url);
    // 如果 URL 以 .m3u8 结尾，移除文件名
    if (url.pathname.endsWith('.m3u8')) {
      url.pathname = url.pathname.substring(0, url.pathname.lastIndexOf('/') + 1);
    } else if (!url.pathname.endsWith('/')) {
      url.pathname += '/';
    }
    return url.protocol + "//" + url.host + url.pathname;
  } catch (error) {
    return m3u8Url.endsWith('/') ? m3u8Url : m3u8Url + '/';
  }
}

/**
 * 简化的配置接口
 */
export interface ProxyConfig {
  // 默认User-Agent
  defaultUserAgent: string;
  // 是否启用详细日志
  enableVerboseLogging: boolean;
  // 允许访问的域名列表（为空表示允许所有域名）
  allowedOrigins: string[];
  // 缓存控制设置
  cacheControl: {
    m3u8: string;
    segment: string;
    key: string;
    logo: string;
  };
}

/**
 * 默认配置
 */
export const defaultConfig: ProxyConfig = {
  defaultUserAgent: 'AptvPlayer/1.4.10',
  enableVerboseLogging: false,
  allowedOrigins: [], // 空数组表示允许所有域名
  cacheControl: {
    m3u8: 'no-cache',
    segment: 'no-cache',
    key: 'public, max-age=3600',
    logo: 'public, max-age=86400, s-maxage=86400'
  }
};

/**
 * 获取配置
 * @returns 代理配置
 */
export function getProxyConfig(): ProxyConfig {
  // 解析允许的域名列表
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '';
  const allowedOrigins = allowedOriginsEnv 
    ? allowedOriginsEnv.split(',').map(origin => origin.trim()).filter(origin => origin)
    : [];

  return {
    ...defaultConfig,
    // 可以通过环境变量覆盖配置
    defaultUserAgent: process.env.DEFAULT_USER_AGENT || defaultConfig.defaultUserAgent,
    enableVerboseLogging: process.env.VERBOSE_LOGGING === 'true',
    allowedOrigins
  };
}

/**
 * 日志输出函数
 * @param message 日志信息
 * @param data 额外数据
 */
export function logInfo(message: string, data?: any): void {
  const config = getProxyConfig();
  if (config.enableVerboseLogging) {
    console.log(`[TVCors Proxy] ${message}`, data ? data : '');
  }
}

/**
 * 错误日志输出
 * @param message 错误信息
 * @param error 错误对象
 */
export function logError(message: string, error?: any): void {
  console.error(`[TVCors Proxy Error] ${message}`, error ? error : '');
}

/**
 * 验证请求来源是否允许访问
 * @param request 请求对象
 * @param allowedOrigins 允许的域名列表
 * @returns 是否允许访问
 */
export function isOriginAllowed(request: Request, allowedOrigins: string[]): boolean {
  // 如果没有配置允许的域名，则允许所有访问
  if (allowedOrigins.length === 0) {
    return true;
  }

  // 获取请求来源
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // 检查 Origin 头
  if (origin) {
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return true;
    }
    
    // 检查是否匹配通配符模式
    for (const allowedOrigin of allowedOrigins) {
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        if (regex.test(origin)) {
          return true;
        }
      }
    }
  }
  
  // 检查 Referer 头（作为备选）
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      
      if (allowedOrigins.includes('*') || allowedOrigins.includes(refererOrigin)) {
        return true;
      }
      
      // 检查通配符模式
      for (const allowedOrigin of allowedOrigins) {
        if (allowedOrigin.includes('*')) {
          const pattern = allowedOrigin.replace(/\*/g, '.*');
          const regex = new RegExp(`^${pattern}$`);
          if (regex.test(refererOrigin)) {
            return true;
          }
        }
      }
    } catch (error) {
      // Referer URL 解析失败，忽略
    }
  }
  
  return false;
}

/**
 * 设置基于来源的CORS响应头
 * @param headers Headers对象
 * @param request 请求对象
 * @param allowedOrigins 允许的域名列表
 */
export function setCorsHeadersWithOrigin(headers: Headers, request: Request, allowedOrigins: string[]): void {
  // 如果没有限制，使用通用CORS设置
  if (allowedOrigins.length === 0) {
    setCorsHeaders(headers);
    return;
  }
  
  // 获取请求来源
  const origin = request.headers.get('origin');
  
  if (origin && isOriginAllowed(request, allowedOrigins)) {
    headers.set('Access-Control-Allow-Origin', origin);
  } else {
    // 如果来源不在允许列表中，不设置CORS头（或者设置为null）
    headers.set('Access-Control-Allow-Origin', 'null');
  }
  
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Range, Origin, Accept');
  headers.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
  headers.set('Access-Control-Allow-Credentials', 'true');
}

/**
 * 设置标准CORS响应头（允许所有来源）
 * @param headers Headers对象
 */
export function setCorsHeaders(headers: Headers): void {
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Range, Origin, Accept');
  headers.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
}

/**
 * 创建错误响应
 * @param message 错误信息
 * @param status HTTP状态码
 * @param request 请求对象（可选，用于域名验证）
 * @returns Response对象
 */
export function createErrorResponse(message: string, status: number = 500, request?: Request): Response {
  const headers = new Headers();
  
  if (request) {
    const config = getProxyConfig();
    if (config.allowedOrigins.length > 0) {
      setCorsHeadersWithOrigin(headers, request, config.allowedOrigins);
    } else {
      setCorsHeaders(headers);
    }
  } else {
    setCorsHeaders(headers);
  }
  
  headers.set('Content-Type', 'application/json');
  
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers }
  );
}