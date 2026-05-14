'use client';

import {
    useDebounce,
    useDepartmentsQuery,
    isPermissionDeniedError,
    useInstitutionsQuery,
} from '@sentinel/hooks';
import { useState } from 'react';
import {
    AddDepartmentDialog,
    BulkCreateDepartmentsDialog,
    DepartmentsList,
} from '@/app/(protected)/(support)/departments/_components';
import { PageHeader, PermissionDeniedState, Separator } from '@sentinel/ui';
import { TemplateContextToolbar } from '../_components/template-context-toolbar';

export default function SupportDepartmentsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInstitutionId, setSelectedInstitutionId] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data: institutions = [] } = useInstitutionsQuery();

    const {
        data: departments = [],
        isLoading,
        isError,
        error,
    } = useDepartmentsQuery(debouncedSearch, selectedInstitutionId || undefined);
    const isViewDenied = isPermissionDeniedError(error, 'departments:view');

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Department Management"
                description="Manage academic departments and codes."
            >
                {!isViewDenied ? (
                    <div className="flex items-center gap-2">
                        <BulkCreateDepartmentsDialog
                            defaultInstitutionId={selectedInstitutionId}
                        />
                        <AddDepartmentDialog defaultInstitutionId={selectedInstitutionId} />
                    </div>
                ) : null}
            </PageHeader>
            <Separator />

            {isViewDenied ? (
                <PermissionDeniedState resourceName="departments" className="h-[360px]" />
            ) : (
                <div className="relative flex flex-col gap-4">
                    <TemplateContextToolbar
                        institutions={institutions}
                        selectedInstitutionId={selectedInstitutionId}
                        onInstitutionChange={setSelectedInstitutionId}
                    />

                    <DepartmentsList
                        departments={departments}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        isLoading={isLoading}
                    />
                    {isLoading && departments.length === 0 && (
                        <div className="bg-background/80 absolute inset-x-0 top-[60px] bottom-0 z-10 flex items-center justify-center rounded-md">
                            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                        </div>
                    )}

                    {isError && (
                        <div className="text-destructive bg-destructive/5 border-destructive/20 mt-4 flex h-32 items-center justify-center rounded-md border">
                            Error loading departments. Contact support if this continues.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
