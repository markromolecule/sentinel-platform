import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { LoginSchema } from '@sentinel/shared/schema';
import { LoginSchemaType } from '@sentinel/shared/schema';
import { useLoginMutation, LoginError } from '@/hooks/query/auth/use-login-mutation';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/data/supabase/client';

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

            if (role === 'student') {
                // Check if student record exists and is fully onboarded
                const supabase = createSupabaseClient();
                const { data: studentData } = await supabase
                    .from('students')
                    .select('student_number, department_id')
                    .eq('user_id', user?.id)
                    .single();

                if (studentData && studentData.student_number && studentData.department_id) {
                    router.push('/student');
                } else {
                    router.push('/onboarding');
                }
            } else if (role === 'proctor') {
                router.push('/proctor/dashboard');
            } else {
                // Strictly Student and Proctor only for sentinel-web
                setAuthError('Access Denied. This portal is for Students and Proctors only.');
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
