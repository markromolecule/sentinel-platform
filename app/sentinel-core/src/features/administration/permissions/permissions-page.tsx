'use client';

import { useState } from 'react';
import {
    PageHeader,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    DataTable,
    Button,
    Alert,
    AlertTitle,
    AlertDescription,
} from '@sentinel/ui';
import { Plus, ShieldAlert } from 'lucide-react';
import { useAccessControlRolesQuery, useAccessControlPermissionsQuery } from '@sentinel/hooks';
import { useCoreAdminCapabilities } from '@/hooks/use-core-admin-capabilities';
import { columns } from './_components/columns';
import { roleColumns } from './_components/role-columns';
import { RoleFormDialog } from './_components/role-form-dialog';

/**
 * Centered permissions page that shows system roles and defined capabilities.
 * Dynamically binds with active RBAC queries and mutators.
 */
export function PermissionsPage() {
    const [createOpen, setCreateOpen] = useState(false);

    // Resolve dynamic page capabilities
    const {
        canViewPage,
        canEditPage,
        isLoading: isLoadingCapabilities,
    } = useCoreAdminCapabilities();

    // Fetch live access control data
    const {
        data: roles = [],
        isLoading: isLoadingRoles,
        error: rolesError,
    } = useAccessControlRolesQuery();
    const {
        data: permissions = [],
        isLoading: isLoadingPermissions,
        error: permissionsError,
    } = useAccessControlPermissionsQuery();

    const canView = canViewPage('permissions');
    const canEdit = canEditPage('permissions');

    const isLoading = isLoadingCapabilities || isLoadingRoles || isLoadingPermissions;

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
            </div>
        );
    }

    if (!canView) {
        return (
            <div className="mx-auto max-w-2xl p-4 md:p-6">
                <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                    <ShieldAlert className="h-5 w-5" />
                    <AlertTitle className="text-destructive ml-2 font-bold">
                        Unauthorized Access
                    </AlertTitle>
                    <AlertDescription className="text-destructive/80 mt-2 text-sm">
                        You do not possess the required "access_control:view" permission to inspect
                        roles or access-control schemes.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const hasError = !!rolesError || !!permissionsError;
    if (hasError) {
        return (
            <div className="mx-auto max-w-2xl p-4 md:p-6">
                <Alert variant="destructive">
                    <ShieldAlert className="h-5 w-5" />
                    <AlertTitle className="text-destructive ml-2 font-bold">
                        Data Fetching Failed
                    </AlertTitle>
                    <AlertDescription className="text-destructive/85 mt-2 text-sm">
                        {rolesError?.message ||
                            permissionsError?.message ||
                            'An unexpected error occurred while loading permissions data.'}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Permissions & Roles"
                description="Manage user roles and define granular system permissions."
            >
                {canEdit && (
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Create Role
                    </Button>
                )}
            </PageHeader>

            <Tabs defaultValue="roles" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="roles">Roles</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions Index</TabsTrigger>
                </TabsList>

                <TabsContent value="roles" className="space-y-4">
                    <DataTable
                        columns={roleColumns}
                        data={roles}
                        searchKey="name"
                        searchPlaceholder="Search roles..."
                        facets={[]}
                    />
                </TabsContent>

                <TabsContent value="permissions" className="space-y-4">
                    <DataTable
                        columns={columns}
                        data={permissions}
                        searchKey="name"
                        searchPlaceholder="Search permissions..."
                        facets={[]}
                    />
                </TabsContent>
            </Tabs>

            <RoleFormDialog open={createOpen} onOpenChange={setCreateOpen} />
        </div>
    );
}
