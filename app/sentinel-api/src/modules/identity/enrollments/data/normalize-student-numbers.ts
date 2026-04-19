export function normalizeStudentNumbers(studentNumbers: string[]) {
    return Array.from(
        new Set(
            studentNumbers
                .map((studentNumber) => studentNumber.trim())
                .filter((studentNumber) => studentNumber.length > 0),
        ),
    );
}
