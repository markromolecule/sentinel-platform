import { describe, expect, it, vi } from 'vitest';
import { getClassrooms, archiveClassroom, unarchiveClassroom } from './classrooms';

describe('classrooms api client services', () => {
    describe('getClassrooms', () => {
        it('fetches classrooms and appends status parameter if provided', async () => {
            const apiClient = vi.fn().mockResolvedValue({
                data: [],
            });

            await getClassrooms(apiClient, {
                search: 'history',
                status: 'archived',
            });

            expect(apiClient).toHaveBeenCalledWith(
                '/classrooms?search=history&status=archived',
            );
        });

        it('fetches classrooms with only status if search is omitted', async () => {
            const apiClient = vi.fn().mockResolvedValue({
                data: [],
            });

            await getClassrooms(apiClient, {
                status: 'active',
            });

            expect(apiClient).toHaveBeenCalledWith('/classrooms?status=active');
        });
    });

    describe('archiveClassroom', () => {
        it('sends PATCH request to the classroom archive endpoint', async () => {
            const apiClient = vi.fn().mockResolvedValue({
                data: null,
            });

            await archiveClassroom(apiClient, 'test-classroom-id');

            expect(apiClient).toHaveBeenCalledWith('/classrooms/test-classroom-id/archive', {
                method: 'PATCH',
            });
        });
    });

    describe('unarchiveClassroom', () => {
        it('sends PATCH request to the classroom unarchive endpoint', async () => {
            const apiClient = vi.fn().mockResolvedValue({
                data: null,
            });

            await unarchiveClassroom(apiClient, 'test-classroom-id');

            expect(apiClient).toHaveBeenCalledWith('/classrooms/test-classroom-id/unarchive', {
                method: 'PATCH',
            });
        });
    });
});
