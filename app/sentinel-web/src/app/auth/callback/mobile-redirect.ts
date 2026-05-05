const DEFAULT_MOBILE_AUTH_CALLBACK_PATH = '/auth/callback';

function normalizePath(url: URL) {
    const path = `${url.host ? `/${url.host}` : ''}${url.pathname}`;
    return path.replace(/\/+/g, '/').replace(/\/$/g, '') || '/';
}

function getConfiguredRedirectPrefixes() {
    return (process.env.MOBILE_AUTH_REDIRECT_PREFIXES || '')
        .split(',')
        .map((prefix) => prefix.trim())
        .filter(Boolean);
}

export function isValidMobileRedirectUrl(redirectTo: string | null) {
    if (!redirectTo) {
        return false;
    }

    if (getConfiguredRedirectPrefixes().some((prefix) => redirectTo.startsWith(prefix))) {
        return true;
    }

    try {
        const url = new URL(redirectTo);
        const normalizedPath = normalizePath(url);

        if (
            url.protocol === 'sentinel-mobile:' &&
            normalizedPath === DEFAULT_MOBILE_AUTH_CALLBACK_PATH
        ) {
            return true;
        }

        if (
            (url.protocol === 'exp:' || url.protocol === 'exps:') &&
            url.pathname.endsWith('/--/auth/callback')
        ) {
            return true;
        }

        if (
            url.protocol === 'https:' &&
            url.hostname === 'auth.expo.io' &&
            url.pathname.endsWith(DEFAULT_MOBILE_AUTH_CALLBACK_PATH)
        ) {
            return true;
        }
    } catch {
        return false;
    }

    return false;
}

export function createMobileRedirectUrl(
    redirectTo: string,
    params: Record<string, string | undefined>,
) {
    const hashParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            hashParams.set(key, value);
        }
    });

    const separator = redirectTo.includes('#') ? '&' : '#';
    const hash = hashParams.toString();

    return hash ? `${redirectTo}${separator}${hash}` : redirectTo;
}
