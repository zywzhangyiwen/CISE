/** @type {import('next').NextConfig} */
const nextConfig = {
  // 关键配置：告诉 Next.js 在构建项目时，忽略 ESLint 的错误。
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // 如果你有其他配置，可以加在这里
};

module.exports = nextConfig;