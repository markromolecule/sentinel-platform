"use client";

import { Box } from "lucide-react";

interface RoomsEmptyStateProps {
    searchTerm?: string;
}

export function RoomsEmptyState({ searchTerm }: RoomsEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-lg border-2 border-dashed">
            <div className="bg-muted p-3 rounded-full mb-4">
                <Box className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No rooms found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                {searchTerm
                    ? `No rooms matched your search for "${searchTerm}". Try adjusting your filters.`
                    : "There are no rooms added to the system yet. Start by adding a new room."}
            </p>
        </div>
    );
}
