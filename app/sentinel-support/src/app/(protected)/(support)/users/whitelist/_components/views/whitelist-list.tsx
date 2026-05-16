'use client';

import { DataTable } from '@sentinel/ui';
import { StudentWhitelist } from '@sentinel/shared/types';
import { columns } from '../tables/columns';
import { WhitelistEmptyState } from './whitelist-empty-state';

interface WhitelistListProps {
    records: StudentWhitelist[];
    search?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
}

export function WhitelistList({
    records,
    search,
    onSearchChange,
    isLoading = false,
}: WhitelistListProps) {
    return (
        <DataTable
            columns={columns}
            data={records}
            searchValue={search}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search student numbers or names..."
            isLoading={isLoading}
            emptyContent={<WhitelistEmptyState search={search} />}
        />
    );
}
