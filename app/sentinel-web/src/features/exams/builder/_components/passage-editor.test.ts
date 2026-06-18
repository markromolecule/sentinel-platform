import { describe, expect, it } from 'vitest';
import { buildLinkedTextNode, getPassageImageAltText } from '@sentinel/ui';

describe('passage editor helpers', () => {
    it('builds linked text content for an empty selection', () => {
        expect(buildLinkedTextNode('https://openai.com/docs')).toEqual({
            type: 'text',
            text: 'https://openai.com/docs',
            marks: [{ type: 'link', attrs: { href: 'https://openai.com/docs' } }],
        });
    });

    it('derives image alt text from the uploaded file name', () => {
        expect(getPassageImageAltText('passage-image.png')).toBe('passage-image');
        expect(getPassageImageAltText('  .png  ')).toBe('Passage image');
    });
});
