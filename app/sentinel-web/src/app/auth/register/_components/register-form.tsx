import { Label, Checkbox, Button, Input } from '@sentinel/ui';
import { ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { RegisterSchemaType } from '@sentinel/shared/schema';
import { UseFormReturn } from 'react-hook-form';
import { useState } from 'react';

import { PasswordRequirements } from './password-requirements';

interface RegisterFormProps {
    form: UseFormReturn<RegisterSchemaType>;
    authError: string | null;
    successMessage: string | null;
    isLoading: boolean;
    onSubmit: () => void;
}

export function RegisterForm({
    form,
    authError,
    successMessage,
    isLoading,
    onSubmit,
}: RegisterFormProps) {
    const {
        register,
        watch,
        formState: { errors },
    } = form;
    const password = watch('password');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    return (
        <form className="space-y-4" onSubmit={onSubmit}>
            {/* Success Message */}
            {successMessage && (
                <div className="flex items-center gap-2 rounded-md border border-green-500/20 bg-green-500/10 p-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-medium text-green-500">{successMessage}</p>
                </div>
            )}

            {/* Auth Error Display */}
            {authError && (
                <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3">
                    <p className="text-sm font-medium text-red-500">{authError}</p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="firstName" className={errors.firstName ? 'text-red-500' : ''}>
                        First name
                    </Label>
                    <Input
                        id="firstName"
                        placeholder="John"
                        className={`border-white/10 bg-[#0f0f10] text-white placeholder:text-gray-500 focus-visible:ring-blue-500 ${errors.firstName ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        disabled={isLoading}
                        {...register('firstName')}
                    />
                    {errors.firstName && (
                        <p className="text-[0.8rem] font-medium text-red-500">
                            {errors.firstName.message}
                        </p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName" className={errors.lastName ? 'text-red-500' : ''}>
                        Last name
                    </Label>
                    <Input
                        id="lastName"
                        placeholder="Doe"
                        className={`border-white/10 bg-[#0f0f10] text-white placeholder:text-gray-500 focus-visible:ring-blue-500 ${errors.lastName ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        disabled={isLoading}
                        {...register('lastName')}
                    />
                    {errors.lastName && (
                        <p className="text-[0.8rem] font-medium text-red-500">
                            {errors.lastName.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email" className={errors.email ? 'text-red-500' : ''}>
                    Email
                </Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="doe@example.com"
                    className={`border-white/10 bg-[#0f0f10] text-white placeholder:text-gray-500 focus-visible:ring-blue-500 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    disabled={isLoading}
                    {...register('email')}
                />
                {errors.email && (
                    <p className="text-[0.8rem] font-medium text-red-500">{errors.email.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="password" className={errors.password ? 'text-red-500' : ''}>
                    Password
                </Label>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className={`border-white/10 bg-[#0f0f10] pr-10 text-white focus-visible:ring-blue-500 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        disabled={isLoading}
                        {...register('password', {
                            onBlur: () => setIsPasswordFocused(false),
                        })}
                        onFocus={() => setIsPasswordFocused(true)}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 transition-colors hover:text-white"
                        disabled={isLoading}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
                <PasswordRequirements value={password} isVisible={isPasswordFocused} />
                {errors.password && (
                    <p className="text-[0.8rem] font-medium text-red-500">
                        {errors.password.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label
                    htmlFor="confirmPassword"
                    className={errors.confirmPassword ? 'text-red-500' : ''}
                >
                    Confirm Password
                </Label>
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        className={`border-white/10 bg-[#0f0f10] pr-10 text-white focus-visible:ring-blue-500 ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        disabled={isLoading}
                        {...register('confirmPassword')}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 transition-colors hover:text-white"
                        disabled={isLoading}
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
                {errors.confirmPassword && (
                    <p className="text-[0.8rem] font-medium text-red-500">
                        {errors.confirmPassword.message}
                    </p>
                )}
            </div>

            <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                    id="terms"
                    className={errors.terms ? 'border-red-500' : ''}
                    onCheckedChange={(checked) => form.setValue('terms', checked as boolean)}
                    {...register('terms')}
                />
                <label
                    htmlFor="terms"
                    className="cursor-pointer text-sm leading-none font-medium text-gray-300 select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    I agree to the{' '}
                    <Link href="/terms-of-service" className="text-blue-400 hover:underline">
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy-policy" className="text-blue-400 hover:underline">
                        Privacy Policy
                    </Link>
                </label>
            </div>
            {errors.terms && (
                <p className="text-[0.8rem] font-medium text-red-500">{errors.terms.message}</p>
            )}

            <Button
                className="group mt-2 h-12 w-full text-base font-semibold"
                variant="premium-3d"
                size="lg"
                type="submit"
                disabled={isLoading}
            >
                {isLoading ? 'Creating account...' : 'Create account'}
                {!isLoading && (
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                )}
            </Button>
        </form>
    );
}
