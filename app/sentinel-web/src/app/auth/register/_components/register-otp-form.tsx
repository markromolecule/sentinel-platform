'use client';

import { useState } from 'react';
import { Button, Input, Label } from '@sentinel/ui';
import { ArrowLeft, ArrowRight, CheckCircle, MailCheck, RotateCw } from 'lucide-react';

interface RegisterOtpFormProps {
    email: string;
    verifyError: string | null;
    successMessage: string | null;
    isVerifying: boolean;
    isResending: boolean;
    resendCooldown: number;
    onVerifyOtp: (token: string) => void;
    onResendOtp: () => void;
    onBackToDetails: () => void;
}

export function RegisterOtpForm({
    email,
    verifyError,
    successMessage,
    isVerifying,
    isResending,
    resendCooldown,
    onVerifyOtp,
    onResendOtp,
    onBackToDetails,
}: RegisterOtpFormProps) {
    const [token, setToken] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = token.trim();
        if (trimmed.length === 6) {
            onVerifyOtp(trimmed);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only accept numbers and limit to 6 digits
        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
        setToken(value);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                    <MailCheck className="size-6" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                    Check your inbox
                </h2>
                <p className="text-sm text-gray-400">
                    We sent a 6-digit verification code to <br />
                    <span className="font-semibold text-white">{email}</span>
                </p>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="flex items-center gap-2 rounded-md border border-green-500/20 bg-green-500/10 p-3">
                    <CheckCircle className="size-4 shrink-0 text-green-500" />
                    <p className="text-sm font-medium text-green-400">{successMessage}</p>
                </div>
            )}

            {/* Error Display */}
            {verifyError && (
                <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3">
                    <p className="text-sm font-medium text-red-400">{verifyError}</p>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="otpToken" className="text-center block text-sm text-gray-300">
                    6-Digit Verification Code
                </Label>
                <div className="flex justify-center">
                    <Input
                        id="otpToken"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="••••••"
                        value={token}
                        onChange={handleInputChange}
                        maxLength={6}
                        autoFocus
                        disabled={isVerifying}
                        className="h-14 w-64 text-center font-mono text-2xl tracking-[0.4em] border-white/10 bg-[#0f0f10] text-white placeholder:text-gray-600 focus-visible:ring-blue-500"
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="group h-12 w-full text-base font-semibold"
                variant="premium-3d"
                size="lg"
                disabled={isVerifying || token.length !== 6}
            >
                {isVerifying ? 'Verifying...' : 'Verify & Continue'}
                {!isVerifying && (
                    <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                )}
            </Button>

            <div className="flex flex-col items-center justify-between gap-3 pt-2 text-sm sm:flex-row">
                <button
                    type="button"
                    onClick={onBackToDetails}
                    disabled={isVerifying}
                    className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-xs sm:text-sm"
                >
                    <ArrowLeft className="size-3.5" />
                    Change email address
                </button>

                <button
                    type="button"
                    onClick={onResendOtp}
                    disabled={resendCooldown > 0 || isResending || isVerifying}
                    className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 disabled:text-gray-600 transition-colors text-xs sm:text-sm font-medium"
                >
                    <RotateCw className={`size-3.5 ${isResending ? 'animate-spin' : ''}`} />
                    {resendCooldown > 0
                        ? `Resend code in ${resendCooldown}s`
                        : 'Resend code'}
                </button>
            </div>
        </form>
    );
}
