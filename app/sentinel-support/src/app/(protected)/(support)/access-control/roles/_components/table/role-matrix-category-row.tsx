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
        <TableRow className="bg-[#f4faff] hover:bg-[#ebf5ff] border border-[#323d8f]/20 border-l border-r">
            <TableCell
                colSpan={rolesCount + 1}
                className="sticky left-0 z-10 border-r border-muted/50 p-0 whitespace-normal"
            >
                <button
                    type="button"
                    className="flex w-full items-center justify-between px-6 py-3.5 text-left"
                    onClick={() => onToggle(categoryKey)}
                >
                    <span className="flex items-center gap-3">
                        {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 text-muted-foreground/80" strokeWidth={3} />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground/80" strokeWidth={3} />
                        )}
                        <span className="text-foreground text-[14px] font-semibold tracking-tight">
                            {category.categoryLabel}
                        </span>
                    </span>
                    <div className="flex px-2 h-6 items-center justify-center rounded-none border border-muted/50 bg-background text-[11px] font-semibold text-foreground">
                        {categoryPermissionCount}
                    </div>
                </button>
            </TableCell>
        </TableRow>
    );
}
