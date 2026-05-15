import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInstitutionFacet } from './index';
import { Institution } from '@sentinel/shared/types';

describe('useInstitutionFacet', () => {
    const mockInstitutions: Institution[] = [
        {
            id: '1',
            name: 'Main Institution',
            parentInstitutionId: null,
            createdAt: new Date().toISOString(),
            createdBy: 'user-1',
        },
        {
            id: '2',
            name: 'Branch Institution',
            parentInstitutionId: '1',
            createdAt: new Date().toISOString(),
            createdBy: 'user-1',
        },
    ];

    it('should format institutions correctly into facet options', () => {
        const { result } = renderHook(() =>
            useInstitutionFacet({ institutions: mockInstitutions }),
        );

        expect(result.current).toHaveLength(2);
        
        expect(result.current[0]).toMatchObject({
            label: 'Main Institution',
            value: '1',
            isBranch: false,
        });

        expect(result.current[1]).toMatchObject({
            label: 'Branch Institution',
            value: '2',
            isBranch: true,
        });
    });

    it('should return empty array when no institutions are provided', () => {
        const { result } = renderHook(() => useInstitutionFacet({ institutions: [] }));
        expect(result.current).toHaveLength(0);
    });
});
