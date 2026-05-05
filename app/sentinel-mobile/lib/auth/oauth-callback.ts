import { supabase } from '@/lib/supabase';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

export type OAuthCallbackSessionResult =
    | {
          status: 'success';
      }
    | {
          status: 'empty';
      };

const DEFAULT_CALLBACK_PATH = 'auth/callback';

function trimSlashes(value: string) {
    return value.replace(/^\/+|\/+$/g, '');
}

export function getMobileAuthCallbackPath() {
    const configuredPath = process.env.EXPO_PUBLIC_MOBILE_AUTH_CALLBACK_PATH;
    return trimSlashes(configuredPath || DEFAULT_CALLBACK_PATH);
}

export function getMobileAuthCallbackUrl() {
    const callbackPath = getMobileAuthCallbackPath();
    return Linking.createURL(callbackPath);
}

export function getExpoAuthProxyRedirectUrl() {
    const configuredProxyUrl = process.env.EXPO_PUBLIC_EXPO_AUTH_PROXY_URL?.trim();

    if (configuredProxyUrl) {
        return configuredProxyUrl.replace(/\/+$/g, '');
    }

    if (Constants.appOwnership === 'expo') {
        const owner = Constants.expoConfig?.owner;
        const slug = Constants.expoConfig?.slug;

        if (owner && slug) {
            return `https://auth.expo.io/@${owner}/${slug}`;
        }
    }

    return null;
}

export function getOAuthProviderRedirectUrl() {
    return getExpoAuthProxyRedirectUrl() || getMobileAuthCallbackUrl();
}

export function getOAuthBrowserStartUrl(authUrl: string) {
    const proxyRedirectUrl = getExpoAuthProxyRedirectUrl();

    if (!proxyRedirectUrl) {
        return authUrl;
    }

    const callbackUrl = getMobileAuthCallbackUrl();
    const startUrl = new URL(`${proxyRedirectUrl}/start`);

    startUrl.searchParams.set('authUrl', authUrl);
    startUrl.searchParams.set('returnUrl', callbackUrl);

    return startUrl.toString();
}

function getCallbackParams(callbackUrl: string) {
    const url = new URL(callbackUrl);
    const params = new URLSearchParams(url.search);

    if (url.hash) {
        const hashParams = new URLSearchParams(url.hash.substring(1));
        hashParams.forEach((value, key) => {
            params.set(key, value);
        });
    }

    return params;
}

export function getOAuthCallbackError(callbackUrl: string) {
    const params = getCallbackParams(callbackUrl);
    return params.get('error') || params.get('error_description');
}

export async function setSessionFromOAuthCallback(
    callbackUrl: string,
): Promise<OAuthCallbackSessionResult> {
    const params = getCallbackParams(callbackUrl);
    const errorMessage = params.get('error') || params.get('error_description');

    if (errorMessage) {
        throw new Error(errorMessage);
    }

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
        return { status: 'empty' };
    }

    const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
    });

    if (error) {
        throw error;
    }

    return { status: 'success' };
}
