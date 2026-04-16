import { Button } from '@sentinel/ui';
import { Input } from '@sentinel/ui';
import { cn } from '@sentinel/ui';
import { Search } from 'lucide-react';
import { HistoryFiltersProps } from '@sentinel/shared/types';

export function HistoryFilters({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
}: HistoryFiltersProps) {
    return (
        <div className="flex flex-col gap-4 md:flex-row">
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
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2 text-sm md:pb-0">
                <Button
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => onStatusFilterChange('all')}
                    className={cn(
                        'h-12 shrink-0 px-6',
                        statusFilter === 'all'
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                            : 'bg-muted/50 border-border text-foreground hover:bg-muted',
                    )}
                >
                    All
                </Button>
                <Button
                    variant={statusFilter === 'passed' ? 'default' : 'outline'}
                    onClick={() => onStatusFilterChange('passed')}
                    className={cn(
                        'h-12 shrink-0 px-6',
                        statusFilter === 'passed'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-muted/50 border-border text-foreground hover:bg-muted',
                    )}
                >
                    Passed
                </Button>
                <Button
                    variant={statusFilter === 'failed' ? 'default' : 'outline'}
                    onClick={() => onStatusFilterChange('failed')}
                    className={cn(
                        'h-12 shrink-0 px-6',
                        statusFilter === 'failed'
                            ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                            : 'bg-muted/50 border-border text-foreground hover:bg-muted',
                    )}
                >
                    Failed
                </Button>
            </div>
        </div>
    );
}
