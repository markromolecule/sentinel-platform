import { TableHeader, TableRow, TableHead, Button } from '@sentinel/ui';
import { Trash2 } from 'lucide-react';
import type { AccessControlRole } from '@sentinel/shared/types';
import { formatRoleLabel } from '@/app/(protected)/(support)/access-control/_lib/access-control-presenters';

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
            <TableRow className="bg-muted/5 hover:bg-muted/5 h-20 border-t border-r border-l border-[#323d8f]/10">
                <TableHead className="bg-muted/5 border-muted/50 text-muted-foreground/80 sticky top-0 left-0 z-30 w-[240px] border-r pl-6 align-middle text-[12px] font-semibold">
                    Permission Baseline
                </TableHead>
                {sortedRoles.map((role) => (
                    <TableHead
                        key={role.id}
                        className="bg-muted/5 border-muted/50 sticky top-0 z-20 w-[130px] border-r pt-4 align-top whitespace-normal"
                    >
                        <div className="space-y-2">
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
                                        className="border-muted/50 bg-background text-foreground h-8 w-full rounded-none border px-2 text-[13px] font-semibold outline-none"
                                    />
                                ) : (
                                    <div className="flex min-h-[32px] items-start gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => onStartRoleNameEdit(role)}
                                            className="text-foreground hover:text-primary text-[13px] leading-tight font-semibold transition-colors"
                                        >
                                            {formatRoleLabel(role.name)}
                                        </button>
                                        {role.isSystem && (
                                            <div
                                                className="bg-primary mt-1 size-2 shrink-0 rounded-none"
                                                title="System Role"
                                            />
                                        )}
                                    </div>
                                )}
                                <div className="text-muted-foreground h-4 text-[11px] font-semibold">
                                    {savingRoleIds.includes(role.id)
                                        ? 'Saving...'
                                        : `${role.assignmentCount} Links`}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {!role.isSystem ? (
                                    <Button
                                        variant="ghost"
                                        size="xs"
                                        className="text-destructive hover:bg-destructive/5 h-6 rounded-none px-1.5 text-[11px] font-semibold"
                                        onClick={() => onSetRoleToDelete(role)}
                                    >
                                        <Trash2 className="mr-1 h-3 w-3" />
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
