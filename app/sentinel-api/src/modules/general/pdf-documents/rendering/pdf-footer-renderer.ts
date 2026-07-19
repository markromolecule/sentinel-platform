import PDFDocument from 'pdfkit';
import { PDF_LAYOUT } from './pdf-page-layout';

export interface FooterConfig {
    text?: string;
    confidentiality_label?: string | null;
    divider_visible?: boolean;
    divider_color?: string;
    page_number_visible?: boolean;
    page_number_format?: 'PAGE_X_OF_Y' | 'SIMPLE_X' | 'BRACKET_X';
}

/**
 * Renders the footer on the current page of the PDF.
 *
 * @param doc PDFKit document instance
 * @param config footer configuration
 * @param currentPage 1-based current page number
 * @param totalPages total pages in the document
 */
export function renderPdfFooter(
    doc: typeof PDFDocument,
    config: FooterConfig,
    currentPage: number,
    totalPages: number,
): void {
    const yPos = PDF_LAYOUT.footerY;

    doc.save();

    // 1. Draw Footer Divider
    if (config.divider_visible !== false) {
        const divColor = config.divider_color || PDF_LAYOUT.colors.border;
        doc.moveTo(PDF_LAYOUT.marginLeft, yPos)
            .lineTo(PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginRight, yPos)
            .strokeColor(divColor)
            .lineWidth(0.5)
            .stroke();
    }

    doc.fontSize(8).fillColor(PDF_LAYOUT.colors.textLight).font(PDF_LAYOUT.fonts.regular);

    // 2. Draw Footer Text (Left)
    const footerText = config.text || '';
    if (footerText) {
        doc.text(footerText, PDF_LAYOUT.marginLeft, yPos + 8, {
            width: 250,
            align: 'left',
            lineBreak: false,
        });
    }

    // 3. Draw Confidentiality Label (Center)
    const confidentiality = config.confidentiality_label || '';
    if (confidentiality) {
        doc.fillColor('#EF4444') // red color for confidentiality
            .font(PDF_LAYOUT.fonts.bold)
            .text(confidentiality, (PDF_LAYOUT.pageWidth - 150) / 2, yPos + 8, {
                width: 150,
                align: 'center',
                lineBreak: false,
            });
    }

    // 4. Draw Page Number (Right)
    if (config.page_number_visible !== false) {
        let pageStr = `${currentPage}`;
        if (config.page_number_format === 'PAGE_X_OF_Y') {
            pageStr = `Page ${currentPage} of ${totalPages}`;
        } else if (config.page_number_format === 'SIMPLE_X') {
            pageStr = `${currentPage}/${totalPages}`;
        } else if (config.page_number_format === 'BRACKET_X') {
            pageStr = `[${currentPage}]`;
        }

        doc.fillColor(PDF_LAYOUT.colors.textLight)
            .font(PDF_LAYOUT.fonts.regular)
            .text(pageStr, PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginRight - 100, yPos + 8, {
                width: 100,
                align: 'right',
                lineBreak: false,
            });
    }

    doc.restore();
}
