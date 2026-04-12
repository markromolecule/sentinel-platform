import {
    TableRow,
    TableCell,
    Button,
    Checkbox,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@sentinel/ui';
import { CircleHelp } from 'lucide-react';
import type { AccessControlPermission, AccessControlRole } from '@sentinel/shared/types';
import {
    formatActionLabel,
    formatRoleLabel,
    getPermissionScopeLabel,
} from '@/app/(protected)/(support)/access-control/_lib/access-control-presenters';

interface RoleMatrixPermissionRowProps {
    permission: AccessControlPermission;
    sortedRoles: AccessControlRole[];
    draftPermissionIdsByRoleId: Record<number, string[]>;
    onPermissionToggle: (roleId: number, permissionId: string, checked: boolean) => void;
}

export function RoleMatrixPermissionRow({
    permission,
    sortedRoles,
    draftPermissionIdsByRoleId,
    onPermissionToggle,
}: RoleMatrixPermissionRowProps) {
    return (
        <TableRow key={permission.id}>
            <TableCell className="bg-background sticky left-0 z-10 border-r align-top whitespace-normal">
                <div className="flex items-start justify-between gap-3 pr-4">
                    <div className="min-w-0 space-y-1">
                        <div className="text-foreground font-medium">{permission.name}</div>
                        <div className="text-muted-foreground text-xs">
                            {formatActionLabel(permission.actionKey)} ·{' '}
                            {getPermissionScopeLabel(permission.scope)}
                        </div>
                        <div className="text-muted-foreground text-xs break-all">
                            {permission.key}
                        </div>
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                className="text-muted-foreground hover:text-foreground shrink-0"
                                aria-label={`View purpose of ${permission.name}`}
                            >
                                <CircleHelp className="h-3.5 w-3.5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" side="right" className="w-72 p-3">
                            <div className="space-y-1.5">
                                <div className="text-sm font-semibold">{permission.name}</div>
                                <p className="text-muted-foreground text-sm">
                                    {permission.description ||
                                        'No purpose has been written for this permission yet.'}
                                </p>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </TableCell>
            {sortedRoles.map((role) => {
                const isChecked = (draftPermissionIdsByRoleId[role.id] ?? []).includes(
                    permission.id,
                );

                return (
                    <TableCell key={`${permission.id}-${role.id}`} className="border-r text-center">
                        <div className="flex justify-center">
                            <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) =>
                                    onPermissionToggle(role.id, permission.id, Boolean(checked))
                                }
                                aria-label={`${permission.name} for ${formatRoleLabel(role.name)}`}
                            />
                        </div>
                    </TableCell>
                );
            })}
        </TableRow>
    );
}
