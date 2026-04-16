'use client';

import { Card } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { Users, UserPlus } from 'lucide-react';
import { StudentsEmptyStateProps } from '@sentinel/shared/types';

export function StudentsEmptyState({ isSearching, onAddClick }: StudentsEmptyStateProps) {
    return (
        <Card className="border-border/50 p-12">
            <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                    <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-foreground text-lg font-semibold">
                        {isSearching ? 'No students found' : 'No students yet'}
                    </h3>
                    <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm">
                        {isSearching
                            ? 'No results found. Try a different search term.'
                            : 'Add students by uploading a CSV or Excel file with student information.'}
                    </p>
                </div>
                {!isSearching && (
                    <Button onClick={onAddClick} className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Students
                    </Button>
                )}
            </div>
        </Card>
    );
}
