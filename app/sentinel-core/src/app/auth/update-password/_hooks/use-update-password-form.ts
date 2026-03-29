import { useUpdatePasswordMutation } from "@sentinel/hooks";
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { UpdatePasswordSchema, UpdatePasswordSchemaType } from '@sentinel/shared/schema';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createSupabaseClient } from '@/data/supabase/client';

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
    const supabase = createSupabaseClient();

    const form = useForm<UpdatePasswordSchemaType>({
        resolver: zodResolver(UpdatePasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    useEffect(() => {
        let mounted = true;

        const verifySession = async () => {
            try {
                const sessionTokens = getSessionTokensFromHash();

                if (sessionTokens) {
                    const { data, error } = await supabase.auth.setSession({
                        access_token: sessionTokens.accessToken,
                        refresh_token: sessionTokens.refreshToken,
                    });

                    if (error) throw error;

                    if (typeof window !== 'undefined') {
                        const cleanUrl = `${window.location.pathname}${window.location.search}`;
                        window.history.replaceState(window.history.state, '', cleanUrl);
                    }

                    if (!data.session && mounted) {
                        setAuthError(
                            'Your invite link may have expired or is invalid. Please request a new one.',
                        );
                    }

                    return;
                }

                const {
                    data: { session },
                    error,
                } = await supabase.auth.getSession();

                if (error) throw error;

                if (!session && mounted) {
                    setAuthError(
                        'Your invite link may have expired or is invalid. Please request a new one.',
                    );
                }
            } catch (err) {
                if (mounted) {
                    const message =
                        err instanceof Error ? err.message : 'An unexpected error occurred';
                    setAuthError(message);
                }
            } finally {
                if (mounted) setIsVerifying(false);
            }
        };

        verifySession();

        // Listen for standard auth events
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' && mounted) {
                setAuthError('Session expired. Please request a new invite.');
            } else if (session && mounted) {
                setAuthError(null);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [supabase]);

    const { mutate: updatePassword, isPending: isMutationLoading } = useUpdatePasswordMutation({
        onSuccess: () => {
            toast.success('Account setup complete!');

            // Push to dashboard. Since they are already logged in (via the invite link)
            // and just updated their password, the session remains fully valid.
            setTimeout(() => {
                router.push('/dashboard');
            }, 500);
        },
        onError: (error) => {
            setAuthError(error.message);
            toast.error('Failed to set password. Please try again.');
        },
    });

    const onSubmit = (data: UpdatePasswordSchemaType) => {
        setAuthError(null);
        updatePassword({ password: data.password });
    };

    return {
        form,
        authError,
        isLoading: isMutationLoading || isVerifying,
        onSubmit: form.handleSubmit(onSubmit),
    };
}
