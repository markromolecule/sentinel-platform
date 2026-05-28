'use client';

import { isPermissionDeniedError, useDebounce } from '@sentinel/hooks';
import { useState } from 'react';
import { useSubjectsList } from '@/app/(protected)/(instructor)/subjects/_hooks/use-subjects-list';
import { SubjectsList } from '@/app/(protected)/(instructor)/subjects/_components/views/subjects-list';
import { RequestSubjectDialog } from '@/app/(protected)/(instructor)/subjects/_components/dialogs/request-subject-dialog';
import { SubjectsEmptyState } from '@/app/(protected)/(instructor)/subjects/_components/views/subjects-empty-state';
import { PermissionDeniedState } from '@sentinel/ui';
import { SubjectPageShell } from './_components/layout';

/**
 * SubjectsPage renders the instructor's subject list page within sentinel-web,
 * wrapped in the SubjectPageShell layout.
 */
export default function SubjectsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { subjects, isLoading, isError, error } = useSubjectsList(debouncedSearch);
    const isViewDenied = isPermissionDeniedError(error, 'subject_requests:view');

    const actions = (
        <div className="flex items-center gap-2">
            {!isViewDenied ? <RequestSubjectDialog /> : null}
        </div>
    );

    return (
        <SubjectPageShell
            title="Subject List"
            description="Manage the offered subjects you have requested or are currently teaching."
            actions={actions}
        >
            {isViewDenied ? (
                <PermissionDeniedState resourceName="subject requests" className="h-[360px]" />
            ) : (
                <div className="relative">
                    {subjects.length > 0 || searchTerm !== '' ? (
                        <SubjectsList
                            subjects={subjects}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                        />
                    ) : !isLoading && subjects.length === 0 ? (
                        <SubjectsEmptyState />
                    ) : null}

                    {isLoading && subjects.length === 0 && (
                        <div className="bg-background/80 absolute inset-x-0 top-[60px] bottom-0 z-10 flex items-center justify-center rounded-md">
                            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                        </div>
                    )}

                    {isError && (
                        <div className="text-destructive bg-destructive/5 border-destructive/20 mt-4 flex h-32 items-center justify-center rounded-md border">
                            Error loading subjects. Contact support if this continues.
                        </div>
                    )}
                </div>
            )}
        </SubjectPageShell>
    );
}

