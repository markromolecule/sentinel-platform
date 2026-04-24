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
    static async createAllForOfferings(
        dbClient: DbClient,
        subjectOfferingIds: string[],
        payload: SubjectOfferingAssignmentsPayload,
    ) {
        if (subjectOfferingIds.length === 0) {
            return;
        }

        const departmentIds = toUniqueStringArray(payload.department_ids);
        const courseIds = toUniqueStringArray(payload.course_ids);
        const sectionIds = toUniqueStringArray(payload.section_ids);
        const yearLevels = sanitizeYearLevels(payload.year_levels);

        if (departmentIds.length > 0) {
            await dbClient
                .insertInto('subject_offering_departments')
                .values(
                    subjectOfferingIds.flatMap((subjectOfferingId) =>
                        departmentIds.map((departmentId) => ({
                            subject_offering_id: subjectOfferingId,
                            department_id: departmentId,
                        })),
                    ),
                )
                .execute();
        }

        if (courseIds.length > 0) {
            await dbClient
                .insertInto('subject_offering_courses')
                .values(
                    subjectOfferingIds.flatMap((subjectOfferingId) =>
                        courseIds.map((courseId) => ({
                            subject_offering_id: subjectOfferingId,
                            course_id: courseId,
                        })),
                    ),
                )
                .execute();
        }

        if (sectionIds.length > 0) {
            await dbClient
                .insertInto('subject_offering_sections')
                .values(
                    subjectOfferingIds.flatMap((subjectOfferingId) =>
                        sectionIds.map((sectionId) => ({
                            subject_offering_id: subjectOfferingId,
                            section_id: sectionId,
                        })),
                    ),
                )
                .execute();
        }

        if (yearLevels.length > 0) {
            await dbClient
                .insertInto('subject_offering_year_levels')
                .values(
                    subjectOfferingIds.flatMap((subjectOfferingId) =>
                        yearLevels.map((yearLevel) => ({
                            subject_offering_id: subjectOfferingId,
                            year_level: yearLevel,
                        })),
                    ),
                )
                .execute();
        }
    }

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
