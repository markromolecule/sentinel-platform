'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { type User } from '@sentinel/services';

import { RowInstructorCombobox } from './row-instructor-combobox';

interface AssignmentBuilderBulkBarProps {
    bulkInstructorId: string;
    users: User[];
    isUsersLoading: boolean;
    isPending: boolean;
    updateBulkInstructor: (instructorId: string) => void;
}

function AssignmentBuilderBulkBar({
    bulkInstructorId,
    users,
    isUsersLoading,
    isPending,
    updateBulkInstructor,
}: AssignmentBuilderBulkBarProps) {
    return (
        <div className="mb-4 rounded-lg border bg-zinc-50/50 p-4 dark:bg-zinc-950/20">
            <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                <div className="space-y-1 md:max-w-md">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Apply instructor to all rows
                    </h4>
                    <p className="text-xs text-zinc-500">
                        Fills the instructor field for all current rows and sets the default for any
                        newly added rows.
                    </p>
                </div>
                <div className="w-full md:w-80">
                    {isUsersLoading ? (
                        <div className="flex h-10 items-center rounded-md border bg-white px-3 dark:bg-zinc-950">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin text-zinc-500" />
                            <span className="text-xs text-zinc-500">Loading instructors...</span>
                        </div>
                    ) : (
                        <RowInstructorCombobox
                            value={bulkInstructorId}
                            onValueChange={updateBulkInstructor}
                            users={users}
                            placeholder="Apply instructor to all..."
                            disabled={isPending}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export { AssignmentBuilderBulkBar };
export type { AssignmentBuilderBulkBarProps };
