'use client';

import { Button } from '@sentinel/ui';
import { School, UserPlus } from 'lucide-react';

type ClassroomsEmptyStateProps = {
    searchTerm?: string;
    onCreateClick: () => void;
};

export function ClassroomsEmptyState({ searchTerm, onCreateClick }: ClassroomsEmptyStateProps) {
    const isSearching = Boolean(searchTerm?.trim());

    return (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="bg-muted text-muted-foreground rounded-full p-4">
                <School className="h-8 w-8" />
            </div>
            <div className="space-y-1">
                <h3 className="text-lg font-semibold">
                    {isSearching ? 'No classrooms found' : 'No classrooms yet'}
                </h3>
                <p className="text-muted-foreground max-w-md text-sm">
                    {isSearching
                        ? 'Try a different search term or clear the filter to see your classrooms.'
                        : 'Create your first classroom from an approved offered subject and section.'}
                </p>
            </div>
            {!isSearching ? (
                <Button
                    onClick={onCreateClick}
                    className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Classroom
                </Button>
            ) : null}
        </div>
    );
}
