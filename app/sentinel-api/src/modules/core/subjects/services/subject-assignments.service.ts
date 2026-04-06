import { type DbClient } from '@sentinel/db';
import { updateSubjectCoursesData } from '../data/update-subject-courses';
import { updateSubjectDepartmentsData } from '../data/update-subject-departments';
import { updateSubjectSectionsData } from '../data/update-subject-sections';
import { updateSubjectYearLevelsData } from '../data/update-subject-year-levels';

const MIN_SUBJECT_YEAR_LEVEL = 1;
const MAX_SUBJECT_YEAR_LEVEL = 6;

export type SubjectAssignmentsPayload = {
    department_ids?: string[];
    course_ids?: string[];
    section_ids?: string[];
    year_levels?: number[];
};

type SubjectAssignments = {
    department_ids: string[];
    course_ids: string[];
    section_ids: string[];
    year_levels: number[];
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

function sanitizeAssignments(payload: SubjectAssignmentsPayload): SubjectAssignments {
    return {
        department_ids: toUniqueStringArray(payload.department_ids),
        course_ids: toUniqueStringArray(payload.course_ids),
        section_ids: toUniqueStringArray(payload.section_ids),
        year_levels: sanitizeYearLevels(payload.year_levels),
    };
}

export class SubjectAssignmentsService {
    static async updateAll(
        dbClient: DbClient,
        subjectId: string,
        payload: SubjectAssignmentsPayload,
    ) {
        const assignments = sanitizeAssignments(payload);

        await updateSubjectDepartmentsData({
            dbClient,
            subjectId,
            departmentIds: assignments.department_ids,
        });
        await updateSubjectCoursesData({
            dbClient,
            subjectId,
            courseIds: assignments.course_ids,
        });
        await updateSubjectSectionsData({
            dbClient,
            subjectId,
            sectionIds: assignments.section_ids,
        });
        await updateSubjectYearLevelsData({
            dbClient,
            subjectId,
            yearLevels: assignments.year_levels,
        });
    }

    static async updatePartial(
        dbClient: DbClient,
        subjectId: string,
        payload: SubjectAssignmentsPayload,
    ) {
        if (payload.department_ids !== undefined) {
            await updateSubjectDepartmentsData({
                dbClient,
                subjectId,
                departmentIds: toUniqueStringArray(payload.department_ids),
            });
        }

        if (payload.course_ids !== undefined) {
            await updateSubjectCoursesData({
                dbClient,
                subjectId,
                courseIds: toUniqueStringArray(payload.course_ids),
            });
        }

        if (payload.section_ids !== undefined) {
            await updateSubjectSectionsData({
                dbClient,
                subjectId,
                sectionIds: toUniqueStringArray(payload.section_ids),
            });
        }

        if (payload.year_levels !== undefined) {
            await updateSubjectYearLevelsData({
                dbClient,
                subjectId,
                yearLevels: sanitizeYearLevels(payload.year_levels),
            });
        }
    }
}
