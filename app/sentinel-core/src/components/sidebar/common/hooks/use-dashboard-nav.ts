'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { useLogoutMutation } from '@/hooks/query/auth/use-logout-mutation';
import { toast } from 'sonner';

export function useDashboardNav() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    const toggleMenu = useCallback((title: string, open?: boolean) => {
        setOpenMenus(prev => ({
            ...prev,
            [title]: open ?? !prev[title]
        }));
    }, []);

    const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation({
        onSuccess: () => {
            router.push('/auth/login');
        },
        onError: (error) => {
            toast.error(error.message);
        }
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
        openMenus,
        toggleMenu,
        isLoggingOut,
        isChildActive,
        handleLogout,
    };
}
