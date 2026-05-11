import { describe, expect, it } from 'vitest';
import { generateRooms } from './room-generation';

describe('room-generation utility', () => {
    it('generates a sequence of rooms with correct names and codes', () => {
        const options = {
            namePrefix: 'Room ',
            codePrefix: 'RM',
            start: 400,
            end: 402,
        };

        const result = generateRooms(options);

        expect(result).toHaveLength(3);
        expect(result).toEqual([
            { name: 'Room 400', code: 'RM400', number: '400' },
            { name: 'Room 401', code: 'RM401', number: '401' },
            { name: 'Room 402', code: 'RM402', number: '402' },
        ]);
    });

    it('handles padding correctly', () => {
        const options = {
            namePrefix: 'Room ',
            codePrefix: 'RM',
            start: 1,
            end: 3,
            padding: 3,
        };

        const result = generateRooms(options);

        expect(result).toEqual([
            { name: 'Room 001', code: 'RM001', number: '001' },
            { name: 'Room 002', code: 'RM002', number: '002' },
            { name: 'Room 003', code: 'RM003', number: '003' },
        ]);
    });

    it('handles descending ranges correctly', () => {
        const options = {
            namePrefix: 'R',
            codePrefix: 'R',
            start: 10,
            end: 8,
        };

        const result = generateRooms(options);

        expect(result).toHaveLength(3);
        expect(result[0].number).toBe('8');
        expect(result[2].number).toBe('10');
    });

    it('handles single room range', () => {
        const options = {
            namePrefix: 'RM',
            codePrefix: 'RM',
            start: 100,
            end: 100,
        };

        const result = generateRooms(options);

        expect(result).toHaveLength(1);
        expect(result[0].number).toBe('100');
    });
});
