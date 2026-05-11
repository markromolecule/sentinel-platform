import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InstitutionService } from './institution.service';
import { executeTransaction } from '@sentinel/db';
import { createInstitutionData } from './data/create-institution';
import { getInstitutionByIdData } from './data/get-institution-by-id';
import { updateInstitutionData } from './data/update-institution';
import { deleteInstitutionData } from './data/delete-institution';
import { ActivityNotificationService } from '../../general/notification/services/activity-notification.service';

vi.mock('@sentinel/db', async () => {
    const actual = await vi.importActual<any>('@sentinel/db');

    return {
        ...actual,
        executeTransaction: vi.fn(async (callback) => await callback({})),
    };
});

vi.mock('./data/create-institution', () => ({
    createInstitutionData: vi.fn(),
}));

vi.mock('./data/get-institution-by-id', () => ({
    getInstitutionByIdData: vi.fn(),
}));

vi.mock('./data/update-institution', () => ({
    updateInstitutionData: vi.fn(),
}));

vi.mock('./data/delete-institution', () => ({
    deleteInstitutionData: vi.fn(),
}));

vi.mock('../../general/notification/services/activity-notification.service', () => ({
    ActivityNotificationService: {
        notifySupportInstitutionOperationCompleted: vi.fn(),
    },
}));

describe('InstitutionService support notifications', () => {
    const dbClient = {} as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('notifies after creating an institution', async () => {
        vi.mocked(createInstitutionData).mockResolvedValue({
            id: 'institution-1',
        } as any);
        vi.mocked(getInstitutionByIdData).mockResolvedValue({
            institution_id: 'institution-1',
            name: 'Sentinel University',
            code: 'SU',
            parent_institution_id: null,
            institution_kind: 'STANDALONE',
            created_at: null,
            created_by: 'support-1',
            updated_at: null,
            updated_by: null,
            creator_first_name: 'Support',
            creator_last_name: 'User',
            updater_first_name: null,
            updater_last_name: null,
        } as any);

        await InstitutionService.createInstitution(
            dbClient,
            { name: 'Sentinel University', code: 'SU' } as any,
            'support-1',
        );

        expect(
            ActivityNotificationService.notifySupportInstitutionOperationCompleted,
        ).toHaveBeenCalledWith({
            dbClient,
            actorUserId: 'support-1',
            institutionId: 'institution-1',
            institutionRecordId: 'institution-1',
            institutionLabel: 'Sentinel University',
            operation: 'CREATED',
        });
    });

    it('notifies after updating an institution', async () => {
        vi.mocked(getInstitutionByIdData)
            .mockResolvedValueOnce({
                institution_id: 'institution-1',
                name: 'Sentinel University',
                code: 'SU',
                parent_institution_id: null,
                institution_kind: 'STANDALONE',
            } as any)
            .mockResolvedValueOnce({
                institution_id: 'institution-1',
                name: 'Sentinel State University',
                code: 'SSU',
                parent_institution_id: null,
                institution_kind: 'STANDALONE',
                created_at: null,
                created_by: 'support-1',
                updated_at: null,
                updated_by: 'support-1',
                creator_first_name: null,
                creator_last_name: null,
                updater_first_name: 'Support',
                updater_last_name: 'User',
            } as any);
        vi.mocked(updateInstitutionData).mockResolvedValue({} as any);

        await InstitutionService.updateInstitution(
            dbClient,
            'institution-1',
            { name: 'Sentinel State University' } as any,
            'support-1',
        );

        expect(
            ActivityNotificationService.notifySupportInstitutionOperationCompleted,
        ).toHaveBeenCalledWith({
            dbClient,
            actorUserId: 'support-1',
            institutionId: 'institution-1',
            institutionRecordId: 'institution-1',
            institutionLabel: 'Sentinel State University',
            operation: 'UPDATED',
        });
    });

    it('notifies after deleting an institution', async () => {
        vi.mocked(deleteInstitutionData).mockResolvedValue({
            id: 'institution-1',
            name: 'Sentinel University',
        } as any);

        await InstitutionService.deleteInstitution(dbClient, 'institution-1', 'support-1');

        expect(
            ActivityNotificationService.notifySupportInstitutionOperationCompleted,
        ).toHaveBeenCalledWith({
            dbClient,
            actorUserId: 'support-1',
            institutionId: 'institution-1',
            institutionRecordId: 'institution-1',
            institutionLabel: 'Sentinel University',
            operation: 'DELETED',
        });
    });
});
