const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isGithubPages = process.env.GITHUB_PAGES === 'true';
const basePath = isGithubPages && repoName ? `/${repoName}` : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: false
  }
};

export default nextConfig;
