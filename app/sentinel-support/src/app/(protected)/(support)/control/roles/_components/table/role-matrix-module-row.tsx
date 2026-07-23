import { TableRow, TableCell } from '@sentinel/ui';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { AccessControlPermission, AccessControlRole } from '@sentinel/shared/types';
import type { MatrixModule } from './role-matrix-types';

interface RoleMatrixModuleRowProps {
    module: MatrixModule;
    sortedRoles: AccessControlRole[];
    draftPermissionIdsByRoleId: Record<number, string[]>;
    categoryKey: string;
    isCollapsed: boolean;
    onToggle: () => void;
}

export function RoleMatrixModuleRow({
    module,
    sortedRoles,
    draftPermissionIdsByRoleId,
    categoryKey,
    isCollapsed,
    onToggle,
}: RoleMatrixModuleRowProps) {
    return (
        <TableRow
            key={`module-${categoryKey}-${module.moduleKey}`}
            className="bg-muted/15 hover:bg-muted/20 cursor-pointer border border-[#323d8f]/10"
            onClick={onToggle}
        >
            <TableCell className="border-muted/30 sticky left-0 z-10 border-r bg-inherit py-3 pl-10 whitespace-normal">
                <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                        {isCollapsed ? (
                            <ChevronRight
                                className="text-muted-foreground/80 h-4 w-4"
                                strokeWidth={3}
                            />
                        ) : (
                            <ChevronDown
                                className="text-muted-foreground/80 h-4 w-4"
                                strokeWidth={3}
                            />
                        )}
                    </div>
                    <div className="space-y-0.5">
                        <div className="text-foreground text-foreground/90 text-[14px] font-bold">
                            {module.moduleLabel}
                        </div>
                        <div className="text-muted-foreground text-[11px] font-bold">
                            {module.permissions.length} permissions
                        </div>
                    </div>
                </div>
            </TableCell>
            {sortedRoles.map((role) => {
                const selectedCount = module.permissions.filter(
                    (permission: AccessControlPermission) =>
                        (draftPermissionIdsByRoleId[role.id] ?? []).includes(permission.id),
                ).length;

                return (
                    <TableCell
                        key={`module-summary-${module.moduleKey}-${role.id}`}
                        className="border-muted/30 border-r text-center whitespace-normal"
                    >
                        <span className="text-foreground text-[12px] font-bold">
                            {selectedCount}/{module.permissions.length}
                        </span>
                    </TableCell>
                );
            })}
        </TableRow>
    );
}
