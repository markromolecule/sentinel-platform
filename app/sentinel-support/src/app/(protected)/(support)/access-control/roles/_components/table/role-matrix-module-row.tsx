import { TableRow, TableCell } from '@sentinel/ui';
import type { AccessControlPermission, AccessControlRole } from '@sentinel/shared/types';
import type { MatrixModule } from './role-matrix-types';

interface RoleMatrixModuleRowProps {
    module: MatrixModule;
    sortedRoles: AccessControlRole[];
    draftPermissionIdsByRoleId: Record<number, string[]>;
    categoryKey: string;
}

export function RoleMatrixModuleRow({
    module,
    sortedRoles,
    draftPermissionIdsByRoleId,
    categoryKey,
}: RoleMatrixModuleRowProps) {
    return (
        <TableRow
            key={`module-${categoryKey}-${module.moduleKey}`}
            className="bg-muted/10 hover:bg-muted/10"
        >
            <TableCell className="sticky left-0 z-10 border-r whitespace-normal">
                <div className="space-y-1">
                    <div className="text-foreground font-medium">{module.moduleLabel}</div>
                    <div className="text-muted-foreground text-xs">
                        {module.permissions.length} permissions
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
                        className="border-r text-center whitespace-normal"
                    >
                        <span className="text-muted-foreground text-xs">
                            {selectedCount}/{module.permissions.length}
                        </span>
                    </TableCell>
                );
            })}
        </TableRow>
    );
}
