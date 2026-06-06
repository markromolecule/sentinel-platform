import { useState, useLayoutEffect, type ReactNode } from 'react';
import { useActivePermissions } from '@sentinel/hooks';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '../../_lib/hooks/use-roles';
import type { AccessControlRole } from '@sentinel/shared/types';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Button,
    SearchBar,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Badge,
    Switch,
} from '@sentinel/ui';
import {
    AccessControlEmptyState,
    AccessControlErrorState,
    AccessControlLoadingState,
} from '@/app/(protected)/(support)/control/_components';
import { RoleForm } from '../roles/role-form';
import { Plus, Edit2, Trash2, Lock, ShieldCheck, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * RoleManagementView renders the core CRUD management grid for dynamic and system-seeded roles.
 * Includes search capability, locking indicators for system-default roles, and edit/delete modal flows.
 */
export function RoleManagementView({ setActions }: { setActions?: (actions: ReactNode) => void }) {
    const [searchValue, setSearchValue] = useState('');
    const { data: roles = [], isLoading, error } = useRoles(searchValue);

    const createRoleMutation = useCreateRole();
    const updateRoleMutation = useUpdateRole();
    const deleteRoleMutation = useDeleteRole();

    const [formOpen, setFormOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<AccessControlRole | null>(null);
    const [roleToDelete, setRoleToDelete] = useState<AccessControlRole | null>(null);

    const { hasPermission } = useActivePermissions();
    const canCreateRole = hasPermission('access_control:create_role');

    const systemRoleCount = roles.filter((role) => role.isSystem).length;
    const customRoleCount = roles.length - systemRoleCount;

    useLayoutEffect(() => {
        if (canCreateRole) {
            setActions?.(
                <Button
                    onClick={() => {
                        setSelectedRole(null);
                        setFormOpen(true);
                    }}
                    className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Role
                </Button>,
            );
        } else {
            setActions?.(null);
        }
        return () => setActions?.(null);
    }, [setActions, canCreateRole]);

    const handleCreateOrUpdate = (payload: any) => {
        if (selectedRole) {
            updateRoleMutation.mutate(
                { roleId: selectedRole.id, payload },
                {
                    onSuccess: () => {
                        toast.success(`Role "${payload.name}" updated successfully.`);
                        setFormOpen(false);
                    },
                    onError: (err: any) => {
                        toast.error(err.message || 'Failed to update role.');
                    },
                },
            );
        } else {
            createRoleMutation.mutate(payload, {
                onSuccess: () => {
                    toast.success(`Role "${payload.name}" created successfully.`);
                    setFormOpen(false);
                },
                onError: (err: any) => {
                    toast.error(err.message || 'Failed to create role.');
                },
            });
        }
    };

    const handleToggleActive = (role: AccessControlRole, checked: boolean) => {
        if (role.isSystem) {
            toast.error('System default roles must remain active.');
            return;
        }

        updateRoleMutation.mutate(
            { roleId: role.id, payload: { isActive: checked } },
            {
                onSuccess: () => {
                    toast.success(
                        `Role "${role.name}" has been ${checked ? 'activated' : 'deactivated'}.`,
                    );
                },
                onError: (err: any) => {
                    toast.error(err.message || 'Failed to update active state.');
                },
            },
        );
    };

    const handleDeleteConfirm = () => {
        if (!roleToDelete) return;

        deleteRoleMutation.mutate(roleToDelete.id, {
            onSuccess: () => {
                toast.success(`Role "${roleToDelete.name}" deleted successfully.`);
                setRoleToDelete(null);
            },
            onError: (err: any) => {
                toast.error(err.message || 'Failed to delete role.');
            },
        });
    };

    if (isLoading) return <AccessControlLoadingState label="Indexing role catalog..." />;
    if (error) return <AccessControlErrorState message={error.message} />;

    if (roles.length === 0 && !searchValue) {
        return (
            <AccessControlEmptyState
                title="Empty Role Catalog"
                description="No custom or system roles have been loaded. Create your first dynamic role definition to begin."
                action={
                    canCreateRole ? (
                        <Button
                            size="sm"
                            onClick={() => {
                                setSelectedRole(null);
                                setFormOpen(true);
                            }}
                            className="mt-4 bg-[#323d8f] hover:bg-[#323d8f]/90"
                        >
                            Create First Role
                        </Button>
                    ) : undefined
                }
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Search Controls */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                    <SearchBar
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder="Search roles by name, slug, description..."
                        containerClassName="w-full sm:max-w-md"
                        className="bg-background/50"
                    />
                    <div className="text-foreground flex items-center gap-4 text-[12px] font-semibold">
                        <div className="flex items-center gap-1.5">
                            <div className="bg-primary size-1.5 rounded-full" />
                            <span>{roles.length} Results</span>
                        </div>
                        <div className="bg-muted-foreground/30 size-1 rounded-full" />
                        <span>{systemRoleCount} System Seeded</span>
                        <div className="bg-muted-foreground/30 size-1 rounded-full" />
                        <span>{customRoleCount} Custom</span>
                    </div>
                </div>
            </div>

            {/* Grid Table */}
            {roles.length === 0 ? (
                <div className="border-muted/50 bg-muted/5 rounded-none border border-dashed py-20 text-center">
                    <AccessControlEmptyState
                        title="No Matching Roles"
                        description="Your search criteria did not match any roles in the catalog."
                        action={
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSearchValue('')}
                                className="mt-4"
                            >
                                Clear Search
                            </Button>
                        }
                    />
                </div>
            ) : (
                <div className="max-h-[calc(100vh-18rem)] overflow-auto border border-[#323d8f]/10">
                    <Table className="min-w-full">
                        <TableHeader className="bg-muted/5 border-muted/50 sticky top-0 z-10 border-b">
                            <TableRow className="h-12 hover:bg-transparent">
                                <TableHead className="text-muted-foreground/80 border-muted/50 w-[25%] border-r pl-6 text-[12px] font-bold tracking-wider uppercase">
                                    Role Name / Slug
                                </TableHead>
                                <TableHead className="text-muted-foreground/80 border-muted/50 w-[35%] border-r text-[12px] font-bold tracking-wider uppercase">
                                    Description
                                </TableHead>
                                <TableHead className="text-muted-foreground/80 border-muted/50 w-[15%] border-r text-center text-[12px] font-bold tracking-wider uppercase">
                                    Active Domains
                                </TableHead>
                                <TableHead className="text-muted-foreground/80 border-muted/50 w-[10%] border-r text-center text-[12px] font-bold tracking-wider uppercase">
                                    Posture Status
                                </TableHead>
                                <TableHead className="text-muted-foreground/80 w-[15%] pr-6 text-right text-[12px] font-bold tracking-wider uppercase">
                                    Management
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {roles.map((role) => (
                                <TableRow
                                    key={role.id}
                                    className="hover:bg-muted/5 h-16 border-b border-[#323d8f]/10 transition-colors"
                                >
                                    {/* Name & Slug */}
                                    <TableCell className="border-muted/50 border-r pl-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-foreground text-[14px] font-semibold">
                                                    {role.name}
                                                </span>
                                                {role.isSystem ? (
                                                    <Badge className="bg-primary/10 text-primary border-primary/10 flex h-5 items-center gap-1 rounded-full px-2 py-0 text-[10px] font-bold">
                                                        <ShieldCheck className="h-3 w-3" />
                                                        System
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-secondary/15 text-secondary border-secondary/10 h-5 rounded-full px-2 py-0 text-[10px] font-bold">
                                                        Custom
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-muted-foreground font-mono text-[11px] font-semibold break-all">
                                                {role.slug}
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Description */}
                                    <TableCell className="border-muted/50 text-muted-foreground border-r text-[13px]">
                                        {role.description || (
                                            <span className="text-muted-foreground/60 italic">
                                                No description specified.
                                            </span>
                                        )}
                                    </TableCell>

                                    {/* Domain Scopes */}
                                    <TableCell className="border-muted/50 border-r text-center">
                                        <div className="flex flex-wrap justify-center gap-1.5 px-2">
                                            {role.domainScope && role.domainScope.length > 0 ? (
                                                role.domainScope.map((domain) => (
                                                    <Badge
                                                        key={domain}
                                                        variant="outline"
                                                        className="border-primary/10 bg-primary/5 text-primary text-[10px] font-bold uppercase"
                                                    >
                                                        {domain}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <Badge
                                                    variant="destructive"
                                                    className="text-[10px] font-bold uppercase"
                                                >
                                                    Global
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Posture Switch Toggle */}
                                    <TableCell className="border-muted/50 border-r text-center">
                                        <div className="flex items-center justify-center">
                                            <Switch
                                                checked={role.isActive}
                                                disabled={
                                                    role.isSystem || updateRoleMutation.isPending
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleToggleActive(role, checked)
                                                }
                                                aria-label={`Toggle status for ${role.name}`}
                                            />
                                        </div>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell className="pr-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setSelectedRole(role);
                                                    setFormOpen(true);
                                                }}
                                                disabled={updateRoleMutation.isPending}
                                                title="Edit properties"
                                            >
                                                <Edit2 className="text-foreground/80 h-4 w-4" />
                                            </Button>

                                            {role.isSystem ? (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled
                                                    className="cursor-not-allowed opacity-50"
                                                    title="System roles are protected"
                                                >
                                                    <Lock className="text-muted-foreground h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setRoleToDelete(role)}
                                                    disabled={deleteRoleMutation.isPending}
                                                    className="text-destructive hover:text-destructive"
                                                    title="Permanently remove"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Role Config Dialog */}
            <RoleForm
                open={formOpen}
                onOpenChange={setFormOpen}
                role={selectedRole}
                roles={roles}
                isPending={createRoleMutation.isPending || updateRoleMutation.isPending}
                onSubmit={handleCreateOrUpdate}
            />

            {/* Deletion Dialog */}
            <AlertDialog
                open={Boolean(roleToDelete)}
                onOpenChange={(open) => !open && setRoleToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Role Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you absolutely sure you want to delete the role{' '}
                            <strong>&quot;{roleToDelete?.name}&quot;</strong>? This action is
                            permanent and will completely remove this role definition from the
                            authorization service.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteRoleMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(event) => {
                                event.preventDefault();
                                handleDeleteConfirm();
                            }}
                            disabled={deleteRoleMutation.isPending}
                            className="bg-destructive hover:bg-destructive/90 text-white"
                        >
                            {deleteRoleMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
