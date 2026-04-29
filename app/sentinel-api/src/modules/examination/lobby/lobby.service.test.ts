import { afterEach, describe, expect, it, vi } from 'vitest';
import { HTTPException } from 'hono/http-exception';
import { type DbClient } from '@sentinel/db';
import { EntitlementsRepository } from '../access/data/entitlements.repository';
import { checkInLobby } from './services/check-in-lobby';
import { getAdmissionStatus } from './services/get-admission-status';
import { LobbyService } from './lobby.service';

vi.mock('../access/data/entitlements.repository', () => ({
    EntitlementsRepository: {
        getStudentProfileByUserId: vi.fn(),
    },
}));

vi.mock('./services/check-in-lobby', () => ({
    checkInLobby: vi.fn(),
}));

vi.mock('./services/get-admission-status', () => ({
    getAdmissionStatus: vi.fn(),
}));

const dbClient = {} as DbClient;

describe('LobbyService', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('resolves the authenticated user to a student record before checking in', async () => {
        vi.mocked(EntitlementsRepository.getStudentProfileByUserId).mockResolvedValue({
            student_id: 'student-record-1',
            institution_id: 'institution-1',
        });
        vi.mocked(checkInLobby).mockResolvedValue({
            status: 'WAITING',
            checkedInAt: '2026-04-13T05:01:00.000Z',
        });

        const result = await LobbyService.checkIn(dbClient, 'exam-1', 'auth-user-1');

        expect(result.status).toBe('WAITING');
        expect(EntitlementsRepository.getStudentProfileByUserId).toHaveBeenCalledWith(
            dbClient,
            'auth-user-1',
        );
        expect(checkInLobby).toHaveBeenCalledWith(dbClient, 'exam-1', 'student-record-1');
    });

    it('resolves the authenticated user to a student record before polling admission status', async () => {
        vi.mocked(EntitlementsRepository.getStudentProfileByUserId).mockResolvedValue({
            student_id: 'student-record-1',
            institution_id: 'institution-1',
        });
        vi.mocked(getAdmissionStatus).mockResolvedValue({
            status: 'APPROVED',
            checkedInAt: '2026-04-13T05:01:00.000Z',
            decidedAt: '2026-04-13T05:02:00.000Z',
        });

        const result = await LobbyService.getAdmissionStatus(dbClient, 'exam-1', 'auth-user-1');

        expect(result.status).toBe('APPROVED');
        expect(getAdmissionStatus).toHaveBeenCalledWith(dbClient, 'exam-1', 'student-record-1');
    });

    it('returns a clear not-found error when the authenticated user has no student profile', async () => {
        vi.mocked(EntitlementsRepository.getStudentProfileByUserId).mockResolvedValue(undefined);

        await expect(LobbyService.checkIn(dbClient, 'exam-1', 'auth-user-1')).rejects.toThrow(
            HTTPException,
        );
        expect(checkInLobby).not.toHaveBeenCalled();
    });
});
