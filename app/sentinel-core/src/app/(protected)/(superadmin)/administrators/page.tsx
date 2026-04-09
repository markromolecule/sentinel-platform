'use client';

import { useUsersQuery } from '@sentinel/hooks';
import {
    AddAdminDialog,
    AdministratorsList,
} from '@/app/(protected)/(superadmin)/administrators/_components';
import { PageHeader } from '@sentinel/ui';
import { Loader2 } from 'lucide-react';
import { AdminUser } from '@sentinel/shared/types';
import { Separator } from '@sentinel/ui';
import { useAcademicScope } from '@/hooks/use-academic-scope';

export default function SuperadminAdministratorsPage() {
    const { institutionId, isLoading: isScopeLoading } = useAcademicScope();
    const hasInstitutionScope = Boolean(institutionId);
    const {
        data: administrators = [],
        isLoading: isUsersLoading,
        error,
    } = useUsersQuery({
        role: 'admin',
        institutionId,
        enabled: hasInstitutionScope,
    });
    const isLoading = isScopeLoading || (hasInstitutionScope && isUsersLoading);

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Administrator Management"
                description="Manage system administrators and their institutional access."
            >
                <AddAdminDialog />
            </PageHeader>

            <Separator />
            {error ? (
                <div className="flex h-64 flex-col items-center justify-center gap-2">
                    <p className="text-destructive font-medium">Failed to load administrators.</p>
                    <p className="text-muted-foreground text-sm">
                        Please ensure the API is reachable.
                    </p>
                </div>
            ) : !isLoading && !hasInstitutionScope ? (
                <div className="flex h-64 flex-col items-center justify-center gap-2">
                    <p className="font-medium">No institution assigned.</p>
                    <p className="text-muted-foreground text-sm">
                        Administrator accounts can only be viewed within your assigned institution.
                    </p>
                </div>
            ) : (
                <div className="relative">
                    <AdministratorsList
                        administrators={administrators as AdminUser[]}
                        isLoading={isLoading}
                    />

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
