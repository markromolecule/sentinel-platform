'use client';

import { useDebounce, useSemestersQuery, isPermissionDeniedError } from '@sentinel/hooks';
import { useState } from 'react';
import { AddSemesterDialog, SemestersList } from './_components';
import { PermissionDeniedState } from '@sentinel/ui';
import { OrganizationPageShell } from '../_components/layout';

export default function CoreSemestersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const {
        data: semesters = [],
        isLoading,
        isError,
        error,
    } = useSemestersQuery({ search: debouncedSearch });
    const isViewDenied = isPermissionDeniedError(error, 'semesters:view');

    const actions = !isViewDenied ? <AddSemesterDialog /> : undefined;

    return (
        <OrganizationPageShell
            title="Semester Management"
            description="Manage academic semesters, terms, and their schedules."
            actions={actions}
        >
            {isViewDenied ? (
                <PermissionDeniedState resourceName="semesters" className="h-[360px]" />
            ) : (
                <div className="relative">
                    <SemestersList
                        semesters={semesters}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        isLoading={isLoading}
                    />

                    {isLoading && semesters.length === 0 && (
                        <div className="bg-background/80 absolute inset-x-0 top-[60px] bottom-0 z-10 flex items-center justify-center rounded-md">
                            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                        </div>
                    )}

                    {isError && (
                        <div className="text-destructive bg-destructive/5 border-destructive/20 mt-4 flex h-32 items-center justify-center rounded-md border">
                            Error loading semesters. Contact support if this continues.
                        </div>
                    )}
                </div>
            )}
        </OrganizationPageShell>
    );
}
