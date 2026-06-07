import { render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ParticipantProfileDialog } from './participant-profile-dialog';
import { useUserQuery } from '@sentinel/hooks';

// Mock hooks
vi.mock('@sentinel/hooks', () => ({
    useUserQuery: vi.fn(),
}));

// Mock UI components
vi.mock('@sentinel/ui', async (importOriginal) => {
    const actual = await importOriginal<any>();
    return {
        ...actual,
        Dialog: ({ children, open }: any) => (open ? <div data-testid="mock-dialog">{children}</div> : null),
        DialogContent: ({ children, ...props }: any) => (
            <div data-testid="mock-dialog-content" {...props}>
                {children}
            </div>
        ),
        DialogTitle: ({ children }: any) => <div>{children}</div>,
        DialogHeader: ({ children }: any) => <div>{children}</div>,
        Avatar: ({ children }: any) => <div data-testid="avatar">{children}</div>,
        AvatarFallback: ({ children }: any) => <div data-testid="avatar-fallback">{children}</div>,
        AvatarImage: ({ src, alt }: any) => <img data-testid="avatar-image" src={src} alt={alt} />,
        Badge: ({ children }: any) => <span>{children}</span>,
        Separator: () => <hr />,
        Skeleton: ({ className }: any) => <div data-testid="skeleton" className={className} />,
    };
});

describe('ParticipantProfileDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should be hidden when open = false', () => {
        const { queryByTestId } = render(
            <ParticipantProfileDialog
                open={false}
                onOpenChange={vi.fn()}
                participantId="user-1"
            />,
        );

        expect(queryByTestId('mock-dialog')).toBeNull();
    });

    it('should render skeleton while user details are loading', () => {
        vi.mocked(useUserQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        } as any);

        const { getAllByTestId, getByText } = render(
            <ParticipantProfileDialog
                open={true}
                onOpenChange={vi.fn()}
                participantId="user-1"
            />,
        );

        expect(getByText('Participant Profile')).toBeTruthy();
        expect(getAllByTestId('skeleton').length).toBeGreaterThan(0);
    });

    it('should render user name, email, institution, department, and course when loaded', () => {
        const mockUser = {
            id: 'user-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@example.com',
            role: 'student',
            status: 'ACTIVE',
            institution: 'National University',
            department: 'College of Computing',
            courses: ['BSIT'],
            studentNo: '2023-12345',
        };

        vi.mocked(useUserQuery).mockReturnValue({
            data: mockUser,
            isLoading: false,
            error: null,
        } as any);

        const { getByText, getAllByText } = render(
            <ParticipantProfileDialog
                open={true}
                onOpenChange={vi.fn()}
                participantId="user-1"
            />,
        );

        expect(getByText('John Doe')).toBeTruthy();
        expect(getAllByText('johndoe@example.com').length).toBeGreaterThan(0);
        expect(getByText('National University')).toBeTruthy();
        expect(getByText('College of Computing')).toBeTruthy();
        expect(getByText('BSIT')).toBeTruthy();
        expect(getByText('2023-12345')).toBeTruthy();
    });

    it('should display [-] for fields that are missing/null/undefined', () => {
        const mockUser = {
            id: 'user-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@example.com',
            role: 'student',
            status: 'ACTIVE',
            institution: null,
            department: undefined,
            courses: [],
            studentNo: null,
        };

        vi.mocked(useUserQuery).mockReturnValue({
            data: mockUser,
            isLoading: false,
            error: null,
        } as any);

        const { getAllByText } = render(
            <ParticipantProfileDialog
                open={true}
                onOpenChange={vi.fn()}
                participantId="user-1"
            />,
        );

        // We expect four - elements: institution, department, course, ID Number
        const placeHolders = getAllByText('-');
        expect(placeHolders.length).toBe(4);
    });
});
