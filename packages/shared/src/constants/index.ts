
// Configuration Constants
export const DEFAULT_PAGINATION_LIMIT = 10;
export const DATE_FORMAT = "MMM dd, yyyy";
export const TIME_FORMAT = "hh:mm a";
export const DATETIME_FORMAT = "MMM dd, yyyy hh:mm a";

// Validation Regex
export const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Enum Collections (for iteration/validation)
export const USER_ROLES = ["admin", "proctor", "student", "instructor"] as const;
export const EXAM_STATUSES = ["available", "completed", "in-progress", "upcoming", "draft", "scheduled", "active"] as const;
export const EXAM_DIFFICULTIES = ["easy", "medium", "hard"] as const;
export const ACTION_TYPES = ["info", "warning", "error", "success"] as const;

// App Constants
export const APP_NAME = "Sentinel Proctoring System";
export const SUPPORT_EMAIL = "support@sentinel.com";

// Academic Constants
export const DEPARTMENTS = [
    "School of Engineering, Computing, and Architecture", // SECA
    "School of Business, Management, and Accountancy",    // SBMA
    "School of Arts, Sciences, and Education",            // SASE
] as const;

export const DEPARTMENTS_ABBR: Record<string, string> = {
    "School of Engineering, Computing, and Architecture": "SECA",
    "School of Business, Management, and Accountancy": "SBMA",
    "School of Arts, Sciences, and Education": "SASE",
};

export const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"] as const;

export const SEMESTERS = ["1st Semester", "2nd Semester", "Summer"] as const;
