import { HTTPException } from 'hono/http-exception';
import { readMultipartFiles, type MultipartBody } from './readers';

/**
 * Extracts and validates the PDF file from a multipart form body.
 * Throws an HTTP 400 exception if no file is found or if the file is not a PDF.
 */
export function resolvePdfFilesFromMultipartBody(body: MultipartBody) {
    const files = [
        ...readMultipartFiles(body.file),
        ...readMultipartFiles(body.lessonFile),
        ...readMultipartFiles(body.pdf),
    ];

    if (files.length === 0) {
        throw new HTTPException(400, {
            message: 'A PDF file is required. Use the "file" field in multipart/form-data.',
        });
    }

    for (const file of files) {
        const inferredMimeType =
            file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : '');

        if (inferredMimeType !== 'application/pdf') {
            throw new HTTPException(400, {
                message: 'Only PDF lesson files are supported for AI preview generation.',
            });
        }
    }

    return files;
}
