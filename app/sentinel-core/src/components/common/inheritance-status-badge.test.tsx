import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InheritanceStatusBadge, getInheritanceStatusLabel, isParentOwnedRecord } from './inheritance-status-badge';

describe('InheritanceStatusBadge', () => {
    it('renders the institution name if provided', () => {
        render(
            <InheritanceStatusBadge
                record={{
                    institutionName: 'Test University',
                }}
            />
        );

        expect(screen.getByText('Test University')).toBeTruthy();
    });

    it('renders a dash if institution name is not provided', () => {
        render(
            <InheritanceStatusBadge
                record={{
                    institutionName: null,
                }}
            />
        );

        expect(screen.getByText('—')).toBeTruthy();
    });
});

describe('getInheritanceStatusLabel', () => {
    it('returns Hidden for HIDDEN status', () => {
        expect(getInheritanceStatusLabel({ inheritanceStatus: 'HIDDEN' })).toBe('Hidden');
        expect(getInheritanceStatusLabel({ isHidden: true })).toBe('Hidden');
    });

    it('returns Overridden for OVERRIDDEN status', () => {
        expect(getInheritanceStatusLabel({ inheritanceStatus: 'OVERRIDDEN' })).toBe('Overridden');
        expect(getInheritanceStatusLabel({ isOverridden: true })).toBe('Overridden');
    });

    it('returns Inherited for INHERITED status', () => {
        expect(getInheritanceStatusLabel({ inheritanceStatus: 'INHERITED' })).toBe('Inherited');
        expect(getInheritanceStatusLabel({ isInherited: true })).toBe('Inherited');
    });

    it('returns Local by default', () => {
        expect(getInheritanceStatusLabel({})).toBe('Local');
    });
});

describe('isParentOwnedRecord', () => {
    it('returns true if the record is inherited', () => {
        expect(isParentOwnedRecord({ isInherited: true })).toBe(true);
    });

    it('returns false if the record is not inherited', () => {
        expect(isParentOwnedRecord({ isLocal: true })).toBe(false);
    });
});
