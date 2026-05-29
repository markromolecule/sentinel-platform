import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { OrganizationNav, type OrganizationSection } from './organization-nav';

describe('OrganizationNav Component', () => {
    afterEach(() => {
        cleanup();
    });

    const sections: OrganizationSection[] = ['departments', 'semesters', 'rooms'];

    it('renders all three navigation items and groups correctly', () => {
        render(<OrganizationNav activeSection="departments" />);

        // Check group headings
        expect(screen.getByText('Structure')).toBeTruthy();

        // Check links
        expect(screen.getByRole('link', { name: 'Departments' })).toBeTruthy();
        expect(screen.getByRole('link', { name: 'Semesters' })).toBeTruthy();
        expect(screen.getByRole('link', { name: 'Rooms' })).toBeTruthy();
    });

    it.each(sections)(
        'applies active styling to the "%s" link and inactive styling to others',
        (activeSection) => {
            render(<OrganizationNav activeSection={activeSection} />);

            const links = {
                departments: screen.getByRole('link', { name: 'Departments' }),
                semesters: screen.getByRole('link', { name: 'Semesters' }),
                rooms: screen.getByRole('link', { name: 'Rooms' }),
            };

            // Assert links have correct routing href
            expect(links.departments.getAttribute('href')).toBe('/departments');
            expect(links.semesters.getAttribute('href')).toBe('/semesters');
            expect(links.rooms.getAttribute('href')).toBe('/rooms');

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
