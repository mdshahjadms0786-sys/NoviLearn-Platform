import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  transpilePackages: [
    '@novilearn/types',
    '@novilearn/shared',
    '@novilearn/design-tokens',
  ],
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-slot'],
  },
};

export default nextConfig;
