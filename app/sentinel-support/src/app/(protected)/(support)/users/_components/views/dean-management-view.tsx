'use client';

import { useState, useLayoutEffect } from 'react';
import { useUsersQuery, useStableValue, useDebounce } from '@sentinel/hooks';
import { AddSuperAdminDialog } from '@/app/(protected)/(support)/users/_components/dialogs/add-admin-dialog';
import { AdministratorsList } from '@/app/(protected)/(support)/users/_components/views/administrators-list';
import { Loader2 } from 'lucide-react';
import type { User } from '@sentinel/shared/types';

export type DeanManagementViewProps = {
    setActions?: (actions: React.ReactNode) => void;
};

export function DeanManagementView({ setActions }: DeanManagementViewProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const {
        data: users,
        isLoading,
        error,
    } = useUsersQuery({
        role: ['superadmin'],
        search: debouncedSearch,
    });

    const administrators = useStableValue(() => (users || []) as User[], [users]);

    useLayoutEffect(() => {
        setActions?.(<AddSuperAdminDialog role="superadmin" triggerLabel="Add Dean" />);
        return () => setActions?.(null);
    }, [setActions]);

    if (error) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-2">
                <p className="text-destructive font-medium">Failed to load dean accounts.</p>
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
                role="superadmin"
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
