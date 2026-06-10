import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { KpiCarouselWidget } from './kpi-carousel-widget';

afterEach(() => {
    cleanup();
});
import { SupportKpiCard } from '@sentinel/shared/types';

const mockCards: SupportKpiCard[] = [
    {
        id: 'managed-institutions',
        label: 'Managed Institutions',
        value: '12',
        change: 9.1,
        trend: 'up',
        description: '2 pending approval',
    },
    {
        id: 'active-sessions',
        label: 'Active Sessions',
        value: '142',
        change: -12.4,
        trend: 'down',
        description: 'Currently ongoing',
    },
];

describe('KpiCarouselWidget', () => {
    it('renders all card labels from props', () => {
        render(<KpiCarouselWidget cards={mockCards} />);
        expect(screen.getByText('Managed Institutions')).toBeDefined();
        expect(screen.getByText('Active Sessions')).toBeDefined();
    });

    it('renders no cards when empty array is passed (no crash)', () => {
        const { container } = render(<KpiCarouselWidget cards={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it('first card value and details are rendered correctly', () => {
        render(<KpiCarouselWidget cards={mockCards} />);
        expect(screen.getByText('12')).toBeDefined();
        expect(screen.getByText('2 pending approval')).toBeDefined();
        expect(screen.getByText('+9.1%')).toBeDefined();
        expect(screen.getByText('-12.4%')).toBeDefined();
    });
});
