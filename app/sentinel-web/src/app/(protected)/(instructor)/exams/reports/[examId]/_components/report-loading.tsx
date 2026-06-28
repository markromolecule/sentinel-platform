import * as React from 'react';

/**
 * Loading skeleton component for the detailed exam report page.
 */
export function ReportLoading() {
    return (
        <div className="flex h-full flex-1 flex-col space-y-6 p-6 md:p-8">
            <div className="space-y-2">
                <div className="bg-muted h-8 w-64 animate-pulse rounded" />
                <div className="bg-muted h-4 w-80 animate-pulse rounded" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-muted h-28 animate-pulse rounded-xl" />
                ))}
            </div>
        </div>
    );
}
