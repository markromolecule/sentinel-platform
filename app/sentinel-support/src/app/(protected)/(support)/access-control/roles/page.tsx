'use client';

import {
    Badge,
    Button,
    SearchBar,
} from '@sentinel/ui';
import {
    AccessControlEmptyState,
    AccessControlErrorState,
    AccessControlLoadingState,
    AccessControlPageShell,
    RoleEditorDialog,
} from '@/app/(protected)/(support)/access-control/_components';
import { useRoleMatrix } from './_hooks/use-role-matrix';
import { RoleMatrixTable } from './_components/role-matrix-table';
import { DeleteRoleDialog } from './_components/dialog/delete-role-dialog';

export default function AccessControlRolesPage() {
    const {
        // Data
        sortedRoles,
        permissions,
        filteredPermissions,
        groupedPermissions,

        // State
        isBusy,
        pageError,
        editorOpen,
        selectedRole: editorRole,
        roleToDelete,
        searchValue,
        draftPermissionIdsByRoleId,
        savingRoleIds,
        collapsedCategoryKeys,
        editingRoleId,
        editingRoleName,

        // Mutations
        createRoleMutation,
        updateRoleMutation,
        deleteRoleMutation,

        // Setters
        setEditorOpen,
        setSelectedRole,
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

    return (
        <AccessControlPageShell
            title="Roles"
            description="Manage role access from one matrix. Permissions are listed on the left and each role gets its own checkbox column."
            actions={
                <Button
                    onClick={() => {
                        setSelectedRole(null);
                        setEditorOpen(true);
                    }}
                >
                    New role
                </Button>
            }
        >
            {isBusy ? (
                <AccessControlLoadingState label="Loading roles and permissions..." />
            ) : pageError ? (
                <AccessControlErrorState message={pageError.message} />
            ) : sortedRoles.length === 0 ? (
                <AccessControlEmptyState
                    title="No roles found"
                    description="Create the first role to start building the access matrix."
                    action={
                        <Button
                            onClick={() => {
                                setSelectedRole(null);
                                setEditorOpen(true);
                            }}
                        >
                            Create first role
                        </Button>
                    }
                />
            ) : permissions.length === 0 ? (
                <AccessControlEmptyState
                    title="No permissions found"
                    description="Create permissions first, then return here to assign them to roles."
                />
            ) : (
                <div className="space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <SearchBar
                                value={searchValue}
                                onChange={(event) => setSearchValue(event.target.value)}
                                placeholder="Search permission name, area, action, or key..."
                                containerClassName="w-full sm:w-[340px]"
                            />
                            <div className="text-muted-foreground flex items-center gap-2 text-xs">
                                <span>{filteredPermissions.length} visible permissions</span>
                                <Badge variant="outline">Auto-save enabled</Badge>
                            </div>
                        </div>
                    </div>

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
            )}

            <RoleEditorDialog
                open={editorOpen}
                onOpenChange={setEditorOpen}
                role={editorRole}
                isPending={createRoleMutation.isPending || updateRoleMutation.isPending}
                onSubmit={(payload) => {
                    if (editorRole) {
                        updateRoleMutation.mutate(
                            { roleId: editorRole.id, payload },
                            {
                                onSuccess: () => {
                                    setEditorOpen(false);
                                },
                            },
                        );
                        return;
                    }

                    createRoleMutation.mutate(payload, {
                        onSuccess: () => {
                            setEditorOpen(false);
                        },
                    });
                }}
            />

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
        </AccessControlPageShell>
    );
}
