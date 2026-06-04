import { describe, expect, it } from 'vitest';
import { isRoleEligibleForCoreAdminPage } from './core-admin-capability-map';

describe('core-admin-capability-map', () => {
    it('allows both admin and superadmin to access administrators page', () => {
        expect(isRoleEligibleForCoreAdminPage('administrators', 'admin')).toBe(true);
        expect(isRoleEligibleForCoreAdminPage('administrators', 'superadmin')).toBe(true);
    });

    it('allows both admin and superadmin to access administrator whitelist page', () => {
        expect(isRoleEligibleForCoreAdminPage('administrator-whitelist', 'admin')).toBe(true);
        expect(isRoleEligibleForCoreAdminPage('administrator-whitelist', 'superadmin')).toBe(true);
    });

    it('denies null or undefined roles access', () => {
        expect(isRoleEligibleForCoreAdminPage('administrators', null)).toBe(false);
        expect(isRoleEligibleForCoreAdminPage('administrators', undefined)).toBe(false);
    });
});
