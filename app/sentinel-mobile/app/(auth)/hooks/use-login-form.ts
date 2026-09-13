import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginSchemaType } from '@sentinel/shared/schema';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLoginMutation } from '@sentinel/hooks';
import {
    getRememberedEmail,
    setRememberedEmail,
    clearRememberedEmail,
} from '@/lib/auth/remember-me';
import { useGoogleAuth } from '@/lib/auth/use-google-auth';

export function useLoginForm() {
    const router = useRouter();
    const params = useLocalSearchParams<{ error?: string }>();

    const [showPassword, setShowPassword] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    const form = useForm<LoginSchemaType>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
            remember: false,
        },
    });

    const { setValue, handleSubmit, control, formState: { errors } } = form;

    const loginMutation = useLoginMutation({
        onSuccess: () => {
            router.replace('/(tabs)/classroom');
        },
        onError: (error) => {
            setAuthError(error.message);
        },
    });

    const {
        loading: googleLoading,
        error: googleError,
        setError: setGoogleError,
        signInWithGoogle,
    } = useGoogleAuth({
        mode: 'login',
        onSuccess: () => {
            router.replace('/(tabs)/classroom');
        },
    });

    useEffect(() => {
        if (params.error) {
            setGoogleError(params.error);
        }
    }, [params.error, setGoogleError]);

    useEffect(() => {
        let isMounted = true;
        const loadSavedEmail = async () => {
            const savedEmail = await getRememberedEmail();
            if (savedEmail && isMounted) {
                setValue('email', savedEmail);
                setValue('remember', true);
            }
        };

        loadSavedEmail();

        return () => {
            isMounted = false;
        };
    }, [setValue]);

    const onSubmit = async (data: LoginSchemaType) => {
        setAuthError(null);

        if (data.remember) {
            await setRememberedEmail(data.email);
        } else {
            await clearRememberedEmail();
        }

        loginMutation.mutate({
            ...data,
            clientType: 'mobile',
        } as any);
    };

    return {
        form,
        control,
        errors,
        showPassword,
        toggleShowPassword: () => setShowPassword((prev) => !prev),
        authError: authError || googleError,
        isSubmitting: loginMutation.isPending,
        googleLoading,
        onSubmit: handleSubmit(onSubmit),
        handleGoogleLogin: signInWithGoogle,
    };
}
