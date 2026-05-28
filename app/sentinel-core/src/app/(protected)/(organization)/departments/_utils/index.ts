export type DepartmentImportPreview = {
    rows: {
        name: string;
        code: string;
    }[];
    errors: string[];
};

/**
 * Parses a manual text input into a preview of department rows.
 * Expected format: "Department Name, Department Code" (one per line)
 */
export function parseDepartmentManualText(input: string): DepartmentImportPreview {
    const lines = input.split('\n').filter((line) => line.trim() !== '');
    const rows: { name: string; code: string }[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
        const parts = line.split(',').map((p) => p.trim());

        if (parts.length < 1) {
            errors.push(`Line ${index + 1}: Invalid format. Expected "Name, Code"`);
            return;
        }

        const name = parts[0];
        const code = parts[1] || '';

        if (!name) {
            errors.push(`Line ${index + 1}: Department name is required`);
            return;
        }

        rows.push({ name, code });
    });

    return { rows, errors };
}
