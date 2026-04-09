import { TableRow, TableCell, Badge } from '@sentinel/ui';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { MatrixCategory, MatrixModule } from './role-matrix-types';

interface RoleMatrixCategoryRowProps {
    category: MatrixCategory;
    isCollapsed: boolean;
    rolesCount: number;
    onToggle: (key: string) => void;
}

export function RoleMatrixCategoryRow({
    category,
    isCollapsed,
    rolesCount,
    onToggle,
}: RoleMatrixCategoryRowProps) {
    const categoryKey = category.categoryKey ?? '__other__';
    const categoryPermissionCount = category.modules.reduce(
        (sum: number, module: MatrixModule) => sum + module.permissions.length,
        0,
    );

    return (
        <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableCell
                colSpan={rolesCount + 1}
                className="sticky left-0 z-10 border-r p-0 whitespace-normal"
            >
                <button
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                    onClick={() => onToggle(categoryKey)}
                >
                    <span className="flex items-center gap-3">
                        {isCollapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                        <span className="text-foreground font-semibold">
                            {category.categoryLabel}
                        </span>
                    </span>
                    <Badge variant="outline">{categoryPermissionCount}</Badge>
                </button>
            </TableCell>
        </TableRow>
    );
}
