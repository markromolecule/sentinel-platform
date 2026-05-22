'use client';

import { Search } from 'lucide-react';

interface WhitelistEmptyStateProps {
    search?: string;
}

export function WhitelistEmptyState({ search }: WhitelistEmptyStateProps) {
    return (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
            <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
                <Search className="text-muted-foreground h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">No records found</h3>
            <p className="text-muted-foreground max-w-[250px] text-sm">
                {search
                    ? `No whitelist records matched your search "${search}".`
                    : 'There are no whitelist records for the selected filters.'}
            </p>
        </div>
    );
}
