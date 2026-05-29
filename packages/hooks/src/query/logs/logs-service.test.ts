import { describe, expect, it, vi } from 'vitest';
import {
    buildLogsQueryString,
    getAuthLogs,
    getActivityLogs,
    getSystemLogs,
} from '@sentinel/services';

describe('Logs Service API', () => {
    describe('buildLogsQueryString', () => {
        it('returns empty string when no params are provided', () => {
            expect(buildLogsQueryString()).toBe('');
        });

        it('returns empty string for empty params object', () => {
            expect(buildLogsQueryString({})).toBe('');
        });

        it('builds a query string omitting null, undefined and empty values', () => {
            const query = buildLogsQueryString({
                page: 2,
                pageSize: 15,
                action: 'user.login',
                resourceType: undefined,
                userId: '',
                branchId: undefined,
            });
            expect(query).toBe('?page=2&pageSize=15&action=user.login');
        });

        it('handles all valid query parameters', () => {
            const query = buildLogsQueryString({
                page: 1,
                pageSize: 10,
                startDate: '2026-05-25T00:00:00Z',
                endDate: '2026-05-25T23:59:59Z',
                action: 'auth.login',
                resourceType: 'user',
                userId: 'user-uuid',
                branchId: 'branch-uuid',
            });
            expect(query).toBe(
                '?page=1&pageSize=10&startDate=2026-05-25T00%3A00%3A00Z&endDate=2026-05-25T23%3A59%3A59Z&action=auth.login&resourceType=user&userId=user-uuid&branchId=branch-uuid',
            );
        });
    });

    describe('Fetch Log Actions', () => {
        const mockLogPage = {
            items: [
                {
                    logId: 'log-1',
                    userId: 'user-1',
                    action: 'user.login',
                    resourceType: 'auth',
                    resourceId: 'session-1',
                    details: null,
                    ipAddress: '127.0.0.1',
                    createdAt: '2026-05-25T08:00:00Z',
                    institutionId: 'inst-1',
                    branchId: 'branch-1',
                    userFirstName: 'John',
                    userLastName: 'Doe',
                },
            ],
            page: 1,
            pageSize: 10,
            total: 1,
            totalPages: 1,
            hasMore: false,
        };

        const mockApiClient = vi.fn().mockResolvedValue({
            message: 'Logs fetched successfully',
            data: mockLogPage,
        });

        it('getAuthLogs calls the api client with /logs/auth and returns data', async () => {
            const result = await getAuthLogs(mockApiClient, { page: 1 });
            expect(mockApiClient).toHaveBeenCalledWith('/logs/auth?page=1');
            expect(result).toEqual(mockLogPage);
        });

        it('getActivityLogs calls the api client with /logs/activity and returns data', async () => {
            const result = await getActivityLogs(mockApiClient, { action: 'create' });
            expect(mockApiClient).toHaveBeenCalledWith('/logs/activity?action=create');
            expect(result).toEqual(mockLogPage);
        });

        it('getSystemLogs calls the api client with /logs/system and returns data', async () => {
            const result = await getSystemLogs(mockApiClient, { pageSize: 5 });
            expect(mockApiClient).toHaveBeenCalledWith('/logs/system?pageSize=5');
            expect(result).toEqual(mockLogPage);
        });
    });
});
