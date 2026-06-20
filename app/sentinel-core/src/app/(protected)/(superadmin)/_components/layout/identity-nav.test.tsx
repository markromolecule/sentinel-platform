import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { IdentityNav, type IdentitySection } from './identity-nav';

describe('IdentityNav Component', () => {
    afterEach(() => {
        cleanup();
    });

    const superadminSections: IdentitySection[] = ['administrators', 'whitelist'];
    const adminSections: IdentitySection[] = ['students', 'instructors', 'student-whitelist'];

    it('renders all two navigation items correctly for superadmin', () => {
        render(<IdentityNav activeSection="administrators" role="superadmin" />);

        // Check group heading
        expect(screen.getByText('Identity & Access')).toBeTruthy();

        // Check links
        expect(screen.getByRole('link', { name: 'Administrators' })).toBeTruthy();
        expect(screen.getByRole('link', { name: 'Whitelist' })).toBeTruthy();
        expect(screen.queryByRole('link', { name: 'Permissions' })).toBeNull();
    });

    it('renders all three navigation items correctly for admin', () => {
        render(<IdentityNav activeSection="students" role="admin" />);

        // Check group heading
        expect(screen.getByText('Identity & Access')).toBeTruthy();

        // Check links
        expect(screen.getByRole('link', { name: 'Students' })).toBeTruthy();
        expect(screen.getByRole('link', { name: 'Instructors' })).toBeTruthy();
        expect(screen.getByRole('link', { name: 'Whitelist' })).toBeTruthy();
    });

    it.each(superadminSections)(
        'applies active styling to the "%s" link for superadmin and inactive styling to others',
        (activeSection) => {
            render(<IdentityNav activeSection={activeSection} role="superadmin" />);

            const links = {
                administrators: screen.getByRole('link', { name: 'Administrators' }),
                whitelist: screen.getByRole('link', { name: 'Whitelist' }),
            };

            // Assert links have correct routing href
            expect(links.administrators.getAttribute('href')).toBe('/administrators');
            expect(links.whitelist.getAttribute('href')).toBe('/administrators/whitelist');

            // Check active/inactive CSS classes
            Object.entries(links).forEach(([section, element]) => {
                const isActive = section === activeSection;
                if (isActive) {
                    expect(element.className).toContain('bg-accent/50');
                    expect(element.className).toContain('border-r-2');
                    expect(element.className).toContain('border-[#323d8f]');
                    expect(element.className).toContain('text-[#323d8f]');
                } else {
                    expect(element.className).toContain('text-muted-foreground');
                    expect(element.className).not.toContain('bg-accent/50');
                    expect(element.className).not.toContain('border-r-2');
                }
            });
        },
    );

    it.each(adminSections)(
        'applies active styling to the "%s" link for admin and inactive styling to others',
        (activeSection) => {
            render(<IdentityNav activeSection={activeSection} role="admin" />);

            const links = {
                students: screen.getByRole('link', { name: 'Students' }),
                instructors: screen.getByRole('link', { name: 'Instructors' }),
                'student-whitelist': screen.getByRole('link', { name: 'Whitelist' }),
            };

            // Assert links have correct routing href
            expect(links.students.getAttribute('href')).toBe('/administrators/students');
            expect(links.instructors.getAttribute('href')).toBe('/administrators/instructors');
            expect(links['student-whitelist'].getAttribute('href')).toBe(
                '/administrators/whitelist',
            );

            // Check active/inactive CSS classes
            Object.entries(links).forEach(([section, element]) => {
                const isActive = section === activeSection;
                if (isActive) {
                    expect(element.className).toContain('bg-accent/50');
                    expect(element.className).toContain('border-r-2');
                    expect(element.className).toContain('border-[#323d8f]');
                    expect(element.className).toContain('text-[#323d8f]');
                } else {
                    expect(element.className).toContain('text-muted-foreground');
                    expect(element.className).not.toContain('bg-accent/50');
                    expect(element.className).not.toContain('border-r-2');
                }
            });
        },
    );
});
