import { describe, it, expect } from 'vitest';
import { accessControlRoleBodySchema } from './access-control-schema';

describe('accessControlRoleBodySchema', () => {
    it('should parse a valid role request body successfully', () => {
        const validBody = {
            name: 'Academic Moderator',
            slug: 'academic-moderator',
            description: 'Custom moderator role for specific academic contexts.',
            domainScope: ['app'],
            isActive: true,
            assignableBy: ['admin'],
        };

        const parsed = accessControlRoleBodySchema.safeParse(validBody);
        expect(parsed.success).toBe(true);
        if (parsed.success) {
            expect(parsed.data.name).toBe('Academic Moderator');
            expect(parsed.data.slug).toBe('academic-moderator');
            expect(parsed.data.domainScope).toEqual(['app']);
        }
    });

    it('should allow optional fields to be omitted', () => {
        const body = {
            name: 'Teaching Assistant',
            domainScope: ['app'],
        };

        const parsed = accessControlRoleBodySchema.safeParse(body);
        expect(parsed.success).toBe(true);
        if (parsed.success) {
            expect(parsed.data.slug).toBeUndefined();
            expect(parsed.data.isActive).toBe(true); // default true
            expect(parsed.data.assignableBy).toEqual([]); // default []
        }
    });

    it('should catch a name that is too short or too long', () => {
        const tooShort = {
            name: 'A',
            domainScope: ['app'],
        };
        const tooLong = {
            name: 'A'.repeat(51),
            domainScope: ['app'],
        };

        expect(accessControlRoleBodySchema.safeParse(tooShort).success).toBe(false);
        expect(accessControlRoleBodySchema.safeParse(tooLong).success).toBe(false);
    });

    it('should catch empty domainScope or domainScope elements with empty strings', () => {
        const emptyScope = {
            name: 'Helper',
            domainScope: [],
        };
        const emptyElement = {
            name: 'Helper',
            domainScope: [''],
        };

        expect(accessControlRoleBodySchema.safeParse(emptyScope).success).toBe(false);
        expect(accessControlRoleBodySchema.safeParse(emptyElement).success).toBe(false);
    });

    it('should catch invalid slug patterns', () => {
        const invalidSlug = {
            name: 'Helper',
            slug: 'invalid_slug_with_underscores',
            domainScope: ['app'],
        };
        const spacesInSlug = {
            name: 'Helper',
            slug: 'invalid slug with spaces',
            domainScope: ['app'],
        };

        expect(accessControlRoleBodySchema.safeParse(invalidSlug).success).toBe(false);
        expect(accessControlRoleBodySchema.safeParse(spacesInSlug).success).toBe(false);
    });

    it('should catch description that is too long', () => {
        const tooLongDescription = {
            name: 'Helper',
            domainScope: ['app'],
            description: 'A'.repeat(256),
        };

        expect(accessControlRoleBodySchema.safeParse(tooLongDescription).success).toBe(false);
    });
});
