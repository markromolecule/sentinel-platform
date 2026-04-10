import { type DependencyList } from 'react';
import { useStableValue } from './use-stable-value';

export function useStableIdMap<T extends { id: string }, V>(
    items: readonly T[],
    getValue: (item: T) => V,
    deps: DependencyList = [],
) {
    return useStableValue(
        () => new Map(items.map((item) => [item.id, getValue(item)])),
        [items, ...deps],
    );
}
