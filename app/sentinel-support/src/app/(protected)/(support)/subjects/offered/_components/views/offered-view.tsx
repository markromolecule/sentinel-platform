'use client';

import { useState } from 'react';
import { ColumnFiltersState } from '@tanstack/react-table';
import { DataTable, PageHeader, PermissionDeniedState, Separator } from '@sentinel/ui';
import { useOfferedPageState } from '@/app/(protected)/(support)/subjects/offered/_hooks/use-offered-page-state';
import { offeredColumns } from '@/app/(protected)/(support)/subjects/offered/_components/tables/offered-columns';
import { isPermissionDeniedError, useStableValue } from '@sentinel/hooks';
import { useInstitutionFacet, useDataTableFilterSync } from '@/hooks';

export function OfferedView() {
    const {
        searchTerm,
        setSearchTerm,
        selectedInstitutionId,
        setSelectedInstitutionId,
        institutions,
        offerings,
        isLoading,
        isError,
        error,
    } = useOfferedPageState();

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        selectedInstitutionId
            ? [{ id: 'institution', value: [selectedInstitutionId] }]
            : [],
    );

    const isViewDenied = isPermissionDeniedError(error, 'subject_offerings:view');

    const institutionOptions = useInstitutionFacet({ institutions });

    useDataTableFilterSync({
        columnFilters,
        syncKeys: ['institution'],
        onFilterChange: (key, value) => {
            if (key === 'institution') {
                setSelectedInstitutionId(value);
            }
        },
    });

    const facets = useStableValue(
        () => [
            {
                columnKey: 'origin',
                title: 'Origin',
                options: ['Inherited', 'Local', 'Overridden'].map((origin) => ({
                    label: origin,
                    value: origin,
                })),
            },
            {
                columnKey: 'institution',
                title: 'Institution',
                options: institutionOptions,
            },
            {
                columnKey: 'status',
                title: 'Status',
                options: ['DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED'].map((status) => ({
                    label: status,
                    value: status,
                })),
            },
        ],
        [institutionOptions],
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
                    <DataTable
                        columns={offeredColumns}
                        data={offerings}
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
                        columnFilters={columnFilters}
                        onColumnFiltersChange={setColumnFilters}
                        searchPlaceholder="Search offered subjects..."
                        facets={facets}
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
