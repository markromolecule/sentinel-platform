import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { LoginSchema, LoginSchemaType } from '@sentinel/shared/schema';
import { useLoginMutation, LoginError } from '@/hooks/query/auth/use-login-mutation';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
            const role = data.user?.user_metadata?.role;

            if (role === 'superadmin' || role === 'admin') {
                toast.success(`Welcome ${role === 'superadmin' ? 'Superadmin' : 'Administrator'}!`);
                router.push('/dashboard');
            } else {
                setAuthError('Unauthorized. This portal is for Administrators only.');
                toast.error('Unauthorized access attempt.');
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
