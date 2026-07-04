'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@sentinel/ui';

interface SelectedInstructorCardProps {
    instructor: any;
    name: string;
}

/**
 * Premium sub-component rendering the preview of the selected instructor.
 */
export function SelectedInstructorCard({ instructor, name }: SelectedInstructorCardProps) {
    return (
        <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 duration-200 dark:border-zinc-800 dark:bg-zinc-900/50">
            <Avatar className="border-border h-9 w-9 border">
                <AvatarImage src={instructor.avatarUrl ?? ''} alt={name} />
                <AvatarFallback className="bg-[#323d8f]/10 text-sm font-bold text-[#323d8f] dark:bg-zinc-800 dark:text-zinc-200">
                    {instructor.firstName?.charAt(0) || instructor.email?.charAt(0) || 'I'}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {[instructor.firstName, instructor.lastName].filter(Boolean).join(' ')}
                </p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {instructor.email}
                </p>
                {instructor.department && (
                    <span className="bg-zinc-150 mt-0.5 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                        {instructor.department}
                    </span>
                )}
            </div>
        </div>
    );
}
