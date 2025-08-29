/* eslint-disable no-console */

import { NextResponse } from 'next/server';
import { getProxyConfig, isOriginAllowed, setCorsHeadersWithOrigin } from '@/lib/utils';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const url = searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  const config = getProxyConfig();
  
  // 验证域名访问权限
  if (!isOriginAllowed(request, config.allowedOrigins)) {
    console.warn(`M3U proxy access denied for request`);
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const decodedUrl = decodeURIComponent(url);
    
    console.log(`M3U Proxy: ${decodedUrl}`);

    const response = await fetch(decodedUrl, {
      headers: {
        'User-Agent': config.defaultUserAgent,
        'Accept': 'application/x-mpegURL,audio/x-mpegurl,application/vnd.apple.mpegurl,text/plain,*/*',
      },
      cache: 'no-cache',
      redirect: 'follow',
      // 设置超时时间为30秒
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.error(`Failed to fetch M3U: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch M3U: ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    const m3uContent = await response.text();

    // 判断是否为M3U/M3U8内容
    const isM3UContent = contentType.toLowerCase().includes('mpegurl') || 
                        contentType.toLowerCase().includes('m3u') ||
                        m3uContent.startsWith('#EXTM3U') ||
                        decodedUrl.toLowerCase().includes('.m3u');

    // 创建响应头
    const headers = new Headers();
    // 强制设置正确的Content-Type for M3U files
    if (isM3UContent) {
      headers.set('Content-Type', 'application/x-mpegURL; charset=utf-8');
    } else {
      headers.set('Content-Type', contentType || 'text/plain; charset=utf-8');
    }
    headers.set('Cache-Control', config.cacheControl.m3u8);
    // 强制在浏览器中显示而不是下载
    headers.set('Content-Disposition', 'inline');
    
    // 设置CORS头
    setCorsHeadersWithOrigin(headers, request, config.allowedOrigins);

    // 返回原始M3U内容，不进行任何URL重写
    return new Response(m3uContent, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('M3U proxy error:', error);
    
    // 提供更详细的错误信息
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        errorMessage = 'Request timeout - The target server did not respond within 30 seconds';
        statusCode = 504;
      } else if (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND')) {
        errorMessage = 'Failed to connect to target server - Network error or DNS resolution failed';
        statusCode = 502;
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Connection refused by target server';
        statusCode = 502;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error',
        url: url ? decodeURIComponent(url) : 'undefined'
      },
      { status: statusCode }
    );
  }
}

export async function OPTIONS(request: Request) {
  // 处理预检请求
  const config = getProxyConfig();
  
  if (!isOriginAllowed(request, config.allowedOrigins)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const headers = new Headers();
  setCorsHeadersWithOrigin(headers, request, config.allowedOrigins);
  
  return new Response(null, {
    status: 200,
    headers,
  });
}