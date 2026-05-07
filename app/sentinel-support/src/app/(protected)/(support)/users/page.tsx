'use client';

import { useUsersQuery, useStableValue, useDebounce } from '@sentinel/hooks';
import { useState } from 'react';
import { AddAdminDialog, AdministratorsList } from '@/app/(protected)/(support)/users/_components';
import { PageHeader } from '@sentinel/ui';
import { Loader2 } from 'lucide-react';
import { User } from '@sentinel/shared/types';
import { Separator, Tabs, TabsList, TabsTrigger } from '@sentinel/ui';
import {
    getAdministratorRoleConfig,
    type AdministratorRole,
} from '@/app/(protected)/(support)/users/_lib/administrator-role-config';

export default function SupportUsersPage() {
    const [activeRole, setActiveRole] = useState<AdministratorRole>('superadmin');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const activeConfig = getAdministratorRoleConfig(activeRole);

    const {
        data: users,
        isLoading,
        error,
    } = useUsersQuery({
        role: activeRole,
        search: debouncedSearch,
    });

    const administrators = useStableValue(() => (users || []) as User[], [users]);

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader title="Administrator Management" description={activeConfig.pageDescription}>
                <AddAdminDialog role={activeRole} />
            </PageHeader>

            <Tabs
                value={activeRole}
                onValueChange={(value) => {
                    setActiveRole(value as AdministratorRole);
                    setSearchTerm('');
                }}
            >
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="superadmin">Superadmins</TabsTrigger>
                    <TabsTrigger value="support">Support</TabsTrigger>
                </TabsList>
            </Tabs>

            <Separator />
            {error ? (
                <div className="flex h-64 flex-col items-center justify-center gap-2">
                    <p className="text-destructive font-medium">{activeConfig.errorTitle}</p>
                    <p className="text-muted-foreground text-sm">
                        Please ensure the API is reachable.
                    </p>
                </div>
            ) : (
                <div className="relative">
                    <AdministratorsList
                        administrators={administrators}
                        role={activeRole}
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
