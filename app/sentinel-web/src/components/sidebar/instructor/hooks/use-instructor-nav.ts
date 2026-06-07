'use client';

import { useLogoutMutation } from '@sentinel/hooks';
import { usePathname } from 'next/navigation';
import { useCallback } from 'react';

export function useInstructorNav() {
    const pathname = usePathname();

    const isExamActive = pathname.startsWith('/exams') || pathname.startsWith('/grading');

    const isSubjectsActive = pathname.startsWith('/subjects');

    const isQuestionBankActive = pathname.startsWith('/question');

    const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation({
        onSuccess: () => {
            window.location.href = '/auth/login';
        },
    });

    const handleLogout = useCallback(() => {
        logout();
    }, [logout]);

    return {
        pathname,
        isExamActive,
        isSubjectsActive,
        isQuestionBankActive,
        isLoggingOut,
        handleLogout,
    };
}
