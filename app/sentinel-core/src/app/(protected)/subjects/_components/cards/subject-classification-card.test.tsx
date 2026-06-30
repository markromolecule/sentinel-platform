import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SubjectClassificationCard } from './subject-classification-card';

vi.mock('next/link', () => ({
    default: ({ children, href, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

vi.mock('@sentinel/hooks', () => ({
    useDeleteSubjectClassificationMutation: () => ({
        mutate: vi.fn(),
        isPending: false,
    }),
}));

vi.mock('@sentinel/ui', () => ({
    AlertDialog: ({ children }: any) => <div>{children}</div>,
    AlertDialogAction: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    AlertDialogCancel: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    AlertDialogContent: ({ children }: any) => <div>{children}</div>,
    AlertDialogDescription: ({ children }: any) => <div>{children}</div>,
    AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
    AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
    AlertDialogTitle: ({ children }: any) => <div>{children}</div>,
    Badge: ({ children, className }: any) => <span className={className}>{children}</span>,
    Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    Card: ({ children, className }: any) => <div className={className}>{children}</div>,
    CardDescription: ({ children, className }: any) => <p className={className}>{children}</p>,
    CardTitle: ({ children, className }: any) => <h3 className={className}>{children}</h3>,
}));

describe('SubjectClassificationCard', () => {
    it('shows inherited status with offer only actions for inherited records', () => {
        const onEdit = vi.fn();
        const onOffer = vi.fn();

        render(
            <SubjectClassificationCard
                classification={{
                    id: 'classification-1',
                    name: 'Shared Group',
                    type: 'GENERAL',
                    description: 'Shared description',
                    subjectCount: 1,
                    subjects: [{ id: 'subject-1', code: 'GEART01X', title: 'Art' }],
                    inheritanceStatus: 'INHERITED',
                    isInherited: true,
                    institutionName: 'Parent Institution',
                }}
                onEdit={onEdit}
                onOffer={onOffer}
                canOffer={true}
                canDelete={true}
            />,
        );

        expect(screen.getByText('Inherited')).toBeTruthy();
        expect(screen.queryByTitle('Edit classification')).toBeNull();
        expect(screen.queryByTitle('Delete classification')).toBeNull();

        fireEvent.click(screen.getByTitle('Offer subjects'));
        expect(onOffer).toHaveBeenCalledTimes(1);
        expect(onEdit).not.toHaveBeenCalled();
    });

    it('shows local status and edit/delete actions for local records', () => {
        render(
            <SubjectClassificationCard
                classification={{
                    id: 'classification-2',
                    name: 'Local Group',
                    type: 'CORE',
                    description: null,
                    subjectCount: 0,
                    subjects: [],
                    inheritanceStatus: 'LOCAL',
                    isInherited: false,
                    institutionName: 'Local Institution',
                }}
                onEdit={vi.fn()}
                onOffer={vi.fn()}
                canOffer={true}
                canDelete={true}
            />,
        );

        expect(screen.getByText('Local')).toBeTruthy();
        expect(screen.getByTitle('Edit classification')).toBeTruthy();
        expect(screen.getByTitle('Delete classification')).toBeTruthy();
    });
});
