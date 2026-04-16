'use client';

import { EmptyState } from '@sentinel/ui';
import { AddStudentWhitelistDialog } from '@/app/(protected)/(admin)/users/whitelist/_components/dialogs/add-student-whitelist-dialog';
import { BulkImportStudentWhitelistDialog } from '@/app/(protected)/(admin)/users/whitelist/_components/dialogs/bulk-import-student-whitelist-dialog';

interface StudentWhitelistEmptyStateProps {
    search?: string;
}

export function StudentWhitelistEmptyState({ search }: StudentWhitelistEmptyStateProps) {
    return (
        <EmptyState
            icon="🪪"
            title={search ? 'No results found' : 'No whitelist entries added'}
            description={
                search
                    ? `We couldn't find any student whitelist records matching "${search}".`
                    : 'Add approved student identities here so onboarding can verify them before creating live student accounts.'
            }
            action={
                !search && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <BulkImportStudentWhitelistDialog />
                        <AddStudentWhitelistDialog />
                    </div>
                )
            }
        />
    );
}
