import { describe, it, expect } from 'vitest';
import { REMEMBERED_EMAIL_KEYS } from './auth';

describe('REMEMBERED_EMAIL_KEYS', () => {
    it('defines storage keys for all platforms including mobile', () => {
        expect(REMEMBERED_EMAIL_KEYS).toEqual({
            WEB: 'sentinel_remembered_email_web',
            CORE: 'sentinel_remembered_email_core',
            SUPPORT: 'sentinel_remembered_email_support',
            MOBILE: 'sentinel_remembered_email_mobile',
        });
    });
});
