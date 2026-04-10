import { type DependencyList } from 'react';
import { useStableValue } from './use-stable-value';

export type StableOption = {
    label: string;
    value: string;
};

export function useStableOptions<T extends { id: string }>(
    items: readonly T[],
    getLabel: (item: T) => string,
    deps: DependencyList = [],
) {
    return useStableValue<StableOption[]>(
        () =>
            items.map((item) => ({
                value: item.id,
                label: getLabel(item),
            })),
        [items, ...deps],
    );
}
