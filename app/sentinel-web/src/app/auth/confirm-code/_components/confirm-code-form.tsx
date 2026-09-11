'use client';

import { Button, Card, CardContent, CardFooter, Input, Label } from '@sentinel/ui';
import { ArrowLeft, ArrowRight, CheckCircle, MailCheck, RotateCw } from 'lucide-react';
import Link from 'next/link';
import { useConfirmCodeForm } from '../_hooks/use-confirm-code-form';

export function ConfirmCodeForm() {
    const {
        email,
        token,
        verifyError,
        successMessage,
        isVerifying,
        isResending,
        resendCooldown,
        onTokenChange,
        onSubmit,
        onResend,
    } = useConfirmCodeForm();

    return (
        <Card className="w-full gap-0 border-white/10 bg-[#131315] text-white shadow-2xl">
            <CardContent className="space-y-5 p-6 sm:p-8">
                <form onSubmit={onSubmit} className="space-y-5">
                    <div className="flex flex-col items-center justify-center space-y-2 text-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                            <MailCheck className="size-6" />
                        </div>
                        <h2 className="text-xl font-semibold tracking-tight text-white">
                            Check your inbox
                        </h2>
                        <p className="text-sm text-gray-400">
                            We sent a 6-digit verification code to <br />
                            <span className="font-semibold text-white">
                                {email || 'your email address'}
                            </span>
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
                        <Label
                            htmlFor="otpToken"
                            className="block text-center text-sm font-medium text-gray-300"
                        >
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
                                onChange={onTokenChange}
                                maxLength={6}
                                autoFocus
                                disabled={isVerifying}
                                className="h-14 w-64 border-white/10 bg-[#0f0f10] text-center font-mono text-2xl tracking-[0.4em] text-white placeholder:text-gray-600 focus-visible:ring-blue-500"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="group h-12 w-full text-base font-semibold"
                        variant="premium-3d"
                        size="lg"
                        disabled={isVerifying || token.length !== 6 || !email}
                    >
                        {isVerifying ? 'Verifying...' : 'Verify & Continue'}
                        {!isVerifying && (
                            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                        )}
                    </Button>

                    <div className="flex flex-col items-center justify-between gap-3 pt-2 text-sm sm:flex-row">
                        <Link
                            href="/auth/register"
                            className="inline-flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-white sm:text-sm"
                        >
                            <ArrowLeft className="size-3.5" />
                            Change email address
                        </Link>

                        <button
                            type="button"
                            onClick={onResend}
                            disabled={resendCooldown > 0 || isResending || isVerifying || !email}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 transition-colors hover:text-blue-300 disabled:text-gray-600 sm:text-sm"
                        >
                            <RotateCw
                                className={`size-3.5 ${isResending ? 'animate-spin' : ''}`}
                            />
                            {resendCooldown > 0
                                ? `Resend code in ${resendCooldown}s`
                                : 'Resend code'}
                        </button>
                    </div>
                </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 border-t border-white/5 p-4 pt-4 sm:p-6 sm:pt-4">
                <p className="text-center text-xs leading-relaxed text-gray-500">
                    Need help accessing your account? Contact{' '}
                    <a
                        href="mailto:support@sentinelph.tech"
                        className="font-medium text-blue-400 transition-colors hover:text-blue-300"
                    >
                        support@sentinelph.tech
                    </a>
                </p>
            </CardFooter>
        </Card>
    );
}
