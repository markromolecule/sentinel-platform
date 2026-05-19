'use client';

import { ScrollArea } from '@sentinel/ui';

export type PreviewRow = {
    student_number: string;
    last_name: string;
    first_name?: string | null;
    source_course?: string | null;
    status: string;
};

export type PreviewTableProps = {
    previewRows: PreviewRow[];
    visiblePreviewRows: PreviewRow[];
    hiddenPreviewRowCount: number;
    showsSourceCourse: boolean;
    maxPreviewRowsCount: number;
};

/**
 * Renders a tabular scroll area of records parsed from the CSV/Excel file that are ready to be imported.
 */
export function PreviewTable({
    previewRows,
    visiblePreviewRows,
    hiddenPreviewRowCount,
    showsSourceCourse,
    maxPreviewRowsCount,
}: PreviewTableProps) {
    if (previewRows.length === 0) {
        return null;
    }

    return (
        <div className="min-h-0 overflow-hidden rounded-lg border">
            <div className="bg-muted border-b px-4 py-2">
                <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Rows Ready To Import
                </p>
            </div>
            <ScrollArea className="h-[260px]">
                <table className="w-full text-left text-xs">
                    <thead className="bg-background sticky top-0 z-10 border-b">
                        <tr>
                            <th className="bg-muted/50 px-4 py-2 font-medium">
                                Student Number
                            </th>
                            <th className="bg-muted/50 px-4 py-2 font-medium">
                                Last Name
                            </th>
                            <th className="bg-muted/50 px-4 py-2 font-medium">
                                First Name
                            </th>
                            {showsSourceCourse && (
                                <th className="bg-muted/50 px-4 py-2 font-medium">
                                    Source Course
                                </th>
                            )}
                            <th className="bg-muted/50 px-4 py-2 font-medium">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {visiblePreviewRows.map((row, index) => (
                            <tr
                                key={`${row.student_number}-${index}`}
                                className="hover:bg-muted/50 transition-colors"
                            >
                                <td className="px-4 py-2 font-mono">
                                    {row.student_number}
                                </td>
                                <td className="px-4 py-2 font-medium">
                                    {row.last_name}
                                </td>
                                <td className="px-4 py-2">
                                    {row.first_name || '—'}
                                </td>
                                {showsSourceCourse && (
                                    <td className="px-4 py-2">
                                        {row.source_course || '—'}
                                    </td>
                                )}
                                <td className="px-4 py-2">
                                    {row.status}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </ScrollArea>
            {hiddenPreviewRowCount > 0 && (
                <div className="bg-muted/40 text-muted-foreground border-t px-4 py-2 text-xs">
                    Showing the first {maxPreviewRowsCount} of {previewRows.length} valid rows.
                    All rows will still be imported.
                </div>
            )}
        </div>
    );
}
