import { useState, useEffect, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useVerifyOtpMutation, useAuth } from '@sentinel/hooks';

export function useConfirmCodeForm() {
    const router = useRouter();
    const params = useLocalSearchParams<{ email?: string }>();
    const email = params.email ? decodeURIComponent(params.email) : '';

    const { supabase } = useAuth();
    const [token, setToken] = useState('');
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(
        email ? 'A 6-digit verification code was sent to your email.' : null,
    );
    const [resendCooldown, setResendCooldown] = useState(60);
    const [isResending, setIsResending] = useState(false);

    // Cooldown interval timer
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const interval = setInterval(() => {
            setResendCooldown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [resendCooldown]);

    const verifyOtpMutation = useVerifyOtpMutation({
        onSuccess: () => {
            // Strict requirement: Immediately redirect to onboarding upon OTP verification
            router.replace('/(onboarding)');
        },
        onError: (error) => {
            setVerifyError(error.message);
            setToken('');
        },
    });

    const handleVerify = useCallback(
        (codeToVerify?: string) => {
            const cleanToken = (codeToVerify ?? token).trim();
            if (cleanToken.length !== 6) {
                setVerifyError('Please enter the complete 6-digit verification code.');
                return;
            }
            if (!email) {
                setVerifyError('Email address is missing. Please return to registration.');
                return;
            }
            setVerifyError(null);
            verifyOtpMutation.mutate({
                email,
                token: cleanToken,
                type: 'signup',
            });
        },
        [token, email, verifyOtpMutation],
    );

    // Auto-trigger verification when 6 digits are typed
    useEffect(() => {
        if (token.length === 6 && !verifyOtpMutation.isPending) {
            handleVerify(token);
        }
    }, [token, handleVerify, verifyOtpMutation.isPending]);

    const handleResend = async () => {
        if (resendCooldown > 0 || isResending || verifyOtpMutation.isPending || !email) {
            return;
        }
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

    const handleTokenChange = (val: string) => {
        setVerifyError(null);
        setToken(val);
    };

    const handleBackToRegister = () => {
        router.replace('/(auth)/register');
    };

    return {
        email,
        token,
        verifyError,
        successMessage,
        isVerifying: verifyOtpMutation.isPending,
        isResending,
        resendCooldown,
        onTokenChange: handleTokenChange,
        onVerify: () => handleVerify(),
        onResend: handleResend,
        onBackToRegister: handleBackToRegister,
    };
}
