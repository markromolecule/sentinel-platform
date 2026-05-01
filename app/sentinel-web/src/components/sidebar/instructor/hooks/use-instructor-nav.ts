'use client';

import { useLogoutMutation } from '@sentinel/hooks';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';

export function useInstructorNav() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const isExamActive = pathname.startsWith('/exams') || pathname.startsWith('/grading');

    const isSubjectsActive = pathname.startsWith('/subjects');

    const isQuestionBankActive = pathname.startsWith('/question/bank');

    const [isExamMenuOpen, setIsExamMenuOpen] = useState(isExamActive);
    const [isSubjectsMenuOpen, setIsSubjectsMenuOpen] = useState(isSubjectsActive);
    const [isQuestionBankMenuOpen, setIsQuestionBankMenuOpen] = useState(isQuestionBankActive);

    const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation({
        onSuccess: () => {
            window.location.href = '/auth/login';
        },
    });

    const isChildActive = useCallback(
        (childUrl: string) => {
            if (!childUrl.includes('?')) {
                return pathname === childUrl;
            }

            const parsed = new URL(childUrl, 'http://localhost:3000');
            if (pathname !== parsed.pathname) return false;

            return Array.from(parsed.searchParams.entries()).every(
                ([key, value]) => searchParams.get(key) === value,
            );
        },
        [pathname, searchParams],
    );

    const handleLogout = useCallback(() => {
        logout();
    }, [logout]);

    return {
        pathname,
        isExamActive,
        isExamMenuOpen,
        setIsExamMenuOpen,
        isSubjectsActive,
        isSubjectsMenuOpen,
        setIsSubjectsMenuOpen,
        isQuestionBankActive,
        isQuestionBankMenuOpen,
        setIsQuestionBankMenuOpen,
        isLoggingOut,
        isChildActive,
        handleLogout,
    };
}
