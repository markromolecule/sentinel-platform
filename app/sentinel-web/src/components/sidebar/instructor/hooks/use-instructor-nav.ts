'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { useLogoutMutation } from '@/hooks/query/auth/use-logout-mutation';

export function useInstructorNav() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const isExamActive =
        pathname.startsWith('/exams') ||
        pathname.startsWith('/assignment') ||
        pathname.startsWith('/grading');

    const [isExamMenuOpen, setIsExamMenuOpen] = useState(isExamActive);

    const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation({
        onSuccess: () => {
            router.push('/auth/login');
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
        isLoggingOut,
        isChildActive,
        handleLogout,
    };
}
