'use client';

import { OriginStatusBadge, getOriginStatusLabel } from '../_components/origin-status-badge';
import { TemplateContextToolbar } from '../_components/template-context-toolbar';
import {
    isPermissionDeniedError,
    useDebounce,
    useInstitutionsQuery,
    useSubjectOfferingsQuery,
} from '@sentinel/hooks';
import { SubjectOffering } from '@sentinel/shared/types';
import {
    Badge,
    DataTable,
    DataTableColumnHeader,
    NativeSelect,
    NativeSelectOption,
    PageHeader,
    PermissionDeniedState,
    Separator,
} from '@sentinel/ui';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

function SummaryBadges({ labels, emptyLabel }: { labels: string[]; emptyLabel: string }) {
    if (labels.length === 0) {
        return <span className="text-muted-foreground text-sm">{emptyLabel}</span>;
    }

    return (
        <div className="flex flex-wrap gap-1">
            {labels.slice(0, 2).map((label) => (
                <Badge key={label} variant="secondary" className="font-medium">
                    {label}
                </Badge>
            ))}
            {labels.length > 2 ? (
                <span className="text-muted-foreground self-center text-xs">
                    +{labels.length - 2} more
                </span>
            ) : null}
        </div>
    );
}

export default function SupportSubjectOfferingsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInstitutionId, setSelectedInstitutionId] = useState('');
    const [originFilter, setOriginFilter] = useState('ALL');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const { data: institutions = [] } = useInstitutionsQuery();
    const {
        data: offerings = [],
        isLoading,
        isError,
        error,
    } = useSubjectOfferingsQuery({
        search: debouncedSearch || undefined,
        institutionId: selectedInstitutionId || undefined,
    });
    const isViewDenied = isPermissionDeniedError(error, 'subject_offerings:view');

    const filteredOfferings = useMemo(
        () =>
            offerings.filter((offering) => {
                if (originFilter === 'ALL') return true;
                return getOriginStatusLabel(offering).toUpperCase() === originFilter;
            }),
        [offerings, originFilter],
    );

    const columns = useMemo<ColumnDef<SubjectOffering>[]>(
        () => [
            {
                accessorKey: 'subjectCode',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Subject Code" />
                ),
                cell: ({ row }) => <span className="font-medium">{row.original.subjectCode}</span>,
            },
            {
                accessorKey: 'subjectTitle',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Subject" />,
            },
            {
                id: 'term',
                accessorFn: (row) => `${row.termAcademicYear} ${row.termSemester}`,
                header: ({ column }) => <DataTableColumnHeader column={column} title="Term" />,
                cell: ({ row }) => (
                    <div className="space-y-1">
                        <div className="font-medium">{row.original.termAcademicYear}</div>
                        <div className="text-muted-foreground text-xs">
                            {row.original.termSemester}
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'status',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
                cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
            },
            {
                id: 'origin',
                accessorFn: (row) => row.inheritanceStatus ?? 'LOCAL',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Origin" />,
                cell: ({ row }) => <OriginStatusBadge record={row.original} />,
            },
            {
                id: 'departments',
                accessorFn: (row) =>
                    row.departments.map((department) => department.name).join(', '),
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Departments" />
                ),
                cell: ({ row }) => (
                    <SummaryBadges
                        labels={row.original.departments.map((department) => department.name)}
                        emptyLabel="No departments"
                    />
                ),
            },
            {
                id: 'courses',
                accessorFn: (row) =>
                    row.courses.map((course) => course.code ?? course.title).join(', '),
                header: ({ column }) => <DataTableColumnHeader column={column} title="Courses" />,
                cell: ({ row }) => (
                    <SummaryBadges
                        labels={row.original.courses.map((course) => course.code ?? course.title)}
                        emptyLabel="No courses"
                    />
                ),
            },
            {
                id: 'sections',
                accessorFn: (row) => row.sections.map((section) => section.name).join(', '),
                header: ({ column }) => <DataTableColumnHeader column={column} title="Sections" />,
                cell: ({ row }) => (
                    <SummaryBadges
                        labels={row.original.sections.map((section) => section.name)}
                        emptyLabel="No sections"
                    />
                ),
            },
        ],
        [],
    );

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Offered Subject Management"
                description="Inspect offered subjects across parent template and branch effective contexts."
            />
            <Separator />

            {isViewDenied ? (
                <PermissionDeniedState resourceName="subject offerings" className="h-[360px]" />
            ) : (
                <>
                    <TemplateContextToolbar
                        institutions={institutions}
                        selectedInstitutionId={selectedInstitutionId}
                        onInstitutionChange={setSelectedInstitutionId}
                    />
                    <div className="flex justify-end">
                        <NativeSelect
                            className="w-[180px]"
                            value={originFilter}
                            onChange={(event) => setOriginFilter(event.target.value)}
                        >
                            <NativeSelectOption value="ALL">All origins</NativeSelectOption>
                            <NativeSelectOption value="INHERITED">Inherited</NativeSelectOption>
                            <NativeSelectOption value="LOCAL">Local</NativeSelectOption>
                            <NativeSelectOption value="OVERRIDDEN">Overridden</NativeSelectOption>
                        </NativeSelect>
                    </div>
                    <DataTable
                        columns={columns}
                        data={filteredOfferings}
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
                        searchPlaceholder="Search offered subjects..."
                        isLoading={isLoading}
                    />
                    {isError ? (
                        <div className="text-destructive bg-destructive/5 border-destructive/20 flex h-32 items-center justify-center rounded-md border">
                            Error loading offered subjects. Contact support if this continues.
                        </div>
                    ) : null}
                </>
            )}
        </div>
    );
}
