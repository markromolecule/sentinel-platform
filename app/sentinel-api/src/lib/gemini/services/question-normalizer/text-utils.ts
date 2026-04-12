/**
 * Normalizes text for string matching by stripping accents, lowering case,
 * and removing non-alphanumeric characters.
 */
export function normalizeForMatch(value: string) {
    return value
        .normalize('NFKD')
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Tokenizes text for fuzzy matching by splitting on whitespace and filtering
 * short tokens.
 */
export function tokenizeForMatch(value: string) {
    return normalizeForMatch(value)
        .split(' ')
        .map((token) => token.trim())
        .filter((token) => token.length >= 3);
}

/**
 * Scores the overlap of unique tokens between two strings.
 */
export function scoreTokenOverlap(query: string, candidate: string) {
    const queryTokens = Array.from(new Set(tokenizeForMatch(query)));

    if (queryTokens.length === 0) {
        return 0;
    }

    const candidateTokenSet = new Set(tokenizeForMatch(candidate));
    const matchedTokenCount = queryTokens.filter((token) => candidateTokenSet.has(token)).length;

    return matchedTokenCount / queryTokens.length;
}

/**
 * Splits text into segments suitable for evidence matching (by line breaks
 * or sentence punctuation).
 */
export function splitIntoEvidenceSegments(value: string) {
    return value
        .split(/[\n\r]+|(?<=[.!?])\s+/)
        .map((segment) => segment.trim())
        .filter((segment) => segment.length >= 12);
}

/**
 * Strips the .pdf extension from a file name.
 */
export function stripPdfExtension(fileName: string) {
    return fileName.replace(/\.pdf$/i, '');
}
