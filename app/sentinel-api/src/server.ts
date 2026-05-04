import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import app from './app';

const port = 3001;

const PRODUCTION_DOMAIN = 'sentinelph.tech';
const EXPECTED_PRODUCTION_URLS = {
    NEXT_PUBLIC_APP_URL: `https://app.${PRODUCTION_DOMAIN}`,
    NEXT_PUBLIC_WEB_URL: `https://app.${PRODUCTION_DOMAIN}`,
    FRONTEND_URL: `https://app.${PRODUCTION_DOMAIN}`,
    NEXT_PUBLIC_CORE_URL: `https://core.${PRODUCTION_DOMAIN}`,
    CORE_URL: `https://core.${PRODUCTION_DOMAIN}`,
    NEXT_PUBLIC_SUPPORT_URL: `https://support.${PRODUCTION_DOMAIN}`,
    SUPPORT_URL: `https://support.${PRODUCTION_DOMAIN}`,
} as const;

function normalizeUrl(value?: string | null) {
    if (!value) return null;

    try {
        const url = new URL(value);
        return url.toString().replace(/\/+$/, '');
    } catch {
        return null;
    }
}

function validateProductionInviteUrls() {
    if (process.env.NODE_ENV !== 'production') {
        return;
    }

    for (const [envName, expectedUrl] of Object.entries(EXPECTED_PRODUCTION_URLS)) {
        const currentValue = process.env[envName];

        if (!currentValue) {
            continue;
        }

        const normalizedCurrentValue = normalizeUrl(currentValue);

        if (!normalizedCurrentValue) {
            console.warn(
                `[startup] ${envName} is not a valid absolute URL: "${currentValue}". Expected ${expectedUrl}.`,
            );
            continue;
        }

        if (normalizedCurrentValue !== expectedUrl) {
            console.warn(
                `[startup] ${envName} is set to ${normalizedCurrentValue}. Expected ${expectedUrl} for production invite redirects.`,
            );
        }
    }
}

validateProductionInviteUrls();

serve({
    fetch: app.fetch,
    port,
});

const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = isProduction ? 'https://api.sentinelph.tech' : `http://localhost:${port}`;
console.log(`Server is running on ${baseUrl}`);
