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
      },
      cache: 'no-cache',
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error(`Failed to fetch M3U: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch M3U: ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'application/x-mpegURL';
    const m3uContent = await response.text();

    // 创建响应头
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', config.cacheControl.m3u8);
    
    // 设置CORS头
    setCorsHeadersWithOrigin(headers, request, config.allowedOrigins);

    // 返回原始M3U内容，不进行任何URL重写
    return new Response(m3uContent, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('M3U proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
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