import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SubjectClassificationService } from './subject-classification.service';
import { createSubjectClassificationData } from './data/create-subject-classification';
import { deleteSubjectClassificationData } from './data/delete-subject-classification';
import { getSubjectClassificationByIdData } from './data/get-subject-classification-by-id';
import { getSubjectClassificationsData } from './data/get-subject-classifications';
import { ActivityNotificationService } from '../../general/notification/services/activity-notification.service';
import { loadEffectiveRows } from '../inheritance/effective-row-loader';

vi.mock('@sentinel/db', async () => {
    const actual = await vi.importActual<any>('@sentinel/db');

    return {
        ...actual,
        executeTransaction: vi.fn(async (callback) => await callback({})),
    };
});

vi.mock('./data/create-subject-classification', () => ({
    createSubjectClassificationData: vi.fn(),
}));

vi.mock('./data/update-subject-classification', () => ({
    updateSubjectClassificationData: vi.fn(),
}));

vi.mock('./data/delete-subject-classification', () => ({
    deleteSubjectClassificationData: vi.fn(),
}));

vi.mock('./data/get-subject-classification-by-id', () => ({
    getSubjectClassificationByIdData: vi.fn(),
}));

vi.mock('./data/get-subject-classifications', () => ({
    getSubjectClassificationsData: vi.fn(),
}));

vi.mock('./data/assert-subjects-in-scope', () => ({
    assertSubjectsInScopeData: vi.fn(),
}));

vi.mock('./data/update-subject-classification-subjects', () => ({
    updateSubjectClassificationSubjectsData: vi.fn(),
}));

vi.mock('./data/update-subject-classification-courses', () => ({
    updateSubjectClassificationCoursesData: vi.fn(),
}));

vi.mock('../../general/notification/services/activity-notification.service', () => ({
    ActivityNotificationService: {
        notifySubjectClassificationCreated: vi.fn(),
        notifySubjectClassificationUpdated: vi.fn(),
        notifySubjectClassificationDeleted: vi.fn(),
    },
}));

vi.mock('../subjects/helper/subject-offering-compat', () => ({
    supportsSubjectClassificationTables: vi.fn().mockResolvedValue(true),
    isMissingSubjectOfferingColumnError: vi.fn().mockReturnValue(false),
}));

vi.mock('../inheritance/effective-row-loader', () => ({
    loadEffectiveRows: vi.fn(),
}));

describe('SubjectClassificationService notifications', () => {
    const dbClient = {} as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('notifies after creating a subject classification', async () => {
        vi.mocked(createSubjectClassificationData).mockResolvedValue({
            subject_classification_id: 'classification-1',
        } as any);
        vi.mocked(getSubjectClassificationByIdData).mockResolvedValue({
            subject_classification_id: 'classification-1',
            name: 'Computer Science Core',
            institution_id: 'institution-1',
            subjects: [],
            course_ids: [],
        } as any);

        await SubjectClassificationService.createSubjectClassification(dbClient, {
            name: 'Computer Science Core',
            type: 'CORE',
            description: null,
            subject_ids: [],
            course_ids: ['course-1'],
            department_id: null,
            created_by: 'admin-1',
            institution_id: 'institution-1',
        });

        expect(ActivityNotificationService.notifySubjectClassificationCreated).toHaveBeenCalledWith(
            {
                dbClient: {},
                actorUserId: 'admin-1',
                institutionId: 'institution-1',
                classificationId: 'classification-1',
                classificationLabel: 'Computer Science Core',
            },
        );
    });

    it('notifies after updating a subject classification', async () => {
        vi.mocked(getSubjectClassificationByIdData).mockResolvedValue({
            subject_classification_id: 'classification-1',
            name: 'Computer Science Electives',
            institution_id: 'institution-1',
            subjects: [],
            course_ids: [],
        } as any);

        await SubjectClassificationService.updateSubjectClassification(
            dbClient,
            'classification-1',
            {
                name: 'Computer Science Electives',
                updated_by: 'admin-1',
            },
            'institution-1',
        );

        expect(ActivityNotificationService.notifySubjectClassificationUpdated).toHaveBeenCalledWith(
            {
                dbClient: {},
                actorUserId: 'admin-1',
                institutionId: 'institution-1',
                classificationId: 'classification-1',
                classificationLabel: 'Computer Science Electives',
            },
        );
    });

    it('notifies after deleting a subject classification', async () => {
        vi.mocked(deleteSubjectClassificationData).mockResolvedValue({
            subject_classification_id: 'classification-1',
            name: 'Computer Science Core',
        } as any);

        await SubjectClassificationService.deleteSubjectClassification(
            dbClient,
            'classification-1',
            'institution-1',
            'admin-1',
        );

        expect(ActivityNotificationService.notifySubjectClassificationDeleted).toHaveBeenCalledWith(
            {
                dbClient,
                actorUserId: 'admin-1',
                institutionId: 'institution-1',
                classificationId: 'classification-1',
                classificationLabel: 'Computer Science Core',
            },
        );
    });
});

describe('SubjectClassificationService pagination', () => {
    const dbClient = {
        selectFrom: vi.fn((table: string) => {
            if (table === 'institutions') {
                return {
                    select: vi.fn(() => ({
                        where: vi.fn(() => ({
                            executeTakeFirstOrThrow: vi.fn().mockResolvedValue({
                                id: 'child-1',
                                parent_institution_id: 'parent-1',
                                institution_kind: 'CHILD',
                            }),
                        })),
                    })),
                };
            }

            throw new Error(`Unexpected table: ${table}`);
        }),
    } as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns paginated classifications and metadata when page and limit are provided', async () => {
        vi.mocked(loadEffectiveRows).mockResolvedValue([
            {
                subject_classification_id: 'classification-1',
                name: 'Alpha',
                classification_type: 'GENERAL',
                description: null,
                institution_id: 'parent-1',
                subjects: [],
                course_ids: [],
                subject_count: 0,
                sourceRecordId: 'classification-1',
                inheritanceStatus: 'INHERITED',
                effectiveInstitutionId: 'child-1',
                isInherited: true,
                isLocal: false,
            },
            {
                subject_classification_id: 'classification-2',
                name: 'Beta',
                classification_type: 'CORE',
                description: null,
                institution_id: 'child-1',
                subjects: [],
                course_ids: [],
                subject_count: 0,
                sourceRecordId: null,
                inheritanceStatus: 'LOCAL',
                effectiveInstitutionId: 'child-1',
                isInherited: false,
                isLocal: true,
            },
        ] as any);

        const result = await SubjectClassificationService.getSubjectClassifications(
            dbClient,
            'child-1',
            'science',
            1,
            1,
        );

        expect(result).toMatchObject({
            items: [
                {
                    subject_classification_id: 'classification-1',
                    name: 'Alpha',
                    classification_type: 'GENERAL',
                    inheritance_status: 'INHERITED',
                    is_inherited: true,
                    effective_institution_id: 'child-1',
                },
            ],
            pagination: {
                page: 1,
                pageSize: 1,
                total: 2,
                totalPages: 2,
                hasMore: true,
            },
        });
        expect(loadEffectiveRows).toHaveBeenCalledOnce();
        expect(getSubjectClassificationsData).not.toHaveBeenCalled();
    });
});
