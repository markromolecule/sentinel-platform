import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { IncidentStatsCallout } from './incident-stats-callout';
import { ShieldAlert } from 'lucide-react';

describe('IncidentStatsCallout', () => {
    const defaultProps = {
        label: 'Total Incidents',
        value: '1,234',
        description: 'Across all violation categories',
        icon: ShieldAlert,
        colorClass: 'bg-red-500/10 text-red-500 border-red-500/20',
    };

    it('renders the label', () => {
        const { container } = render(<IncidentStatsCallout {...defaultProps} />);
        const card = container.firstChild as HTMLElement;
        expect(within(card).getByText('Total Incidents')).toBeTruthy();
    });

    it('renders the value', () => {
        const { container } = render(<IncidentStatsCallout {...defaultProps} />);
        const card = container.firstChild as HTMLElement;
        expect(within(card).getByText('1,234')).toBeTruthy();
    });

    it('renders the description', () => {
        const { container } = render(<IncidentStatsCallout {...defaultProps} />);
        const card = container.firstChild as HTMLElement;
        expect(within(card).getByText('Across all violation categories')).toBeTruthy();
    });

    it('renders with a numeric value', () => {
        render(<IncidentStatsCallout {...defaultProps} value={42} />);
        expect(screen.getByText('42')).toBeTruthy();
    });

    it('applies the colorClass to the icon wrapper', () => {
        const { container } = render(<IncidentStatsCallout {...defaultProps} />);
        const iconWrapper = container.querySelector('.bg-red-500\\/10');
        expect(iconWrapper).toBeTruthy();
    });
});
