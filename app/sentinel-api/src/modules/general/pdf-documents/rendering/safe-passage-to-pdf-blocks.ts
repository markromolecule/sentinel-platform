/**
 * Represents a styled text run within a paragraph or block.
 */
export interface PdfTextRun {
    text: string;
    bold?: boolean;
    italic?: boolean;
}

/**
 * Represents a logical block of content for PDF rendering.
 */
export interface PdfTextBlock {
    type: 'paragraph' | 'heading' | 'bullet' | 'break';
    level?: number; // For headings (1, 2, 3)
    runs: PdfTextRun[];
}

/**
 * Helper to decode common HTML entities.
 */
function decodeHtmlEntities(str: string): string {
    return str
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'");
}

/**
 * Parses plain text and a small allowlist of HTML structural elements
 * into structured text blocks for deterministic PDF rendering.
 * Strips script/style tags and all attributes (e.g. href, style, onload).
 *
 * @param html input string containing HTML or plain text
 * @returns array of PdfTextBlocks
 */
export function parsePassageToPdfBlocks(html: string | null | undefined): PdfTextBlock[] {
    if (!html) return [];

    // Pre-processing: remove scripts and styles completely
    let sanitized = html
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');

    // Split text into tokens of tags and plain text
    const tokenRegex = /(<[a-zA-Z0-9/!\s"'-=]+>)/g;
    const tokens = sanitized.split(tokenRegex);

    const blocks: PdfTextBlock[] = [];
    let currentBlock: PdfTextBlock = { type: 'paragraph', runs: [] };

    // Format states
    let isBold = false;
    let isItalic = false;

    // Helper to push current block if it has content
    const commitCurrentBlock = () => {
        if (currentBlock.runs.length > 0) {
            blocks.push(currentBlock);
        }
        currentBlock = { type: 'paragraph', runs: [] };
    };

    for (const token of tokens) {
        if (!token) continue;

        if (token.startsWith('<') && token.endsWith('>')) {
            // It's a tag. Extract tag name.
            const match = token.match(/^<\/?([a-zA-Z0-9]+)/);
            if (!match) continue;

            const tagName = match[1].toLowerCase();
            const isClosing = token.startsWith('</');

            switch (tagName) {
                case 'b':
                case 'strong':
                    isBold = !isClosing;
                    break;
                case 'i':
                case 'em':
                    isItalic = !isClosing;
                    break;
                case 'br':
                    commitCurrentBlock();
                    blocks.push({ type: 'break', runs: [] });
                    break;
                case 'p':
                case 'div':
                    commitCurrentBlock();
                    break;
                case 'li':
                    commitCurrentBlock();
                    if (!isClosing) {
                        currentBlock = { type: 'bullet', runs: [] };
                    }
                    break;
                case 'h1':
                case 'h2':
                case 'h3':
                    commitCurrentBlock();
                    if (!isClosing) {
                        const level = parseInt(tagName.substring(1)) as 1 | 2 | 3;
                        currentBlock = { type: 'heading', level, runs: [] };
                    }
                    break;
                default:
                    // Ignore all other tags
                    break;
            }
        } else {
            // It's text content. Decode entities.
            const textContent = decodeHtmlEntities(token);
            if (textContent) {
                currentBlock.runs.push({
                    text: textContent,
                    bold: isBold || undefined,
                    italic: isItalic || undefined,
                });
            }
        }
    }

    commitCurrentBlock();
    return blocks;
}
