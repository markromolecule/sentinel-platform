import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /* config options here */
    transpilePackages: ['@sentinel/shared', '@sentinel/ui'],
};

export default nextConfig;
