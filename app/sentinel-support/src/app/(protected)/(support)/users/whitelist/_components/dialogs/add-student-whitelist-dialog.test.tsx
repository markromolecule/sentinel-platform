import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AddStudentWhitelistDialog } from './add-student-whitelist-dialog';

vi.mock('@/app/(protected)/(support)/users/whitelist/_hooks/use-student-whitelist-form', () => ({
    useStudentWhitelistForm: () => ({
        form: {
            control: {},
            watch: vi.fn(),
            getValues: vi.fn(),
            setValue: vi.fn(),
            handleSubmit: vi.fn(),
        },
        onSubmit: vi.fn(),
        isPending: false,
    }),
}));

vi.mock('@/app/(protected)/(support)/users/whitelist/_components/forms/student-whitelist-form-fields', () => ({
    StudentWhitelistFormFields: () => <div data-testid="mock-form-fields">Form Fields</div>,
}));

vi.mock('@sentinel/ui', async () => {
    const actual = await vi.importActual<typeof import('@sentinel/ui')>('@sentinel/ui');
    return {
        ...actual,
        Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
            <div data-testid="mock-dialog" data-open={open}>
                {children}
            </div>
        ),
        DialogContent: ({ children }: { children: React.ReactNode }) => (
            <div data-testid="mock-dialog-content">{children}</div>
        ),
        DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        Form: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    };
});

describe('AddStudentWhitelistDialog', () => {
    it('renders the dialog trigger correctly', () => {
        render(<AddStudentWhitelistDialog triggerLabel="Test Add Trigger" />);

        expect(screen.getByText('Test Add Trigger')).toBeTruthy();
    });
});
