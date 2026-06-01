'use client';

import { useState, type ReactNode } from 'react';
import { type RowSelectionState } from '@tanstack/react-table';
import {
    useCoursesQuery,
    useDepartmentsQuery,
    useInstitutionsQuery,
    useDeleteSelectedStudentWhitelistMutation,
    useStableValue,
} from '@sentinel/hooks';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Button,
    DataTable,
} from '@sentinel/ui';
import { StudentWhitelist } from '@sentinel/shared/types';
import { columns } from '@/app/(protected)/(admin)/users/whitelist/_components/tables/columns';
import { StudentWhitelistEmptyState } from './student-whitelist-empty-state';
import { buildStudentWhitelistFacets } from './student-whitelist-facets';
import { Loader2, Trash2 } from 'lucide-react';

interface StudentWhitelistListProps {
    records: StudentWhitelist[];
    search?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
    showInstitution?: boolean;
    toolbarActions?: ReactNode;
}

/**
 * StudentWhitelistList renders a data table of student whitelist entries
 * with search, facets, actions, and support for bulk/individual deletions.
 *
 * @param props - Component props containing whitelist records, search filters, and toolbar actions.
 */
export function StudentWhitelistList({
    records,
    search,
    onSearchChange,
    isLoading = false,
    showInstitution = false,
    toolbarActions,
}: StudentWhitelistListProps) {
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [deleteOpen, setDeleteOpen] = useState(false);
    const { data: institutions = [] } = useInstitutionsQuery();
    const { data: departments = [] } = useDepartmentsQuery();
    const { data: courses = [] } = useCoursesQuery();
    const selectedRecords = useStableValue(
        () => records.filter((_, index) => rowSelection[String(index)]),
        [records, rowSelection],
    );
    const deleteSelected = useDeleteSelectedStudentWhitelistMutation({
        onSuccess: () => {
            setDeleteOpen(false);
            setRowSelection({});
        },
    });
    const facets = useStableValue(() => {
        const nextFacets = buildStudentWhitelistFacets({
            institutions,
            departments,
            courses,
        });

        return showInstitution
            ? nextFacets
            : nextFacets.filter((facet) => facet.columnKey !== 'institutionId');
    }, [courses, departments, institutions, showInstitution]);

    const combinedToolbarActions = useStableValue(
        () => (
            <>
                {toolbarActions}
                {selectedRecords.length > 0 && (
                    <Button
                        variant="outline"
                        className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteOpen(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Selected ({selectedRecords.length})
                    </Button>
                )}
            </>
        ),
        [selectedRecords.length, toolbarActions],
    );

    return (
        <>
            <DataTable
                columns={columns}
                data={records}
                searchValue={search}
                onSearchChange={onSearchChange}
                searchPlaceholder="Search student numbers or names..."
                facets={facets}
                isLoading={isLoading}
                toolbarActions={combinedToolbarActions}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                initialColumnVisibility={{
                    institutionId: showInstitution,
                    claimedName: false,
                }}
                emptyContent={<StudentWhitelistEmptyState search={search} />}
            />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete selected whitelist entries?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will delete the selected unclaimed whitelist entries. Any claimed
                            entries in the selection will be skipped and left unchanged.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteSelected.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90 text-white"
                            disabled={deleteSelected.isPending}
                            onClick={(event) => {
                                event.preventDefault();
                                deleteSelected.mutate(selectedRecords);
                            }}
                        >
                            {deleteSelected.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                `Delete Selected (${selectedRecords.length})`
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
