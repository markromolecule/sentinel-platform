import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WhitelistList } from './whitelist-list';

vi.mock('@sentinel/hooks', () => ({
    useDeleteSelectedStudentWhitelistMutation: () => ({
        mutate: vi.fn(),
        isPending: false,
    }),
}));

vi.mock('@sentinel/ui', async () => {
    const actual = await vi.importActual<typeof import('@sentinel/ui')>('@sentinel/ui');
    return {
        ...actual,
        DataTable: ({ data }: { data: Array<unknown> }) => (
            <div data-testid="mock-data-table">Rows count: {data.length}</div>
        ),
    };
});

describe('WhitelistList', () => {
    it('renders the DataTable with records successfully', () => {
        render(<WhitelistList records={[]} />);

        expect(screen.getByTestId('mock-data-table')).toBeTruthy();
        expect(screen.getByText('Rows count: 0')).toBeTruthy();
    });
});
