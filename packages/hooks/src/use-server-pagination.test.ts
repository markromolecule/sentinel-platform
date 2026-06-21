import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useServerPagination } from './use-server-pagination';

describe('useServerPagination', () => {
    it('should initialize with default pagination state', () => {
        const { result } = renderHook(() => useServerPagination());
        expect(result.current.pagination).toEqual({
            pageIndex: 0,
            pageSize: 10,
        });
    });

    it('should initialize with custom pagination state', () => {
        const customState = { pageIndex: 2, pageSize: 25 };
        const { result } = renderHook(() => useServerPagination([], customState));
        expect(result.current.pagination).toEqual(customState);
    });

    it('should update pagination state manually', () => {
        const { result } = renderHook(() => useServerPagination());

        act(() => {
            result.current.setPagination({ pageIndex: 1, pageSize: 20 });
        });

        expect(result.current.pagination).toEqual({
            pageIndex: 1,
            pageSize: 20,
        });
    });

    it('should reset pageIndex to 0 when dependencies change', () => {
        let watchVal = 'initial';
        const { result, rerender } = renderHook(() => useServerPagination([watchVal]));

        // Update pageIndex manually
        act(() => {
            result.current.setPagination({ pageIndex: 3, pageSize: 10 });
        });
        expect(result.current.pagination.pageIndex).toBe(3);

        // Change the dependency value
        watchVal = 'changed';
        rerender();

        expect(result.current.pagination.pageIndex).toBe(0);
    });

    it('should not reset pageIndex on mount when custom initial pageIndex > 0', () => {
        const customState = { pageIndex: 2, pageSize: 10 };
        const { result } = renderHook(() => useServerPagination(['some-dep'], customState));
        expect(result.current.pagination.pageIndex).toBe(2);
    });
});
