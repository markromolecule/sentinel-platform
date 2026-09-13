import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, RegisterSchemaType } from '@sentinel/shared/schema';
import { useRouter } from 'expo-router';
import { useSignUpMutation } from '@sentinel/hooks';
import { useGoogleAuth } from '@/lib/auth/use-google-auth';

export function useRegisterForm() {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    const form = useForm<RegisterSchemaType>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            terms: true,
        },
    });

    const { handleSubmit, control, formState: { errors } } = form;

    const signUpMutation = useSignUpMutation({
        onSuccess: (data) => {
            if (data.session) {
                router.replace('/(onboarding)');
            } else {
                router.replace('/(auth)/login');
            }
        },
        onError: (error) => {
            setAuthError(error.message);
        },
    });

    const {
        loading: googleLoading,
        error: googleError,
        signInWithGoogle,
    } = useGoogleAuth({
        mode: 'register',
        onSuccess: () => {
            router.replace('/(onboarding)');
        },
    });

    const onSubmit = (data: RegisterSchemaType) => {
        setAuthError(null);
        signUpMutation.mutate({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    first_name: data.firstName,
                    last_name: data.lastName,
                },
            },
        });
    };

    return {
        form,
        control,
        errors,
        showPassword,
        toggleShowPassword: () => setShowPassword((prev) => !prev),
        showConfirmPassword,
        toggleShowConfirmPassword: () => setShowConfirmPassword((prev) => !prev),
        authError: authError || googleError,
        isSubmitting: signUpMutation.isPending,
        googleLoading,
        onSubmit: handleSubmit(onSubmit),
        handleGoogleRegister: signInWithGoogle,
    };
}
