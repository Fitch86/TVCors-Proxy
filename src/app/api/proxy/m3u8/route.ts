/* eslint-disable no-console,@typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { 
  getBaseUrl, 
  resolveUrl, 
  getProxyConfig, 
  logInfo, 
  logError, 
  setCorsHeaders,
  setCorsHeadersWithOrigin,
  isOriginAllowed,
  createErrorResponse 
} from "@/lib/utils";

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const allowCORS = searchParams.get('allowCORS') === 'true';
  const userAgent = searchParams.get('ua');
  
  const config = getProxyConfig();
  
  // 验证域名访问权限
  if (config.allowedOrigins.length > 0 && !isOriginAllowed(request, config.allowedOrigins)) {
    logError('Access denied: Origin not allowed', { 
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
      allowedOrigins: config.allowedOrigins
    });
    return createErrorResponse('Access denied: Origin not allowed', 403, request);
  }
  
  if (!url) {
    logError('Missing URL parameter');
    return createErrorResponse('Missing url parameter', 400, request);
  }
  const ua = userAgent || config.defaultUserAgent;

  let response: Response | null = null;
  let responseUsed = false;

  try {
    const decodedUrl = decodeURIComponent(url);
    logInfo('Fetching M3U8', { url: decodedUrl, allowCORS });

    response = await fetch(decodedUrl, {
      cache: 'no-cache',
      redirect: 'follow',
      credentials: 'same-origin',
      headers: {
        'User-Agent': ua,
      },
    });

    if (!response.ok) {
      logError('Failed to fetch M3U8', { status: response.status, statusText: response.statusText });
      return createErrorResponse('Failed to fetch m3u8', 500, request);
    }

    const contentType = response.headers.get('Content-Type') || '';
    
    // 重写M3U8内容
    if (contentType.toLowerCase().includes('mpegurl') || contentType.toLowerCase().includes('octet-stream')) {
      // 获取最终的响应URL（处理重定向后的URL）
      const finalUrl = response.url;
      const m3u8Content = await response.text();
      responseUsed = true; // 标记 response 已被使用

      // 使用最终的响应URL作为baseUrl，而不是原始的请求URL
      const baseUrl = getBaseUrl(finalUrl);

      // 重写 M3U8 内容
      const modifiedContent = rewriteM3U8Content(m3u8Content, baseUrl, request, allowCORS);

      const headers = new Headers();
      headers.set('Content-Type', contentType);
      if (config.allowedOrigins.length > 0) {
        setCorsHeadersWithOrigin(headers, request, config.allowedOrigins);
      } else {
        setCorsHeaders(headers);
      }
      headers.set('Cache-Control', config.cacheControl.m3u8);
      
      logInfo('M3U8 content rewritten successfully');
      return new Response(modifiedContent, { headers });
    }
    
    // 直接代理
    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('Content-Type') || 'application/vnd.apple.mpegurl');
    if (config.allowedOrigins.length > 0) {
      setCorsHeadersWithOrigin(headers, request, config.allowedOrigins);
    } else {
      setCorsHeaders(headers);
    }
    headers.set('Cache-Control', config.cacheControl.m3u8);

    logInfo('M3U8 proxied directly');
    // 直接返回视频流
    return new Response(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    logError('Error processing M3U8 request', error);
    return createErrorResponse('Failed to fetch m3u8', 500, request);
  } finally {
    // 确保 response 被正确关闭以释放资源
    if (response && !responseUsed) {
      try {
        response.body?.cancel();
      } catch (error) {
        // 忽略关闭时的错误
        logError('Failed to close response body', error);
      }
    }
  }
}

/**
 * 重写M3U8内容，替换其中的URL为代理URL
 * @param content M3U8内容
 * @param baseUrl 基础URL
 * @param req 请求对象
 * @param allowCORS 是否允许直接CORS
 * @returns 重写后的M3U8内容
 */
