'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApi, useStableValue } from '@sentinel/hooks';
import { bulkImportStudentWhitelist } from '@sentinel/services';
import { STUDENT_WHITELIST_QUERY_KEYS } from '@sentinel/shared/constants';
import {
    StudentWhitelistBulkImportFailure,
    StudentWhitelistBulkImportInput,
    StudentWhitelistStatus,
} from '@sentinel/shared/types';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export interface ParsedStudentWhitelistRow {
    row_number: number;
    student_number: string;
    last_name: string;
    first_name?: string | null;
    status: StudentWhitelistStatus;
    source_course?: string | null;
}

export interface StudentWhitelistBulkParseResult {
    rows: ParsedStudentWhitelistRow[];
    errors: string[];
}

export interface StudentWhitelistBulkImportSummary {
    createdCount: number;
    failedCount: number;
    failures: StudentWhitelistBulkImportFailure[];
}

const STATUS_LOOKUP: Record<string, StudentWhitelistStatus> = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    ARCHIVED: 'ARCHIVED',
};
const MASTERLIST_STATUS_LOOKUP: Record<string, StudentWhitelistStatus> = {
    ENROLLED: 'ACTIVE',
    REGISTERED: 'ACTIVE',
};

const HEADER_ALIASES = {
    studentNumber: [
        'student number',
        'student no',
        'student no.',
        'studentid',
        'student id',
        'student_id',
        'student_number',
    ],
    studentName: ['student name', 'name of student', 'student_name'],
    lastName: ['last name', 'lastname', 'last_name', 'surname'],
    firstName: ['first name', 'firstname', 'first_name', 'given name'],
    status: ['status'],
    sourceCourse: ['course', 'program', 'course code'],
};

function normalizeHeaderValue(value: string | number | null | undefined) {
    return String(value ?? '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function findColumnIndex(row: Array<string | number>, aliases: string[]) {
    return row.findIndex((cell) => aliases.includes(normalizeHeaderValue(cell)));
}

function getRowValue(row: Array<string | number>, index: number) {
    if (index < 0) {
        return '';
    }

    return String(row[index] ?? '').trim();
}

function parseStudentName(value: string) {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return {
            last_name: '',
            first_name: null,
        };
    }

    if (trimmedValue.includes(',')) {
        const [lastName, ...rest] = trimmedValue.split(',');

        return {
            last_name: lastName.trim(),
            first_name: rest.join(',').trim() || null,
        };
    }

    const nameParts = trimmedValue.split(/\s+/).filter(Boolean);
    if (!nameParts.length) {
        return {
            last_name: '',
            first_name: null,
        };
    }

    if (nameParts.length === 1) {
        return {
            last_name: nameParts[0],
            first_name: null,
        };
    }

    return {
        last_name: nameParts[nameParts.length - 1],
        first_name: nameParts.slice(0, -1).join(' '),
    };
}

function normalizeStatus(value: string) {
    if (!value) {
        return 'ACTIVE' as const;
    }

    const normalizedValue = value.trim().replace(/\s+/g, '_').toUpperCase();

    return STATUS_LOOKUP[normalizedValue] || MASTERLIST_STATUS_LOOKUP[normalizedValue] || null;
}

function formatFailureMessage(failure: StudentWhitelistBulkImportFailure) {
    const studentLabel = failure.studentNumber || `row ${failure.rowNumber}`;

    return `Row ${failure.rowNumber} (${studentLabel}): ${failure.error}.`;
}

