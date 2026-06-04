import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InstructorProfileDropdown } from './instructor-profile-dropdown';
import { useProfileQuery } from '@sentinel/hooks';
import React from 'react';

vi.mock('@sentinel/hooks', () => ({
    useProfileQuery: vi.fn(),
    useUpdatePasswordMutation: vi.fn(),
}));

vi.mock('next-themes', () => ({
    useTheme: () => ({
        theme: 'light',
        setTheme: vi.fn(),
    }),
}));

vi.mock('./hooks/use-instructor-nav', () => ({
    useInstructorNav: () => ({
        handleLogout: vi.fn(),
    }),
}));

describe('InstructorProfileDropdown', () => {
    it('renders fallback when loading', () => {
        vi.mocked(useProfileQuery).mockReturnValue({
            profile: null,
            isLoading: true,
        } as unknown as ReturnType<typeof useProfileQuery>);

        const { container } = render(<InstructorProfileDropdown />);
        const fallback = container.querySelector('.animate-pulse');
        expect(fallback).toBeTruthy();
    });

    it('renders dynamic profile data initials', () => {
        vi.mocked(useProfileQuery).mockReturnValue({
            profile: {
                firstName: 'Alice',
                lastName: 'Smith',
                email: 'alice.smith@example.com',
                employeeNo: 'EMP-123',
                department: 'CS',
                institution: 'State Uni',
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useProfileQuery>);

        render(<InstructorProfileDropdown />);
        expect(screen.getByText('AS')).toBeTruthy();
    });
});
