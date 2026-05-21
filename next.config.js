const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
const isGithubPages = process.env.GITHUB_PAGES === 'true' || isGithubActions;
const basePath = isGithubPages ? '/NateEyeView' : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath ? `${basePath}/` : '',
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: false
  }
};

module.exports = nextConfig;
