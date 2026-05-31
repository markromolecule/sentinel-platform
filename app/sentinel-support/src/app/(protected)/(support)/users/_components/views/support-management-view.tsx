'use client';

import { useState, useLayoutEffect } from 'react';
import { useUsersQuery, useStableValue, useDebounce } from '@sentinel/hooks';
import { AddSuperAdminDialog } from '@/app/(protected)/(support)/users/_components/dialogs/add-admin-dialog';
import { AdministratorsList } from '@/app/(protected)/(support)/users/_components/views/administrators-list';
import { Loader2 } from 'lucide-react';
import type { User } from '@sentinel/shared/types';

export type SupportManagementViewProps = {
    setActions?: (actions: React.ReactNode) => void;
};

export function SupportManagementView({ setActions }: SupportManagementViewProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const {
        data: users,
        isLoading,
        error,
    } = useUsersQuery({
        role: ['support'],
        search: debouncedSearch,
    });

    const administrators = useStableValue(() => (users || []) as User[], [users]);

    useLayoutEffect(() => {
        setActions?.(<AddSuperAdminDialog role="support" triggerLabel="Add Support Staff" />);
        return () => setActions?.(null);
    }, [setActions]);

    if (error) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-2">
                <p className="text-destructive font-medium">
                    Failed to load support staff accounts.
                </p>
                <p className="text-muted-foreground text-sm">
                    Please ensure the API is reachable.
                </p>
            </div>
        );
    }

    return (
        <div className="relative">
            <AdministratorsList
                administrators={administrators}
                role="support"
                isLoading={isLoading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            {isLoading && administrators.length === 0 && (
                <div
                    data-testid="support-users-loading"
                    className="bg-background/80 absolute inset-x-0 top-[60px] bottom-0 flex items-center justify-center rounded-md"
                >
                    <Loader2 className="text-primary h-8 w-8 animate-spin" />
                </div>
            )}
        </div>
    );
}