function parseWorksheet(worksheet: XLSX.WorkSheet): StudentWhitelistBulkParseResult {
    const sheetRows = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
        defval: '',
        blankrows: false,
    }) as Array<Array<string | number>>;

    if (!sheetRows.length) {
        return {
            rows: [],
            errors: ['File is empty or uses an unsupported format.'],
        };
    }

    const rows: ParsedStudentWhitelistRow[] = [];
    const errors: string[] = [];
    let activeColumnMap: {
        studentNumber: number;
        studentName: number;
        lastName: number;
        firstName: number;
        status: number;
        sourceCourse: number;
    } | null = null;

    sheetRows.forEach((sheetRow, index) => {
        const nextColumnMap = {
            studentNumber: findColumnIndex(sheetRow, HEADER_ALIASES.studentNumber),
            studentName: findColumnIndex(sheetRow, HEADER_ALIASES.studentName),
            lastName: findColumnIndex(sheetRow, HEADER_ALIASES.lastName),
            firstName: findColumnIndex(sheetRow, HEADER_ALIASES.firstName),
            status: findColumnIndex(sheetRow, HEADER_ALIASES.status),
            sourceCourse: findColumnIndex(sheetRow, HEADER_ALIASES.sourceCourse),
        };
        const hasStudentHeader =
            nextColumnMap.studentNumber >= 0 &&
            (nextColumnMap.studentName >= 0 || nextColumnMap.lastName >= 0);

        if (hasStudentHeader) {
            activeColumnMap = nextColumnMap;
            return;
        }

        if (!activeColumnMap) {
            return;
        }

        const studentNumber = getRowValue(sheetRow, activeColumnMap.studentNumber);
        const explicitLastName = getRowValue(sheetRow, activeColumnMap.lastName);
        const explicitFirstName = getRowValue(sheetRow, activeColumnMap.firstName);
        const studentName = getRowValue(sheetRow, activeColumnMap.studentName);
        const status = normalizeStatus(getRowValue(sheetRow, activeColumnMap.status));
        const sourceCourse = getRowValue(sheetRow, activeColumnMap.sourceCourse) || null;
        const parsedName = parseStudentName(studentName);
        const lastName = explicitLastName || parsedName.last_name;
        const firstName = explicitFirstName || parsedName.first_name;
        const hasRelevantContent = Boolean(
            studentNumber ||
            studentName ||
            explicitLastName ||
            explicitFirstName ||
            sourceCourse ||
            getRowValue(sheetRow, activeColumnMap.status),
        );

        if (!hasRelevantContent) {
            return;
        }

        if (!studentNumber || !lastName) {
            errors.push(`Row ${index + 1}: Student Number and Last Name are required.`);
            return;
        }

        if (!status) {
            errors.push(`Row ${index + 1}: Status must be Active, Inactive, or Archived.`);
            return;
        }

        rows.push({
            row_number: index + 1,
            student_number: studentNumber,
            last_name: lastName,
            first_name: firstName || null,
            status,
            source_course: sourceCourse,
        });
    });

    if (!rows.length && !errors.length) {
        errors.push(
            'Could not find a student list header. Use columns like Student ID and Student Name, or Last Name.',
        );
    }

    return { rows, errors };
}

/**
 * Custom hook to handle Excel/CSV bulk import for student whitelists.
 */
export function useStudentWhitelistBulkImport() {
    const apiClient = useApi();
    const queryClient = useQueryClient();
    const [file, setFile] = useState<File | null>(null);
    const [parseResult, setParseResult] = useState<StudentWhitelistBulkParseResult | null>(null);
    const [importSummary, setImportSummary] = useState<StudentWhitelistBulkImportSummary | null>(
        null,
    );
    const [isParsing, setIsParsing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const resetState = useCallback(() => {
        setFile(null);
        setParseResult(null);
        setImportSummary(null);
        setIsParsing(false);
        setIsImporting(false);
    }, []);

    const parseFile = useCallback(async (selectedFile: File) => {
        setFile(selectedFile);
        setImportSummary(null);
        setIsParsing(true);

        try {
            const data = await selectedFile.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            setParseResult(parseWorksheet(worksheet));
        } catch (error) {
            console.error('Student whitelist parse error:', error);
            setParseResult({
                rows: [],
                errors: ['Failed to parse the file. Please use a valid CSV or Excel sheet.'],
            });
        } finally {
            setIsParsing(false);
        }
    }, []);

    const importRows = useCallback(
        async (
            scope: Pick<
                StudentWhitelistBulkImportInput,
                'institution_id' | 'department_id' | 'course_id'
            >,
        ) => {
            if (!parseResult?.rows.length) {
                toast.error('Upload a file with at least one valid whitelist row.');
                return false;
            }

            setIsImporting(true);

            try {
                const result = await bulkImportStudentWhitelist(apiClient, {
                    institution_id: scope.institution_id,
                    department_id: scope.department_id,
                    course_id: scope.course_id,
                    rows: parseResult.rows,
                });

                setImportSummary({
                    createdCount: result.createdCount,
                    failedCount: result.failedCount,
                    failures: result.failures,
                });

                await queryClient.invalidateQueries({
                    queryKey: STUDENT_WHITELIST_QUERY_KEYS.all,
                });

                if (result.createdCount > 0) {
                    toast.success(`Imported ${result.createdCount} whitelist record(s).`);
                }

                if (result.failedCount > 0) {
                    setParseResult((current) =>
                        current
                            ? {
                                  rows: [],
                                  errors: [
                                      ...current.errors,
                                      ...result.failures.map(formatFailureMessage),
                                  ],
                              }
                            : current,
                    );

                    toast.error(`Skipped ${result.failedCount} whitelist record(s).`);
                }

                if (result.createdCount > 0 && result.failedCount === 0) {
                    resetState();
                    return true;
                }

                return false;
            } catch (error) {
                console.error('Student whitelist bulk import error:', error);
                toast.error(
                    error instanceof Error ? error.message : 'Failed to import whitelist rows.',
                );
                return false;
            } finally {
                setIsImporting(false);
            }
        },
        [apiClient, parseResult, queryClient, resetState],
    );

    const previewCount = useStableValue(() => parseResult?.rows.length || 0, [parseResult]);

    return {
        file,
        parseResult,
        previewCount,
        importSummary,
        isParsing,
        isImporting,
        parseFile,
        importRows,
        resetState,
    };
}
