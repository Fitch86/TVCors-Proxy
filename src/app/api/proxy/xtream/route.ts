/* eslint-disable no-console */

import { NextResponse } from 'next/server';
import { getProxyConfig, isOriginAllowed, setCorsHeadersWithOrigin } from '@/lib/utils';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  const config = getProxyConfig();
  
  // 验证域名访问权限
  if (!isOriginAllowed(request, config.allowedOrigins)) {
    console.warn(`Xtream proxy access denied for request`);
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const decodedUrl = decodeURIComponent(url);
    
    // 构建查询参数（排除url参数）
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== 'url') {
        params.append(key, value);
      }
    });

    // 构建完整请求URL
    const targetUrl = params.toString() ? `${decodedUrl}?${params.toString()}` : decodedUrl;
    
    console.log(`Xtream Proxy: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': config.defaultUserAgent,
      },
      cache: 'no-cache',
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error(`Failed to fetch Xtream API: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { 
          error: `Failed to fetch Xtream API: ${response.statusText}`,
          status: response.status 
        },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'application/json';
    const responseData = await response.text();

    // 创建响应头
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'no-cache');
    
    // 设置CORS头
    setCorsHeadersWithOrigin(headers, request, config.allowedOrigins);

    // 返回代理响应
    return new Response(responseData, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Xtream proxy error:', error);
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