'use client';

import { EmptyState } from '@sentinel/ui';
import { AddUserDialog } from '@/app/(protected)/(admin)/users/_components/dialogs/add-user-dialog';

interface UsersEmptyStateProps {
    search?: string;
}

export function UsersEmptyState({ search }: UsersEmptyStateProps) {
    return (
        <EmptyState
            icon="👥"
            title={search ? 'No results found' : 'No users added'}
            description={
                search
                    ? `We couldn't find any users matching "${search}".`
                    : 'Add users to the system to start managing permissions and access.'
            }
            action={!search && <AddUserDialog />}
        />
    );
}
