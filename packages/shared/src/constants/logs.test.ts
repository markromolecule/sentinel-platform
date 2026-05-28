import { describe, expect, it } from 'vitest';
import { LOGS_QUERY_KEYS } from './logs';

describe('LOGS_QUERY_KEYS', () => {
    it('should have the correct base query key', () => {
        expect(LOGS_QUERY_KEYS.all).toEqual(['logs']);
    });

    it('should build auth query key with and without params', () => {
        expect(LOGS_QUERY_KEYS.auth()).toEqual(['logs', 'auth', undefined]);

        const params = { page: 1, pageSize: 10 };
        expect(LOGS_QUERY_KEYS.auth(params)).toEqual(['logs', 'auth', params]);
    });

    it('should build activity query key with and without params', () => {
        expect(LOGS_QUERY_KEYS.activity()).toEqual(['logs', 'activity', undefined]);

        const params = { action: 'user.login' };
        expect(LOGS_QUERY_KEYS.activity(params)).toEqual(['logs', 'activity', params]);
    });

    it('should build system query key with and without params', () => {
        expect(LOGS_QUERY_KEYS.system()).toEqual(['logs', 'system', undefined]);

        const params = { userId: '123' };
        expect(LOGS_QUERY_KEYS.system(params)).toEqual(['logs', 'system', params]);
    });
});
