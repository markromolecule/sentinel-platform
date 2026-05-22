export type SectionImportPreview = {
    rows: {
        name: string;
        year_level?: number;
    }[];
    errors: string[];
};

/**
 * Parses a manual text input into a preview of section rows.
 * Expected format: "Section Name, Year Level" (one per line)
 */
export function parseSectionManualText(input: string): SectionImportPreview {
    const lines = input.split('\n').filter((line) => line.trim() !== '');
    const rows: { name: string; year_level?: number }[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
        const parts = line.split(',').map((p) => p.trim());

        if (parts.length < 1) {
            errors.push(`Line ${index + 1}: Invalid format. Expected "Name, YearLevel"`);
            return;
        }

        const name = parts[0];
        const yearLevelStr = parts[1] || '';
        let year_level: number | undefined;

        if (!name) {
            errors.push(`Line ${index + 1}: Section name is required`);
            return;
        }

        if (yearLevelStr) {
            const parsed = parseInt(yearLevelStr, 10);
            if (!isNaN(parsed)) {
                year_level = parsed;
            }
        }

        rows.push({ name, year_level });
    });

    return { rows, errors };
}
