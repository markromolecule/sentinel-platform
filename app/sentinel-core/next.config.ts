import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /* config options here */
    transpilePackages: [
        '@sentinel/shared',
        '@sentinel/ui',
        '@sentinel/hooks',
        '@sentinel/services',
    ],
};

export default nextConfig;
