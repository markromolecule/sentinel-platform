'use client';

import { useDebounce, usePresence, useUsersQuery } from '@sentinel/hooks';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { PageHeader, Separator } from '@sentinel/ui';
import { UserManagementTable } from '@/app/(protected)/administrators/_components';
import { AdministratorsList } from '@/app/(protected)/administrators/_components';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import { PermissionGate } from '../shared/permission-gate';
import type { AdminUser } from '@sentinel/shared/types';
import type { UserManagementPageVariant, UserManagementScopeMode } from './user-management-presets';

interface UserManagementPageProps {
    title: string;
    description: string;
    roleFilter?: string;
    actions: React.ReactNode;
    scopeMode: UserManagementScopeMode;
    variant: UserManagementPageVariant;
}

/**
 * Shared shell for user and administrator directory pages.
 */
export function UserManagementPage({
    title,
    description,
    roleFilter,
    actions,
    scopeMode,
    variant,
}: UserManagementPageProps) {
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const { onlineUserIds } = usePresence();
    const { institutionId, isLoading: isScopeLoading } = useAcademicScope();
    const hasInstitutionScope = Boolean(institutionId);
    const shouldRestrictToInstitution = scopeMode === 'institution';

    const {
        data: users = [],
        isLoading: isUsersLoading,
        error,
    } = useUsersQuery({
        search: debouncedSearch,
        role: roleFilter,
        institutionId: shouldRestrictToInstitution ? institutionId : undefined,
        enabled: shouldRestrictToInstitution ? hasInstitutionScope : true,
    });

    const isLoading =
        isScopeLoading ||
        (shouldRestrictToInstitution ? hasInstitutionScope && isUsersLoading : isUsersLoading);

    if (error) {
        return (
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader title={title} description={description} />
                <div className="flex h-64 flex-col items-center justify-center gap-2">
                    <p className="text-destructive font-medium">
                        {variant === 'administrators'
                            ? 'Failed to load administrators.'
                            : 'Failed to load users.'}
                    </p>
                    <p className="text-muted-foreground text-sm">
                        Please ensure the API is reachable.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader title={title} description={description}>
                <PermissionGate permission="administrators" action="edit">
                    {actions}
                </PermissionGate>
            </PageHeader>
            <Separator />
            {shouldRestrictToInstitution && !isLoading && !hasInstitutionScope ? (
                <div className="flex h-64 flex-col items-center justify-center gap-2">
                    <p className="font-medium">No institution assigned.</p>
                    <p className="text-muted-foreground text-sm">
                        Administrator accounts can only be viewed within your assigned institution.
                    </p>
                </div>
            ) : (
                <div className="relative">
                    {variant === 'administrators' ? (
                        <AdministratorsList
                            administrators={users as AdminUser[]}
                            isLoading={isLoading}
                        />
                    ) : (
                        <UserManagementTable
                            users={users}
                            onlineUserIds={onlineUserIds}
                            search={search}
                            onSearchChange={setSearch}
                            isLoading={isLoading}
                        />
                    )}

                    {isLoading && users.length === 0 ? (
                        <div className="bg-background/80 absolute inset-x-0 top-[60px] bottom-0 flex items-center justify-center rounded-md">
                            <Loader2 className="text-primary h-8 w-8 animate-spin" />
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
