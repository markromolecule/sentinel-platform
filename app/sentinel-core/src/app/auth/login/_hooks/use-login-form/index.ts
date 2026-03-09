import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { LoginSchema } from '@sentinel/shared/schema';
import { LoginSchemaType } from '@sentinel/shared/schema';
import { useLoginMutation, LoginError } from '@/hooks/query/auth/use-login-mutation';
import { useRouter } from 'next/navigation';

export function useLoginForm() {
    const router = useRouter();
    const [authError, setAuthError] = useState<string | null>(null);

    const form = useForm<LoginSchemaType>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
            remember: false,
        },
    });

    const { mutate: login, isPending: isLoading } = useLoginMutation({
        onSuccess: async (data) => {
            const user = data.user;
            const role = user?.user_metadata?.role;

            if (role === 'admin' || role === 'superadmin') {
                router.push('/admin/dashboard');
            } else {
                // Strictly Admin and Superadmin only for sentinel-core
                setAuthError('Access Denied. This portal is for Administrators only.');
            }
        },
        onError: (error: LoginError) => {
            setAuthError(error.message);
        },
    });

    const onSubmit = (data: LoginSchemaType) => {
        setAuthError(null);
        login({
            email: data.email,
            password: data.password,
        });
    };

    return {
        form,
        authError,
        isLoading,
        onSubmit: form.handleSubmit(onSubmit),
    };
}
