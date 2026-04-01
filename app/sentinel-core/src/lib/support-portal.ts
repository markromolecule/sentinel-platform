const SUPPORT_PORTAL_FALLBACK =
    process.env.NODE_ENV === 'development'
        ? 'http://localhost:3003'
        : 'https://support.sentinelph.tech';

export function getSupportPortalUrl() {
    const candidate = process.env.NEXT_PUBLIC_SUPPORT_URL;

    if (!candidate) return SUPPORT_PORTAL_FALLBACK;

    try {
        const url = new URL(candidate);
        const hostname = url.hostname.toLowerCase();
        const isLoopbackHost =
            hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';

        if (process.env.NODE_ENV === 'production' && isLoopbackHost) {
            return SUPPORT_PORTAL_FALLBACK;
        }

        return url.toString().replace(/\/+$/, '');
    } catch {
        return SUPPORT_PORTAL_FALLBACK;
    }
}
