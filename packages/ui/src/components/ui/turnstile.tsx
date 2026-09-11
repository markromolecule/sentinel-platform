'use client';

import * as React from 'react';
import { useEffect, useRef } from 'react';

declare global {
    interface Window {
        turnstile?: {
            render: (
                container: string | HTMLElement,
                params: {
                    sitekey: string;
                    theme?: 'light' | 'dark' | 'auto';
                    callback?: (token: string) => void;
                    'error-callback'?: () => void;
                    'expired-callback'?: () => void;
                },
            ) => string;
            reset: (widgetId?: string) => void;
            remove: (widgetId?: string) => void;
        };
    }
}

declare const process: any;

export interface TurnstileRef {
    reset: () => void;
}

export interface TurnstileProps {
    siteKey?: string;
    onSuccess: (token: string) => void;
    onError?: () => void;
    onExpire?: () => void;
    theme?: 'light' | 'dark' | 'auto';
    className?: string;
}

export const Turnstile = React.forwardRef<TurnstileRef, TurnstileProps>(
    (
        {
            siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY,
            onSuccess,
            onError,
            onExpire,
            theme = 'dark',
            className,
        },
        ref,
    ) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const widgetIdRef = useRef<string | null>(null);

        React.useImperativeHandle(ref, () => ({
            reset: () => {
                if (widgetIdRef.current && window.turnstile) {
                    try {
                        window.turnstile.reset(widgetIdRef.current);
                    } catch (e) {
                        console.error('Failed to reset Turnstile:', e);
                    }
                }
            },
        }));

        useEffect(() => {
            if (!siteKey) {
                console.warn(
                    'Turnstile: siteKey is not configured (NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY). The CAPTCHA widget will not render.',
                );
                return;
            }

            let isMounted = true;

            const renderWidget = () => {
                if (!containerRef.current || !window.turnstile || widgetIdRef.current) return;
                try {
                    widgetIdRef.current = window.turnstile.render(containerRef.current, {
                        sitekey: siteKey,
                        theme,
                        callback: (token: string) => {
                            if (isMounted) onSuccess(token);
                        },
                        'error-callback': () => {
                            if (isMounted) onError?.();
                        },
                        'expired-callback': () => {
                            if (isMounted) onExpire?.();
                        },
                    });
                } catch (err) {
                    console.error('Failed to render Turnstile widget:', err);
                }
            };

            if (window.turnstile) {
                renderWidget();
            } else {
                const interval = setInterval(() => {
                    if (window.turnstile) {
                        clearInterval(interval);
                        renderWidget();
                    }
                }, 50);

                const existingScript = document.getElementById('cf-turnstile-script') as HTMLScriptElement | null;
                if (!existingScript) {
                    const script = document.createElement('script');
                    script.id = 'cf-turnstile-script';
                    script.src =
                        'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
                    script.async = true;
                    script.defer = true;
                    script.onload = () => {
                        clearInterval(interval);
                        renderWidget();
                    };
                    document.head.appendChild(script);
                } else {
                    existingScript.addEventListener('load', () => {
                        clearInterval(interval);
                        renderWidget();
                    });
                }

                return () => {
                    clearInterval(interval);
                    isMounted = false;
                    if (widgetIdRef.current && window.turnstile) {
                        try {
                            window.turnstile.remove(widgetIdRef.current);
                        } catch {
                            // ignore cleanup errors
                        }
                        widgetIdRef.current = null;
                    }
                };
            }

            return () => {
                isMounted = false;
                if (widgetIdRef.current && window.turnstile) {
                    try {
                        window.turnstile.remove(widgetIdRef.current);
                    } catch {
                        // ignore cleanup errors
                    }
                    widgetIdRef.current = null;
                }
            };
        }, [siteKey, theme, onSuccess, onError, onExpire]);

        if (!siteKey) {
            return null;
        }

        return (
            <div className={className || 'flex justify-center my-2'}>
                <div ref={containerRef} className="min-h-[65px]" />
            </div>
        );
    },
);

Turnstile.displayName = 'Turnstile';
