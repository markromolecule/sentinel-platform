import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ExamsFilterTabs } from './exams-filter-tabs';
import type { ExamTabKey } from '../_constants';

vi.mock('@sentinel/ui', () => ({
    TabsList: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    TabsTrigger: ({
        children,
        onClick,
    }: {
        children: ReactNode;
        onClick?: () => void;
    }) => (
        <button onClick={onClick}>
            {children}
        </button>
    ),
}));

describe('ExamsFilterTabs', () => {
    it('renders all tab values and calls onValueChange', () => {
        const onValueChange = vi.fn();
        const counts: Record<ExamTabKey, number> = {
            all: 12,
            published: 4,
            drafts: 3,
            archived: 1,
        };

        render(<ExamsFilterTabs activeTab="published" counts={counts} onValueChange={onValueChange} />);

        expect(screen.getByRole('button', { name: /All/ })).toBeTruthy();
        expect(screen.getByRole('button', { name: /Published/ })).toBeTruthy();
        expect(screen.getByRole('button', { name: /Drafts/ })).toBeTruthy();
        expect(screen.getByRole('button', { name: /Archived/ })).toBeTruthy();

        fireEvent.click(screen.getByRole('button', { name: /Drafts/ }));

        expect(onValueChange).toHaveBeenCalledWith('drafts');
    }, 10000);
});
