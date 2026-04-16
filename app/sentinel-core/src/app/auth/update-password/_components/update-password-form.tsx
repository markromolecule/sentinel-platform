import { Input } from '@sentinel/ui';
import { Label } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { ArrowRight } from 'lucide-react';
import { UpdatePasswordSchemaType } from '@sentinel/shared/schema';
import { UseFormReturn } from 'react-hook-form';

interface UpdatePasswordFormProps {
    form: UseFormReturn<UpdatePasswordSchemaType>;
    authError: string | null;
    isLoading: boolean;
    onSubmit: () => void;
}

export function UpdatePasswordForm({
    form,
    authError,
    isLoading,
    onSubmit,
}: UpdatePasswordFormProps) {
    const {
        register,
        formState: { errors },
    } = form;

    return (
        <form className="space-y-4" onSubmit={onSubmit}>
            {authError && (
                <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3">
                    <p className="text-sm font-medium text-red-500">{authError}</p>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="password" className={errors.password ? 'text-red-500' : ''}>
                    New Password
                </Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="Enter your new password"
                    className={`border-white/10 bg-[#0f0f10] text-white focus-visible:ring-blue-500 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    disabled={isLoading}
                    {...register('password')}
                />
                {errors.password && (
                    <p className="text-[0.8rem] font-medium text-red-500">
                        {errors.password.message}
                    </p>
                )}
            </div>

            <div className="space-y-2 pb-4">
                <Label
                    htmlFor="confirmPassword"
                    className={errors.confirmPassword ? 'text-red-500' : ''}
                >
                    Confirm Password
                </Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    className={`border-white/10 bg-[#0f0f10] text-white focus-visible:ring-blue-500 ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    disabled={isLoading}
                    {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                    <p className="text-[0.8rem] font-medium text-red-500">
                        {errors.confirmPassword.message}
                    </p>
                )}
            </div>

            <Button
                className="group h-12 w-full text-base font-semibold"
                variant="premium-3d"
                size="lg"
                type="submit"
                disabled={isLoading}
            >
                {isLoading ? 'Updating...' : 'Update Password'}
                {!isLoading && (
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                )}
            </Button>
        </form>
    );
}
