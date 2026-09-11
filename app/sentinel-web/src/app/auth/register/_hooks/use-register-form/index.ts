import {
    SignUpError,
    useSignUpMutation,
    useVerifyOtpMutation,
    VerifyOtpError,
} from '@sentinel/hooks';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useRef, useCallback } from 'react';
import { RegisterSchema, RegisterSchemaType } from '@sentinel/shared/schema';
import { TurnstileRef } from '@sentinel/ui';
import { config } from '@/lib/config';
import { useRouter } from 'next/navigation';

export function useRegisterForm() {
    const router = useRouter();
    const [step, setStep] = useState<'details' | 'verify'>('details');
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [authError, setAuthError] = useState<string | null>(null);
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const turnstileRef = useRef<TurnstileRef>(null);

    const form = useForm<RegisterSchemaType>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            terms: false,
            captchaToken: undefined,
        },
    });

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const interval = setInterval(() => {
            setResendCooldown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [resendCooldown]);

    const { mutate: signUp, isPending: isLoading } = useSignUpMutation({
        onSuccess: (data) => {
            const emailToVerify = form.getValues('email') || (data.user as any)?.email || registeredEmail;
            setRegisteredEmail(emailToVerify);
            router.push(`/auth/confirm-code?email=${encodeURIComponent(emailToVerify)}`);
        },
        onError: (error: SignUpError) => {
            setAuthError(error.message);
            setCaptchaToken(null);
            turnstileRef.current?.reset();
        },
    });

    const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtpMutation({
        onSuccess: (data) => {
            if (data.session) {
                router.push('/onboarding');
                router.refresh();
            } else {
                router.push('/auth/login');
            }
        },
        onError: (error: VerifyOtpError) => {
            setVerifyError(error.message);
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

    const onSubmit = (data: RegisterSchemaType) => {
        setAuthError(null);
        setSuccessMessage(null);
        const resolvedToken = captchaToken || data.captchaToken || form.getValues('captchaToken');

        if (process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY && !resolvedToken) {
            setAuthError('Please complete the security check before creating an account.');
            return;
        }

        const appUrl =
            typeof window !== 'undefined' && window.location.origin
                ? window.location.origin
                : config.appUrl;

        signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    first_name: data.firstName,
                    last_name: data.lastName,
                    role: 'student',
                },
                emailRedirectTo: `${appUrl}/auth/callback`,
                captchaToken: resolvedToken || undefined,
            },
            captchaToken: resolvedToken || undefined,
        } as any);
    };

    const handleVerifyOtp = (token: string) => {
        setVerifyError(null);
        verifyOtp({
            email: registeredEmail,
            token,
            type: 'signup',
        });
    };

    const handleResendOtp = () => {
        if (resendCooldown > 0) return;
        setVerifyError(null);
        setSuccessMessage(null);
        const appUrl =
            typeof window !== 'undefined' && window.location.origin
                ? window.location.origin
                : config.appUrl;

        signUp({
            email: registeredEmail,
            password: form.getValues('password'),
            options: {
                data: {
                    first_name: form.getValues('firstName'),
                    last_name: form.getValues('lastName'),
                    role: 'student',
                },
                emailRedirectTo: `${appUrl}/auth/callback`,
                captchaToken: captchaToken || undefined,
            },
            captchaToken: captchaToken || undefined,
        } as any);
        setResendCooldown(60);
        setSuccessMessage('A fresh verification code has been dispatched.');
    };

    const handleBackToDetails = () => {
        setStep('details');
        setVerifyError(null);
        setAuthError(null);
        setSuccessMessage(null);
        setCaptchaToken(null);
        form.setValue('captchaToken', undefined);
        turnstileRef.current?.reset();
    };

    return {
        form,
        step,
        registeredEmail,
        authError,
        verifyError,
        successMessage,
        isLoading,
        isVerifying,
        resendCooldown,
        turnstileRef,
        captchaToken,
        onCaptchaSuccess,
        onCaptchaExpire,
        onSubmit: form.handleSubmit(onSubmit),
        onVerifyOtp: handleVerifyOtp,
        onResendOtp: handleResendOtp,
        onBackToDetails: handleBackToDetails,
    };
}
