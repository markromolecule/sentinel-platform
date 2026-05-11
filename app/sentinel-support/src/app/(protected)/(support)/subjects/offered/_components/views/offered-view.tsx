'use client';

import { DataTable, PageHeader, PermissionDeniedState, Separator } from '@sentinel/ui';
import { TemplateContextToolbar } from '@/app/(protected)/(support)/_components/template-context-toolbar';
import { useOfferedPageState } from '@/app/(protected)/(support)/subjects/offered/_hooks/use-offered-page-state';
import { offeredColumns } from '@/app/(protected)/(support)/subjects/offered/_components/tables/offered-columns';
import { isPermissionDeniedError, useStableValue } from '@sentinel/hooks';

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

    const isViewDenied = isPermissionDeniedError(error, 'subject_offerings:view');

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
                options: institutions.map((institution) => ({
                    label: institution.name,
                    value: institution.name,
                })),
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
        [institutions],
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

                    <DataTable
                        columns={offeredColumns}
                        data={offerings}
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
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
