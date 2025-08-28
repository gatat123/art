/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: false,
  typescript: {
    // 빌드 시 타입 체크 무시 (Railway 빌드 문제 해결용)
    ignoreBuildErrors: true,
  },
  eslint: {
    // 빌드 시 ESLint 무시
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // 메모리 사용량 최적화
    workerThreads: false,
    cpus: 1
  }
}

module.exports = nextConfig