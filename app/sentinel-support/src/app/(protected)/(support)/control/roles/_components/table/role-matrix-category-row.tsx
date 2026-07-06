import { TableRow, TableCell } from '@sentinel/ui';
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
        <TableRow className="border border-r border-l border-[#323d8f]/20 bg-[#f4faff] hover:bg-[#ebf5ff] dark:bg-slate-900/60 dark:hover:bg-slate-800/80">
            <TableCell
                colSpan={rolesCount + 1}
                className="border-muted/50 sticky left-0 z-10 border-r p-0 bg-inherit whitespace-normal"
            >
                <button
                    type="button"
                    className="flex w-full items-center justify-between px-6 py-3.5 text-left"
                    onClick={() => onToggle(categoryKey)}
                >
                    <span className="flex items-center gap-3">
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
                        <span className="text-foreground text-[14px] font-semibold tracking-tight">
                            {category.categoryLabel}
                        </span>
                    </span>
                    <div className="border-muted/50 bg-background text-foreground flex h-6 items-center justify-center rounded-none border px-2 text-[11px] font-semibold">
                        {categoryPermissionCount}
                    </div>
                </button>
            </TableCell>
        </TableRow>
    );
}
