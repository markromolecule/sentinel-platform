'use client';

import { ScrollArea } from '@sentinel/ui';

export type IssuesListProps = {
    errors: string[];
};

/**
 * Renders a scrollable list of validation errors or warnings found during the file parse check.
 */
export function IssuesList({ errors }: IssuesListProps) {
    if (errors.length === 0) {
        return null;
    }

    return (
        <ScrollArea className="h-[140px] rounded-md border bg-amber-50/30 p-2">
            <ul className="space-y-1">
                {errors.map((error, index) => (
                    <li
                        key={index}
                        className="flex items-start gap-2 text-xs text-amber-600"
                    >
                        <span className="mt-0.5">•</span>
                        {error}
                    </li>
                ))}
            </ul>
        </ScrollArea>
    );
}
