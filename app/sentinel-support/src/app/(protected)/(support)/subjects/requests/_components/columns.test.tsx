import { describe, expect, it, vi } from 'vitest';
import { requestColumns } from './columns';

vi.mock('./request-actions', () => ({
    RequestActions: () => null,
}));

describe('requestColumns', () => {
    it('defines a hidden-compatible institution column with filtering support', () => {
        const institutionColumn = requestColumns.find((column) => {
            if ('accessorKey' in column) {
                return column.accessorKey === 'institution';
            }

            return false;
        });

        expect(institutionColumn).toBeDefined();
        expect(institutionColumn).toHaveProperty('filterFn');
    });
});
