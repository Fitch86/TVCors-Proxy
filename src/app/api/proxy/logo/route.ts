/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server';
import { 
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
  const imageUrl = searchParams.get('url');
  const userAgent = searchParams.get('ua');

  const config = getProxyConfig();
  
  // 验证域名访问权限
  if (config.allowedOrigins.length > 0 && !isOriginAllowed(request, config.allowedOrigins)) {
    logError('Access denied: Origin not allowed');
    return createErrorResponse('Access denied: Origin not allowed', 403, request);
  }

  if (!imageUrl) {
    logError('Missing image URL parameter');
    return createErrorResponse('Missing image URL', 400, request);
  }

  const ua = userAgent || config.defaultUserAgent;

  try {
    const decodedUrl = decodeURIComponent(imageUrl);
    logInfo('Fetching image', { url: decodedUrl });
    
    const imageResponse = await fetch(decodedUrl, {
      cache: 'no-cache',
      redirect: 'follow',
      credentials: 'same-origin',
      headers: {
        'User-Agent': ua,
      },
    });

    if (!imageResponse.ok) {
      logError('Failed to fetch image', { status: imageResponse.status, statusText: imageResponse.statusText });
      return createErrorResponse(
        imageResponse.statusText || 'Failed to fetch image',
        imageResponse.status,
        request
      );
    }

    const contentType = imageResponse.headers.get('content-type');

    if (!imageResponse.body) {
      logError('Image response has no body');
      return createErrorResponse('Image response has no body', 500, request);
    }

    // 创建响应头
    const headers = new Headers();
    if (contentType) {
      headers.set('Content-Type', contentType);
    }

    // 设置CORS和缓存头
    if (config.allowedOrigins.length > 0) {
      setCorsHeadersWithOrigin(headers, request, config.allowedOrigins);
    } else {
      setCorsHeaders(headers);
    }
    headers.set('Cache-Control', config.cacheControl.logo);

    logInfo('Image fetched successfully', { contentType });
    // 直接返回图片流
    return new Response(imageResponse.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    logError('Error processing image request', error);
    return createErrorResponse('Error fetching image', 500, request);
  }
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