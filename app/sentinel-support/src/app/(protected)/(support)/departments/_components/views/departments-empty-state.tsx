'use client';

import { EmptyState } from '@sentinel/ui';
import { AddDepartmentDialog } from '@/app/(protected)/(support)/departments/_components/dialogs/add-department-dialog';

interface DepartmentsEmptyStateProps {
    searchTerm?: string;
}

export function DepartmentsEmptyState({ searchTerm }: DepartmentsEmptyStateProps) {
    return (
        <EmptyState
            icon="🏢"
            title={searchTerm ? 'No results found' : 'No departments added'}
            description={
                searchTerm
                    ? `We couldn't find any departments matching "${searchTerm}".`
                    : 'Add departments to the institution to start managing them.'
            }
            action={!searchTerm && <AddDepartmentDialog />}
        />
    );
}
