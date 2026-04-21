import { LoginError, useLoginMutation } from '@sentinel/hooks';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { LoginSchema, LoginSchemaType } from '@sentinel/shared/schema';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { createSupabaseClient } from '@/data/supabase/client';
import { resolveCoreRole } from '../../../../../lib/auth/core-role';

export function useLoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createSupabaseClient();
    const [authError, setAuthError] = useState<string | null>(searchParams.get('error'));

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
            const role = resolveCoreRole(data.user);

            if (role) {
                await router.refresh();
                toast.success(`Welcome ${role.replace('_', ' ')}!`);
                router.push('/dashboard');
            } else {
                await supabase.auth.signOut();
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
