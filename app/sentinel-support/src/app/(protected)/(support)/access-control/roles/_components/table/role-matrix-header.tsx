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
            <TableRow className="bg-muted/5 hover:bg-muted/5 h-20 border-t border-l border-r border-[#323d8f]/10">
                <TableHead className="bg-muted/5 sticky top-0 left-0 z-30 w-[240px] border-r border-muted/50 text-[12px] font-semibold text-muted-foreground/80 pl-6 align-middle">
                    Permission Baseline
                </TableHead>
                {sortedRoles.map((role) => (
                    <TableHead
                        key={role.id}
                        className="bg-muted/5 sticky top-0 z-20 w-[130px] border-r border-muted/50 align-top whitespace-normal pt-4"
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
                                    <div className="flex items-start gap-1.5 min-h-[32px]">
                                        <button
                                            type="button"
                                            onClick={() => onStartRoleNameEdit(role)}
                                            className="text-foreground text-[13px] font-semibold leading-tight hover:text-primary transition-colors"
                                        >
                                            {formatRoleLabel(role.name)}
                                        </button>
                                        {role.isSystem && (
                                            <div className="mt-1 size-2 rounded-none bg-primary shrink-0" title="System Role" />
                                        )}
                                    </div>
                                )}
                                <div className="text-muted-foreground text-[11px] font-semibold h-4">
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
                                        className="text-destructive h-6 px-1.5 text-[11px] font-semibold hover:bg-destructive/5 rounded-none"
                                        onClick={() => onSetRoleToDelete(role)}
                                    >
                                        <Trash2 className="h-3 w-3 mr-1" />
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
