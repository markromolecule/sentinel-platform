import { LoginError, useLoginMutation } from '@sentinel/hooks';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { LoginSchema } from '@sentinel/shared/schema';
import { LoginSchemaType } from '@sentinel/shared/schema';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/data/supabase/client';
import { toast } from 'sonner';
import { resolveWebAuthState } from '@/lib/auth/resolve-web-auth-state';

/**
 * Handles manual login for the student/instructor web portal.
 */
export function useLoginForm() {
    const router = useRouter();
    const [authError, setAuthError] = useState<string | null>(null);
    const supabase = createSupabaseClient();

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
            if (!user) {
                setAuthError('Could not verify your account after signing in.');
                toast.error('Could not verify your access.');
                return;
            }

            const authState = await resolveWebAuthState(supabase, user);

            if (authState.role === 'student') {
                await router.refresh();
                if (authState.isFullyOnboarded) {
                    toast.success('Welcome back Student!');
                } else {
                    toast.info('Please complete your onboarding.');
                }

                router.push(authState.destination);
                return;
            }

            if (authState.role === 'instructor') {
                await router.refresh();
                toast.success('Welcome Instructor!');
                router.push(authState.destination);
                return;
            }

            await supabase.auth.signOut();
            setAuthError('Access Denied. This portal is for Students and Instructors only.');
            toast.error('Access Denied.');
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
