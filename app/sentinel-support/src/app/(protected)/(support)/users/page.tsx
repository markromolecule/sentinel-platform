'use client';

import { useUsersQuery, useStableValue } from '@sentinel/hooks';
import { AddAdminDialog, AdministratorsList } from '@/app/(protected)/(support)/users/_components';
import { PageHeader } from '@sentinel/ui';
import { Loader2 } from 'lucide-react';
import { User } from '@sentinel/shared/types';
import { Separator } from '@sentinel/ui';

export default function SupportUsersPage() {
    const { data: users, isLoading, error } = useUsersQuery({ role: 'superadmin' });

    const administrators = useStableValue(() => (users || []) as User[], [users]);

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="User Management"
                description="Create and manage superadmin accounts for the main Sentinel platform."
            >
                <AddAdminDialog />
            </PageHeader>

            <Separator />
            {error ? (
                <div className="flex h-64 flex-col items-center justify-center gap-2">
                    <p className="text-destructive font-medium">
                        Failed to load superadmin accounts.
                    </p>
                    <p className="text-muted-foreground text-sm">
                        Please ensure the API is reachable.
                    </p>
                </div>
            ) : (
                <div className="relative">
                    <AdministratorsList administrators={administrators} isLoading={isLoading} />

                    {isLoading && administrators.length === 0 && (
                        <div className="bg-background/80 absolute inset-x-0 top-[60px] bottom-0 flex items-center justify-center rounded-md">
                            <Loader2 className="text-primary h-8 w-8 animate-spin" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
