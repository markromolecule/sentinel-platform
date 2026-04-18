'use client';

import { useAuth } from '@sentinel/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { normalizeUserRole } from '@/lib/auth/resolve-web-auth-state';

export function AuthSessionRedirect() {
    const router = useRouter();
    const { user, isLoading, supabase } = useAuth();

    useEffect(() => {
        if (isLoading || !user || !supabase) {
            return;
        }

        let isActive = true;

        void (async () => {
            const role = normalizeUserRole(user.user_metadata?.role);

            if (role === 'instructor') {
                router.replace('/dashboard');
                return;
            }

            if (role && role !== 'student') {
                router.replace('/auth/login?error=Unauthorized role access');
                return;
            }

            const { data: studentRecord, error } = await supabase
                .from('students')
                .select('student_number, department_id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (!isActive) {
                return;
            }

            if (error) {
                console.error('Unable to read landing auth state:', error.message);
                router.replace('/auth/login?error=Could not verify your access.');
                return;
            }

            const isFullyOnboarded = !!(
                studentRecord?.student_number && studentRecord?.department_id
            );

            router.replace(isFullyOnboarded ? '/student/exam' : '/onboarding');
        })();

        return () => {
            isActive = false;
        };
    }, [isLoading, router, supabase, user]);

    return null;
}
