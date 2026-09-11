import { LoginError, useLoginMutation } from '@sentinel/hooks';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useRef, useCallback } from 'react';
import { LoginSchema, LoginSchemaType } from '@sentinel/shared/schema';
import { TurnstileRef } from '@sentinel/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { createSupabaseClient } from '@/data/supabase/client';
import { resolveCoreRole } from '../../../../../lib/auth/core-role';
import { REMEMBERED_EMAIL_KEYS } from '@sentinel/shared/constants';

export function useLoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createSupabaseClient();
    const [authError, setAuthError] = useState<string | null>(searchParams.get('error'));
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const turnstileRef = useRef<TurnstileRef>(null);

    const form = useForm<LoginSchemaType>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
            remember: false,
        },
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEYS.CORE);
            if (savedEmail) {
                form.setValue('email', savedEmail);
                form.setValue('remember', true);
            }
        }
    }, [form]);

    const { mutate: login, isPending: isLoading } = useLoginMutation({
        onSuccess: async (data) => {
            const role = resolveCoreRole(data.user);

            if (role) {
                // Handle Remember Me persistence
                const rememberMe = form.getValues('remember');
                if (rememberMe) {
                    localStorage.setItem(REMEMBERED_EMAIL_KEYS.CORE, data.user?.email || '');
                } else {
                    localStorage.removeItem(REMEMBERED_EMAIL_KEYS.CORE);
                }

                await router.refresh();
                toast.success(`Welcome ${role.replace('_', ' ')}!`);
                router.push('/dashboard');
            } else {
                await supabase.auth.signOut();
                setAuthError('Unauthorized. This portal is for Administrators only.');
                toast.error('Unauthorized access attempt.');
            }
        },
        onError: (error: LoginError) => {
            setAuthError(error.message);
            setCaptchaToken(null);
            turnstileRef.current?.reset();
        },
    });

    const onCaptchaSuccess = useCallback(
        (token: string) => {
            setCaptchaToken(token);
            form.setValue('captchaToken', token);
        },
        [form],
    );

    const onCaptchaExpire = useCallback(() => {
        setCaptchaToken(null);
        form.setValue('captchaToken', undefined);
    }, [form]);

    const onSubmit = (data: LoginSchemaType) => {
        setAuthError(null);
        const resolvedToken = captchaToken || data.captchaToken || form.getValues('captchaToken');

        if (process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY && !resolvedToken) {
            setAuthError('Please complete the security check before signing in.');
            return;
        }

        login({
            email: data.email,
            password: data.password,
            captchaToken: resolvedToken,
            options: {
                captchaToken: resolvedToken,
            },
        } as any);
    };

    return {
        form,
        authError,
        isLoading,
        turnstileRef,
        captchaToken,
        onCaptchaSuccess,
        onCaptchaExpire,
        onSubmit: form.handleSubmit(onSubmit),
    };
}
