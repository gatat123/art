/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    BUILD_TIME: new Date().toISOString(),
    BUILD_VERSION: '0.1.2-fix-' + Date.now()
  }
}

module.exports = nextConfig
