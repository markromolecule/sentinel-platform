export const PDF_LAYOUT = {
    pageWidth: 595.28, // A4 width in points
    pageHeight: 841.89, // A4 height in points
    marginTop: 80, // Printable area start Y
    marginBottom: 80, // Printable area end Y boundary
    marginLeft: 54,
    marginRight: 54,

    // Header & Footer vertical positions
    headerY: 30,
    footerY: 800,

    // Font presets
    fonts: {
        regular: 'Helvetica',
        bold: 'Helvetica-Bold',
        oblique: 'Helvetica-Oblique',
    },

    // Safe Colors
    colors: {
        textPrimary: '#1F2937', // charcoal
        textSecondary: '#4B5563', // gray
        textLight: '#9CA3AF', // light gray
        border: '#E5E7EB', // divider
        sentinelPrimary: '#3B82F6', // Sentinel Blue
    },
};

/**
 * Calculates remaining height on the current page.
 *
 * @param currentY current vertical offset
 * @returns remaining height in pt
 */
export function getRemainingPageHeight(currentY: number): number {
    return PDF_LAYOUT.pageHeight - PDF_LAYOUT.marginBottom - currentY;
}
