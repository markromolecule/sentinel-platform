import { type DbClient } from '@sentinel/db';
import { createStudentWhitelistData } from '../data/create-student-whitelist';
import { getStudentWhitelistByStudentNumbersData } from '../data/get-student-whitelist-by-student-numbers';
import { buildCreateStudentWhitelistValues } from '../helpers/build-student-whitelist-write-values';
import {
    doesImportedCourseMatchSelectedCourse,
    normalizeStudentNumber,
} from '../helpers/normalize-student-whitelist-values';
import { resolveStudentWhitelistMutationScope } from '../helpers/resolve-student-whitelist-mutation-scope';
import { isDuplicateStudentWhitelistError } from '../helpers/student-whitelist-errors';
import type { BulkImportStudentWhitelistArgs } from '../student-whitelist.types';

type BulkImportFailure = {
    row_number: number;
    student_number: string | null;
    last_name: string | null;
    source_course: string | null;
    error: string;
};

type PreparedBulkImportRow = {
    row_number: number;
    student_number: string;
    last_name: string;
    first_name: string | null;
    status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
    source_course: string | null;
};

function buildFailure(
    row: {
        row_number: number;
        student_number?: string | null;
        last_name?: string | null;
        source_course?: string | null;
    },
    error: string,
): BulkImportFailure {
    return {
        row_number: row.row_number,
        student_number: row.student_number ?? null,
        last_name: row.last_name ?? null,
        source_course: row.source_course ?? null,
        error,
    };
}

function prepareBulkImportRows({
    rows,
    selectedCourseCode,
    selectedCourseTitle,
}: {
    rows: BulkImportStudentWhitelistArgs['values']['rows'];
    selectedCourseCode?: string | null;
    selectedCourseTitle?: string | null;
}) {
    const failures: BulkImportFailure[] = [];
    const preparedRows: PreparedBulkImportRow[] = [];
    const seenStudentNumbers = new Set<string>();

    for (const row of rows) {
        const studentNumber = normalizeStudentNumber(row.student_number);
        const lastName = row.last_name.trim();
        const firstName = row.first_name?.trim() || null;
        const sourceCourse = row.source_course?.trim() || null;
        const studentNumberKey = studentNumber.toLowerCase();

        if (!studentNumber || !lastName) {
            failures.push(
                buildFailure(
                    {
                        row_number: row.row_number,
                        student_number: studentNumber || null,
                        last_name: lastName || null,
                        source_course: sourceCourse,
                    },
                    'Student number and last name are required',
                ),
            );
            continue;
        }

        if (seenStudentNumbers.has(studentNumberKey)) {
            failures.push(
                buildFailure(
                    {
                        row_number: row.row_number,
                        student_number: studentNumber,
                        last_name: lastName,
                        source_course: sourceCourse,
                    },
                    'Duplicate student number found in this import file',
                ),
            );
            continue;
        }

        if (
            !doesImportedCourseMatchSelectedCourse({
                importedCourse: sourceCourse,
                selectedCourseCode,
                selectedCourseTitle,
            })
        ) {
            failures.push(
                buildFailure(
                    {
                        row_number: row.row_number,
                        student_number: studentNumber,
                        last_name: lastName,
                        source_course: sourceCourse,
                    },
                    'Course does not match the selected whitelist scope',
                ),
            );
            continue;
        }

        seenStudentNumbers.add(studentNumberKey);
        preparedRows.push({
            row_number: row.row_number,
            student_number: studentNumber,
            last_name: lastName,
            first_name: firstName,
            status: row.status ?? 'ACTIVE',
            source_course: sourceCourse,
        });
    }

    return {
        failures,
        preparedRows,
    };
}

function filterExistingBulkImportRows({
    rows,
    existingStudentNumbers,
}: {
    rows: PreparedBulkImportRow[];
    existingStudentNumbers: Set<string>;
}) {
    const failures: BulkImportFailure[] = [];

    const rowsToCreate = rows.filter((row) => {
        const alreadyExists = existingStudentNumbers.has(row.student_number.toLowerCase());

        if (alreadyExists) {
            failures.push(
                buildFailure(row, 'Student whitelist record already exists for this institution'),
            );
        }

        return !alreadyExists;
    });

    return {
        failures,
        rowsToCreate,
    };
}

async function createBulkImportRows({
    dbClient,
    institutionId,
    departmentId,
    courseId,
    requesterUserId,
    rows,
}: {
    dbClient: DbClient;
    institutionId: string;
    departmentId: string;
    courseId: string;
    requesterUserId: string;
    rows: PreparedBulkImportRow[];
}) {
    const failures: BulkImportFailure[] = [];
    let createdCount = 0;

    for (const row of rows) {
        try {
            await createStudentWhitelistData({
                dbClient,
                values: buildCreateStudentWhitelistValues({
                    institutionId,
                    requesterUserId,
                    studentNumber: row.student_number,
                    values: {
                        institution_id: institutionId,
                        department_id: departmentId,
                        course_id: courseId,
                        student_number: row.student_number,
                        last_name: row.last_name,
                        first_name: row.first_name,
                        status: row.status,
                    },
                }),
            });

            createdCount += 1;
        } catch (error) {
            if (isDuplicateStudentWhitelistError(error)) {
                failures.push(
                    buildFailure(
                        row,
                        'Student whitelist record already exists for this institution',
                    ),
                );
                continue;
            }

            throw error;
        }
    }

    return {
        createdCount,
        failures,
    };
}

export async function bulkImportStudentWhitelist(
    dbClient: DbClient,
    {
        requesterRole,
        requesterInstitutionId,
        requesterDepartmentId,
        requesterCourseId,
        requesterUserId,
        values,
    }: BulkImportStudentWhitelistArgs,
) {
    const scope = await resolveStudentWhitelistMutationScope({
        dbClient,
        requesterRole,
        requesterInstitutionId,
        requesterDepartmentId,
        requesterCourseId,
        requestedInstitutionId: values.institution_id,
        departmentId: values.department_id,
        courseId: values.course_id,
    });

    const selectedCourse = await dbClient
        .selectFrom('courses')
        .select(['code', 'title'])
        .where('course_id', '=', values.course_id)
        .executeTakeFirst();

    if (!selectedCourse) {
        throw new Error('Course not found');
    }

    const preparedResult = prepareBulkImportRows({
        rows: values.rows,
        selectedCourseCode: selectedCourse.code,
        selectedCourseTitle: selectedCourse.title,
    });

    const existingRecords = await getStudentWhitelistByStudentNumbersData({
        dbClient,
        institutionId: scope.institutionId,
        studentNumbers: preparedResult.preparedRows.map((row) => row.student_number),
    });
    const existingStudentNumbers = new Set(
        existingRecords.map((record) =>
            normalizeStudentNumber(record.student_number).toLowerCase(),
        ),
    );

    const filteredResult = filterExistingBulkImportRows({
        rows: preparedResult.preparedRows,
        existingStudentNumbers,
    });

    const createdResult = await createBulkImportRows({
        dbClient,
        institutionId: scope.institutionId,
        departmentId: scope.departmentId,
        courseId: scope.courseId,
        requesterUserId,
        rows: filteredResult.rowsToCreate,
    });

    const failures = [
        ...preparedResult.failures,
        ...filteredResult.failures,
        ...createdResult.failures,
    ].sort((left, right) => left.row_number - right.row_number);

    return {
        total_rows: values.rows.length,
        created_count: createdResult.createdCount,
        failed_count: failures.length,
        failures,
    };
}
