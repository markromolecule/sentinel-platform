/**
 * Environment configuration for the Sentinel application.
 * Automatically detects development vs production environment.
 */

const isDevelopment =
    process.env.NODE_ENV === 'development' &&
    !process.env.NEXT_PUBLIC_APP_URL?.includes('sentinelph.tech');

// Domain configuration
const PRODUCTION_DOMAIN = 'sentinelph.tech';
const APP_SUBDOMAIN = `app.${PRODUCTION_DOMAIN}`;

export const config = {
    // Frontend URLs
    appUrl:
        process.env.NEXT_PUBLIC_APP_URL ||
        (isDevelopment ? 'http://localhost:3000' : `https://${APP_SUBDOMAIN}`),

    // Backend API URLs
    apiUrl:
        process.env.NEXT_PUBLIC_API_URL ||
        (isDevelopment ? 'http://localhost:3001' : `https://api.${PRODUCTION_DOMAIN}`),

    // Domain info
    domain: PRODUCTION_DOMAIN,
    appSubdomain: APP_SUBDOMAIN,

    // Environment flags
    isDevelopment,
    isProduction: !isDevelopment,
};

export default config;
