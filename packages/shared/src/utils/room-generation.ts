export type GeneratedRoom = {
    name: string;
    code: string;
    number: string;
};

export type GenerateRoomsOptions = {
    namePrefix: string; // e.g. "Room "
    codePrefix: string; // e.g. "RM"
    start: number;
    end: number;
    padding?: number;
};

/**
 * Generates a list of rooms based on a range of numbers and naming prefixes.
 *
 * @example
 * generateRooms({ namePrefix: 'Room ', codePrefix: 'RM', start: 400, end: 405 })
 * // Returns:
 * // [
 * //   { name: 'Room 400', code: 'RM400', number: '400' },
 * //   ...
 * //   { name: 'Room 405', code: 'RM405', number: '405' }
 * // ]
 */
export function generateRooms({
    namePrefix,
    codePrefix,
    start,
    end,
    padding = 0,
}: GenerateRoomsOptions): GeneratedRoom[] {
    const rooms: GeneratedRoom[] = [];
    const min = Math.min(start, end);
    const max = Math.max(start, end);

    for (let i = min; i <= max; i++) {
        const numStr = padding > 0 ? String(i).padStart(padding, '0') : String(i);
        rooms.push({
            name: `${namePrefix}${numStr}`,
            code: `${codePrefix}${numStr}`,
            number: numStr,
        });
    }

    return rooms;
}
