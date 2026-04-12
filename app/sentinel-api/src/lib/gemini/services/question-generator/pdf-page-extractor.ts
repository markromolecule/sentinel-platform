import { HTTPException } from 'hono/http-exception';

export type ExtractedPdfPage = {
    fileName: string;
    pageNumber: number;
    text: string;
};

export type ExtractedPdfDocument = {
    fileName: string;
    pageCount: number;
    pages: ExtractedPdfPage[];
};

function normalizePageText(value: string) {
    return value.replace(/\s+/g, ' ').trim();
}

async function loadPdfJs() {
    return await import('pdfjs-dist/legacy/build/pdf.mjs');
}

export async function extractPdfDocuments(files: File[]): Promise<ExtractedPdfDocument[]> {
    const { getDocument } = await loadPdfJs();

    return await Promise.all(
        files.map(async (file) => {
            const data = new Uint8Array(await file.arrayBuffer());
            const pdf = await getDocument({
                data,
                useSystemFonts: true,
                isEvalSupported: false,
            }).promise;

            const pages: ExtractedPdfPage[] = [];

            for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
                const page = await pdf.getPage(pageNumber);
                const textContent = await page.getTextContent();
                const text = normalizePageText(
                    textContent.items
                        .map((item: any) => ('str' in item ? String(item.str ?? '') : ''))
                        .join(' '),
                );

                pages.push({
                    fileName: file.name,
                    pageNumber,
                    text,
                });
            }

            return {
                fileName: file.name,
                pageCount: pdf.numPages,
                pages,
            };
        }),
    );
}

export function assertPdfDocumentsContainExtractableText(documents: ExtractedPdfDocument[]) {
    const hasExtractableText = documents.some((document) =>
        document.pages.some((page) => page.text.length > 0),
    );

    if (!hasExtractableText) {
        throw new HTTPException(422, {
            message:
                'The uploaded PDF does not contain extractable text. Upload a text-based PDF to generate page-attributed questions.',
        });
    }
}
