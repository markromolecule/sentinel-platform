import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExamAttemptPassageSheet } from './exam-attempt-passage-sheet';

// Mock Radix Dialog/Sheet primitives if needed, but since they are imported from @sentinel/ui which is mocked or uses radix directly, we can test it.
// Let's mock @sentinel/ui to render a simplified mock layout to avoid Radix Portal render timing issues in Vitest.
vi.mock('@sentinel/ui', () => ({
    Sheet: ({ children, open }: any) =>
        open ? <div data-testid="mock-sheet">{children}</div> : null,
    SheetContent: ({ children, className }: any) => (
        <div className={className} data-testid="mock-sheet-content">
            {children}
        </div>
    ),
    SheetHeader: ({ children }: any) => <div data-testid="mock-sheet-header">{children}</div>,
    SheetTitle: ({ children }: any) => <h2 data-testid="mock-sheet-title">{children}</h2>,
    SheetDescription: ({ children }: any) => <p data-testid="mock-sheet-description">{children}</p>,
}));

describe('ExamAttemptPassageSheet', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders nothing when isOpen is false', () => {
        const { container } = render(
            <ExamAttemptPassageSheet
                isOpen={false}
                onOpenChange={vi.fn()}
                title="Test Passage"
                body="<p>Passage content HTML</p>"
            />,
        );

        expect(screen.queryByTestId('mock-sheet')).toBeNull();
        expect(container.firstChild).toBeNull();
    });

    it('renders title, description, and HTML body when isOpen is true', () => {
        render(
            <ExamAttemptPassageSheet
                isOpen={true}
                onOpenChange={vi.fn()}
                title="Test Passage Title"
                description="Test Passage Description"
                body="<p data-testid='html-content'>Passage HTML content</p>"
            />,
        );

        expect(screen.getByTestId('mock-sheet')).toBeTruthy();
        expect(screen.getByTestId('mock-sheet-title').textContent).toBe('Test Passage Title');
        expect(screen.getByTestId('mock-sheet-description').textContent).toBe(
            'Test Passage Description',
        );
        expect(screen.getByTestId('html-content')).toBeTruthy();
    });
});
