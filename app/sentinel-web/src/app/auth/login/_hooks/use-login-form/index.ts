import { LoginError, useLoginMutation } from '@sentinel/hooks';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { LoginSchema } from '@sentinel/shared/schema';
import { LoginSchemaType } from '@sentinel/shared/schema';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/data/supabase/client';
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
            const user = data.user;
            const role = data.user?.user_metadata?.role?.toLowerCase();

            if (role === 'student') {
                // Check if student record exists and is fully onboarded
                const supabase = createSupabaseClient();
                const { data: studentData } = await supabase
                    .from('students')
                    .select('student_number, department_id')
                    .eq('user_id', user?.id)
                    .maybeSingle();

                await router.refresh();
                if (studentData && studentData.student_number && studentData.department_id) {
                    toast.success('Welcome back Student!');
                    router.push('/student/classroom');
                } else {
                    toast.info('Please complete your onboarding.');
                    router.push('/onboarding');
                }
            } else if (role === 'instructor') {
                await router.refresh();
                toast.success('Welcome Instructor!');
                router.push('/dashboard');
            } else {
                // Strictly Student and Instructor only for sentinel-web
                setAuthError('Access Denied. This portal is for Students and Instructors only.');
                toast.error('Access Denied.');
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
