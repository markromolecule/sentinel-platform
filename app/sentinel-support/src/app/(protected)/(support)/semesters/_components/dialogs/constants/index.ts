// Semester options
export const SEMESTER_OPTIONS = ['1st Semester', '2nd Semester', '3rd Semester', 'Summer'];

// Generate academic year options for the last 5 years
const currentYear = new Date().getFullYear();
export const ACADEMIC_YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - 1 + i;
    return `${year}-${year + 1}`;
});
