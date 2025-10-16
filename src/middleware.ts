/**
 * Next.js 中间件
 * 处理安全防护、CSRF验证等
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  // 迁移兼容：将 /quality/equipment-* 重定向到 /equipment/*
  const match = url.pathname.match(/^\/quality\/equipment-(.+)$/);
  if (match) {
    url.pathname = `/equipment/${match[1]}`;
    return NextResponse.redirect(url, 308);
  }

  const response = NextResponse.next();
  
  // 生成CSP nonce
  const nonce = generateNonce();
  
  // 现代安全响应头
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '0'); // 现代浏览器推荐禁用，依赖CSP
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  
  // 严格的权限策略
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), accelerometer=(), gyroscope=(), magnetometer=(), ambient-light-sensor=()'
  );
  
  // 宽松的内容安全策略 - 避免阻止客户端路由
  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'", // Ant Design需要内联样式
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');
  
  // 仅在生产环境启用严格的CSP
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Content-Security-Policy', cspHeader);
  }
  
  // HSTS (仅在HTTPS环境下)
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // 设置nonce到响应中供客户端使用
  response.headers.set('X-CSP-Nonce', nonce);
  
  return response;
}

// 生成CSP nonce
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

