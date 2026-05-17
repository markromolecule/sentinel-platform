'use client';

import { EmptyState } from '@sentinel/ui';
import { AddSectionDialog } from '@/app/(protected)/sections/_components/dialogs/add-section-dialog';

interface SectionsEmptyStateProps {
    searchTerm?: string;
}

export function SectionsEmptyState({ searchTerm }: SectionsEmptyStateProps) {
    return (
        <EmptyState
            icon="🏢"
            title={searchTerm ? 'No results found' : 'No sections added'}
            description={
                searchTerm
                    ? `We couldn't find any sections matching "${searchTerm}".`
                    : 'Add sections to the system to start managing them.'
            }
            action={!searchTerm && <AddSectionDialog />}
        />
    );
}
