import { type DependencyList, useMemo } from 'react';

export function useStableValue<T>(factory: () => T, deps: DependencyList) {
    return useMemo(factory, deps);
}
