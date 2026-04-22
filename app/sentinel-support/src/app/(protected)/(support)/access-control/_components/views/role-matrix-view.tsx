'use client';

import { Badge, SearchBar } from '@sentinel/ui';
import {
    AccessControlEmptyState,
    AccessControlErrorState,
    AccessControlLoadingState,
} from '@/app/(protected)/(support)/access-control/_components';
import { useRoleMatrix } from '../../roles/_hooks/use-role-matrix';
import { RoleMatrixTable } from '../../roles/_components/role-matrix-table';
import { DeleteRoleDialog } from '../../roles/_components/dialog/delete-role-dialog';

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
        startRoleNameEdit,
        submitRoleNameEdit,
    } = useRoleMatrix();

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

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                    <SearchBar
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder="Search permissions..."
                        containerClassName="w-full sm:max-w-md"
                        className="h-11 rounded-xl border-muted-foreground/20 bg-background/50 focus-visible:ring-primary/20"
                    />
                    <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        <div className="flex items-center gap-1.5">
                            <div className="size-1.5 rounded-full bg-primary" />
                            <span>{filteredPermissions.length} Results</span>
                        </div>
                        <div className="size-1 rounded-full bg-muted-foreground/30" />
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[9px] font-bold animate-pulse">
                            Auto-Save Enabled
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border bg-card/20 overflow-hidden shadow-sm">
                <RoleMatrixTable
                    sortedRoles={sortedRoles}
                    groupedPermissions={groupedPermissions}
                    draftPermissionIdsByRoleId={draftPermissionIdsByRoleId}
                    savingRoleIds={savingRoleIds}
                    collapsedCategoryKeys={collapsedCategoryKeys}
                    editingRoleId={editingRoleId}
                    editingRoleName={editingRoleName}
                    onToggleCategory={toggleCategory}
                    onPermissionToggle={handlePermissionToggle}
                    onStartRoleNameEdit={startRoleNameEdit}
                    onSubmitRoleNameEdit={submitRoleNameEdit}
                    onSetEditingRoleId={setEditingRoleId}
                    onSetEditingRoleName={setEditingRoleName}
                    onSetRoleToDelete={setRoleToDelete}
                />
            </div>

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
