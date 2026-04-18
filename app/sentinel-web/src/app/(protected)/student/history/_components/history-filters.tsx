import { Input } from '@sentinel/ui';
import { Search } from 'lucide-react';
import { HistoryFiltersProps } from '@sentinel/shared/types';

export function HistoryFilters({
    searchQuery,
    onSearchChange,
}: HistoryFiltersProps) {
    return (
        <div className="flex flex-col gap-4">
            <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Search className="text-muted-foreground h-5 w-5" />
                </div>
                <Input
                    placeholder="Search exam history..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-12 rounded-xl pl-11 transition-all"
                />
            </div>
        </div>
    );
}
