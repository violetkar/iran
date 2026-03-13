/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SITE_URL: 'https://mp-action.netlify.app',
  },
};

module.exports = nextConfig;
