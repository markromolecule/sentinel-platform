import { describe, expect, it } from 'vitest';
import { renderPassage, sanitizePassageHtml } from './passage-rendering';

describe('passage rendering', () => {
    it('escapes plain passages and preserves line breaks', () => {
        const rendered = renderPassage({
            passageContent: 'Hello <world>\nSecond line',
            passageType: 'plain',
        });

        expect(rendered?.html).toBe('Hello &lt;world&gt;<br />Second line');
    });

    it('sanitizes allow-listed html and removes dangerous attributes', () => {
        const rendered = renderPassage({
            passageContent:
                '<p><strong>Rich</strong> <a href="https://example.com" onclick="alert(1)">link</a></p>',
            passageType: 'html',
        });

        expect(rendered?.html).toContain('<strong>Rich</strong>');
        expect(rendered?.html).toContain(
            '<a href="https://example.com" rel="noopener noreferrer nofollow">link</a>',
        );
        expect(rendered?.html).not.toContain('onclick');
    });

    it('neutralizes script and javascript url injections', () => {
        const rendered = sanitizePassageHtml(
            '<script>alert(1)</script><a href="javascript:alert(1)">bad</a><img src="data:text/html;base64,xyz" alt="x" />',
        );

        expect(rendered).toContain('alert(1)');
        expect(rendered).not.toContain('<script');
        expect(rendered).toContain('<a rel="noopener noreferrer nofollow">bad</a>');
        expect(rendered).not.toContain('javascript:');
        expect(rendered).not.toContain('data:text/html');
    });
});
