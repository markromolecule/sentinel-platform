'use client';

import { Button } from '@sentinel/ui';
import { LayoutGrid, List } from 'lucide-react';
import { ViewMode } from '@/app/(protected)/(instructor)/question/bank/collections/_types';

interface CollectionViewControlsProps {
    view: ViewMode;
    onViewChange: (view: ViewMode) => void;
}

export function CollectionViewControls({ view, onViewChange }: CollectionViewControlsProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Button
                    variant={view === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => onViewChange('grid')}
                    className="h-9 w-9"
                >
                    <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                    variant={view === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => onViewChange('list')}
                    className="h-9 w-9"
                >
                    <List className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
