/**
 * Environment configuration for the Sentinel application.
 * Automatically detects development vs production environment.
 */

// Domain configuration
const PRODUCTION_DOMAIN = 'sentinelph.tech';
const APP_SUBDOMAIN = `support.${PRODUCTION_DOMAIN}`;

function normalizePublicUrl(value?: string | null) {
    if (!value) return null;

    try {
        const url = new URL(value);
        const hostname = url.hostname.toLowerCase();
        const isLoopbackHost =
            hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';

        if (process.env.NODE_ENV === 'production' && isLoopbackHost) {
            return null;
        }

        return url.toString().replace(/\/+$/, '');
    } catch {
        return null;
    }
}

const isDevelopment =
    process.env.NODE_ENV === 'development' &&
    !normalizePublicUrl(process.env.NEXT_PUBLIC_APP_URL)?.includes(PRODUCTION_DOMAIN);

export const config = {
    // Frontend URLs
    appUrl:
        normalizePublicUrl(process.env.NEXT_PUBLIC_APP_URL) ||
        (isDevelopment ? 'http://localhost:3003' : `https://${APP_SUBDOMAIN}`),

    // Backend API URLs
    apiUrl:
        normalizePublicUrl(process.env.NEXT_PUBLIC_API_URL) ||
        (isDevelopment ? 'http://localhost:3001' : `https://api.${PRODUCTION_DOMAIN}`),

    // Domain info
    domain: PRODUCTION_DOMAIN,
    appSubdomain: APP_SUBDOMAIN,

    // Environment flags
    isDevelopment,
    isProduction: !isDevelopment,
};

export default config;
