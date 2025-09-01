/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [],
  },
  output: 'standalone',
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // CORS 跨域现在由各个路由处理器动态处理，基于 ALLOWED_ORIGINS 配置
};

export default nextConfig;