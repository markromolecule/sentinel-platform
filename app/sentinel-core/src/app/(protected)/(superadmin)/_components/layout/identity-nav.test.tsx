import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { IdentityNav, type IdentitySection } from './identity-nav';

describe('IdentityNav Component', () => {
    afterEach(() => {
        cleanup();
    });

    const sections: IdentitySection[] = ['administrators', 'whitelist', 'permissions'];

    it('renders all three navigation items correctly', () => {
        render(<IdentityNav activeSection="administrators" />);

        // Check group heading
        expect(screen.getByText('Identity & Access')).toBeTruthy();

        // Check links
        expect(screen.getByRole('link', { name: 'Administrators' })).toBeTruthy();
        expect(screen.getByRole('link', { name: 'Whitelist' })).toBeTruthy();
        expect(screen.getByRole('link', { name: 'Permissions' })).toBeTruthy();
    });

    it.each(sections)(
        'applies active styling to the "%s" link and inactive styling to others',
        (activeSection) => {
            render(<IdentityNav activeSection={activeSection} />);

            const links = {
                administrators: screen.getByRole('link', { name: 'Administrators' }),
                whitelist: screen.getByRole('link', { name: 'Whitelist' }),
                permissions: screen.getByRole('link', { name: 'Permissions' }),
            };

            // Assert links have correct routing href
            expect(links.administrators.getAttribute('href')).toBe('/administrators');
            expect(links.whitelist.getAttribute('href')).toBe('/administrators/whitelist');
            expect(links.permissions.getAttribute('href')).toBe('/permissions');

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
