'use client';

import { useState } from 'react';
import { Badge, SearchBar, Tabs, TabsList, TabsTrigger } from '@sentinel/ui';
import {
    AccessControlEmptyState,
    AccessControlErrorState,
    AccessControlLoadingState,
} from '@/app/(protected)/(support)/control/_components';
import { useRoleMatrix } from '../../roles/_hooks/use-role-matrix';
import { RoleMatrixTable } from '../../roles/_components/role-matrix-table';
import { DeleteRoleDialog } from '../../roles/_components/dialog/delete-role-dialog';

/**
 * RoleMatrixView renders the Dynamic RBAC Role Matrix.
 * Displays permissions mapping against active roles.
 * Includes domain scoping filters to narrow down target columns dynamically.
 */
export function RoleMatrixView() {
    const {
        // Data
        sortedRoles,
        permissions,
        filteredPermissions,
        groupedPermissions,

        // State
        isBusy,
        pageError,
        roleToDelete,
        searchValue,
        draftPermissionIdsByRoleId,
        savingRoleIds,
        collapsedCategoryKeys,
        collapsedModuleKeys,
        editingRoleId,
        editingRoleName,

        // Mutations
        deleteRoleMutation,

        // Setters
        setRoleToDelete,
        setSearchValue,
        setEditingRoleId,
        setEditingRoleName,

        // Actions
        handlePermissionToggle,
        toggleCategory,
        toggleModule,
        startRoleNameEdit,
        submitRoleNameEdit,
    } = useRoleMatrix();

    const [selectedDomain, setSelectedDomain] = useState<'all' | 'support' | 'core' | 'app'>('all');

    if (isBusy) return <AccessControlLoadingState label="Constructing matrix..." />;
    if (pageError) return <AccessControlErrorState message={pageError.message} />;

    if (sortedRoles.length === 0) {
        return (
            <AccessControlEmptyState
                title="No Roles"
                description="The role catalog is currently empty. Define system roles to begin mapping permissions."
            />
        );
    }

    if (permissions.length === 0) {
        return (
            <AccessControlEmptyState
                title="Empty Catalog"
                description="No permissions found in the registry. You must define permissions before mapping them to roles."
            />
        );
    }

    // Filter sortedRoles dynamically based on the selected domain tab
    const filteredRoles = sortedRoles.filter((role) => {
        if (selectedDomain === 'all') return true;
        return role.domainScope?.includes(selectedDomain);
    });

    return (
        <div className="space-y-6">
            {/* Domain Filter Tabs */}
            <div className="border-b border-[#323d8f]/10 pb-4">
                <Tabs value={selectedDomain} onValueChange={(val) => setSelectedDomain(val as any)} className="w-full">
                    <TabsList className="bg-muted/50 border-muted-foreground/10 grid w-full max-w-2xl grid-cols-4 border p-1 rounded-none">
                        <TabsTrigger value="all" className="rounded-none text-[12px] font-bold">
                            All Domains
                        </TabsTrigger>
                        <TabsTrigger value="support" className="rounded-none text-[12px] font-bold">
                            Support Operations
                        </TabsTrigger>
                        <TabsTrigger value="core" className="rounded-none text-[12px] font-bold">
                            Core System
                        </TabsTrigger>
                        <TabsTrigger value="app" className="rounded-none text-[12px] font-bold">
                            End-User App
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Header Controls & Filters */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                    <SearchBar
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder="Search permissions..."
                        containerClassName="w-full sm:max-w-md"
                        className="border-muted/50 bg-background/50 focus-visible:ring-primary/20 h-11 rounded-none"
                    />
                    <div className="text-muted-foreground/80 flex items-center gap-4 text-[12px] font-bold">
                        <div className="flex items-center gap-1.5">
                            <div className="bg-primary size-1.5 rounded-full" />
                            <span>{filteredPermissions.length} Results</span>
                        </div>
                        <div className="bg-muted-foreground/30 size-1 rounded-full" />
                        <Badge
                            variant="secondary"
                            className="bg-primary/5 text-primary border-primary/10 h-6 px-2 text-[11px] font-bold"
                        >
                            Auto-Save
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Matrix View Content */}
            {filteredRoles.length === 0 ? (
                <div className="border-muted/50 bg-muted/5 rounded-none border border-dashed py-20 text-center">
                    <AccessControlEmptyState
                        title="No Active Roles in Domain"
                        description={`There are currently no active roles configured within the "${selectedDomain}" domain scope.`}
                    />
                </div>
            ) : (
                <RoleMatrixTable
                    sortedRoles={filteredRoles}
                    groupedPermissions={groupedPermissions}
                    draftPermissionIdsByRoleId={draftPermissionIdsByRoleId}
                    savingRoleIds={savingRoleIds}
                    collapsedCategoryKeys={collapsedCategoryKeys}
                    collapsedModuleKeys={collapsedModuleKeys}
                    editingRoleId={editingRoleId}
                    editingRoleName={editingRoleName}
                    onToggleCategory={toggleCategory}
                    onToggleModule={toggleModule}
                    onPermissionToggle={handlePermissionToggle}
                    onStartRoleNameEdit={startRoleNameEdit}
                    onSubmitRoleNameEdit={submitRoleNameEdit}
                    onSetEditingRoleId={setEditingRoleId}
                    onSetEditingRoleName={setEditingRoleName}
                    onSetRoleToDelete={setRoleToDelete}
                />
            )}

            <DeleteRoleDialog
                role={roleToDelete}
                onClose={() => setRoleToDelete(null)}
                onDelete={(roleId) => {
                    deleteRoleMutation.mutate(roleId, {
                        onSuccess: () => {
                            setRoleToDelete(null);
                        },
                    });
                }}
                isPending={deleteRoleMutation.isPending}
            />
        </div>
    );
}
