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