function rewriteM3U8Content(content: string, baseUrl: string, req: Request, allowCORS: boolean): string {
  // 从 referer 头提取协议信息
  const referer = req.headers.get('referer');
  let protocol = 'http';
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      protocol = refererUrl.protocol.replace(':', '');
    } catch (error) {
      // ignore
    }
  }

  const host = req.headers.get('host');
  const proxyBase = `${protocol}://${host}/api/proxy`;

  const lines = content.split('\n');
  const rewrittenLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // 处理 TS 片段 URL 和其他媒体文件
    if (line && !line.startsWith('#')) {
      const resolvedUrl = resolveUrl(baseUrl, line);
      const proxyUrl = allowCORS ? resolvedUrl : `${proxyBase}/segment?url=${encodeURIComponent(resolvedUrl)}`;
      rewrittenLines.push(proxyUrl);
      continue;
    }

    // 处理 EXT-X-MAP 标签中的 URI
    if (line.startsWith('#EXT-X-MAP:')) {
      line = rewriteMapUri(line, baseUrl, proxyBase);
    }

    // 处理 EXT-X-KEY 标签中的 URI
    if (line.startsWith('#EXT-X-KEY:')) {
      line = rewriteKeyUri(line, baseUrl, proxyBase);
    }

    // 处理嵌套的 M3U8 文件 (EXT-X-STREAM-INF)
    if (line.startsWith('#EXT-X-STREAM-INF:')) {
      rewrittenLines.push(line);
      // 下一行通常是 M3U8 URL
      if (i + 1 < lines.length) {
        i++;
        const nextLine = lines[i].trim();
        if (nextLine && !nextLine.startsWith('#')) {
          const resolvedUrl = resolveUrl(baseUrl, nextLine);
          const proxyUrl = `${proxyBase}/m3u8?url=${encodeURIComponent(resolvedUrl)}`;
          rewrittenLines.push(proxyUrl);
        } else {
          rewrittenLines.push(nextLine);
        }
      }
      continue;
    }

    rewrittenLines.push(line);
  }

  return rewrittenLines.join('\n');
}

/**
 * 重写EXT-X-MAP标签中的URI
 * @param line 包含EXT-X-MAP的行
 * @param baseUrl 基础URL
 * @param proxyBase 代理基础URL
 * @returns 重写后的行
 */
function rewriteMapUri(line: string, baseUrl: string, proxyBase: string): string {
  const uriMatch = line.match(/URI="([^"]+)"/);
  if (uriMatch) {
    const originalUri = uriMatch[1];
    const resolvedUrl = resolveUrl(baseUrl, originalUri);
    const proxyUrl = `${proxyBase}/segment?url=${encodeURIComponent(resolvedUrl)}`;
    return line.replace(uriMatch[0], `URI="${proxyUrl}"`);
  }
  return line;
}

/**
 * 重写EXT-X-KEY标签中的URI
 * @param line 包含EXT-X-KEY的行
 * @param baseUrl 基础URL
 * @param proxyBase 代理基础URL
 * @returns 重写后的行
 */
function rewriteKeyUri(line: string, baseUrl: string, proxyBase: string): string {
  const uriMatch = line.match(/URI="([^"]+)"/);
  if (uriMatch) {
    const originalUri = uriMatch[1];
    const resolvedUrl = resolveUrl(baseUrl, originalUri);
    const proxyUrl = `${proxyBase}/key?url=${encodeURIComponent(resolvedUrl)}`;
    return line.replace(uriMatch[0], `URI="${proxyUrl}"`);
  }
  return line;
}

export async function OPTIONS(request: Request) {
  const config = getProxyConfig();
  const headers = new Headers();
  
  if (config.allowedOrigins.length > 0) {
    setCorsHeadersWithOrigin(headers, request, config.allowedOrigins);
  } else {
    setCorsHeaders(headers);
  }
  
  return new Response(null, { status: 200, headers });
}