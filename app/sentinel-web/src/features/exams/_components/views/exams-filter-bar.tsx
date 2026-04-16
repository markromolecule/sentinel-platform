'use client';

import { Search } from 'lucide-react';
import { Input } from '@sentinel/ui';
import { cn } from '@sentinel/ui';
import { ExamsFilterBarProps } from '@sentinel/shared/types';

const tabs = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'completed', label: 'Completed' },
];

export function ExamsFilterBar({
    searchQuery,
    onSearchChange,
    activeTab,
    onTabChange,
}: ExamsFilterBarProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row">
            {/* Search */}
            <div className="relative max-w-xs">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                    placeholder="Search exams..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Tabs */}
            <div className="bg-muted/50 flex w-fit items-center gap-1 rounded-lg p-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => onTabChange(tab.value)}
                        className={cn(
                            'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                            activeTab === tab.value
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
