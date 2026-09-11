'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVerifyOtpMutation, VerifyOtpError, useAuth } from '@sentinel/hooks';

export function useConfirmCodeForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryEmail = searchParams?.get('email') || '';
    const { supabase } = useAuth();

    const [email, setEmail] = useState(queryEmail);
    const [token, setToken] = useState('');
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(
        queryEmail ? 'A 6-digit verification code was sent to your email.' : null,
    );
    const [resendCooldown, setResendCooldown] = useState(60);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        if (queryEmail && queryEmail !== email) {
            setEmail(queryEmail);
            if (!successMessage) {
                setSuccessMessage('A 6-digit verification code was sent to your email.');
            }
        }
    }, [queryEmail]);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const interval = setInterval(() => {
            setResendCooldown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [resendCooldown]);

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

    const handleVerify = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setVerifyError(null);
        const cleanToken = token.trim();
        if (cleanToken.length !== 6) {
            setVerifyError('Please enter the complete 6-digit verification code.');
            return;
        }
        if (!email) {
            setVerifyError('Email address is missing. Please return to registration.');
            return;
        }

        verifyOtp({
            email,
            token: cleanToken,
            type: 'signup',
        });
    };

    const handleResend = async () => {
        if (resendCooldown > 0 || isResending || !email) return;
        setVerifyError(null);
        setSuccessMessage(null);
        setIsResending(true);

        try {
            if (supabase?.auth?.resend) {
                const { error } = await supabase.auth.resend({
                    type: 'signup',
                    email,
                });
                if (error) {
                    setVerifyError(error.message);
                    return;
                }
            }
            setResendCooldown(60);
            setSuccessMessage('A fresh verification code has been dispatched.');
        } catch (err: any) {
            setVerifyError(err?.message || 'Failed to resend verification code');
        } finally {
            setIsResending(false);
        }
    };

    const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
        setToken(val);
    };

    return {
        email,
        token,
        verifyError,
        successMessage,
        isVerifying,
        isResending,
        resendCooldown,
        onTokenChange: handleTokenChange,
        onSubmit: handleVerify,
        onResend: handleResend,
    };
}
