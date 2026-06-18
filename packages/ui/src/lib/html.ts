export function htmlToPlainText(html: string) {
    if (!html) {
        return '';
    }

    if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
        const document = new DOMParser().parseFromString(html, 'text/html');
        return document.body.textContent ?? '';
    }

    return html
        .replaceAll(/<\s*br\s*\/?\s*>/gi, '\n')
        .replaceAll(/<\/(p|div|h2|h3|h4|li|blockquote|pre)>/gi, '\n')
        .replaceAll(/<[^>]+>/g, '');
}
