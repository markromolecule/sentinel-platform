import type { NextConfig } from 'next';

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://va.vercel-scripts.com https://accounts.google.com https://apis.google.com https://challenges.cloudflare.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.supabase.co https://lh3.googleusercontent.com https://*.googleusercontent.com https://avatars.githubusercontent.com;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' https://*.sentinelph.tech wss://*.sentinelph.tech https://*.supabase.co wss://*.supabase.co https://*.livekit.cloud wss://*.livekit.cloud https://va.vercel-scripts.com https://vitals.vercel-insights.com https://accounts.google.com https://challenges.cloudflare.com http://localhost:* ws://localhost:* http://127.0.0.1:* ws://127.0.0.1:*;
    media-src 'self' blob: data:;
    worker-src 'self' blob:;
    frame-src 'self' https://accounts.google.com https://challenges.cloudflare.com;
    frame-ancestors 'none';
    form-action 'self' https://accounts.google.com;
    base-uri 'self';
    object-src 'none';
`.replace(/\s{2,}/g, ' ').trim();

const securityHeaders = [
    {
        key: 'Content-Security-Policy',
        value: cspHeader,
    },
    {
        key: 'X-Frame-Options',
        value: 'DENY',
    },
    {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
    },
    {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
    },
    {
        key: 'Permissions-Policy',
        value: 'camera=(self), microphone=(self), geolocation=(), browsing-topics=()',
    },
    {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
    },
    {
        key: 'X-DNS-Prefetch-Control',
        value: 'on',
    },
];

const nextConfig: NextConfig = {
    transpilePackages: [
        '@sentinel/shared',
        '@sentinel/ui',
        '@sentinel/hooks',
        '@sentinel/services',
    ],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.supabase.co',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: securityHeaders,
            },
        ];
    },
};

export default nextConfig;

