'use client';

import { useUsersQuery, useStableValue, useDebounce } from '@sentinel/hooks';
import { useState } from 'react';
import { AddSuperAdminDialog } from '@/app/(protected)/(support)/users/_components/dialogs/add-admin-dialog';
import { AdministratorsList } from '@/app/(protected)/(support)/users/_components/views/administrators-list';
import { PageHeader } from '@sentinel/ui';
import { Loader2 } from 'lucide-react';
import { User } from '@sentinel/shared/types';
import { Separator } from '@sentinel/ui';

export default function DeanManagementPage() {
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

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader title="Dean Management" description="Create and manage dean accounts.">
                <AddSuperAdminDialog role="superadmin" triggerLabel="Add Dean" />
            </PageHeader>

            <Separator />
            {error ? (
                <div className="flex h-64 flex-col items-center justify-center gap-2">
                    <p className="text-destructive font-medium">Failed to load dean accounts.</p>
                    <p className="text-muted-foreground text-sm">
                        Please ensure the API is reachable.
                    </p>
                </div>
            ) : (
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
            )}
        </div>
    );
}
