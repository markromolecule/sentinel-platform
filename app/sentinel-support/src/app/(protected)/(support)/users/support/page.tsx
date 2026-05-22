'use client';

import { useUsersQuery, useStableValue, useDebounce } from '@sentinel/hooks';
import { useState } from 'react';
import { AddSuperAdminDialog } from '@/app/(protected)/(support)/users/_components/dialogs/add-admin-dialog';
import { AdministratorsList } from '@/app/(protected)/(support)/users/_components/views/administrators-list';
import { PageHeader } from '@sentinel/ui';
import { Loader2 } from 'lucide-react';
import { User } from '@sentinel/shared/types';
import { Separator } from '@sentinel/ui';

export default function SupportManagementPage() {
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

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Support Management"
                description="Create and manage support staff accounts for the system."
            >
                <AddSuperAdminDialog role="support" triggerLabel="Add Support Staff" />
            </PageHeader>

            <Separator />
            {error ? (
                <div className="flex h-64 flex-col items-center justify-center gap-2">
                    <p className="text-destructive font-medium">
                        Failed to load support staff accounts.
                    </p>
                    <p className="text-muted-foreground text-sm">
                        Please ensure the API is reachable.
                    </p>
                </div>
            ) : (
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
            )}
        </div>
    );
}
