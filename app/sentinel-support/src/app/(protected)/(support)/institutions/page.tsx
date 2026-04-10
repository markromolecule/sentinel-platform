'use client';

import { useDebounce, useInstitutionsQuery, useStableValue } from '@sentinel/hooks';
import { useState } from 'react';
import {
    AddInstitutionDialog,
    InstitutionsList,
} from '@/app/(protected)/(support)/institutions/_components';
import { PageHeader, Separator } from '@sentinel/ui';

export default function SupportInstitutionsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data: institutions = [], isLoading, isError } = useInstitutionsQuery(debouncedSearch);
    const visibleInstitutions = useStableValue(() => institutions, [institutions]);
    const isInitialLoading = useStableValue(
        () => isLoading && visibleInstitutions.length === 0,
        [isLoading, visibleInstitutions],
    );
    const showErrorState = useStableValue(() => isError, [isError]);

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Institution Management"
                description="Manage academic institutions and their configurations."
            >
                <AddInstitutionDialog />
            </PageHeader>
            <Separator />

            <div className="relative">
                <InstitutionsList
                    institutions={visibleInstitutions}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    isLoading={isLoading}
                />

                {isInitialLoading && (
                    <div className="bg-background/80 absolute inset-x-0 top-[60px] bottom-0 z-10 flex items-center justify-center rounded-md">
                        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                    </div>
                )}

                {showErrorState && (
                    <div className="text-destructive bg-destructive/5 border-destructive/20 mt-4 flex h-32 items-center justify-center rounded-md border">
                        Error loading institutions. Please try again.
                    </div>
                )}
            </div>
        </div>
    );
}
