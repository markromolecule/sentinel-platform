import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SubjectService } from './subject.service';
import { SubjectCrudService } from './services/subject-crud.service';
import { ActivityNotificationService } from '../../general/notification/services/activity-notification.service';

vi.mock('./services/subject-crud.service', () => ({
    SubjectCrudService: {
        getSubjects: vi.fn(),
        createSubject: vi.fn(),
        getSubjectById: vi.fn(),
        updateSubject: vi.fn(),
        deleteSubject: vi.fn(),
        deleteSelectedSubjects: vi.fn(),
    },
}));

vi.mock('../../general/notification/services/activity-notification.service', () => ({
    ActivityNotificationService: {
        notifySubjectCreated: vi.fn(),
        notifySubjectUpdated: vi.fn(),
        notifySubjectDeleted: vi.fn(),
    },
}));

describe('SubjectService notifications', () => {
    const dbClient = {} as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('notifies after creating a subject', async () => {
        vi.mocked(SubjectCrudService.createSubject).mockResolvedValue({
            subject_id: 'subject-1',
        } as any);
        vi.mocked(SubjectCrudService.getSubjectById).mockResolvedValue({
            subject_id: 'subject-1',
            subject_code: 'CS101',
            subject_title: 'Intro to Computing',
        } as any);

        await SubjectService.createSubject(dbClient, {
            code: 'CS101',
            title: 'Intro to Computing',
            created_by: 'admin-1',
            institution_id: 'institution-1',
        });

        expect(ActivityNotificationService.notifySubjectCreated).toHaveBeenCalledWith({
            dbClient,
            actorUserId: 'admin-1',
            institutionId: 'institution-1',
            subjectId: 'subject-1',
            subjectLabel: 'CS101 - Intro to Computing',
        });
    });

    it('notifies after updating a subject', async () => {
        vi.mocked(SubjectCrudService.getSubjectById).mockResolvedValue({
            subject_id: 'subject-1',
            subject_code: 'CS101',
            subject_title: 'Advanced Computing',
        } as any);

        await SubjectService.updateSubject(
            dbClient,
            'subject-1',
            { title: 'Advanced Computing', updated_by: 'admin-1' },
            'institution-1',
        );

        expect(ActivityNotificationService.notifySubjectUpdated).toHaveBeenCalledWith({
            dbClient,
            actorUserId: 'admin-1',
            institutionId: 'institution-1',
            subjectId: 'subject-1',
            subjectLabel: 'CS101 - Advanced Computing',
        });
    });

    it('notifies after deleting multiple subjects', async () => {
        vi.mocked(SubjectCrudService.deleteSelectedSubjects).mockResolvedValue({
            deleted_count: 3,
        } as any);

        await SubjectService.deleteSelectedSubjects(
            dbClient,
            ['subject-1', 'subject-2', 'subject-3'],
            'institution-1',
            'admin-1',
        );

        expect(ActivityNotificationService.notifySubjectDeleted).toHaveBeenCalledWith({
            dbClient,
            actorUserId: 'admin-1',
            institutionId: 'institution-1',
            subjectLabel: '3 subjects',
            bulk: true,
            count: 3,
        });
    });
});

describe('SubjectService pagination', () => {
    const dbClient = {} as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns the full subject list when pagination is omitted', async () => {
        vi.mocked(SubjectCrudService.getSubjects).mockResolvedValue([
            {
                subject_id: 'subject-1',
                subject_code: 'CS101',
            },
            {
                subject_id: 'subject-2',
                subject_code: 'CS102',
            },
        ] as any);

        const result = await SubjectService.getSubjects(
            dbClient,
            'institution-1',
            'computing',
        );

        expect(SubjectCrudService.getSubjects).toHaveBeenCalledWith(
            dbClient,
            'institution-1',
            'computing',
        );
        expect(result).toEqual([
            {
                subject_id: 'subject-1',
                subject_code: 'CS101',
            },
            {
                subject_id: 'subject-2',
                subject_code: 'CS102',
            },
        ]);
    });

    it('returns paginated subjects and metadata when page and limit are provided', async () => {
        vi.mocked(SubjectCrudService.getSubjects).mockResolvedValue([
            { subject_id: 'subject-1', subject_code: 'CS101' },
            { subject_id: 'subject-2', subject_code: 'CS102' },
            { subject_id: 'subject-3', subject_code: 'CS103' },
        ] as any);

        const result = await SubjectService.getSubjects(
            dbClient,
            'institution-1',
            'computing',
            2,
            1,
        );

        expect(result).toEqual({
            items: [{ subject_id: 'subject-2', subject_code: 'CS102' }],
            pagination: {
                page: 2,
                limit: 1,
                total: 3,
                hasMore: true,
            },
        });
    });
});
