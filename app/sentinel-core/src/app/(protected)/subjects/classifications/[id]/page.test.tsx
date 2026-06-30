import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SubjectClassificationDetailsPage from './page';

const subjectClassificationDialogSpy = vi.fn();
const offerDialogSpy = vi.fn();

vi.mock('react', async () => {
    const actual = await vi.importActual<any>('react');

    return {
        ...actual,
        use: (value: any) => value,
    };
});

vi.mock('next/link', () => ({
    default: ({ children, href, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

vi.mock('@sentinel/hooks', () => ({
    useSubjectClassificationQuery: () => ({
        data: {
            id: 'classification-1',
            name: 'Shared Group',
            type: 'GENERAL',
            description: 'Shared description',
            subjectCount: 1,
            subjects: [{ id: 'subject-1', code: 'GE101', title: 'General Education' }],
            inheritanceStatus: 'INHERITED',
            isInherited: true,
        },
        isLoading: false,
        isError: false,
    }),
    useActivePermissions: () => ({
        hasPermission: (permission: string) =>
            ['subjects:update', 'subject_offerings:offer'].includes(permission),
    }),
}));

vi.mock('../../_components/dialogs/subject-classification-dialog', () => ({
    SubjectClassificationDialog: (props: any) => {
        subjectClassificationDialogSpy(props);
        return <div data-testid="classification-dialog" />;
    },
}));

vi.mock('../../_components/dialogs/offer-classification-subjects-dialog', () => ({
    OfferClassificationSubjectsDialog: (props: any) => {
        offerDialogSpy(props);
        return <div data-testid="offer-dialog" />;
    },
}));

vi.mock('@sentinel/ui', () => ({
    Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    Button: ({ children, asChild, ...props }: any) =>
        asChild ? <span {...props}>{children}</span> : <button {...props}>{children}</button>,
    PageHeader: ({ title, description, children }: any) => (
        <div>
            <h1>{title}</h1>
            <p>{description}</p>
            {children}
        </div>
    ),
    Separator: () => <hr />,
    DataTable: ({ emptyContent }: any) => <div>{emptyContent}</div>,
    DataTableColumnHeader: ({ title }: any) => <span>{title}</span>,
    EmptyState: ({ title, description, action }: any) => (
        <div>
            <h2>{title}</h2>
            <p>{description}</p>
            {action}
        </div>
    ),
}));

describe('SubjectClassificationDetailsPage', () => {
    beforeEach(() => {
        subjectClassificationDialogSpy.mockClear();
        offerDialogSpy.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    it('shows inherited status, keeps offer available, and disables management for inherited records', () => {
        render(<SubjectClassificationDetailsPage params={{ id: 'classification-1' } as any} />);

        expect(screen.getByText('Inherited')).toBeTruthy();
        expect(screen.getByText('Offer Subjects')).toBeTruthy();

        const manageButton = screen.getByText('Parent Managed');
        expect(manageButton).toBeTruthy();
        expect((manageButton as HTMLButtonElement).disabled).toBe(true);
        expect(screen.queryByText('Assign subjects now')).toBeNull();

        fireEvent.click(screen.getByText('Offer Subjects'));
        expect(offerDialogSpy.mock.calls.at(-1)?.[0]).toMatchObject({ open: true });
    });
});
