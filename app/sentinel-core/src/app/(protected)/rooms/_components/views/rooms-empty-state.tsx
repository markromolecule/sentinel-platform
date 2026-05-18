'use client';

import { Box } from 'lucide-react';

interface RoomsEmptyStateProps {
    searchTerm?: string;
}

export function RoomsEmptyState({ searchTerm }: RoomsEmptyStateProps) {
    return (
        <div className="bg-muted/20 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
            <div className="bg-muted mb-4 rounded-full p-3">
                <Box className="text-muted-foreground h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">No rooms found</h3>
            <p className="text-muted-foreground mx-auto mt-2 max-w-sm">
                {searchTerm
                    ? `No rooms matched your search for "${searchTerm}". Try adjusting your filters.`
                    : 'There are no rooms added to the system yet. Start by adding a new room.'}
            </p>
        </div>
    );
}
