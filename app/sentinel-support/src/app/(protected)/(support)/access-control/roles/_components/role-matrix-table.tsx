import type { AccessControlRole } from '@sentinel/shared/types';
import { Table, TableBody } from '@sentinel/ui';
import type { MatrixCategory, MatrixModule } from './table/role-matrix-types';
import { RoleMatrixHeader } from './table/role-matrix-header';
import { RoleMatrixCategoryRow } from './table/role-matrix-category-row';
import { RoleMatrixModuleRow } from './table/role-matrix-module-row';
import { RoleMatrixPermissionRow } from './table/role-matrix-permission-row';

interface RoleMatrixTableProps {
    sortedRoles: AccessControlRole[];
    groupedPermissions: MatrixCategory[];
    draftPermissionIdsByRoleId: Record<number, string[]>;
    savingRoleIds: number[];
    collapsedCategoryKeys: Record<string, boolean>;
    editingRoleId: number | null;
    editingRoleName: string;
    onToggleCategory: (key: string) => void;
    onPermissionToggle: (roleId: number, permissionId: string, checked: boolean) => void;
    onStartRoleNameEdit: (role: AccessControlRole) => void;
    onSubmitRoleNameEdit: (role: AccessControlRole) => void;
    onSetEditingRoleId: (id: number | null) => void;
    onSetEditingRoleName: (name: string) => void;
    onSetRoleToDelete: (role: AccessControlRole) => void;
}

export function RoleMatrixTable({
    sortedRoles,
    groupedPermissions,
    draftPermissionIdsByRoleId,
    savingRoleIds,
    collapsedCategoryKeys,
    editingRoleId,
    editingRoleName,
    onToggleCategory,
    onPermissionToggle,
    onStartRoleNameEdit,
    onSubmitRoleNameEdit,
    onSetEditingRoleId,
    onSetEditingRoleName,
    onSetRoleToDelete,
}: RoleMatrixTableProps) {
    return (
        <div
            data-lenis-prevent
            className="max-h-[calc(100svh-20rem)] min-h-[28rem] overflow-auto border-y"
        >
            <Table className="min-w-[1220px] table-fixed">
                <RoleMatrixHeader
                    sortedRoles={sortedRoles}
                    savingRoleIds={savingRoleIds}
                    editingRoleId={editingRoleId}
                    editingRoleName={editingRoleName}
                    onStartRoleNameEdit={onStartRoleNameEdit}
                    onSubmitRoleNameEdit={onSubmitRoleNameEdit}
                    onSetEditingRoleId={onSetEditingRoleId}
                    onSetEditingRoleName={onSetEditingRoleName}
                    onSetRoleToDelete={onSetRoleToDelete}
                />

                <TableBody>
                    {groupedPermissions.flatMap((category) => {
                        const categoryKey = category.categoryKey ?? '__other__';
                        const isCollapsed = collapsedCategoryKeys[categoryKey] ?? false;

                        return [
                            <RoleMatrixCategoryRow
                                key={`category-${categoryKey}`}
                                category={category}
                                isCollapsed={isCollapsed}
                                rolesCount={sortedRoles.length}
                                onToggle={onToggleCategory}
                            />,
                            ...(!isCollapsed
                                ? category.modules.flatMap((module: MatrixModule) => [
                                      <RoleMatrixModuleRow
                                          key={`module-${categoryKey}-${module.moduleKey}`}
                                          module={module}
                                          sortedRoles={sortedRoles}
                                          draftPermissionIdsByRoleId={draftPermissionIdsByRoleId}
                                          categoryKey={categoryKey}
                                      />,
                                      ...module.permissions.map((permission) => (
                                          <RoleMatrixPermissionRow
                                              key={permission.id}
                                              permission={permission}
                                              sortedRoles={sortedRoles}
                                              draftPermissionIdsByRoleId={
                                                  draftPermissionIdsByRoleId
                                              }
                                              onPermissionToggle={onPermissionToggle}
                                          />
                                      )),
                                  ])
                                : []),
                        ];
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
