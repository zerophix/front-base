import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 实验性功能
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['antd', 'lodash'],
  },
  
  // 编译器优化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // API重写配置 - 将前端API请求代理到内网穿透地址
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NATAPP_BASE_URL || 'http://dolphinmind.natapp1.cc'}/api/:path*`,
      },
    ];
  },
  
  // Webpack配置
  webpack(config) {
    // SVG处理
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  
  // 图片优化
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;