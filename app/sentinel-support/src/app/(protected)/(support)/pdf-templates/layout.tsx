import type { ReactNode } from 'react';
import { PdfTemplateWorkspaceShell } from './_components';

export default function PdfTemplatesLayout({ children }: { children: ReactNode }) {
    return <PdfTemplateWorkspaceShell>{children}</PdfTemplateWorkspaceShell>;
}
