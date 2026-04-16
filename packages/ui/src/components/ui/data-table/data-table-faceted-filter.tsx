import * as React from 'react';
import { Column } from '@tanstack/react-table';
import { FacetedFilter } from '../faceted-filter';

interface DataTableFacetedFilterProps<TData, TValue> {
    column?: Column<TData, TValue>;
    title?: string;
    options: {
        label: string;
        value: string;
        icon?: React.ComponentType<{ className?: string }>;
    }[];
}

export function DataTableFacetedFilter<TData, TValue>({
    column,
    title,
    options,
}: DataTableFacetedFilterProps<TData, TValue>) {
    const selectedValues = new Set(column?.getFilterValue() as string[]);
    const facets = column?.getFacetedUniqueValues();

    return (
        <FacetedFilter
            title={title}
            options={options}
            selectedValues={selectedValues}
            onSelect={(value) => {
                if (selectedValues.has(value)) {
                    selectedValues.delete(value);
                } else {
                    selectedValues.add(value);
                }
                const filterValues = Array.from(selectedValues);
                column?.setFilterValue(filterValues.length ? filterValues : undefined);
            }}
            onClear={() => column?.setFilterValue(undefined)}
            counts={facets as any}
        />
    );
}
