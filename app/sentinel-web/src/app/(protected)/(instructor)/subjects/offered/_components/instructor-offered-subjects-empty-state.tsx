'use client';

import { EmptyState } from '@sentinel/ui';

interface InstructorOfferedSubjectsEmptyStateProps {
    searchTerm?: string;
}

export function InstructorOfferedSubjectsEmptyState({
    searchTerm,
}: InstructorOfferedSubjectsEmptyStateProps) {
    return (
        <EmptyState
            icon="🗂️"
            title={searchTerm ? 'No results found' : 'No offered subjects available'}
            description={
                searchTerm
                    ? `We couldn't find any offered subjects matching "${searchTerm}".`
                    : 'No subject offerings are available for the current term. If you think this is incorrect, contact your administrator.'
            }
        />
    );
}
