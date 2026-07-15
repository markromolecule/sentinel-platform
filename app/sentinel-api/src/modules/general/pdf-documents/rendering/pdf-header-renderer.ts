import PDFDocument from 'pdfkit';
import { PDF_LAYOUT } from './pdf-page-layout';

export interface HeaderConfig {
    logo_visible?: boolean;
    logo_placement?: 'LEFT' | 'RIGHT' | 'CENTER';
    logo_max_size_px?: number;
    title_text?: string;
    title_alignment?: 'LEFT' | 'RIGHT' | 'CENTER';
    subtitle_text?: string | null;
    subtitle_alignment?: 'LEFT' | 'RIGHT' | 'CENTER';
    divider_visible?: boolean;
    divider_color?: string;
    accent_color?: string;
    sentinel_logo_visible?: boolean;
}

/**
 * Renders the header on the current page of the PDF.
 * 
 * @param doc PDFKit document instance
 * @param config header configuration
 * @param logoBuffer optional PNG buffer of the institution logo
 * @param sentinelLogoBuffer optional PNG buffer of the Sentinel logo
 */
export function renderPdfHeader(
    doc: typeof PDFDocument,
    config: HeaderConfig,
    logoBuffer?: Buffer | null,
    sentinelLogoBuffer?: Buffer | null
): void {
    const startY = PDF_LAYOUT.headerY;
    const endY = PDF_LAYOUT.marginTop - 15;
    
    doc.save();

    // 1. Draw Accent Strip if configured
    if (config.accent_color) {
        doc.rect(0, 0, PDF_LAYOUT.pageWidth, 8)
           .fill(config.accent_color);
    }

    let logoWidth = 50;
    let logoHeight = 30;
    if (config.logo_max_size_px) {
        // Convert px to pt roughly (1px = 0.75pt)
        const sizePt = config.logo_max_size_px * 0.75;
        logoWidth = Math.min(sizePt, 100);
        logoHeight = Math.min(sizePt, 35);
    }

    let logoX = PDF_LAYOUT.marginLeft;
    let logoY = startY;

    // Draw main institution logo if visible & provided
    const drawMainLogo = config.logo_visible && logoBuffer;
    if (drawMainLogo && logoBuffer) {
        if (config.logo_placement === 'RIGHT') {
            logoX = PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginRight - logoWidth;
        } else if (config.logo_placement === 'CENTER') {
            logoX = (PDF_LAYOUT.pageWidth - logoWidth) / 2;
        }
        try {
            doc.image(logoBuffer, logoX, logoY, { width: logoWidth, height: logoHeight });
        } catch (e) {
            // Fallback: draw box with text if image corrupt
            doc.rect(logoX, logoY, logoWidth, logoHeight)
               .strokeColor(PDF_LAYOUT.colors.border)
               .stroke();
        }
    }

    // Draw Sentinel Co-Branding Logo if visible
    if (config.sentinel_logo_visible && sentinelLogoBuffer) {
        // Position Sentinel logo on the opposite side of the main logo
        let sLogoX = PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginRight - 70;
        if (drawMainLogo && config.logo_placement === 'RIGHT') {
            sLogoX = PDF_LAYOUT.marginLeft;
        }
        const sLogoY = startY + 5;
        try {
            doc.image(sentinelLogoBuffer, sLogoX, sLogoY, { width: 70, height: 18 });
        } catch (e) {
            // Silent ignore or simple text
            doc.fontSize(8)
               .fillColor(PDF_LAYOUT.colors.textLight)
               .text('SENTINEL', sLogoX, sLogoY);
        }
    }

    // 2. Draw Title and Subtitle
    const titleText = config.title_text || 'Report';
    const subtitleText = config.subtitle_text || '';

    // Calculate title bounds to avoid overlapping the logo
    let textX = PDF_LAYOUT.marginLeft;
    let textWidth = PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginLeft - PDF_LAYOUT.marginRight;

    if (drawMainLogo && logoBuffer) {
        if (config.logo_placement === 'LEFT') {
            textX = PDF_LAYOUT.marginLeft + logoWidth + 15;
            textWidth = PDF_LAYOUT.pageWidth - textX - PDF_LAYOUT.marginRight;
        } else if (config.logo_placement === 'RIGHT') {
            textWidth = logoX - PDF_LAYOUT.marginLeft - 15;
        }
    }

    doc.fillColor(PDF_LAYOUT.colors.textPrimary);
    
    // Draw Title
    doc.font(PDF_LAYOUT.fonts.bold)
       .fontSize(14);
       
    const titleAlign = config.title_alignment?.toLowerCase() as 'left' | 'right' | 'center' || 'left';
    doc.text(titleText, textX, startY + 2, {
        width: textWidth,
        align: titleAlign,
        lineBreak: false
    });

    // Draw Subtitle if present
    if (subtitleText) {
        doc.font(PDF_LAYOUT.fonts.regular)
           .fontSize(9)
           .fillColor(PDF_LAYOUT.colors.textSecondary);
           
        const subtitleAlign = config.subtitle_alignment?.toLowerCase() as 'left' | 'right' | 'center' || 'left';
        doc.text(subtitleText, textX, startY + 20, {
            width: textWidth,
            align: subtitleAlign,
            lineBreak: false
        });
    }

    // 3. Draw Header Divider
    if (config.divider_visible !== false) {
        const divColor = config.divider_color || PDF_LAYOUT.colors.border;
        doc.moveTo(PDF_LAYOUT.marginLeft, endY)
           .lineTo(PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginRight, endY)
           .strokeColor(divColor)
           .lineWidth(0.75)
           .stroke();
    }

    doc.restore();
}
