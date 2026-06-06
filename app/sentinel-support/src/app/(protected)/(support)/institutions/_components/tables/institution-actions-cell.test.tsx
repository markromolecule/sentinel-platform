import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InstitutionActionsCell } from './institution-actions-cell';
import { Institution } from '@sentinel/shared/types';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}));

// Mock hooks
vi.mock('@sentinel/hooks', () => ({
    useActivePermissions: () => ({
        hasPermission: () => true,
    }),
    useDeleteInstitutionMutation: () => ({
        mutate: vi.fn(),
        isPending: false,
    }),
    useInstitutionsQuery: () => ({
        data: [],
    }),
    useApi: () => ({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    }),
    useDepartmentsQuery: () => ({ data: [] }),
    useCoursesQuery: () => ({ data: [] }),
    useSemestersQuery: () => ({ data: [] }),
    useSubjectsQuery: () => ({ data: [] }),
    useEffectiveInstitutionNamingConventionsQuery: () => ({ data: null }),
    useStableValue: (factory: any) => factory(),
}));

// Mock Dialog/Dropdown components to simplify testing
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
        DialogHeader: ({ children }: any) => <div>{children}</div>,
        DialogTitle: ({ children }: any) => <h2>{children}</h2>,
        DialogDescription: ({ children }: any) => <p>{children}</p>,
        DialogFooter: ({ children }: any) => <div>{children}</div>,
        DropdownMenu: ({ children, open }: any) => <div>{children}</div>,
        DropdownMenuTrigger: ({ children }: any) => (
            <div onClick={(e) => e.stopPropagation()}>{children}</div>
        ),
        DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
        DropdownMenuItem: ({ children, onClick }: any) => (
            <div onClick={onClick} className="cursor-pointer">
                {children}
            </div>
        ),
    };
});

const mockInstitution: Institution = {
    id: 'inst-1',
    name: 'Test Institution',
    code: 'TEST',
    institutionKind: 'PARENT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

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
    writable: true,
});

describe('InstitutionActionsCell', () => {
    it('stops click propagation when interacting with dialog content', async () => {
        const onParentClick = vi.fn();

        render(
            <div onClick={onParentClick}>
                <InstitutionActionsCell institution={mockInstitution} />
            </div>,
        );

        // Open the dropdown
        const trigger = screen.getByRole('button', { name: /open menu/i });
        fireEvent.click(trigger);

        // Parent click should NOT be called for trigger click (it has stopPropagation)
        expect(onParentClick).not.toHaveBeenCalled();

        // Open the Edit Details dialog
        const editItem = await screen.findByText(/edit details/i);
        fireEvent.click(editItem);

        // Find the dialog content (InstitutionWizardDialog)
        const dialogTitle = await screen.findByText(/edit test institution/i);
        const dialogContent = dialogTitle.closest('[data-slot="dialog-content"]');

        if (!dialogContent) throw new Error('Dialog content not found');

        // Click inside the dialog content
        fireEvent.click(dialogContent);

        // Verify parent click was NOT called (propagation stopped)
        expect(onParentClick).not.toHaveBeenCalled();
    });
});
