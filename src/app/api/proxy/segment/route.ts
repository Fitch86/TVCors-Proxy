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
  // 仅当请求包含 Origin 或 Referer 时才严格校验；
  // 某些片段请求可能不带这些头，此时不阻断，仅通过下方的CORS响应头进行控制。
  const hasOriginOrReferer = !!(request.headers.get('origin') || request.headers.get('referer'));
  if (config.allowedOrigins.length > 0 && hasOriginOrReferer && !isOriginAllowed(request, config.allowedOrigins)) {
    logError('Access denied: Origin not allowed');
    return createErrorResponse('Access denied: Origin not allowed', 403, request);
  }
  
  if (!url) {
    logError('Missing URL parameter');
    return createErrorResponse('Missing url parameter', 400, request);
  }
  const ua = userAgent || config.defaultUserAgent;

  let response: Response | null = null;
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  try {
    const decodedUrl = decodeURIComponent(url);
    logInfo('Fetching video segment', { url: decodedUrl });
    
    response = await fetch(decodedUrl, {
      headers: {
        'User-Agent': ua,
      },
    });
    
    if (!response.ok) {
      logError('Failed to fetch segment', { status: response.status, statusText: response.statusText });
      return createErrorResponse('Failed to fetch segment', 500, request);
    }

    const headers = new Headers();
    headers.set('Content-Type', 'video/mp2t');
    if (config.allowedOrigins.length > 0) {
      setCorsHeadersWithOrigin(headers, request, config.allowedOrigins);
    } else {
      setCorsHeaders(headers);
    }
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', config.cacheControl.segment);
    
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    // 使用流式传输，避免占用内存
    const stream = new ReadableStream({
      start(controller) {
        if (!response?.body) {
          controller.close();
          return;
        }

        reader = response.body.getReader();
        const isCancelled = false;

        function pump() {
          if (isCancelled || !reader) {
            return;
          }

          reader.read().then(({ done, value }) => {
            if (isCancelled) {
              return;
            }

            if (done) {
              controller.close();
              cleanup();
              return;
            }

            controller.enqueue(value);
            pump();
          }).catch((error) => {
            if (!isCancelled) {
              controller.error(error);
              cleanup();
            }
          });
        }

        function cleanup() {
          if (reader) {
            try {
              reader.releaseLock();
            } catch (e) {
              // reader 可能已经被释放，忽略错误
            }
            reader = null;
          }
        }

        pump();
      },
      cancel() {
        // 当流被取消时，确保释放所有资源
        if (reader) {
          try {
            reader.releaseLock();
          } catch (e) {
            // reader 可能已经被释放，忽略错误
          }
          reader = null;
        }

        if (response?.body) {
          try {
            response.body.cancel();
          } catch (e) {
            // 忽略取消时的错误
          }
        }
      }
    });

    logInfo('Video segment streaming started');
    return new Response(stream, { headers });
  } catch (error) {
    // 确保在错误情况下也释放资源
    if (reader) {
      try {
        (reader as ReadableStreamDefaultReader<Uint8Array>).releaseLock();
      } catch (e) {
        // 忽略错误
      }
    }

    if (response?.body) {
      try {
        response.body.cancel();
      } catch (e) {
        // 忽略错误
      }
    }

    logError('Error processing segment request', error);
    return createErrorResponse('Failed to fetch segment', 500, request);
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