/* eslint-disable no-console,@typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
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
  const url = searchParams.get('url');
  const userAgent = searchParams.get('ua');
  
  const config = getProxyConfig();
  
  // 验证域名访问权限
  if (config.allowedOrigins.length > 0 && !isOriginAllowed(request, config.allowedOrigins)) {
    logError('Access denied: Origin not allowed');
    return createErrorResponse('Access denied: Origin not allowed', 403, request);
  }
  
  if (!url) {
    logError('Missing URL parameter');
    return createErrorResponse('Missing url parameter', 400, request);
  }

  const ua = userAgent || config.defaultUserAgent;

  try {
    const decodedUrl = decodeURIComponent(url);
    logInfo('Fetching encryption key', { url: decodedUrl });
    
    const response = await fetch(decodedUrl, {
      headers: {
        'User-Agent': ua,
      },
    });
    
    if (!response.ok) {
      logError('Failed to fetch key', { status: response.status, statusText: response.statusText });
      return createErrorResponse('Failed to fetch key', 500, request);
    }
    
    const keyData = await response.arrayBuffer();
    
    const headers = new Headers();
    headers.set('Content-Type', 'application/octet-stream');
    if (config.allowedOrigins.length > 0) {
      setCorsHeadersWithOrigin(headers, request, config.allowedOrigins);
    } else {
      setCorsHeaders(headers);
    }
    headers.set('Cache-Control', config.cacheControl.key);
    
    logInfo('Encryption key fetched successfully');
    return new Response(keyData, { headers });
  } catch (error) {
    logError('Error processing key request', error);
    return createErrorResponse('Failed to fetch key', 500, request);
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