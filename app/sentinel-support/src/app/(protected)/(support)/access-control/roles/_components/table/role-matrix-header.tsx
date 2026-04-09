import { TableHeader, TableRow, TableHead, Button } from '@sentinel/ui';
import { Trash2 } from 'lucide-react';
import type { AccessControlRole } from '@sentinel/shared/types';

interface RoleMatrixHeaderProps {
    sortedRoles: AccessControlRole[];
    savingRoleIds: number[];
    editingRoleId: number | null;
    editingRoleName: string;
    onStartRoleNameEdit: (role: AccessControlRole) => void;
    onSubmitRoleNameEdit: (role: AccessControlRole) => void;
    onSetEditingRoleId: (id: number | null) => void;
    onSetEditingRoleName: (name: string) => void;
    onSetRoleToDelete: (role: AccessControlRole) => void;
}

export function RoleMatrixHeader({
    sortedRoles,
    savingRoleIds,
    editingRoleId,
    editingRoleName,
    onStartRoleNameEdit,
    onSubmitRoleNameEdit,
    onSetEditingRoleId,
    onSetEditingRoleName,
    onSetRoleToDelete,
}: RoleMatrixHeaderProps) {
    return (
        <TableHeader>
            <TableRow className="bg-background hover:bg-background">
                <TableHead className="bg-background sticky top-0 left-0 z-30 w-[320px] border-r whitespace-normal">
                    Permission
                </TableHead>
                {sortedRoles.map((role) => (
                    <TableHead
                        key={role.id}
                        className="bg-background sticky top-0 z-20 w-[180px] border-r align-top whitespace-normal"
                    >
                        <div className="space-y-3 py-1">
                            <div className="space-y-1">
                                {editingRoleId === role.id ? (
                                    <input
                                        autoFocus
                                        value={editingRoleName}
                                        onChange={(event) =>
                                            onSetEditingRoleName(event.target.value)
                                        }
                                        onBlur={() => {
                                            onSetEditingRoleId(null);
                                            onSetEditingRoleName('');
                                        }}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                event.preventDefault();
                                                void onSubmitRoleNameEdit(role);
                                            }

                                            if (event.key === 'Escape') {
                                                onSetEditingRoleId(null);
                                                onSetEditingRoleName('');
                                            }
                                        }}
                                        className="border-border bg-background text-foreground h-8 w-full rounded-md border px-2 text-sm font-semibold outline-none"
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => onStartRoleNameEdit(role)}
                                        className="text-foreground min-h-8 text-left text-sm font-semibold"
                                    >
                                        {role.name}
                                    </button>
                                )}
                                <div className="text-muted-foreground text-xs">
                                    {savingRoleIds.includes(role.id)
                                        ? 'Saving changes...'
                                        : `${role.assignmentCount} users`}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {!role.isSystem ? (
                                    <Button
                                        variant="ghost"
                                        size="xs"
                                        className="text-destructive"
                                        onClick={() => onSetRoleToDelete(role)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                        Delete
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    </TableHead>
                ))}
            </TableRow>
        </TableHeader>
    );
}
