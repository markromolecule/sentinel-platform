import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { InstructorSidebar } from './instructor-sidebar';

vi.mock('@/components/sidebar/instructor/hooks/use-instructor-nav', () => ({
    useInstructorNav: () => ({
        pathname: '/exams',
        isExamActive: true,
        isSubjectsActive: false,
        isQuestionBankActive: false,
        isLoggingOut: false,
        handleLogout: vi.fn(),
    }),
}));

vi.mock('@sentinel/ui', () => ({
    Sidebar: ({ children }: { children: ReactNode }) => <aside>{children}</aside>,
    SidebarContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    SidebarGroup: ({ children }: { children: ReactNode }) => <section>{children}</section>,
    SidebarGroupContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    SidebarMenu: ({ children }: { children: ReactNode }) => <ul>{children}</ul>,
    SidebarMenuItem: ({ children }: { children: ReactNode }) => <li>{children}</li>,
    SidebarMenuButton: ({ children }: { children: ReactNode }) => <>{children}</>,
    SidebarMenuAction: ({ children }: { children: ReactNode }) => <>{children}</>,
    SidebarMenuSub: ({ children }: { children: ReactNode }) => <ul>{children}</ul>,
    SidebarMenuSubItem: ({ children }: { children: ReactNode }) => <li>{children}</li>,
    SidebarMenuSubButton: ({ children }: { children: ReactNode }) => <>{children}</>,
    SidebarRail: () => null,
    SidebarSeparator: () => <hr data-testid="sidebar-separator" />,
    Collapsible: ({ children }: { children: ReactNode }) => <>{children}</>,
    CollapsibleContent: ({ children }: { children: ReactNode }) => <>{children}</>,
    CollapsibleTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
    useSidebar: () => ({
        state: 'expanded',
        setOpen: vi.fn(),
    }),
    cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
}));

vi.mock('@sentinel/hooks', () => ({
    useConversationsQuery: () => ({
        data: [
            { conversationId: '1', unreadCount: 2, participants: [] },
            { conversationId: '2', unreadCount: 3, participants: [] },
        ],
    }),
    useMessageRealtime: vi.fn(),
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('InstructorSidebar', () => {
    it('renders top-level sections without nested exam or question-bank children', () => {
        render(<InstructorSidebar />);

        expect(screen.getByText('Overview')).toBeTruthy();
        expect(screen.getByRole('link', { name: 'Exams' })).toBeTruthy();
        expect(screen.getByRole('link', { name: 'Question Bank' })).toBeTruthy();
        expect(screen.queryByText('Assign')).toBeNull();
        expect(screen.queryByText('Grade')).toBeNull();
        expect(screen.queryByText('All Questions')).toBeNull();
        expect(screen.queryByText('Collections')).toBeNull();
        expect(screen.queryByText('TOS Matrix')).toBeNull();
        const separators = screen.getAllByTestId('sidebar-separator');
        expect(separators.length).toBeGreaterThanOrEqual(4);

        const studentsLink = screen.getByRole('link', { name: 'Students' });
        const examsLink = screen.getByRole('link', { name: 'Exams' });
        const separatorBetweenGroups = separators[1];

        expect(
            studentsLink.compareDocumentPosition(separatorBetweenGroups) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
        expect(
            separatorBetweenGroups.compareDocumentPosition(examsLink) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
    });
});
