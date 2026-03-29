import { useUpdatePasswordMutation } from '@sentinel/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { UpdatePasswordSchema, UpdatePasswordSchemaType } from '@sentinel/shared/schema';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createSupabaseClient } from '@/data/supabase/client';
import { Session } from '@supabase/supabase-js';

function getSessionTokensFromHash() {
    if (typeof window === 'undefined') return null;

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (!accessToken || !refreshToken) {
        return null;
    }

    return { accessToken, refreshToken };
}

export function useUpdatePasswordForm() {
    const router = useRouter();
    const [authError, setAuthError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(true);
    const hasDetectedSession = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const form = useForm<UpdatePasswordSchemaType>({
        resolver: zodResolver(UpdatePasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const supabase = createSupabaseClient();

    useEffect(() => {
        let isMounted = true;

        // 1. Initial detection of intent
        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        const hasTokenInUrl = hash.includes('access_token=') || hash.includes('code=');

        console.log('UpdatePassword Hook: URL has token:', hasTokenInUrl);

        // 2. Auth Listener
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('UpdatePassword Auth Event:', event, 'Session active:', !!session);

            if (session) {
                hasDetectedSession.current = true;
                setAuthError(null);
                setIsVerifying(false);
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
            } else if (event === 'SIGNED_OUT') {
                hasDetectedSession.current = false;
            }
        });

        // 3. Helper to settle verification
        const settleVerification = (session: Session | null) => {
            if (session) {
                hasDetectedSession.current = true;
                setAuthError(null);
            } else if (!hasTokenInUrl) {
                // If there's no token in the URL and no session, we can fail early
                console.log(
                    'UpdatePassword: No token in URL and no session found. Showing form anyway.',
                );
            }
            setIsVerifying(false);
        };

        // 4. Initial Check with Timeout
        const checkSession = async () => {
            const sessionTokens = getSessionTokensFromHash();

            if (sessionTokens) {
                console.log('UpdatePassword: Hydrating session from URL fragment...');
                const { data, error } = await supabase.auth.setSession({
                    access_token: sessionTokens.accessToken,
                    refresh_token: sessionTokens.refreshToken,
                });

                if (error) {
                    console.error('UpdatePassword: Failed to hydrate session:', error.message);
                    if (isMounted) {
                        setAuthError(
                            'Your invite link is invalid or expired. Please request a new one.',
                        );
                        setIsVerifying(false);
                    }
                    return;
                }

                if (typeof window !== 'undefined') {
                    const cleanUrl = `${window.location.pathname}${window.location.search}`;
                    window.history.replaceState(window.history.state, '', cleanUrl);
                }

                settleVerification(data.session);
                return;
            }

            const {
                data: { session },
            } = await supabase.auth.getSession();
            console.log('UpdatePassword Initial Check: Session active:', !!session);

            if (session) {
                settleVerification(session);
            } else if (hasTokenInUrl) {
                // If we HAVE a token but NO session yet, wait for Supabase to parse it
                console.log(
                    'UpdatePassword: Token detected, waiting for Supabase to parse fragment...',
                );
                timeoutRef.current = setTimeout(() => {
                    console.log('UpdatePassword: Session settlement timed out после 5s.');
                    if (isMounted) {
                        setIsVerifying(false);
                    }
                }, 5000); // Give it 5 seconds to parse
            } else {
                settleVerification(null);
            }
        };

        checkSession();

        return () => {
            isMounted = false;
            subscription.unsubscribe();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [supabase]);

    const { mutate: updatePassword, isPending: isMutationLoading } = useUpdatePasswordMutation({
        onSuccess: async () => {
            toast.success('Password updated successfully!');
            // Refresh the page to clear the URL
            router.refresh();
            setTimeout(() => {
                router.push('/dashboard');
            }, 500);
        },
        onError: (error) => {
            setAuthError(error.message);
            toast.error('Failed to update password.');
        },
    });

    const onSubmit = async (data: UpdatePasswordSchemaType) => {
        setAuthError(null);

        // Final sanity check for session before calling mutation
        const {
            data: { session },
        } = await supabase.auth.getSession();
        console.log('UpdatePassword OnSubmit Check: Session active:', !!session);

        if (!session) {
            setAuthError('Session lost. Please try clicking the link in your email again.');
            toast.error('Session not found.');
            return;
        }

        updatePassword({
            password: data.password,
        });
    };

    return {
        form,
        authError,
        isLoading: isMutationLoading || isVerifying,
        onSubmit: form.handleSubmit(onSubmit),
    };
}
