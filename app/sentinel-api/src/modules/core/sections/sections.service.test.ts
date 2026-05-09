import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SectionService } from './sections.service';
import { createSectionData, createSectionsData } from './data/create-section';
import { updateSectionData } from './data/update-section';
import { deleteSectionData } from './data/delete-section';
import { deleteSectionsData } from './data/delete-sections';
import {
    hideInheritedRecord,
    upsertInheritedOverride,
} from '../inheritance/inheritable-write-helper';
import { ActivityNotificationService } from '../../general/notification/services/activity-notification.service';

vi.mock('./data/create-section', () => ({
    createSectionData: vi.fn(),
    createSectionsData: vi.fn(),
}));

vi.mock('./data/update-section', () => ({
    updateSectionData: vi.fn(),
}));

vi.mock('./data/delete-section', () => ({
    deleteSectionData: vi.fn(),
}));

vi.mock('./data/delete-sections', () => ({
    deleteSectionsData: vi.fn(),
}));

vi.mock('../inheritance/inheritable-write-helper', () => ({
    hideInheritedRecord: vi.fn(),
    upsertInheritedOverride: vi.fn(),
}));

vi.mock('../../general/notification/services/activity-notification.service', () => ({
    ActivityNotificationService: {
        notifySectionCreated: vi.fn(),
        notifySectionsBulkCreated: vi.fn(),
        notifySectionUpdated: vi.fn(),
        notifySectionDeleted: vi.fn(),
    },
}));

describe('SectionService notifications', () => {
    const dbClient = {} as any;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(hideInheritedRecord).mockResolvedValue(null);
        vi.mocked(upsertInheritedOverride).mockResolvedValue(null);
    });

    it('notifies after creating a section', async () => {
        vi.mocked(createSectionData).mockResolvedValue({
            section_id: 'section-1',
            section_name: 'BSCS 3A',
        } as any);

        await SectionService.createSection(dbClient, {
            name: 'BSCS 3A',
            institutionId: 'institution-1',
            created_by: 'admin-1',
        });

        expect(ActivityNotificationService.notifySectionCreated).toHaveBeenCalledWith({
            dbClient,
            actorUserId: 'admin-1',
            institutionId: 'institution-1',
            sectionId: 'section-1',
            sectionLabel: 'BSCS 3A',
        });
    });

    it('notifies once for a bulk section create action', async () => {
        vi.mocked(createSectionsData).mockResolvedValue([
            { section_id: 'section-1', section_name: 'BSCS 3A' },
            { section_id: 'section-2', section_name: 'BSCS 3B' },
        ] as any);

        await SectionService.createBulkSections(dbClient, {
            institutionId: 'institution-1',
            created_by: 'admin-1',
            sections: [{ name: 'BSCS 3A' }, { name: 'BSCS 3B' }],
        });

        expect(ActivityNotificationService.notifySectionsBulkCreated).toHaveBeenCalledWith({
            dbClient,
            actorUserId: 'admin-1',
            institutionId: 'institution-1',
            count: 2,
        });
    });

    it('notifies after updating a section', async () => {
        vi.mocked(updateSectionData).mockResolvedValue({
            section_id: 'section-1',
            section_name: 'BSCS 4A',
        } as any);

        await SectionService.updateSection(dbClient, 'section-1', {
            name: 'BSCS 4A',
            updated_by: 'admin-1',
            institutionId: 'institution-1',
        });

        expect(ActivityNotificationService.notifySectionUpdated).toHaveBeenCalledWith({
            dbClient,
            actorUserId: 'admin-1',
            institutionId: 'institution-1',
            sectionId: 'section-1',
            sectionLabel: 'BSCS 4A',
        });
    });

    it('notifies after deleting multiple sections', async () => {
        vi.mocked(deleteSectionsData).mockResolvedValue([
            { section_id: 'section-1' },
            { section_id: 'section-2' },
        ] as any);

        await SectionService.deleteSections(
            dbClient,
            ['section-1', 'section-2'],
            'institution-1',
            'admin-1',
        );

        expect(ActivityNotificationService.notifySectionDeleted).toHaveBeenCalledWith({
            dbClient,
            actorUserId: 'admin-1',
            institutionId: 'institution-1',
            sectionLabel: '2 sections',
            bulk: true,
            count: 2,
        });
    });
});
