'use client';

import { useLogoutMutation } from '@sentinel/hooks';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export function useDashboardNav() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    const toggleMenu = useCallback((title: string, open?: boolean) => {
        setOpenMenus((prev) => ({
            ...prev,
            [title]: open ?? !prev[title],
        }));
    }, []);

    const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation({
        onSuccess: () => {
            window.location.href = '/auth/login';
        },
        onError: (error) => {
            toast.error(error.message);
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
        logout(undefined);
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
