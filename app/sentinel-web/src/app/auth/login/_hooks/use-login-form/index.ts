import { LoginError, useLoginMutation } from '@sentinel/hooks';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useRef, useCallback } from 'react';
import { LoginSchema } from '@sentinel/shared/schema';
import { LoginSchemaType } from '@sentinel/shared/schema';
import { TurnstileRef } from '@sentinel/ui';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/data/supabase/client';
import { toast } from 'sonner';
import { resolveWebAuthState } from '@/lib/auth/resolve-web-auth-state';
import { REMEMBERED_EMAIL_KEYS } from '@sentinel/shared/constants';

/**
 * Handles manual login for the student/instructor web portal.
 */
export function useLoginForm() {
    const router = useRouter();
    const [authError, setAuthError] = useState<string | null>(null);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const turnstileRef = useRef<TurnstileRef>(null);
    const supabase = createSupabaseClient();

    const form = useForm<LoginSchemaType>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
            remember: false,
        },
    });

    useEffect(() => {
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEYS.WEB);
            if (savedEmail) {
                form.setValue('email', savedEmail);
                form.setValue('remember', true);
            }
        }
    }, [form]);

    const { mutate: login, isPending: isLoading } = useLoginMutation({
        onSuccess: async (data) => {
            const user = data.user;
            if (!user) {
                setAuthError('Could not verify your account after signing in.');
                toast.error('Could not verify your access.');
                return;
            }

            // Handle Remember Me persistence
            if (typeof localStorage !== 'undefined') {
                const rememberMe = form.getValues('remember');
                if (rememberMe) {
                    localStorage.setItem(REMEMBERED_EMAIL_KEYS.WEB, user.email || '');
                } else {
                    localStorage.removeItem(REMEMBERED_EMAIL_KEYS.WEB);
                }
            }

            const authState = await resolveWebAuthState(supabase, user);

            if (authState.role === 'student') {
                await router.refresh();
                if (authState.isFullyOnboarded) {
                    toast.success('Welcome back Student!');
                } else {
                    toast.info('Please complete your onboarding.');
                }

                router.push(authState.destination);
                return;
            }

            if (authState.role === 'instructor') {
                await router.refresh();
                toast.success('Welcome Instructor!');
                router.push(authState.destination);
                return;
            }

            await supabase.auth.signOut();
            setAuthError('Access Denied. This portal is for Students and Instructors only.');
            toast.error('Access Denied.');
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
            setAuthError((prev) => (prev?.toLowerCase().includes('captcha') ? null : prev));
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
