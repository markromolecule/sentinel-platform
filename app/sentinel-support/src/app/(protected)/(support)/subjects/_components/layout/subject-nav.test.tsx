import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SubjectNav, type SubjectSection } from './subject-nav';

describe('SubjectNav Component', () => {
    afterEach(() => {
        cleanup();
    });

    const sections: SubjectSection[] = ['list', 'classifications', 'offered', 'requests'];

    it('renders all four navigation items and groups correctly', () => {
        render(<SubjectNav activeSection="list" />);

        // Check group headings
        expect(screen.getByText('Catalog')).toBeTruthy();
        expect(screen.getByText('Enrollment')).toBeTruthy();

        // Check links
        expect(screen.getByRole('link', { name: 'Subject List' })).toBeTruthy();
        expect(screen.getByRole('link', { name: 'Subject Classifications' })).toBeTruthy();
        expect(screen.getByRole('link', { name: 'Offered Subjects' })).toBeTruthy();
        expect(screen.getByRole('link', { name: 'Enrollment Requests' })).toBeTruthy();
    });

    it.each(sections)('applies active styling to the "%s" link and inactive styling to others', (activeSection) => {
        render(<SubjectNav activeSection={activeSection} />);

        const links = {
            list: screen.getByRole('link', { name: 'Subject List' }),
            classifications: screen.getByRole('link', { name: 'Subject Classifications' }),
            offered: screen.getByRole('link', { name: 'Offered Subjects' }),
            requests: screen.getByRole('link', { name: 'Enrollment Requests' }),
        };

        // Assert links have correct routing href
        expect(links.list.getAttribute('href')).toBe('/subjects');
        expect(links.classifications.getAttribute('href')).toBe('/subjects/classifications');
        expect(links.offered.getAttribute('href')).toBe('/subjects/offered');
        expect(links.requests.getAttribute('href')).toBe('/subjects/requests');

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
    });
});
