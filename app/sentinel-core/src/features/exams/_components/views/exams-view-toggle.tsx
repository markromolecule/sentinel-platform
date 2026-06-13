'use client';

import { Button } from '@sentinel/ui';
import { LayoutGrid, List } from 'lucide-react';

export type ExamsViewMode = 'grid' | 'list';

interface ExamsViewToggleProps {
    viewMode: ExamsViewMode;
    onViewModeChange: (viewMode: ExamsViewMode) => void;
}

export function ExamsViewToggle({ viewMode, onViewModeChange }: ExamsViewToggleProps) {
    return (
        <div className="border-border/60 bg-muted/30 inline-flex items-center rounded-lg border p-1">
            <Button
                type="button"
                size="sm"
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                className="h-8 gap-2 px-3"
                onClick={() => onViewModeChange('grid')}
                aria-pressed={viewMode === 'grid'}
            >
                <LayoutGrid className="h-4 w-4" />
                Column
            </Button>
            <Button
                type="button"
                size="sm"
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                className="h-8 gap-2 px-3"
                onClick={() => onViewModeChange('list')}
                aria-pressed={viewMode === 'list'}
            >
                <List className="h-4 w-4" />
                List
            </Button>
        </div>
    );
}
