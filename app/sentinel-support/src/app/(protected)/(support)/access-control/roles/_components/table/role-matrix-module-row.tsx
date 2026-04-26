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
            className="bg-muted/15 hover:bg-muted/20 border border-[#323d8f]/10 cursor-pointer"
            onClick={onToggle}
        >
            <TableCell className="sticky left-0 z-10 border-r border-muted/30 whitespace-normal pl-10 py-3">
                <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                        {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 text-muted-foreground/80" strokeWidth={3} />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground/80" strokeWidth={3} />
                        )}
                    </div>
                    <div className="space-y-0.5">
                        <div className="text-foreground text-[14px] font-bold text-foreground/90">{module.moduleLabel}</div>
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
                        className="border-r border-muted/30 text-center whitespace-normal"
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
