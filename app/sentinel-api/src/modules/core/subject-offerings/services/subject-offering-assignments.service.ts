import { type DbClient } from '@sentinel/db';
import { updateSubjectOfferingCoursesData } from '../data/update-subject-offering-courses';
import { updateSubjectOfferingDepartmentsData } from '../data/update-subject-offering-departments';
import { updateSubjectOfferingSectionsData } from '../data/update-subject-offering-sections';
import { updateSubjectOfferingYearLevelsData } from '../data/update-subject-offering-year-levels';

const MIN_SUBJECT_YEAR_LEVEL = 1;
const MAX_SUBJECT_YEAR_LEVEL = 6;

export type SubjectOfferingAssignmentsPayload = {
    department_ids?: string[];
    course_ids?: string[];
    section_ids?: string[];
    year_levels?: number[];
};

function toUniqueStringArray(values: string[] | undefined) {
    return Array.from(new Set(values ?? []));
}

function sanitizeYearLevels(yearLevels: number[] | undefined) {
    return Array.from(
        new Set(
            (yearLevels ?? [])
                .map((value) => Number(value))
                .filter(
                    (value) =>
                        Number.isInteger(value) &&
                        value >= MIN_SUBJECT_YEAR_LEVEL &&
                        value <= MAX_SUBJECT_YEAR_LEVEL,
                ),
        ),
    );
}

export class SubjectOfferingAssignmentsService {
    static async updateAll(
        dbClient: DbClient,
        subjectOfferingId: string,
        payload: SubjectOfferingAssignmentsPayload,
    ) {
        await updateSubjectOfferingDepartmentsData({
            dbClient,
            subjectOfferingId,
            departmentIds: toUniqueStringArray(payload.department_ids),
        });
        await updateSubjectOfferingCoursesData({
            dbClient,
            subjectOfferingId,
            courseIds: toUniqueStringArray(payload.course_ids),
        });
        await updateSubjectOfferingSectionsData({
            dbClient,
            subjectOfferingId,
            sectionIds: toUniqueStringArray(payload.section_ids),
        });
        await updateSubjectOfferingYearLevelsData({
            dbClient,
            subjectOfferingId,
            yearLevels: sanitizeYearLevels(payload.year_levels),
        });
    }

    static async updatePartial(
        dbClient: DbClient,
        subjectOfferingId: string,
        payload: SubjectOfferingAssignmentsPayload,
    ) {
        if (payload.department_ids !== undefined) {
            await updateSubjectOfferingDepartmentsData({
                dbClient,
                subjectOfferingId,
                departmentIds: toUniqueStringArray(payload.department_ids),
            });
        }

        if (payload.course_ids !== undefined) {
            await updateSubjectOfferingCoursesData({
                dbClient,
                subjectOfferingId,
                courseIds: toUniqueStringArray(payload.course_ids),
            });
        }

        if (payload.section_ids !== undefined) {
            await updateSubjectOfferingSectionsData({
                dbClient,
                subjectOfferingId,
                sectionIds: toUniqueStringArray(payload.section_ids),
            });
        }

        if (payload.year_levels !== undefined) {
            await updateSubjectOfferingYearLevelsData({
                dbClient,
                subjectOfferingId,
                yearLevels: sanitizeYearLevels(payload.year_levels),
            });
        }
    }
}
