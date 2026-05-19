import * as XLSX from 'xlsx';
import type { ParsedStudent, ParsedWorksheetResult } from './student-enrollment.types';

type WorksheetRow = Array<string | number>;

type StudentColumnMap = {
    studentNumber: number;
    studentName: number;
    lastName: number;
    firstName: number;
    section: number;
    subject: number;
    term: number;
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
    section: ['section'],
    subject: ['subject', 'course', 'course code', 'program'],
    term: ['term', 'semester'],
} as const;

export const INVALID_ENROLLMENT_FILE_ERROR =
    'Failed to parse the file. Please use a valid CSV or Excel sheet.';

function normalizeHeaderValue(value: string | number | null | undefined) {
    return String(value ?? '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function findColumnIndex(row: WorksheetRow, aliases: readonly string[]) {
    return row.findIndex((cell) => (aliases as string[]).includes(normalizeHeaderValue(cell)));
}

// Helper to check if a row might be the header row
function resolvesAnyHeader(row: WorksheetRow): boolean {
    const combinedAliases = [
        ...HEADER_ALIASES.studentNumber,
        ...HEADER_ALIASES.studentName,
        ...HEADER_ALIASES.lastName,
        ...HEADER_ALIASES.firstName,
    ] as string[];
    return row.some((cell) => combinedAliases.includes(normalizeHeaderValue(cell)));
}

function getRowValue(row: WorksheetRow, index: number) {
    if (index < 0) {
        return '';
    }

    return String(row[index] ?? '').trim();
}

function parseStudentName(value: string) {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
        return {
            lastName: '',
            firstName: '',
        };
    }

    if (trimmedValue.includes(',')) {
        const [lastName, ...rest] = trimmedValue.split(',');

        return {
            lastName: lastName.trim(),
            firstName: rest.join(',').trim(),
        };
    }

    const nameParts = trimmedValue.split(/\s+/).filter(Boolean);

    if (nameParts.length <= 1) {
        return {
            lastName: nameParts[0] || '',
            firstName: '',
        };
    }

    return {
        lastName: nameParts[nameParts.length - 1],
        firstName: nameParts.slice(0, -1).join(' '),
    };
}

function resolveColumnMap(row: WorksheetRow): StudentColumnMap | null {
    const columnMap = {
        studentNumber: findColumnIndex(row, HEADER_ALIASES.studentNumber),
        studentName: findColumnIndex(row, HEADER_ALIASES.studentName),
        lastName: findColumnIndex(row, HEADER_ALIASES.lastName),
        firstName: findColumnIndex(row, HEADER_ALIASES.firstName),
        section: findColumnIndex(row, HEADER_ALIASES.section),
        subject: findColumnIndex(row, HEADER_ALIASES.subject),
        term: findColumnIndex(row, HEADER_ALIASES.term),
    };

    const hasStudentHeader =
        columnMap.studentNumber >= 0 && (columnMap.studentName >= 0 || columnMap.lastName >= 0);

    return hasStudentHeader ? columnMap : null;
}

function parseStudentRow(row: WorksheetRow, columnMap: StudentColumnMap): ParsedStudent | null {
    const studentNumber = getRowValue(row, columnMap.studentNumber);
    const explicitLastName = getRowValue(row, columnMap.lastName);
    const explicitFirstName = getRowValue(row, columnMap.firstName);
    const studentName = getRowValue(row, columnMap.studentName);
    const parsedName = parseStudentName(studentName);
    const lastName = explicitLastName || parsedName.lastName;
    const firstName = explicitFirstName || parsedName.firstName;

    const hasRelevantContent = Boolean(
        studentNumber || studentName || explicitLastName || explicitFirstName,
    );

    if (!hasRelevantContent) {
        return null;
    }

    return {
        studentNo: studentNumber,
        firstName,
        lastName,
        section: getRowValue(row, columnMap.section),
        subject: getRowValue(row, columnMap.subject),
        term: getRowValue(row, columnMap.term),
    };
}

function parseWorksheet(worksheet: XLSX.WorkSheet): ParsedWorksheetResult {
    const rows = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
        defval: '',
        blankrows: false,
    }) as WorksheetRow[];

    if (!rows.length) {
        return {
            students: [],
            errors: ['File is empty or uses an unsupported format.'],
        };
    }

    const students: ParsedStudent[] = [];
    const errors: string[] = [];
    const seenStudentNumbers = new Set<string>();
    let activeColumnMap: StudentColumnMap | null = null;

    rows.forEach((row, index) => {
        const nextColumnMap = resolveColumnMap(row);

        if (nextColumnMap) {
            activeColumnMap = nextColumnMap;
            return;
        }

        if (!activeColumnMap) {
            // If this row contains keywords but didn't form a full student header, ignore it
            if (resolvesAnyHeader(row)) {
                return;
            }
            return;
        }

        const student = parseStudentRow(row, activeColumnMap);

        if (!student) {
            return;
        }

        if (!student.studentNo || !student.lastName) {
            errors.push(`Row ${index + 1}: Student Number and Last Name are required.`);
            return;
        }

        if (seenStudentNumbers.has(student.studentNo)) {
            errors.push(`Row ${index + 1}: Duplicate student number ${student.studentNo} ignored.`);
            return;
        }

        seenStudentNumbers.add(student.studentNo);

        students.push(student);
    });

    if (!students.length && !errors.length) {
        errors.push(
            'Could not find a student list header. Use columns like Student ID and Student Name, or Last Name.',
        );
    }

    return { students, errors };
}

export async function parseEnrollmentFile(file: File) {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = firstSheetName ? workbook.Sheets[firstSheetName] : null;

    if (!worksheet) {
        return {
            students: [],
            errors: ['File is empty or uses an unsupported format.'],
        };
    }

    return parseWorksheet(worksheet);
}
