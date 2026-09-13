import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';
import {
    getMobileAuthCallbackUrl,
    getOAuthBrowserStartUrl,
    getOAuthCallbackError,
    getOAuthProviderRedirectUrl,
    setSessionFromOAuthCallback,
} from './oauth-callback';

// Complete any pending auth sessions on iOS
WebBrowser.maybeCompleteAuthSession();

export interface UseGoogleAuthOptions {
    mode?: 'login' | 'register';
    onSuccess: () => void;
}

export function useGoogleAuth({ mode = 'login', onSuccess }: UseGoogleAuthOptions) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mobileAuthCallbackUrl = getMobileAuthCallbackUrl();
    const oauthProviderRedirectUrl = getOAuthProviderRedirectUrl();

    const signInWithGoogle = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: oauthProviderRedirectUrl,
                    queryParams: {
                        prompt: 'select_account',
                    },
                    skipBrowserRedirect: true,
                },
            });

            if (oauthError) {
                throw oauthError;
            }

            if (!data.url) {
                throw new Error('No OAuth URL returned.');
            }

            if (__DEV__) {
                console.info('Sentinel mobile OAuth callback URL:', mobileAuthCallbackUrl);
                console.info('Sentinel OAuth provider redirect URL:', oauthProviderRedirectUrl);
                console.info('Sentinel mobile OAuth URL:', data.url);
                console.info(
                    'Sentinel browser OAuth start URL:',
                    getOAuthBrowserStartUrl(data.url),
                );
            }

            const result = await WebBrowser.openAuthSessionAsync(
                getOAuthBrowserStartUrl(data.url),
                mobileAuthCallbackUrl,
            );

            if (result.type === 'success' && result.url) {
                const callbackError = getOAuthCallbackError(result.url);
                if (callbackError) {
                    throw new Error(callbackError);
                }

                const sessionResult = await setSessionFromOAuthCallback(result.url);
                if (sessionResult.status === 'success') {
                    onSuccess();
                    return;
                }
            }

            if (result.type === 'cancel' || result.type === 'dismiss') {
                throw new Error(
                    mode === 'login'
                        ? 'Google login was cancelled.'
                        : 'Google registration was cancelled.',
                );
            }

            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData.session) {
                onSuccess();
                return;
            }

            throw new Error('Authentication callback did not include a session.');
        } catch (err: any) {
            const fallbackMessage =
                mode === 'login'
                    ? 'Google login failed. Please try again.'
                    : 'Google registration failed. Please try again.';
            setError(err.message || fallbackMessage);
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        setError,
        signInWithGoogle,
    };
}
