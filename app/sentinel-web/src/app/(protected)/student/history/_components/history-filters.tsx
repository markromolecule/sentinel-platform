import { Input } from '@sentinel/ui';
import { Search } from 'lucide-react';
import { HistoryFiltersProps } from '@sentinel/shared/types';

export function HistoryFilters({ searchQuery, onSearchChange }: HistoryFiltersProps) {
    return (
        <div className="flex flex-col gap-3">
            <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Search className="text-muted-foreground h-4 w-4" />
                </div>
                <Input
                    placeholder="Search examination..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-ring h-10 rounded-none pl-10 shadow-none transition-colors"
                />
            </div>
        </div>
    );
}
