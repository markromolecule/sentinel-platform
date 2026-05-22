import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InstitutionWizardDialog } from './institution-wizard-dialog';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock hooks
vi.mock('@sentinel/hooks', () => ({
    useApi: () => ({}),
    useInstitutionsQuery: () => ({ data: [] }),
    useDepartmentsQuery: () => ({ data: [] }),
    useCoursesQuery: () => ({ data: [] }),
    useSemestersQuery: () => ({ data: [] }),
    useSubjectsQuery: () => ({ data: [] }),
    useEffectiveInstitutionNamingConventionsQuery: () => ({ data: null }),
    useStableValue: (factory: any) => factory(),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
}));

// Mock UI components
vi.mock('@sentinel/ui', async (importOriginal) => {
    const actual = await importOriginal<any>();
    return {
        ...actual,
        Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
        DialogContent: ({ children, onClick, ...props }: any) => (
            <div data-slot="dialog-content" onClick={onClick} {...props}>
                {children}
            </div>
        ),
        DialogTitle: ({ children }: any) => <div>{children}</div>,
        DialogDescription: ({ children }: any) => <div>{children}</div>,
        DialogHeader: ({ children }: any) => <div>{children}</div>,
        DialogFooter: ({ children }: any) => <div>{children}</div>,
    };
});

describe('InstitutionWizardDialog', () => {
    it('stops click propagation', () => {
        const onParentClick = vi.fn();
        render(
            <div onClick={onParentClick}>
                <InstitutionWizardDialog open={true} onOpenChange={() => {}} />
            </div>,
        );

        const dialogContent = screen.getByAlphaTestId
            ? null
            : document.querySelector('[data-slot="dialog-content"]');
        if (!dialogContent) {
            // Fallback if data-slot is not present
            const title = screen.getByText(/institution setup/i);
            fireEvent.click(title);
        } else {
            fireEvent.click(dialogContent);
        }

        expect(onParentClick).not.toHaveBeenCalled();
    });
});
