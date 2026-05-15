import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDataTableFilterSync } from './index';
import { ColumnFiltersState } from '@tanstack/react-table';

describe('useDataTableFilterSync', () => {
    it('should call onFilterChange when a synced filter changes', () => {
        const onFilterChange = vi.fn();
        const syncKeys = ['institution'];
        
        let columnFilters: ColumnFiltersState = [
            { id: 'institution', value: ['inst-1'] }
        ];

        const { rerender } = renderHook(
            ({ filters }) => useDataTableFilterSync({
                columnFilters: filters,
                onFilterChange,
                syncKeys,
            }),
            { initialProps: { filters: [] as ColumnFiltersState } }
        );

        // First change
        rerender({ filters: columnFilters });
        expect(onFilterChange).toHaveBeenCalledWith('institution', 'inst-1');

        // Second change
        columnFilters = [{ id: 'institution', value: ['inst-2'] }];
        rerender({ filters: columnFilters });
        expect(onFilterChange).toHaveBeenCalledWith('institution', 'inst-2');

        // Clear filter
        columnFilters = [];
        rerender({ filters: columnFilters });
        expect(onFilterChange).toHaveBeenCalledWith('institution', undefined);
    });

    it('should not call onFilterChange for unsynced filters', () => {
        const onFilterChange = vi.fn();
        const syncKeys = ['institution'];
        
        const { rerender } = renderHook(
            ({ filters }) => useDataTableFilterSync({
                columnFilters: filters,
                onFilterChange,
                syncKeys,
            }),
            { initialProps: { filters: [] as ColumnFiltersState } }
        );

        rerender({ filters: [{ id: 'origin', value: ['local'] }] });
        expect(onFilterChange).not.toHaveBeenCalled();
    });
});
